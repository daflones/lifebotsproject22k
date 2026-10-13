import {test} from 'node:test';
import assert from 'node:assert/strict';
import {chatWindowLayout,chatWindowPosition,createFloatingChat} from '../src/floating-chat.js';
import * as C from '../src/core.js';
import {ensureSocial} from '../src/social-core.js';
import {createSocialView} from '../src/social-view.js';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fixture(width=1000){const state=C.initialState();ensureSocial(state);let room='global',page='home';const data=new Map(),events=new Map(),windowEvents=new Map(),classes=new Set(),panel={style:{}},root={innerHTML:'',hidden:false,classList:{add:v=>classes.add(v),remove:v=>classes.delete(v)},addEventListener:(n,fn)=>events.set(n,fn),removeEventListener:(n,fn)=>{if(events.get(n)===fn)events.delete(n);},querySelector:selector=>selector==='.chat-float'?panel:null},win={innerWidth:width,innerHeight:800,addEventListener:(n,fn)=>windowEvents.set(n,fn),removeEventListener:(n,fn)=>{if(windowEvents.get(n)===fn)windowEvents.delete(n);}},doc={documentElement:{},querySelector:()=>null},storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},view={setRoom:r=>room=r,getRoom:()=>room,getChannel:()=>room,roomTitle:()=>room,chatPanel:({draft})=>`<form id="floating-chat-form"><textarea>${escape(draft)}</textarea></form>`};
 const env={getState:()=>state,getPage:()=>page,view,escape,icon:()=>'',root,window:win,document:doc,storage};const chat=createFloatingChat(env);chat.refresh();return {chat,state,root,panel,events,windowEvents,classes,data,win,env,setPage:p=>page=p,emit:(name,event={})=>events.get(name)?.(event)};
}
test('janela cabe no celular, mantém a barra inferior livre e se adapta ao teclado',()=>{
 for(const viewport of [{width:360,height:740,bottomReserve:80},{width:390,height:290,bottomReserve:0,left:20,top:100},{width:1440,height:900,bottomReserve:84}])for(const mode of ['minimized','window','maximized']){
  const r=chatWindowLayout(viewport,mode,{x:2,y:-1});assert.ok(r.x>=viewport.left||!viewport.left);assert.ok(r.y>=(viewport.top||0));assert.ok(r.x+r.width<=(viewport.left||0)+viewport.width);assert.ok(r.y+r.height<=(viewport.top||0)+viewport.height-viewport.bottomReserve);
 }
 const r=chatWindowLayout({width:360,height:740,bottomReserve:80},'window');assert.equal(r.width,340);assert.equal(r.height,360);assert.deepEqual(chatWindowPosition(r,-999,9999),{x:0,y:1});
});
test('no celular o chat começa minimizado e respeita a escolha salva de abrir',()=>{
 const f=fixture(390);assert.equal(f.chat.mode,'minimized');assert.ok(!f.root.innerHTML.includes('textarea'));
 f.chat.open();const restored=createFloatingChat(f.env);restored.refresh();assert.equal(restored.mode,'window');restored.dispose();f.chat.dispose();
});
test('minimizar, maximizar e restaurar preservam posição, canal e rascunho',()=>{
 const f=fixture();assert.match(f.root.innerHTML,/data-chat-mode="window"/);f.chat.setDraft('Texto <a guardar>');f.chat.minimize();assert.match(f.root.innerHTML,/data-chat-mode="minimized"/);assert.ok(!f.root.innerHTML.includes('textarea'));
 f.chat.maximize();assert.match(f.root.innerHTML,/data-chat-mode="maximized"/);assert.match(f.root.innerHTML,/Texto &lt;a guardar&gt;/);f.chat.maximize();assert.equal(f.chat.mode,'window');assert.deepEqual(f.chat.position,{x:1,y:1});
 f.chat.setRoom('market');assert.ok(!f.root.innerHTML.includes('Texto'));f.chat.setRoom('global');assert.ok(f.root.innerHTML.includes('Texto'));f.chat.clearDraft();assert.ok(!f.root.innerHTML.includes('Texto'));f.chat.dispose();
});
test('arraste por mouse ou dedo fica dentro da tela e bloqueia clique gerado pelo gesto',()=>{
 for(const pointerType of ['mouse','touch']){const f=fixture(),target={closest:()=>({focus(){}})};let prevented=0,stopped=0;
  f.emit('pointerdown',{target,pointerType,pointerId:1,button:0,clientX:900,clientY:600,preventDefault(){}});f.emit('pointermove',{pointerId:1,clientX:200,clientY:100,preventDefault:()=>prevented++});assert.ok(f.chat.position.x<1);assert.ok(f.chat.position.y<1);assert.ok(f.classes.has('is-chat-dragging'));f.emit('pointerup',{pointerId:1});assert.equal(f.classes.size,0);
  f.emit('click',{preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++});assert.equal(stopped,1);assert.equal(prevented,2);assert.ok(Number.parseFloat(f.panel.style.left)>=10);assert.ok(Number.parseFloat(f.panel.style.top)>=10);f.chat.dispose();
 }
});
test('cancelar arraste restaura posição e teclado move sem arrastar mensagens ou campos',()=>{
 const f=fixture(),target={closest:()=>({focus(){}})},initial=f.chat.position;
 f.emit('pointerdown',{target,pointerId:2,button:0,clientX:900,clientY:600,preventDefault(){}});f.emit('pointermove',{pointerId:2,clientX:100,clientY:100,preventDefault(){}});f.emit('pointercancel');assert.deepEqual(f.chat.position,initial);
 f.emit('pointerdown',{target:{closest:()=>null},pointerId:3,button:0,clientX:0,clientY:0,preventDefault:()=>assert.fail('Campo não inicia arraste')});f.emit('keydown',{target,key:'ArrowLeft',shiftKey:true,preventDefault(){}});assert.ok(f.chat.position.x<1);f.chat.maximize();const position=f.chat.position;f.emit('keydown',{target,key:'ArrowLeft',preventDefault:()=>assert.fail('Maximizado não deve mover')});assert.deepEqual(f.chat.position,position);f.chat.dispose();assert.equal(f.events.size,0);assert.equal(f.windowEvents.size,0);
});
test('preferências persistem por conta, janela fica oculta no login e respeita configuração admin',()=>{
 const f=fixture();f.chat.setRoom('market');f.chat.minimize();const another=createFloatingChat(f.env);another.refresh();assert.equal(another.mode,'minimized');assert.match(f.root.innerHTML,/market/);f.setPage('login');another.refresh();assert.equal(f.root.hidden,true);
 f.setPage('home');f.state.settings.social.chatFloatingEnabled=false;another.refresh();assert.equal(f.root.hidden,true);f.state.settings.social.chatFloatingEnabled=true;f.state.profile.id='new-profile';another.refresh();assert.equal(another.mode,'window');assert.equal(f.root.hidden,false);another.dispose();f.chat.dispose();
});
test('painel flutuante usa os mesmos canais e permissões, com texto escapado',()=>{
 const state=C.initialState();ensureSocial(state);state.social.messages.unshift({id:'test-message',authorId:state.profile.id,name:'<Piloto>',room:'global',text:'<script>alert(1)</script>',at:Date.now()});
 const view=createSocialView({getState:()=>state,isDemo:true,escape,icon:()=>'',coin:()=>'',sprite:()=>'',button:(label,action,extra)=>`<button data-a="${action}" ${extra}>${label}</button>`,heading:()=>'',assetUrl:String,input:()=>'',textarea:()=>'',modal(){},format:String,baseUrl:()=> 'https://game.test/#home'});
 const panel=view.chatPanel({floating:true,draft:'<rascunho>'});assert.match(panel,/floating-chat-form/);assert.match(panel,/&lt;script&gt;/);assert.match(panel,/&lt;rascunho&gt;/);assert.ok(!panel.includes('<script>'));view.setRoom('guild');assert.equal(view.getChannel(),null);assert.match(view.chatPanel({floating:true}),/Encontrar guilda/);assert.ok(!view.chatPanel({floating:true}).includes('floating-chat-form'));
});
test('X remove o chat da tela e reabrir preserva canal, posição e rascunho',()=>{
 const f=fixture();f.chat.setRoom('market');f.chat.setDraft('Oferta em andamento');assert.match(f.root.innerHTML,/data-a="floating-chat-close"/);
 const position=f.chat.position;f.chat.close();assert.equal(f.chat.mode,'closed');assert.equal(f.root.hidden,true);assert.equal(f.root.innerHTML,'');f.chat.refresh();assert.equal(f.root.innerHTML,'');
 f.chat.open();assert.equal(f.root.hidden,false);assert.match(f.root.innerHTML,/market/);assert.match(f.root.innerHTML,/Oferta em andamento/);assert.deepEqual(f.chat.position,position);
 f.chat.close();const restored=createFloatingChat(f.env);restored.refresh();assert.equal(restored.mode,'closed');assert.equal(f.root.hidden,true);restored.open();assert.equal(f.root.hidden,false);restored.dispose();f.chat.dispose();
});
