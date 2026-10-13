import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {runInNewContext} from 'node:vm';

const root=resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);
function argument(name){const index=args.indexOf(name);if(index<0)return null;const value=args[index+1];if(!value||value.startsWith('--'))throw new Error('Informe o valor de '+name);return value;}
const siteArgument=argument('--url'),originArgument=argument('--origin');
const site=siteArgument?new URL(siteArgument):null;
if(site&&(!['http:','https:'].includes(site.protocol)||site.username||site.password||site.pathname!=='/'||site.search||site.hash))throw new Error('Use a URL raiz do jogo, sem caminho, fragmento ou credenciais.');
const origin=originArgument||site?.origin||'http://localhost:3000';
const parsedOrigin=new URL(origin);
if(parsedOrigin.origin!==origin)throw new Error('--origin deve conter somente protocolo e host, sem barra final.');
const sandbox={window:{}};
runInNewContext(await readFile(resolve(root,'src/config.js'),'utf8'),sandbox);
const config=sandbox.window.LIFEBOTS_CONFIG;
const apiHeaders={apikey:config.supabasePublishableKey,'Content-Type':'application/json',Origin:origin};
const backend=config.supabaseUrl;
const cases=[],results=[];
const check=(name,run)=>cases.push({name,run});
function assert(condition,message){if(!condition)throw new Error(message);}
function request(url,options={}){return fetch(url,{...options,redirect:'follow',signal:AbortSignal.timeout(15000)});}

check('SDK do Supabase acessível',async()=>{
 const r=await request(config.supabaseJsUrl);assert(r.ok&&/javascript/.test(r.headers.get('content-type')||''),'SDK indisponível ou tipo de conteúdo incorreto.');
});
check('Cadastro/Auth acessível',async()=>{
 const r=await request(backend+'/auth/v1/settings',{headers:{apikey:config.supabasePublishableKey}});assert(r.ok,'Auth HTTP '+r.status);const b=await r.json();assert(b.external?.email===true&&!b.disable_signup,'Cadastro por e-mail desativado.');return 'confirmação '+(b.mailer_autoconfirm?'automática':'por e-mail');
});
check('CORS da origem do jogo',async()=>{
 const r=await request(backend+'/functions/v1/game-api',{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'apikey,content-type,authorization'}});
 assert(r.status===204&&r.headers.get('access-control-allow-origin')===origin,'Origem não autorizada. Configure ALLOWED_ORIGINS nos Secrets do Supabase.');
});
check('Conteúdo público do jogo',async()=>{
 const r=await request(backend+'/functions/v1/game-api',{method:'POST',headers:apiHeaders,body:JSON.stringify({action:'public_config'})});const b=await r.json();assert(r.ok&&b.ok&&Array.isArray(b.data?.catalog)&&b.data.catalog.length>0,'API/conteúdo indisponível (HTTP '+r.status+').');return b.data.catalog.length+' robôs publicados';
});
check('Snapshot exige sessão',async()=>{
 const r=await request(backend+'/functions/v1/game-api',{method:'POST',headers:apiHeaders,body:JSON.stringify({action:'snapshot'})});const b=await r.json();assert(r.status===401&&b.error?.code==='AUTH_REQUIRED','A API não devolveu AUTH_REQUIRED para uma requisição sem sessão.');
});
check('Origem desconhecida recusada',async()=>{
 const r=await request(backend+'/functions/v1/game-api',{method:'OPTIONS',headers:{Origin:'https://lifebots-untrusted.invalid'}});assert(r.status===403&&!r.headers.get('access-control-allow-origin'),'Uma origem externa foi aceita.');
});
check('Job exige segredo privado',async()=>{
 const r=await request(backend+'/functions/v1/daily-settlement',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert(r.status===401,'Job ausente, sem configuração ou sem proteção (HTTP '+r.status+').');
});
for(const name of ['payment-webhook','mercosulpay-webhook'])check(name+' exige assinatura',async()=>{
 const r=await request(backend+'/functions/v1/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert(r.status===401,'Webhook ausente ou assinatura não exigida (HTTP '+r.status+').');
});
check('Carteiras inacessíveis sem sessão',async()=>{
 const r=await request(backend+'/rest/v1/lr_wallets?select=user_id&limit=1',{headers:{apikey:config.supabasePublishableKey}});
 if(r.status===401||r.status===403)return;
 const b=await r.json();assert(r.ok&&Array.isArray(b)&&b.length===0,'Carteira exposta ou tabela inacessível por erro inesperado (HTTP '+r.status+').');
});

if(site){
 const address=path=>new URL(path,site).href;
 check('Saúde do frontend',async()=>{const r=await request(address('/healthz'));assert(r.ok&&(await r.text()).trim()==='ok','Health check inválido.');});
 check('HTML da versão publicada',async()=>{const r=await request(address('/'));assert(r.ok&&/text\/html/.test(r.headers.get('content-type')||''),'HTML indisponível.');const html=await r.text();assert(/<title>LifeBots/.test(html),'O domínio não está entregando LifeBots.');assert(r.headers.get('cache-control')?.includes('no-store'),'HTML pode permanecer em cache após atualização.');});
 check('Build publicado, módulos e imagem',async()=>{
  const r=await request(address('/version.json'));assert(r.ok,'Manifest de versão ausente.');const b=await r.json(),expected=JSON.parse(await readFile(resolve(root,'dist/version.json'),'utf8'));assert(b.version===expected.version&&b.release===expected.release,'O domínio está entregando outro build; confira branch e deploy.');
  const module=await request(address('/releases/'+b.release+'/app.js'));assert(module.ok&&/javascript/.test(module.headers.get('content-type')||''),'JavaScript indisponível.');assert(module.headers.get('cache-control')?.includes('immutable'),'Módulo com hash sem cache imutável.');
  const image=await request(address('/assets/icon-192.png'));assert(image.ok&&/image\/png/.test(image.headers.get('content-type')||''),'Imagem indisponível.');assert(image.headers.get('x-content-type-options')==='nosniff','Headers não estão herdados na rota dos assets.');
 });
 for(const path of ['/sw.js','/version.json','/manifest.webmanifest'])check('Atualização sem cache: '+path,async()=>{const r=await request(address(path));assert(r.ok&&r.headers.get('cache-control')?.includes('no-store'),'Arquivo pode permanecer em cache após atualização.');});
 for(const path of ['/lifebots-missing-file.js','/releases/missing/file.js','/assets/lifebots-missing-file.png'])check('Arquivo ausente: '+path,async()=>{const r=await request(address(path));assert(r.status===404,'Arquivo inexistente recebeu HTTP '+r.status+'; revise fallback do Nginx.');});
}

await Promise.all(cases.map(async item=>{
 try{const detail=await item.run();results.push({name:item.name,ok:true,detail});}
 catch(error){results.push({name:item.name,ok:false,detail:error.cause?.code||error.message});}
}));
for(const item of cases){const result=results.find(r=>r.name===item.name);console.log(`${result.ok?'OK':'FALHOU'}: ${result.name}${result.detail?' — '+result.detail:''}`);}
console.log('Verificação pública: não cria contas, cobranças, saques, partidas ou alterações no banco.');
console.log('Auth com duas contas, Realtime, cron, pagamentos e navegador continuam exigindo validação própria.');
if(!site)console.log('Frontend EasyPanel não verificado. Depois do deploy use --url https://SEU_DOMINIO.');
if(results.some(r=>!r.ok))process.exitCode=1;
