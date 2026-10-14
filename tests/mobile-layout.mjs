import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {chromium,webkit} from 'playwright';
import * as C from '../src/core.js';
import {ensureSocial} from '../src/social-core.js';
import {defaultConquestRules} from '../src/guild-conquest.js';

const engines=(process.env.MOBILE_BROWSER||'chromium,webkit').split(',');
const root=resolve(import.meta.dirname,'..'),url='http://127.0.0.1:4179',browsers={},sizes=[{width:320,height:568},{width:375,height:667},{width:390,height:720},{width:430,height:740},{width:667,height:375}];
const release=JSON.parse(await readFile(new URL('../dist/version.json',import.meta.url),'utf8')).release;
const artifacts=await mkdtemp(join(tmpdir(),'lifebots-mobile-'));
let server;
before(async()=>{
 server=spawn(process.execPath,['scripts/serve.mjs'],{cwd:root,env:{...process.env,PORT:'4179'},stdio:'ignore'});
 for(let attempt=0;attempt<50;attempt++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,100));}
 for(const name of engines)browsers[name]=await ({chromium,webkit})[name].launch({headless:true,...(name==='chromium'?{channel:process.env.MOBILE_CHROMIUM_CHANNEL||'chromium'}:{})});
 console.log('Capturas móveis:',artifacts);
});
after(async()=>{for(const browser of Object.values(browsers))await browser.close();server?.kill();});
function fixture(empty=false){const state=C.initialState();ensureSocial(state);for(const robot of state.robots){const info=C.robotInfo(state,robot);robot.productionDailyMinor=info.daily*100;robot.expiresAt=info.expires;}state.serverAuthoritative=true;state.profile.name='Layout';state.profile.role='admin';state.adminUsers=[];state.social.events.push({id:'layout-conquest',type:'guild-conquest',name:'Cerco do Vale',description:'Castelos, casas e cabanas.',startsAt:Date.now()-60000,endsAt:Date.now()+C.DAY,enabled:true,scene:'guild-canyon',rewardPoolRC:500,participationRC:0,battleRewardRC:0,conquest:defaultConquestRules()});state.social.guilds[0].members.push({userId:state.profile.id||'demo-self',role:'member',joinedAt:Date.now()});if(empty){state.robots=[];state.selectedRobot=null;state.balances={LC:0,RC:0};}return state;}
const sdk=`import * as C from '/releases/${release}/core.js';
const state=window.__mobileFixture,channel={on(){return this},subscribe(){return this}};
export function createClient(){return {
 auth:{getSession:async()=>({data:{session:{user:{id:state.profile.id}}}}),onAuthStateChange:()=>({})},
 from:()=>({select:async()=>({data:[],error:null})}),channel:()=>channel,removeChannel(){},
 functions:{invoke:async(name,{body})=>{let result={};if(body.action==='snapshot')return {data:{ok:true,data:state}};
 if(body.action==='story_start'){const draft=C.clone(state);draft.serverAuthoritative=false;state.activeStory=C.beginStory(draft,body.chapter_id,body.robot_id);state.activeStory.controlMode='manual';}
 if(body.action==='story_enter')C.enterStory(state.activeStory);
 if(body.action==='story_move')result=C.storyTurn(state.activeStory,body.move,.5);
 if(body.action==='story_cancel')state.activeStory=null;
 return {data:{ok:true,data:{result,snapshot:state}}};}}
};}`;
async function pageFor(browser,size,empty=false){
 const context=await browser.newContext({viewport:size,isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:'block'});
 await context.addInitScript(state=>{window.__mobileFixture=state;},fixture(empty));
 await context.route('**/config.js',route=>route.fulfill({contentType:'application/javascript',body:"window.LIFEBOTS_CONFIG={mode:'server',allowDemo:false,serverAvailable:true,supabaseUrl:location.origin,supabasePublishableKey:'public-layout-fixture',supabaseJsUrl:location.origin+'/__mobile-sdk.js'};"}));
 await context.route('**/__mobile-sdk.js',route=>route.fulfill({contentType:'application/javascript',body:sdk}));
 await context.route('**/fonts.googleapis.com/**',route=>route.fulfill({contentType:'text/css',body:''}));
 const page=await context.newPage();await page.goto(url+'/#home');await page.locator('.hangar-stage').waitFor();
 if(await page.locator('[data-a="floating-chat-close"]').count())await page.locator('[data-a="floating-chat-close"]').click();
 return {context,page};
}
async function visibleInside(page,selector){const box=await page.locator(selector).first().boundingBox();assert.ok(box,selector+' ausente');assert.ok(box.y>=-1&&box.y+box.height<=page.viewportSize().height+1,selector+' fora da área visível: '+JSON.stringify(box));return box;}
for(const engine of engines)for(const size of sizes)test(`${engine}: navegação, cards e missão em ${size.width}x${size.height}`,async t=>{
 const {context,page}=await pageFor(browsers[engine],size);t.after(()=>context.close());
 await page.screenshot({path:join(artifacts,engine+'-'+size.width+'-home.png')});
 assert.ok((await page.locator('.game-header').boundingBox()).height<=115,'Cabeçalho excessivo');
 assert.ok((await page.locator('.hangar-stage').boundingBox()).height<=520,'Hangar excessivo: '+JSON.stringify(await page.locator('.hangar-stage').evaluate(el=>[...el.children].filter(child=>getComputedStyle(child).position!=='absolute').map(child=>({name:child.className,height:child.getBoundingClientRect().height,top:child.getBoundingClientRect().top,gridArea:getComputedStyle(child).gridArea,minHeight:getComputedStyle(child).minHeight})))));
 const dock=await visibleInside(page,'.game-dock');const links=await page.locator('.game-dock>a,.game-dock>button').all();assert.equal(links.length,8);
 for(const link of links){const box=await link.boundingBox();assert.ok(box.y>=dock.y&&box.y+box.height<=dock.y+dock.height+1,'Navegação em mais de uma linha');assert.ok(box.height>=44,'Alvo de toque pequeno');}
 await page.locator('[data-a="mobile-menu"]').click();await visibleInside(page,'.mobile-menu-links');assert.ok((await page.locator('.mobile-menu-links').boundingBox()).height<=440,'Menu muito longo');
 await page.locator('[data-a="close"]').first().click();
 for(const route of ['robots','story','arena','shop','wallet','affiliates','guilds','market','events','admin','login']){
  await page.evaluate(route=>location.hash=route,route);await page.waitForTimeout(60);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Rolagem horizontal em '+route);
  if(route==='shop'){
   await page.screenshot({path:join(artifacts,engine+'-'+size.width+'-shop.png')});
   assert.ok((await page.locator('.catalog-card').first().boundingBox()).height<=380,'Card de catálogo excessivo: '+JSON.stringify(await page.locator('.catalog-card').first().evaluate(el=>({height:el.getBoundingClientRect().height,body:[...el.querySelector('.catalog-body').children].map(child=>({name:child.className,height:child.getBoundingClientRect().height,margin:getComputedStyle(child).margin}))}))));
   const cards=await page.locator('.catalog-card').all();const first=await cards[0].boundingBox(),second=await cards[1].boundingBox();assert.ok(Math.abs(first.y-second.y)<=1,'Catálogo não usa duas colunas');
   await page.screenshot({path:join(artifacts,engine+'-'+size.width+'-shop.png')});
  }
  if(route==='events'){
   assert.equal(await page.locator('.territory-node').count(),6);
   await page.locator('[data-a="conquest-focus"][data-id="cabin-1"]').click();
   assert.match(await page.locator('.conquest-command h3').textContent(),/Cabana/);
   for(const button of await page.locator('.conquest-orders button').all())assert.ok((await button.boundingBox()).height>=44,'Ordem sem alvo de toque suficiente');
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mapa gera rolagem horizontal');
   await page.screenshot({path:join(artifacts,engine+'-'+size.width+'-conquest.png'),fullPage:true});
  }
  if(route==='login')assert.ok(await page.locator('input[name="email"]').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16),'Campo aciona zoom automático do Safari');
 }
 await page.evaluate(()=>location.hash='story');await page.locator('[data-a="chapter"][data-id="1"]').first().click();
 await page.locator('[data-a="story-start"][data-mode="manual"]').click();await page.locator('.mission-travel').waitFor();
 await visibleInside(page,'[data-a="story-skipintro"]');
 assert.equal(await page.locator('.mission-dialogue').first().evaluate(el=>getComputedStyle(el).display),'block','Diálogo está dividido em colunas');
 await page.screenshot({path:join(artifacts,engine+'-'+size.width+'-mission.png')});
 await page.locator('[data-a="story-skipintro"]').click();await page.locator('.mission-battle').waitFor();
 await visibleInside(page,'.combat-controls');const field=await page.locator('.mission-battle').boundingBox();
 for(const selector of ['.mission-player .combat-sprite','.mission-enemy .combat-sprite']){const box=await page.locator(selector).boundingBox();assert.ok(box.height>=90&&box.x>=field.x-1&&box.x+box.width<=field.x+field.width+1&&box.y>=field.y-1&&box.y+box.height<=field.y+field.height+1,'Personagem cortado: '+selector);}
 await page.screenshot({path:join(artifacts,engine+'-'+size.width+'-battle.png')});
});
for(const engine of engines)test(`${engine}: hangar vazio não sobrepõe botões`,async t=>{
 const {context,page}=await pageFor(browsers[engine],{width:375,height:667},true);t.after(()=>context.close());
 const caption=await page.locator('.actor-caption').boundingBox(),actions=await page.locator('.hangar-actions').boundingBox();assert.ok(caption.y+caption.height<=actions.y+1,'Legenda sobrepõe ações');
 await visibleInside(page,'.hangar-actions');await page.screenshot({path:join(artifacts,engine+'-empty.png')});
});
