import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import {createArenaQueue} from '../src/arena-queue.js';
function setup(t,isDemo=true){let state=C.initialState(),q=null,html='',battle=null,time=0;const timers=[];const original=setTimeout;globalThis.setTimeout=(fn,delay)=>timers.push({fn,at:time+delay});t.after(()=>globalThis.setTimeout=original);
 const view=createArenaQueue({core:C,isDemo,getState:()=>state,getQueue:()=>q,setQueue:v=>q=v,getCombat:()=>null,modal:s=>html=s,closeModal:()=>html='',toast(){},startBattle:o=>battle=C.beginBattle(state,state.robots[0].uid,o),findOnline:async()=>{throw new Error('Backend pending');},escape:String,icon:String,button:(x,a)=>`<button data-a="${a}">${x}</button>`,sprite:def=>`<div class="sprite">${def.name}</div>`});
 function advance(ms){const target=time+ms;let count=0;while(true){timers.sort((a,b)=>a.at-b.at);if(!timers.length||timers[0].at>target)break;const timer=timers.shift();time=timer.at;timer.fn();assert.ok(++count<100);}time=target;}
 return {view,state,advance,get html(){return html;},get queue(){return q;},get battle(){return battle;}};
}
test('a fila espera e encontra um bot identificado; só então consome uma batalha',async t=>{
 const f=setup(t),used=f.state.robots[0].used;await f.view.start(f.state.robots[0].uid);assert.match(f.html,/Procurando um jogador/);assert.equal(f.state.daily.used,0);
 f.advance(8000);assert.match(f.html,/Controlado pelo jogo/);assert.ok(!f.html.includes(' · BOT'));assert.equal(f.state.daily.used,0);f.advance(900);assert.equal(f.battle.opponent.isBot,true);assert.equal(f.state.daily.used,1);assert.equal(f.state.robots[0].used,used+1);
});
test('cancelar e tentativas simultâneas não criam batalhas adicionais',async t=>{
 const f=setup(t);await f.view.start(f.state.robots[0].uid);const first=f.queue;await f.view.start(f.state.robots[0].uid);assert.equal(f.queue,first);
 f.view.cancel();f.advance(20000);assert.equal(f.battle,null);assert.equal(f.state.daily.used,0);
});
test('o tempo do admin é respeitado e cancelar durante a apresentação do bot não debita a cota',async t=>{
 const f=setup(t);f.state.settings.matchTimeoutSeconds=3;await f.view.start(f.state.robots[0].uid);
 f.advance(2999);assert.equal(f.queue.status,'searching');f.advance(1);assert.equal(f.queue.status,'bot');
 f.view.cancel();f.advance(1000);assert.equal(f.battle,null);assert.equal(f.state.daily.used,0);
});
test('batalhas esgotadas bloqueiam a busca e contas conectadas não recebem resultados locais',async t=>{
 const f=setup(t);f.state.daily.used=4;await f.view.start(f.state.robots[0].uid);assert.equal(f.queue,null);assert.equal(f.battle,null);
 const online=setup(t,false);await online.view.start(online.state.robots[0].uid);online.advance(20000);assert.equal(online.battle,null);assert.equal(online.state.daily.used,0);
});
