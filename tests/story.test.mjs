import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
function finish(ticket){C.enterStory(ticket);let count=0;while(!['won','lost'].includes(ticket.status)&&count++<100){if(ticket.status==='wave-cleared')C.nextStoryWave(ticket);else C.storyTurn(ticket,ticket.energy===3?'special':'attack',.5);}assert.ok(count<100);}
test('começar e vencer só a primeira onda não paga nem avança o capítulo',()=>{
 const s=C.initialState(),before=s.balances.RC,used=s.daily.used,robotUsed=s.robots[0].used,t=C.beginStory(s,1,s.robots[0].uid);
 assert.equal(t.enemies.length,2);assert.equal(t.status,'travel');assert.throws(()=>C.resolveStory(s,t),/Termine/);
 C.enterStory(t);while(t.status==='fighting')C.storyTurn(t,'attack',.5);
 assert.equal(t.status,'wave-cleared');assert.equal(s.story,0);assert.equal(s.balances.RC,before);
 assert.throws(()=>C.resolveStory(s,t),/Termine/);assert.equal(s.daily.used,used);assert.equal(s.robots[0].used,robotUsed);
});
test('capítulo só paga depois de derrotar todos os robôs e paga uma única vez',()=>{
 const s=C.initialState(),before=s.balances.RC,t=C.beginStory(s,1,s.robots[0].uid);finish(t);
 assert.equal(t.status,'won');assert.equal(t.defeated,2);assert.equal(C.resolveStory(s,t),120);
 assert.equal(s.balances.RC,before+120);assert.equal(s.story,1);assert.equal(s.storyRuns.length,1);
 assert.throws(()=>C.resolveStory(s,t),/finalizada/);
});
test('uma missão em andamento é retomada, cobra replay uma vez e nunca repete o prêmio',()=>{
 const s=C.initialState(),a=C.beginStory(s,1,s.robots[0].uid),b=C.beginStory(s,1,s.robots[0].uid);assert.equal(a,b);
 finish(a);C.resolveStory(s,a);assert.throws(()=>C.resolveStory(s,b),/finalizada/);
 const before=s.balances.RC,replay=C.beginStory(s,1,s.robots[0].uid);assert.equal(replay.replay,true);assert.equal(replay.reward,0);assert.equal(s.balances.RC,before-40);
 assert.equal(C.beginStory(s,1,s.robots[0].uid),replay);assert.equal(s.balances.RC,before-40);
 finish(replay);assert.equal(C.resolveStory(s,replay),0);assert.equal(s.balances.RC,before-40);
 assert.equal(s.transactions.filter(x=>x.kind==='História · O despertar').length,1);
});
test('derrota e interrupção não pagam recompensa nem avançam capítulos',()=>{
 const s=C.initialState(),before=s.balances.RC,loss=C.beginStory(s,1,s.robots[0].uid);C.enterStory(loss);loss.playerHP=1;
 C.storyTurn(loss,'attack',1);assert.equal(loss.status,'lost');assert.equal(C.resolveStory(s,loss),0);
 const cancelled=C.beginStory(s,1,s.robots[0].uid);C.cancelStory(cancelled);
 assert.throws(()=>C.enterStory(cancelled),/começou/);assert.throws(()=>C.resolveStory(s,cancelled),/Termine/);
 assert.equal(s.balances.RC,before);assert.equal(s.story,0);
});
test('bloqueios, robô expirado, força exigida e movimentos inválidos são recusados',()=>{
 const s=C.initialState();assert.throws(()=>C.beginStory(s,3,s.robots[0].uid),/anterior/);
 s.story=5;assert.throws(()=>C.beginStory(s,6,s.robots[0].uid),/100/);
 s.story=0;assert.throws(()=>C.beginStory(s,1,s.robots[0].uid,Date.now()+100*C.DAY),/prazo/);
 const t=C.beginStory(s,1,s.robots[0].uid);C.enterStory(t);const before=C.clone(t);
 assert.throws(()=>C.storyTurn(t,'special'),/energia/);assert.deepEqual(t,before);
 assert.throws(()=>C.storyTurn(t,'invalid'),/inválido/);assert.throws(()=>C.storyTurn(t,'attack',NaN),/inválido/);
});
test('recuperação entre ondas respeita 35% e nunca ultrapassa vida máxima',()=>{
 const s=C.initialState(),t=C.beginStory(s,1,s.robots[0].uid);C.enterStory(t);
 while(t.status==='fighting')C.storyTurn(t,'attack',.5);
 const old=t.playerHP,recovered=C.nextStoryWave(t);assert.equal(recovered.healed,Math.min(t.player.health-old,Math.ceil(t.player.health*.35)));
 assert.ok(t.playerHP<=t.player.health);assert.equal(t.enemyIndex,1);assert.equal(t.enemyHP,t.enemies[1].health);
 assert.throws(()=>C.nextStoryWave(t),/Vença/);
});
test('os 54 capítulos têm oponentes e uma equipe evoluída pode completar toda a campanha',()=>{
 const s=C.initialState();s.balances.LC=100000;const robot=C.buyRobot(s,'onyx');robot.level=10;robot.overrides={attack:800,defense:800,health:2000};const piece=C.buyPart(s,'nova-arm');piece.level=3;C.equip(s,robot.uid,piece.uid);
 for(const chapter of C.CHAPTERS){const t=C.beginStory(s,chapter.id,robot.uid);assert.equal(t.enemies.length,chapter.enemies.length);assert.ok(t.enemies.at(-1).boss);finish(t);assert.equal(t.status,'won');assert.equal(C.resolveStory(s,t),chapter.reward);}
 assert.equal(s.story,42);assert.equal(s.storyRuns.length,54);
});
