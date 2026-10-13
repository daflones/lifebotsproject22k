import {cp,mkdir,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
export async function build(root,out=resolve(root,'dist')){
 const source=resolve(root,'src'),names=(await readdir(source)).sort();
 const version=JSON.parse(await readFile(resolve(root,'package.json'),'utf8')).version;
 const hash=createHash('sha256');for(const name of names)hash.update(name).update(await readFile(resolve(source,name)));
 const release=hash.digest('hex').slice(0,16),folder=`releases/${release}`;
 await mkdir(out,{recursive:true});await cp(source,out,{recursive:true});
 await rm(resolve(out,'releases'),{recursive:true,force:true});await mkdir(resolve(out,folder),{recursive:true});
 const modules=names.filter(name=>/\.(js|css)$/.test(name)&&name!=='sw.js');
 for(const name of modules){let text=await readFile(resolve(source,name),'utf8');if(name.endsWith('.css'))text=text.replaceAll('./assets/','../../assets/');await writeFile(resolve(out,folder,name),text);}
 let html=await readFile(resolve(source,'index.html'),'utf8');
 for(const name of modules)if(name!=='config.js')html=html.replaceAll(`"./${name}"`,`"./${folder}/${name}"`);
 await writeFile(resolve(out,'index.html'),html);
 const shell=['./index.html','./manifest.webmanifest',...modules.map(name=>name==='config.js'?'./config.js':`./${folder}/${name}`),'./assets/icon-192.png','./assets/icon-512.png'];
 let worker=await readFile(resolve(source,'sw.js'),'utf8');worker=worker.replace('__BUILD_HASH__',release).replace('__BUILD_VERSION__',version).replace(/const SHELL=\[[^;]*\];/,`const SHELL=${JSON.stringify(shell)};`);
 await writeFile(resolve(out,'sw.js'),worker);
 await writeFile(resolve(out,'version.json'),JSON.stringify({version,release})+'\n');
 return {version,release,folder};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const result=await build(resolve(import.meta.dirname,'..'));console.log(`LifeBots ${result.version}: ${result.folder}. Assets e progresso preservados.`);
}
