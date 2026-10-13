import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import {createStoryView} from '../src/story-view.js';
function fixture(t){
 let state=C.initialState(),combat=null,html='',saved=0,time=0,nextId=0;const queue=[];
 const original=globalThis.setTimeout;globalThis.setTimeout=(fn,delay)=>{queue.push({id:++nextId,fn,at:time+delay});return nextId;};t.after(()=>globalThis.setTimeout=original);
 const env={core:C,isDemo:true,getState:()=>state,setState:s=>state=s,getCombat:()=>combat,setCombat:b=>combat=b,
  modal:h=>html=h,closeModal:()=>html='',render(){},save:()=>saved++,toast(){},escape:String,
  icon:name=>`<svg>${name}</svg>`,button:(label,action,extra='',cls='')=>`<button data-a="${action}" class="${cls}" ${extra}>${label}</button>`,
  sprite:(def,cls='',row=0)=>`<div class="sprite ${cls}" data-row="${row}">${def.name}</div>`,coin:type=>`<span>${type}</span>`,format:String};
 let view=createStoryView(env);
 function advance(ms){const until=time+ms;let count=0;while(true){queue.sort((a,b)=>a.at-b.at||a.id-b.id);if(!queue.length||queue[0].at>until)break;const item=queue.shift();time=item.at;item.fn();assert.ok(++count<300,'Loop de animação não terminou.');}time=until;}
 return {get view(){return view;},reload(){state=C.clone(state);combat=null;view=createStoryView(env);},get state(){return state;},get combat(){return combat;},get html(){return html;},get saved(){return saved;},advance};
}
test('a exploração apresenta viagem, ataques, próxima onda e prêmio após vitória',t=>{
 const f=fixture(t),before=f.state.balances.RC;f.view.start(1,f.state.robots[0].uid);
 assert.match(f.html,/mission-travel/);assert.match(f.html,/Robôs|ROBÔS/);assert.equal(f.state.balances.RC,before);
 f.view.enter();f.advance(650);assert.match(f.html,/action-player-attack/);assert.match(f.html,/data-motion="windup"/);assert.ok(!f.html.includes('damage-enemy'));assert.equal(f.state.story,0);
 f.advance(312);assert.match(f.html,/data-motion="impact"/);assert.match(f.html,/damage-enemy/);
 f.advance(600);assert.match(f.html,/action-enemy-attack/);assert.match(f.html,/damage-player/);
 f.advance(60000);assert.equal(f.combat,null);assert.match(f.html,/MISSÃO CONCLUÍDA/);assert.match(f.html,/\+120 RC/);
 assert.match(f.html,/RobotCoins adicionadas/);assert.equal(f.state.balances.RC,before+120);assert.ok(f.saved>=3);
});
test('é possível assumir os controles e retomar combate automático',t=>{
 const f=fixture(t);f.view.start(1,f.state.robots[0].uid);f.view.enter();f.view.toggleAuto();
 f.advance(5000);assert.equal(f.combat.ticket.turns,0);assert.match(f.html,/Modo manual/);
 f.view.move('shield');assert.equal(f.combat.ticket.turns,1);assert.match(f.html,/shield-field/);f.advance(1200);
 f.view.toggleAuto();f.advance(60000);assert.equal(f.state.story,1);assert.ok(f.saved>=3);
});
test('sair durante ataque cancela os callbacks e nunca credita prêmio atrasado',t=>{
 const f=fixture(t),before=f.state.balances.RC;f.view.start(1,f.state.robots[0].uid);f.view.enter();f.advance(650);
 f.view.exit();f.advance(60000);assert.equal(f.combat,null);assert.equal(f.state.story,0);assert.equal(f.state.balances.RC,before);assert.ok(f.saved>=2);
});
test('derrota e replay exibem a condição correta da recompensa',t=>{
 const f=fixture(t),before=f.state.balances.RC;f.view.start(1,f.state.robots[0].uid);f.view.enter();f.combat.ticket.playerHP=1;f.combat.playerHP=1;
 f.advance(60000);assert.match(f.html,/Nenhum prêmio creditado/);assert.equal(f.state.balances.RC,before);
 f.view.start(1,f.state.robots[0].uid);f.view.enter();f.advance(60000);assert.equal(f.state.story,1);
 f.view.start(1,f.state.robots[0].uid);f.view.enter();f.advance(60000);assert.match(f.html,/Prêmio já resgatado/);assert.equal(f.state.balances.RC,before+120-40);
});

test('a viagem aguarda o piloto e um replay recarregado continua sem cobrar novamente',t=>{
 const f=fixture(t);f.state.story=1;const before=f.state.balances.RC;f.view.start(1,f.state.robots[0].uid);
 assert.equal(f.state.balances.RC,before-40);f.advance(10000);assert.equal(f.combat.phase,'travel');assert.match(f.html,/NEXA/);
 f.view.enter();f.view.toggleAuto();f.view.move('attack');f.advance(1200);const id=f.combat.ticket.id,turns=f.combat.ticket.turns;
 f.reload();f.view.start(1,f.state.robots[0].uid);assert.equal(f.combat.ticket.id,id);assert.equal(f.combat.ticket.turns,turns);assert.equal(f.state.balances.RC,before-40);
 assert.equal(f.combat.auto,false);f.view.toggleAuto();f.advance(60000);assert.equal(f.combat,null);assert.equal(f.state.balances.RC,before-40);assert.match(f.html,/Prêmio já resgatado/);
});
