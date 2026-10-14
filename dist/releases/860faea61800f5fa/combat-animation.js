import {robotCombatProfile} from './combat-profiles.js';

// Apenas apresentação. O motor resolve o turno uma única vez antes desta sequência.
export function presentCombatTurn({battle:b,kind,result,render,later,audio,onDefeated,onComplete}){
 const p=b.ticket.player,e=b.ticket.opponent||b.ticket.enemies[b.ticket.enemyIndex];
 const duration=b.ticket.rules.actionMs,generation=b.animationGeneration=(b.animationGeneration||0)+1;
 const schedule=(fn,ms)=>later(b,()=>{if(b.animationGeneration===generation)fn();},Math.round(ms));
 const action=kind==='special'?'special':kind==='shield'?'shield':'player-attack';
 const row=kind==='special'?5:kind==='shield'?4:1;
 b.busy=true;b.moveKind=kind;b.action=action;b.motion='windup';b.enemyDamage=0;b.playerDamage=0;b.playerRow=row;b.enemyRow=0;b.playerOffset=0;b.enemyOffset=0;
 b.log=kind==='special'?'O núcleo concentra energia para o especial…':kind==='shield'?'Escudo levantado. Preparando o contra-ataque…':'Seu robô prepara o golpe…';
 audio?.play(kind==='special'?'charge':kind==='shield'?'guard':'servo',p);render(b);
 schedule(()=>{b.motion='strike';b.playerOffset=duration*.28;audio?.play(kind,p);render(b);},duration*.28);
 schedule(()=>{b.motion='impact';b.playerOffset=duration*.52;b.enemyRow=2;b.enemyOffset=0;b.previousEnemyHP=b.enemyHP;b.enemyHP=result.enemyHP;b.enemyDamage=result.damage;
  b.log=`${kind==='special'?'Especial':kind==='shield'?'Contra-ataque protegido':'Ataque'}: ${result.damage} de dano.`;audio?.play('hit',e.def||e);render(b);
 },duration*.52);
 schedule(()=>{b.motion='recover';b.previousEnemyHP=b.enemyHP;b.playerOffset=duration*.82;b.enemyOffset=duration*.3;render(b);},duration*.82);
 schedule(()=>{
  if(result.defeated||result.status==='won'){
   b.action='wave-win';b.motion='down';b.playerRow=0;b.enemyRow=3;b.playerOffset=b.enemyOffset=0;b.log='Adversário derrotado. Passagem liberada!';audio?.play('knockout',e.def||e);render(b);
   schedule(()=>onDefeated(result),duration*.7);return;
  }
  if(result.noRetaliation){b.busy=false;b.action='';b.motion='idle';b.playerRow=b.enemyRow=0;b.playerOffset=b.enemyOffset=0;onComplete(result);return;}
  b.action='enemy-attack';b.motion='windup';b.playerRow=kind==='shield'?4:0;b.enemyRow=1;b.enemyDamage=0;b.playerOffset=kind==='shield'?duration*.32:0;b.enemyOffset=0;b.log=`${e.name} prepara uma resposta…`;audio?.play('servo',e.def||e);render(b);
  schedule(()=>{b.motion='strike';b.enemyOffset=duration*.28;audio?.play('attack',e.def||e);render(b);},duration*.28);
  schedule(()=>{b.motion='impact';b.enemyOffset=duration*.52;b.previousPlayerHP=b.playerHP;b.playerHP=result.playerHP;b.playerDamage=result.retaliation;b.playerRow=kind==='shield'?4:2;b.playerOffset=kind==='shield'?duration*.32:0;b.log=`${e.name}: ${result.retaliation} de dano${kind==='shield'?' · Escudo absorveu parte do golpe':''}.`;audio?.play(kind==='shield'?'block':'hit',p);render(b);},duration*.52);
  schedule(()=>{b.motion='recover';b.previousPlayerHP=b.playerHP;b.enemyOffset=duration*.82;b.playerOffset=kind==='shield'?duration*.5:duration*.3;render(b);},duration*.82);
  schedule(()=>{b.previousPlayerHP=b.playerHP;b.previousEnemyHP=b.enemyHP;b.playerRow=b.enemyRow=0;b.playerOffset=b.enemyOffset=0;b.action='';b.motion='idle';b.busy=false;onComplete(result);},duration);
 },duration);
}
export function combatFieldData(b,sceneStyle=''){
 const p=b.ticket.player,e=b.ticket.opponent||b.ticket.enemies[b.ticket.enemyIndex],actor=b.action==='enemy-attack'?(e.def||e):p,target=b.action==='enemy-attack'?p:(e.def||e);
 const a=robotCombatProfile(actor),t=robotCombatProfile(target);
 return `data-motion="${b.motion||'idle'}" data-weapon="${a.style}" style="${sceneStyle};--actor-color:${a.color};--target-color:${t.color};--action-duration:${b.ticket.rules.actionMs}ms"`;
}
export function combatSpriteOptions(b,side){return {duration:b.ticket.rules.actionMs,offset:b[side+'Offset']||0,once:!!b.busy};}
export function combatEffects(b,icon){
 const attacking=b.action==='enemy-attack',target=attacking?'player':'enemy',impact=b.motion==='impact',damage=impact?(attacking?b.playerDamage:b.enemyDamage):0;
 const guarded=b.moveKind==='shield'&&attacking;
 return `<div class="combat-fx ${attacking?'reverse':''}" aria-hidden="true">${b.motion==='windup'?'<div class="charge-vortex"><i></i><i></i><i></i></div><div class="servo-trail"></div>':''}${b.motion==='strike'?'<div class="weapon-trail"></div><div class="combat-projectile"><i></i></div>':''}${impact?`<div class="impact-rings impact-${target} ${guarded?'blocked':''}"><i></i><i></i></div><div class="impact-shards shards-${target}">${Array.from({length:8},(_,i)=>`<i style="--shard:${i}"></i>`).join('')}</div><div class="hit-burst burst-${target}">${icon('spark')}</div>`:''}${b.motion==='down'?'<div class="defeat-motes">'+Array.from({length:8},(_,i)=>`<i style="--shard:${i}"></i>`).join('')+'</div>':''}</div>${damage?`<div class="damage-number damage-${target} ${b.moveKind==='special'&&!attacking?'special-damage':''}">${guarded?'BLOQUEIO<br>':''}−${damage}</div>`:''}`;
}
