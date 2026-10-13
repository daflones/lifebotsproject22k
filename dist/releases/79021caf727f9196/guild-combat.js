import * as C from './core.js';
import {beginGuildBattle,settleGuildBattle} from './guilds.js';
import {presentCombatTurn} from './combat-animation.js';
export function createGuildCombat(env){const current=()=>env.getCombat(),later=(b,fn,ms)=>setTimeout(()=>{if(current()===b)fn();},ms);
 function render(b){env.modal(env.presentation.arena(b),'combat-modal immersive-combat guild-combat');}
 function start(id,uid){if(current())return;if(!env.isDemo){env.toast('As guerras entre guildas serão sincronizadas pelo servidor.',true);return;}const next=C.clone(env.getState()),saved=next.social.activeGuildBattle,ticket=saved&&!saved.settled?saved:beginGuildBattle(next,id,uid);env.setState(next);env.save();const b={kind:'guild',scene:ticket.scene,ticket,playerHP:ticket.playerHP,enemyHP:ticket.enemyHP,energy:ticket.energy,round:ticket.round,busy:false,playerRow:0,enemyRow:0,action:'',log:'Defenda o sinal da sua guilda. Escolha seu movimento.'};env.setCombat(b);env.audio.setScene('combat');env.audio.play('start');if(['won','lost'].includes(ticket.status)){finish();return;}render(b);}
 function move(kind){const b=current();if(b?.kind!=='guild'||b.busy)return;const result=C.storyTurn(b.ticket,kind,Math.random());env.save();b.energy=result.energy;
  presentCombatTurn({battle:b,kind,result,render,later,audio:env.audio,onDefeated:finish,onComplete:()=>{if(result.status==='lost'){finish();return;}b.round=b.ticket.round;b.log='Seu próximo movimento decide a passagem.';render(b);}});
 }

 function finish(){const b=current();if(b?.kind!=='guild')return;const next=C.clone(env.getState()),ticket=next.social.activeGuildBattle,outcome=settleGuildBattle(next,ticket);env.setState(next);env.save();env.setCombat(null);env.render();env.audio.play(outcome.win?'victory':'lose');env.modal(`<div class="battle-result ${outcome.win?'win':'lose'}">${env.sprite(ticket.player,'result-sprite',outcome.win?3:2)}<span class="eyebrow">DUELO DE GUILDA ENCERRADO</span><h2 id="modal-title">${outcome.win?'O sinal está seguro!':'Prepare o próximo avanço.'}</h2><div class="guild-duel-results"><span>+${outcome.points} pontos para a guilda</span><b>${env.coin('RC')} +${outcome.reward} RC</b><small>Guilda nível ${outcome.level} · Prêmio final após o evento</small></div>${env.button('Voltar à guilda','goto','data-page="guilds"','primary wide')}</div>`);}
 function exit(){const b=current();if(b?.kind!=='guild')return;b.ticket.status='lost';finish();}
 return {start,move,exit};
}
