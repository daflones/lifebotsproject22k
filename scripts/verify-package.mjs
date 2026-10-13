import {readFile,readdir,stat,access} from 'node:fs/promises';
import {resolve,relative,dirname,extname} from 'node:path';
import {createHash} from 'node:crypto';

const root=resolve(import.meta.dirname,'..');
const failures=[];
const packageInfo=JSON.parse(await readFile(resolve(root,'package.json'),'utf8'));
const version=JSON.parse(await readFile(resolve(root,'dist/version.json'),'utf8'));
const names=(await readdir(resolve(root,'src'))).sort();
const hash=createHash('sha256');
for(const name of names)hash.update(name).update(await readFile(resolve(root,'src',name)));
if(version.release!==hash.digest('hex').slice(0,16)||version.version!==packageInfo.version)failures.push('Build desatualizado: execute npm run build.');
for(const name of names){
  await access(resolve(root,'dist',name));
  if(/\.(js|css)$/.test(name)&&name!=='sw.js')await access(resolve(root,'dist/releases',version.release,name));
}
const html=await readFile(resolve(root,'dist/index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g))await access(resolve(root,'dist',match[1]));
const worker=await readFile(resolve(root,'dist/sw.js'),'utf8');
if(worker.includes('__BUILD_'))failures.push('Service worker sem versão de build.');
const shell=JSON.parse(worker.match(/const SHELL=(\[[^;]+\]);/)?.[1]||'[]');
if(!shell.length)failures.push('Shell offline vazio.');
for(const file of shell)await access(resolve(root,'dist',file));

const ignored=new Set(['.git','node_modules','.temp','.sites','.openai','android','ios']);
async function filesIn(directory){
  const result=[];
  for(const entry of await readdir(directory,{withFileTypes:true})){
    if(ignored.has(entry.name))continue;
    const path=resolve(directory,entry.name);
    if(entry.isDirectory())result.push(...await filesIn(path));
    else if(entry.isFile()&&!/\.(?:zip|log)$|\.tar\.gz$/.test(entry.name))result.push(path);
  }
  return result;
}
const files=await filesIn(root);
let largest=0;
for(const file of files){
  const name=relative(root,file).replaceAll('\\','/');
  const size=(await stat(file)).size;largest=Math.max(largest,size);
  if(size>=100*1024*1024)failures.push('Arquivo grande demais para Git comum: '+name);
  if(/(?:^|\/)\.env(?:\.|$)/.test(name)&&!name.endsWith('/.env.example')&&name!=='.env.example'||/(?:^|\/)(?:\.backend-secrets|id_rsa|id_ed25519)$/.test(name))failures.push('Arquivo privado: '+name);
  if(!['.js','.mjs','.ts','.json','.toml','.md','.txt','.bat','.cmd','.sql','.conf'].includes(extname(file))&&!name.endsWith('.env.example'))continue;
  const text=await readFile(file,'utf8');
  if(/\b(?:sbp_[A-Za-z0-9]{24,}|sb_secret_[A-Za-z0-9_-]{24,}|otp_live_[A-Za-z0-9]{24,}|whsec_[A-Za-z0-9]{24,}|gh[pousr]_[A-Za-z0-9]{24,}|github_pat_[A-Za-z0-9_]{30,})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text))failures.push('Possível credencial privada: '+name);
  for(const jwt of text.matchAll(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g)){
    try{if(JSON.parse(Buffer.from(jwt[0].split('.')[1],'base64url').toString()).role==='service_role')failures.push('JWT privilegiado: '+name);}catch{}
  }
  if(!/\.(?:js|mjs|ts)$/.test(name))continue;
  for(const match of text.matchAll(/^[ \t]*(?:import|export)\s+(?:[^\n;]*?\bfrom\s*)?["'](\.[^"']+)["']/gm)){
    try{await access(resolve(dirname(file),match[1]));}catch{failures.push('Import ausente em '+name+': '+match[1]);}
  }
}
const assets=(await readdir(resolve(root,'dist/assets'))).length;
const migrations=(await readdir(resolve(root,'supabase/migrations'))).filter(f=>f.endsWith('.sql')).length;
for(const name of ['game-api','daily-settlement','payment-webhook','mercosulpay-webhook'])await access(resolve(root,'supabase/functions',name,'index.ts'));
if(failures.length){failures.forEach(f=>console.error('FALHOU: '+f));process.exit(1);}
console.log(`Pacote LifeBots ${version.version}: build ${version.release}, ${assets} assets, ${migrations} migrations e quatro funções OK.`);
console.log(`Imports, shell offline e revisão de credenciais OK. Maior arquivo: ${(largest/1024/1024).toFixed(2)} MiB.`);
console.log('Esta revisão não substitui análise de histórico Git nem testes com jogadores no domínio de produção.');
