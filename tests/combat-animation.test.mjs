import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import {presentCombatTurn} from '../src/combat-animation.js';
import {robotAnimation,robotCombatProfile,COMBAT_ASSETS} from '../src/combat-profiles.js';
import {COMBAT_FRAMES} from '../src/combat-frames.js';
import {renderRobotSprite} from '../src/robot-sprite.js';
function fixture(kind='attack',duration=600){
 const state=C.initialState(),ticket=C.beginStory(state,1,state.robots[0].uid);C.enterStory(ticket);ticket.rules.actionMs=duration;if(kind==='special')ticket.energy=ticket.rules.energyMax;
 const b={ticket,playerHP:ticket.playerHP,enemyHP:ticket.enemyHP},result=C.storyTurn(ticket,kind,.5),queue=[],cues=[];let time=0,active=true,completed=0,defeated=0;
 presentCombatTurn({battle:b,kind,result,render(){},later:(battle,fn,ms)=>queue.push({at:time+ms,fn:()=>{if(active)fn();}}),audio:{play:(cue,robot)=>cues.push({cue,robot:robot?.asset})},onComplete:()=>completed++,onDefeated:()=>defeated++});
 const advance=ms=>{const end=time+ms;while(true){queue.sort((a,b)=>a.at-b.at);const item=queue[0];if(!item||item.at>end)break;queue.shift();time=item.at;item.fn();}time=end;};
 return {b,ticket,result,cues,advance,stop:()=>active=false,get completed(){return completed;},get defeated(){return defeated;}};
}
test('vida e efeitos mudam no impacto, motor resolve um turno e resposta toca o som do adversário',()=>{
 const f=fixture(),enemy=f.b.enemyHP,player=f.b.playerHP;assert.equal(f.ticket.turns,1);assert.equal(f.b.motion,'windup');assert.equal(f.b.enemyHP,enemy);assert.equal(f.b.playerHP,player);assert.equal(f.cues[0].cue,'servo');
 f.advance(168);assert.equal(f.b.motion,'strike');assert.equal(f.b.enemyHP,enemy);assert.equal(f.cues.at(-1).cue,'attack');
 f.advance(144);assert.equal(f.b.motion,'impact');assert.equal(f.b.enemyHP,f.result.enemyHP);assert.equal(f.cues.at(-1).cue,'hit');
 f.advance(600);assert.equal(f.b.action,'enemy-attack');assert.equal(f.b.playerHP,f.result.playerHP);f.advance(288);assert.equal(f.b.busy,false);assert.equal(f.completed,1);assert.equal(f.ticket.turns,1);
});
test('defesa e especial têm poses próprias e obedecem ao tempo congelado do combate',()=>{
 for(const [kind,row] of [['shield',4],['special',5]])for(const duration of [200,600,1600]){
  const f=fixture(kind,duration);assert.equal(f.b.playerRow,row);f.advance(duration*.52);assert.equal(f.b.enemyHP,f.result.enemyHP);assert.ok(f.cues.some(c=>c.cue===kind));f.advance(duration);if(kind==='shield'&&!f.result.defeated)assert.ok(f.cues.some(c=>c.cue==='block'));f.advance(duration*2);assert.equal(f.completed+f.defeated,1);assert.equal(f.ticket.turns,1);
 }
});
test('saída durante carga cancela efeitos tardios e callbacks de conclusão',()=>{
 const f=fixture('special');const hp=f.b.enemyHP;f.stop();f.advance(10000);assert.equal(f.b.enemyHP,hp);assert.equal(f.cues.length,1);assert.equal(f.completed,0);assert.equal(f.defeated,0);
});
test('todos os quinze modelos selecionam atlas novos; escolhas administrativas e atlas original são respeitados',()=>{
 const profiles=new Set();for(const def of C.DEFAULT_ROBOTS){const atlas=robotAnimation(def,true);assert.equal(atlas.columns,6);assert.equal(atlas.rows,6);assert.equal(atlas.asset,COMBAT_ASSETS.find(asset=>asset.startsWith(def.id+'-')));profiles.add(robotCombatProfile(def).style);if(def.asset.endsWith('-sprites.png'))assert.equal(robotAnimation({...def,animationAsset:'legacy'},true).columns,4);}
 assert.equal(profiles.size,9);assert.equal(robotAnimation({...C.DEFAULT_ROBOTS[0],animationAsset:'nova-combat-v6.png'},true).asset,'nova-combat-v6.png');assert.equal(robotCombatProfile({...C.DEFAULT_ROBOTS[0],combatStyle:'frost',soundPitch:.7}).pitch,.7);
});
test('540 poses são reproduzidas por caixas válidas; cada estado mostra seis quadros e o original continua disponível',()=>{
 assert.equal(Object.keys(COMBAT_FRAMES).length,15);
 for(const def of C.DEFAULT_ROBOTS){const meta=COMBAT_FRAMES[COMBAT_ASSETS.find(asset=>asset.startsWith(def.id+'-'))];assert.equal(meta.frames.length,36);for(const f of meta.frames){assert.ok(f.x>=0&&f.y>=0&&f.x+f.width<=meta.width&&f.y+f.height<=meta.height);assert.ok(f.anchorX>=f.x&&f.anchorX<=f.x+f.width&&f.anchorY>=f.y&&f.anchorY<=f.y+f.height);}
  for(let row=0;row<6;row++){const html=renderRobotSprite(def,'combat-sprite',row,{once:true,duration:600,offset:312});assert.equal((html.match(/class="combat-pose /g)||[]).length,6);assert.match(html,/sprite-rects/);assert.match(html,/--sprite-offset:-312ms/);assert.ok(!html.includes('NaN'));}
  if(def.asset.endsWith('-sprites.png'))assert.match(renderRobotSprite({...def,animationAsset:'legacy'},'combat-sprite',4),/data-row="0"/);if(def.asset.endsWith('-sprites.png'))assert.match(renderRobotSprite({...def,animationAsset:'legacy'},'combat-sprite',5),/data-row="1"/);
 }
});
