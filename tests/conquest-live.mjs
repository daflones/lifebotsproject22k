import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import * as C from '../src/core.js';
import {defaultConquestRules} from '../src/guild-conquest.js';
import {freshWorld,sessionContext,handleAction,storedState,visibleSnapshot} from '../supabase/functions/_shared/runtime/engine.js';
const root=new URL('..',import.meta.url),url='http://127.0.0.1:4181',ids=[1,2,3].map(n=>'20000000-0000-4000-8000-00000000000'+n);
let server,browser;
before(async()=>{server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'4181'},stdio:'ignore'});for(let n=0;n<50;n++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}browser=await chromium.launch({headless:true,channel:process.env.MOBILE_CHROMIUM_CHANNEL||'chrome'});});
after(async()=>{await browser?.close();server?.kill();});
function fixture(){const config=C.initialState(),rows=new Map(),profiles=ids.map((id,i)=>({id,name:['Alpha','Beta','Gamma'][i],role:i===0?'admin':'user',status:'active',emailConfirmed:true,referralCode:'PILOT'+i}));let world=freshWorld(),now=Date.now();for(const profile of profiles){const state=C.initialState(now);Object.assign(state,{profile,robots:[],inventory:[],transactions:[],balances:{RC:10000,LC:10000}});rows.set(profile.id,storedState(state));}
 function act(actor,body){const context={mode:'real',config,profiles,world:{revision:0,data:world},accounts:[...rows].map(([userId,data])=>({userId,data:C.clone(data),revision:0,wallets:{...data.balances}}))},session=sessionContext(context,actor);let result;if(body.action!=='snapshot'){result=handleAction(session,body,now);world=session.world;for(const [id,s] of session.accounts)rows.set(id,storedState(s));}return {ok:true,data:body.action==='snapshot'?visibleSnapshot(session):{result,snapshot:visibleSnapshot(session)}};}
 for(const id of ids)act(id,{action:'buy_robot',catalog_id:'titan'});const guild=act(ids[0],{action:'guild_create',name:'Aurora','tag':'AUR',description:'Cooperativa'}).data.result;act(ids[1],{action:'guild_join',guild_id:guild.id});act(ids[2],{action:'guild_create',name:'Boreal',tag:'BOR',description:'Adversária'});act(ids[0],{action:'admin_guild_event_save',event:{id:'live-conquest',type:'guild-conquest',name:'Conquista ao vivo',description:'Evento compartilhado',startsAt:now-60000,endsAt:now+C.DAY,enabled:true,scene:'guild-canyon',rewardPoolRC:1000,participationRC:0,battleRewardRC:0,conquest:defaultConquestRules()}});
 return {act,rows,get now(){return now;},advance(){now+=21000;},get world(){return world;}};
}
const sdk=`export function createClient(){return {auth:{getSession:async()=>({data:{session:{user:{id:window.__actor}}}}),onAuthStateChange:()=>({})},from:()=>({select:async()=>({data:[],error:null})}),channel(){const callbacks=[];window.__emitSignal=()=>callbacks.forEach(fn=>fn({}));window.__setChannelStatus=status=>window.__channelStatus?.(status);return {on(type,filter,fn){callbacks.push(fn);return this;},subscribe(fn){window.__channelStatus=fn;fn('SUBSCRIBED');return this;}};},removeChannel(){},functions:{invoke:async(name,{body})=>{const response=await fetch('/__conquest-action',{method:'POST',body:JSON.stringify(body)}),data=await response.json();return {data};}}};}`;
test('três clientes compartilham conquista, ranking, defesa e reconexão sem saldo local',async t=>{
 const f=fixture(),clients=[],errors=[];
 for(const id of ids){const context=await browser.newContext({viewport:{width:390,height:740},isMobile:true,hasTouch:true,serviceWorkers:'block'});t.after(()=>context.close());await context.addInitScript(({id,now})=>{window.__actor=id;window.__clock=now;Date.now=()=>window.__clock;localStorage.setItem('lifebots-lang','pt');},{id,now:f.now});
  await context.route('**/config.js',route=>route.fulfill({contentType:'application/javascript',body:"window.LIFEBOTS_CONFIG={mode:'server',allowDemo:false,supabaseUrl:location.origin,supabasePublishableKey:'public-conquest-fixture',supabaseJsUrl:location.origin+'/__conquest-sdk.js'};"}));
  await context.route('**/__conquest-sdk.js',route=>route.fulfill({contentType:'application/javascript',body:sdk}));
  await context.route('**/fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));await context.route('**/www.googletagmanager.com/**',route=>route.fulfill({contentType:'application/javascript',body:''}));
  await context.route('**/__conquest-action',async route=>{const body=route.request().postDataJSON();let reply;try{reply=f.act(id,body);}catch(error){reply={ok:false,error:{message:error.message}};}await route.fulfill({contentType:'application/json',body:JSON.stringify(reply)});if(body.action!=='snapshot'&&reply.ok)for(const page of clients)await page.evaluate(()=>window.__emitSignal?.());});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));clients.push(page);await page.goto(url+'/#events');await page.locator('.territory-node').first().waitFor();if(await page.locator('[data-a="floating-chat-close"]').count())await page.locator('[data-a="floating-chat-close"]').click();await page.locator('[data-a="conquest-focus"][data-id="cabin-1"]').click();
 }
 const [a,b,observer]=clients,attack=page=>page.locator('[data-a="conquest-order"][data-move="attack"]');
 await attack(a).click();await b.waitForFunction(()=>document.querySelector('.conquest-history')?.textContent.includes('Alpha'));assert.match(await observer.locator('.conquest-ranking').last().textContent(),/Alpha/);
 await attack(b).click();await a.waitForFunction(()=>document.querySelector('.conquest-history')?.textContent.includes('Beta'));
 for(let i=0;i<10&&!f.world.conquests['live-conquest'].territories['cabin-1'].ownerId;i++){f.advance();for(const page of clients)await page.evaluate(now=>window.__clock=now,f.now);await attack(i%2?b:a).click();await new Promise(resolve=>setTimeout(resolve,600));}
 assert.ok(f.world.conquests['live-conquest'].territories['cabin-1'].ownerId);
 await observer.waitForFunction(()=>document.querySelector('[data-a="conquest-focus"][data-id="cabin-1"] .territory-banner')?.textContent==='Aurora');assert.equal(await attack(observer).isDisabled(),true,'proteção pós-conquista');
 assert.ok(await a.locator('[data-a="conquest-order"][data-move="attack"]').isDisabled(),'não atacar próprio território');
 await b.locator('[data-a="conquest-ranking"]').click();assert.match(await b.locator('.conquest-ranking').last().textContent(),/Alpha/);assert.match(await b.locator('.conquest-ranking').last().textContent(),/Beta/);
 await observer.evaluate(()=>{window.__setChannelStatus('CHANNEL_ERROR');window.__emitSignal=()=>{};});assert.match(await observer.locator('.conquest-sync').textContent(),/periódica/);
 f.advance();for(const page of clients)await page.evaluate(now=>window.__clock=now,f.now);await a.locator('[data-a="conquest-order"][data-move="fortify"]').click();
 await observer.evaluate(()=>window.dispatchEvent(new Event('online')));await observer.waitForFunction(()=>document.querySelector('.conquest-history')?.textContent.includes('Fortificar'));
 await b.reload();await b.locator('.territory-node').first().waitFor();assert.match(await b.locator('[data-id="cabin-1"].territory-node').textContent(),/Aurora/);
 for(const locale of ['en','es','ru','ja']){await a.evaluate(async locale=>{const app=document.querySelector('script[type="module"]').src,{setLocale}=await import(new URL('./i18n.js',app).href);setLocale(locale);},locale);assert.ok(await a.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow em '+locale);assert.notEqual(await a.locator('.conquest-heading .eyebrow').textContent(),'CONQUISTA DE TERRITÓRIOS');assert.match(await a.locator('.conquest-ranking').last().textContent(),/Alpha/);}
 assert.deepEqual(errors,[]);assert.equal(await a.evaluate(()=>localStorage.getItem('liferobots-demo-v1')),null);
});
