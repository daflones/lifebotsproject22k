import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {runInNewContext} from 'node:vm';
import * as C from '../src/core.js';
import {createLoginView} from '../src/login-view.js';
import {createAdminOperations} from '../src/admin-operations.js';

const config={mode:'server',serverAvailable:true,supabaseUrl:'https://example.supabase.co',supabasePublishableKey:'public-key',supabaseJsUrl:'data:text/javascript,export const createClient=()=>globalThis.productionClient'};
globalThis.window={LIFEBOTS_CONFIG:config};
globalThis.localStorage={getItem:()=> 'demo'};
const calls=[];
globalThis.productionClient={functions:{invoke:async(name,{body})=>{calls.push(body);return {data:{ok:true,data:{result:{id:'payment',kind:body.action,simulated:false}}},error:null};}}};
const API=await import('../src/api.js');
const esc=String,button=(label,action)=>`<button data-a="${action}">${label}</button>`,state=C.initialState();
state.serverAuthoritative=true;state.profile.role='admin';state.adminUsers=[];
const env={getState:()=>state,escape:esc,icon:()=>'',input:()=>'',textarea:()=>'',sprite:()=>'',button,assetUrl:String,sceneAsset:String,audio:{preferences:{enabled:false}},isDemo:false,serverAvailable:true,coin:()=>'',format:String,brl:String,modal(){},render(){},mutate(){}};

const readConfig=await readFile(new URL('../src/config.js',import.meta.url),'utf8');
const readApi=await readFile(new URL('../src/api.js',import.meta.url),'utf8');

test('produção ignora preferência demo antiga e indisponibilidade não cria uma conta local',()=>{
 assert.equal(API.isDemo,false);
 const sandbox={window:{}};runInNewContext(readConfig,sandbox);
 const published=sandbox.window.LIFEBOTS_CONFIG;
 assert.equal(published.mode,'server');assert.equal(published.allowDemo,false);
 assert.ok(!readApi.includes("connection==='demo'"));
});

test('login publicado não oferece entrada em demonstração',()=>{
 const html=createLoginView(env).render('login');
 assert.doesNotMatch(html,/demo-mode|server-mode|demonstra|prévia|moedas de teste/i);
});

test('depósitos e saques usam API real e preservam a identificação enviada',async()=>{
 for(const action of ['deposit','withdraw']){
  await API.action(action,{amount_cents:2000,idempotency_key:'payment-request-123',mode:'demo',action:'snapshot'});
  const body=calls.at(-1);assert.equal(body.action,action);assert.equal(body.mode,'real');assert.equal(body.idempotency_key,'payment-request-123');assert.equal(body.amount_cents,2000);
 }
});

test('ativação de pagamentos aparece uma única vez no painel',()=>{
 const html=createAdminOperations(env).render('withdrawals');
 assert.equal((html.match(/name="paymentsEnabled"/g)||[]).length,1);
});

test('textos compartilhados de produção não classificam moedas como teste',async()=>{
 for(const file of ['robot-offer.js','story-view.js']){
  const text=await readFile(new URL('../src/'+file,import.meta.url),'utf8');
  assert.doesNotMatch(text,/Nesta prévia, os valores são de teste|RobotCoins de teste adicionadas/);
 }
 assert.doesNotMatch(C.DEFAULT_SETTINGS.withdrawalRules,/teste|prévia|fictíci/i);
});

