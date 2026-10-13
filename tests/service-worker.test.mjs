import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
const source=await readFile(new URL('../src/sw.js',import.meta.url),'utf8');
function worker(){
 const handlers={},saved=new Map();let fetcher=async()=>new Response('novo'),calls=0;
 const key=request=>new URL(typeof request==='string'?request:request.url,'https://game.test/').href;
 runInNewContext(source,{URL,self:{location:{origin:'https://game.test'},addEventListener:(name,fn)=>handlers[name]=fn},fetch:request=>{calls++;return fetcher(request);},caches:{open:async()=>({put:async(request,response)=>saved.set(key(request),response)}),match:async request=>saved.get(key(request))?.clone()}});
 function get(path,mode='cors',method='GET',headers=new Headers()){let response;handlers.fetch({request:{url:key(path),mode,method,headers},respondWith:r=>response=r});return response;}
 return {get,cache:(path,text)=>saved.set(key(path),new Response(text)),network:fn=>fetcher=fn,get calls(){return calls;}};
}
test('documentos e módulos priorizam a rede e preservam a versão em cache para uso offline',async()=>{
 const w=worker();w.cache('./index.html','antigo');w.cache('./releases/current/core.js','core antigo');
 assert.equal(await (await w.get('./index.html','navigate')).text(),'novo');
 assert.equal(await (await w.get('./releases/current/core.js')).text(),'novo');
 w.network(async()=>{throw new Error('offline');});
 assert.equal(await (await w.get('./index.html','navigate')).text(),'novo');
 assert.equal(await (await w.get('./releases/current/core.js')).text(),'novo');
});
test('fallback HTML atende navegação, sem substituir JavaScript ausente ou interceptar API/POST',async()=>{
 const w=worker();w.cache('./index.html','shell offline');w.network(async()=>{throw new Error('offline');});
 assert.equal(await (await w.get('./?v=0.2.0','navigate')).text(),'shell offline');
 await assert.rejects(w.get('./releases/missing/app.js'),/offline/);
 const calls=w.calls;assert.equal(w.get('./api/snapshot'),undefined);assert.equal(w.get('./actions','cors','POST'),undefined);assert.equal(w.calls,calls);
});

test('requisições de faixa de áudio ficam com o navegador, sem armazenar respostas parciais',()=>{
 const w=worker(),range=new Headers({Range:'bytes=0-100'});assert.equal(w.get('./assets/music-aurora-v2.ogg','cors','GET',range),undefined);assert.equal(w.calls,0);
});
