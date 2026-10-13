import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installDragScroll} from '../src/drag-scroll.js';
import * as C from '../src/core.js';
import {robotSlots,createEquipmentView} from '../src/equipment-view.js';

function documentFixture(){const handlers=new Map(),classes=new Set(),el={nodeType:1,scrollHeight:600,clientHeight:200,scrollWidth:100,clientWidth:100,scrollTop:70,scrollLeft:0,parentElement:null,closest:()=>null},doc={scrollingElement:el,body:{classList:{add:k=>classes.add(k),remove:k=>classes.delete(k)}},addEventListener:(n,fn)=>handlers.set(n,fn),removeEventListener:(n,fn)=>{if(handlers.get(n)===fn)handlers.delete(n);}};return {handlers,classes,el,doc,emit:(name,event={})=>handlers.get(name)?.(event)};}
test('arrastar com mouse rola após o limiar e bloqueia apenas o clique do arraste',()=>{
 const f=documentFixture(),dispose=installDragScroll(f.doc);let prevented=0,stopped=0;
 f.emit('pointerdown',{pointerType:'mouse',button:0,target:f.el,clientX:20,clientY:100});f.emit('pointermove',{clientX:20,clientY:104,preventDefault:()=>prevented++});assert.equal(f.el.scrollTop,70);
 f.emit('pointermove',{clientX:20,clientY:150,preventDefault:()=>prevented++});assert.equal(f.el.scrollTop,20);assert.ok(f.classes.has('is-drag-scrolling'));f.emit('pointerup');assert.equal(f.classes.size,0);
 f.emit('click',{preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++});assert.equal(stopped,1);f.emit('click',{preventDefault:()=>prevented++,stopImmediatePropagation:()=>stopped++});assert.equal(stopped,1);assert.equal(prevented,2);dispose();assert.equal(f.handlers.size,0);
});
test('toque, campos de entrada e cancelamento preservam o comportamento nativo',()=>{
 const f=documentFixture(),dispose=installDragScroll(f.doc);for(const pointerType of ['touch','pen']){f.emit('pointerdown',{pointerType,button:0,target:f.el,clientX:0,clientY:0});f.emit('pointermove',{clientX:0,clientY:100,preventDefault:()=>assert.fail('Toque deve continuar nativo')});assert.equal(f.el.scrollTop,70);}
 f.emit('pointerdown',{pointerType:'mouse',button:0,target:{closest:()=>({tagName:'TEXTAREA'})},clientX:0,clientY:0});f.emit('pointermove',{clientX:0,clientY:100,preventDefault:()=>assert.fail('Campo não pode iniciar arraste')});assert.equal(f.el.scrollTop,70);
 f.emit('pointerdown',{pointerType:'mouse',button:0,target:f.el,clientX:0,clientY:0});f.emit('pointermove',{clientX:0,clientY:50,preventDefault(){}});f.emit('pointercancel');f.emit('click',{preventDefault:()=>assert.fail('Cancelamento não bloqueia clique'),stopImmediatePropagation(){}});dispose();
});
test('espaços vêm do contrato do robô e ação de evolução aparece junto à peça instalada',()=>{
 const s=C.initialState(),r=s.robots[0],i=C.buyPart(s,'core');C.equip(s,r.uid,i.uid);let modal='';const view=createEquipmentView({core:C,getState:()=>s,escape:String,icon:()=>'',button:(label,action,attrs)=>`<button data-a="${action}" ${attrs}>${label}</button>`,partArt:p=>`<img alt="${p.name}">`,modal:html=>modal=html});
 let info=C.robotInfo(s,r),html=view.slots(info);assert.match(html,/data-a="slot-upgrade"/);assert.match(html,/data-a="slot-equip"[^>]+data-slot="arm"/);assert.match(html,/Pulso Verde/);view.open(r.uid,'core');assert.match(modal,/data-a="slot-buy"/);assert.match(modal,/Adquirir e equipar/);
 r.contract.slots=['core','sensor'];info=C.robotInfo(s,r);assert.deepEqual(robotSlots(info),['core','sensor']);html=view.slots(info);assert.match(html,/Sensor/);assert.ok(!html.includes('data-slot="shield"'));assert.throws(()=>view.open(r.uid,'shield'),/espaço/);
});
test('um robô usado em duelo persistido não equipa nem evolui até o encerramento',()=>{
 const s=C.initialState(),r=s.robots[0],i=C.buyPart(s,'core');C.equip(s,r.uid,i.uid);s.social={activeGuildBattle:{uid:r.uid,settled:false}};
 for(const fn of [()=>C.equip(s,r.uid,i.uid),()=>C.levelPart(s,i.uid),()=>C.levelUp(s,r.uid),()=>C.storyQuote(s,1,r.uid)])assert.throws(fn,/batalha/);
 s.social.activeGuildBattle=null;C.levelPart(s,i.uid);assert.equal(i.level,2);
});