test('configuração runtime do EasyPanel aceita somente variáveis públicas e mantém produção',async t=>{
 const directory=await mkdtemp(join(tmpdir(),'lifebots-env-'));t.after(()=>rm(directory,{recursive:true,force:true}));
 const output=join(directory,'config.js'),script=new URL('../deploy/40-lifebots-config.sh',import.meta.url),source=new URL('../src/config.js',import.meta.url);
 const {fileURLToPath}=await import('node:url');
 const run=extra=>spawnSync('sh',[fileURLToPath(script),fileURLToPath(source),output],{env:{...process.env,...extra},encoding:'utf8'});
 const result=run({SUPABASE_URL:'https://custom.supabase.co',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test-only'});
 assert.equal(result.status,0,result.stderr||result.error?.message);
 const sandbox={window:{}};runInNewContext(await readFile(output,'utf8'),sandbox);
 assert.equal(sandbox.window.LIFEBOTS_CONFIG.supabaseUrl,'https://custom.supabase.co');assert.equal(sandbox.window.LIFEBOTS_CONFIG.allowDemo,false);
 assert.notEqual(run({SUPABASE_PUBLISHABLE_KEY:'sb_secret_test-only'}).status,0);
 assert.notEqual(run({SUPABASE_URL:"https://bad.supabase.co';alert(1);//"}).status,0);
});

test('interface conectada não oferece simulações e retenta pagamentos com a mesma chave',async t=>{
 const listeners={},elements=new Map(),element=()=>({innerHTML:'',setAttribute(){},focus(){},append(){},remove(){},classList:{add(){},remove(){},toggle(){}},dataset:{}});
 for(const id of ['#app','#modal-root','#toast-root','#main-content','#chat-root'])elements.set(id,element());
 elements.get('#modal-root').addEventListener=()=>{};
 globalThis.document={querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],addEventListener:(name,fn,options)=>listeners[name==='click'&&options===true?'clickCapture':name]=fn,createElement:element,activeElement:element(),body:element(),documentElement:{style:{setProperty(){}}}};
 globalThis.location={hash:'#home',href:'https://lifebots.com.br/#home',origin:'https://lifebots.com.br',protocol:'https:'};
 window.addEventListener=(name,fn)=>listeners[name]=fn;window.scrollTo=()=>{};
 Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
 const interval=globalThis.setInterval,timeout=globalThis.setTimeout;globalThis.setInterval=()=>0;globalThis.setTimeout=fn=>{fn();return 0;};t.after(()=>{globalThis.setInterval=interval;globalThis.setTimeout=timeout;});
 globalThis.FormData=class{constructor(form){this.fields=Object.entries(form.fields||{});}*[Symbol.iterator](){yield* this.fields;}getAll(key){return this.fields.filter(([k])=>k===key).map(([,value])=>value);}};
 const channel={on(){return this;},subscribe(){return this;}};
 Object.assign(productionClient,{auth:{getSession:async()=>({data:{session:{user:{id:'account'}}}}),onAuthStateChange:()=>({})},from:()=>({select:async()=>({data:[],error:null})}),channel:()=>channel});
 let failPayment=true;
 productionClient.functions.invoke=async(name,{body})=>{
  calls.push(body);
  if(body.action==='snapshot')return {data:{ok:true,data:state}};
  if(body.action==='deposit'&&failPayment){failPayment=false;return {error:{message:'Falha de comunicação'}};}
  return {data:{ok:true,data:{result:{id:'payment',kind:'deposit',amountCents:2000,feeCents:0,LC:2000,status:'pending'},snapshot:state}}};
 };
 await import('../src/app.js');await new Promise(setImmediate);
 const click=async(a,id)=>listeners.click({target:{closest:()=>({dataset:{a,id},disabled:false})}});
 for(const route of ['shop','wallet','arena','admin']){
  location.hash='#'+route;listeners.hashchange();const html=elements.get('#app').innerHTML;
  assert.ok(!/PRÉVIA|de teste|Simular 1 dia|LifeRobots/.test(html),'Texto de demonstração em '+route);
 }
 await click('mobile-menu');assert.match(elements.get('#modal-root').innerHTML,/data-page="admin"/);
 state.profile.role='user';state.profile.isAdmin=false;location.hash='#home';listeners.hashchange();await click('mobile-menu');assert.doesNotMatch(elements.get('#modal-root').innerHTML,/data-page="admin"|Painel administrativo/);
 location.hash='#admin';listeners.hashchange();assert.match(elements.get('#app').innerHTML,/Acesso restrito aos administradores/);assert.doesNotMatch(elements.get('#app').innerHTML,/admin-studio|admin-economy/);
 state.profile.role='admin';listeners.hashchange();
 location.hash='#wallet';listeners.hashchange();assert.doesNotMatch(elements.get('#app').innerHTML,/MercosulPay|Gateway:/i);
 await click('withdraw');assert.doesNotMatch(elements.get('#modal-root').innerHTML,/MercosulPay/i);
 location.hash='#admin';listeners.hashchange();
 await click('admin-tab','activity');assert.ok(!/data-a="reset-demo"|data-a="simulate-day"/.test(elements.get('#app').innerHTML),elements.get('#app').innerHTML.match(/.{0,100}data-a="reset-demo".{0,100}/)?.[0]);
 await click('deposit');const modal=elements.get('#modal-root').innerHTML;
 assert.ok(!/de teste|fictícia|Simular depósito|MercosulPay/i.test(modal));
 const requestKey=modal.match(/data-request-key="([^"]+)"/)[1],submit={disabled:false},form={id:'money-form',dataset:{kind:'deposit',requestKey},fields:{amount:'20'},querySelector:()=>submit};
 for(let attempt=0;attempt<2;attempt++)await listeners.submit({preventDefault(){},target:form});
 const payments=calls.filter(body=>body.action==='deposit').slice(-2);assert.equal(payments.length,2);assert.equal(payments[0].idempotency_key,payments[1].idempotency_key);assert.equal(payments[0].idempotency_key,requestKey);assert.equal(submit.disabled,false);
});
