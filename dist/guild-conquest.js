import * as C from './core.js';
import {requireSocialDemo,socialConfig,membership,currentId,assertTradable,receipt} from './social-core.js';
export const TERRITORY_TYPES={castle:{label:'Castelo',health:1200,value:5,armor:.2},tower:{label:'Torre',health:600,value:3,armor:.15},house:{label:'Casa',health:400,value:2,armor:0},cabin:{label:'Cabana',health:250,value:1,armor:0}};
export const defaultConquestRules=()=>({castle:1,tower:1,house:2,cabin:2,cooldownSeconds:20,protectionSeconds:120,dailyOrders:60});
export function validateConquest(event){
 const rules=event.conquest;if(!rules||typeof rules!=='object')throw new Error('Configuração de conquista inválida.');
 for(const [key,min,max] of [['castle',1,2],['tower',0,4],['house',0,4],['cabin',0,4],['cooldownSeconds',15,300],['protectionSeconds',30,3600],['dailyOrders',1,500]])if(!Number.isSafeInteger(rules[key])||rules[key]<min||rules[key]>max)throw new Error('Configuração de conquista inválida: '+key);
 const size=Object.keys(TERRITORY_TYPES).reduce((sum,key)=>sum+rules[key],0);if(size<3||size>12)throw new Error('Configure de 3 a 12 locais no mapa.');
 if(event.participationRC!==0||event.battleRewardRC!==0||event.rewardPoolRC>1000000)throw new Error('A conquista usa apenas o orçamento total, limitado a 1.000.000 RC.');
 return Object.fromEntries(Object.keys(defaultConquestRules()).map(key=>[key,rules[key]]));
}
function contract(state,id){return state.social?.eventSnapshots?.[id]||state.social?.events?.find(e=>e.id===id);}
function initialConquest(event){const territories={};for(const [type,def] of Object.entries(TERRITORY_TYPES))for(let n=1;n<=event.conquest[type];n++)territories[type+'-'+n]={id:type+'-'+n,type,number:n,hp:def.health,shield:0,ownerId:null,protectedUntil:0,heldSince:event.startsAt};return {version:0,territories,pilots:{},contributions:{},control:{},history:[]};}
function accrue(board,event,now){const until=Math.min(now,event.endsAt);for(const place of Object.values(board.territories)){if(place.ownerId&&until>place.heldSince)board.control[place.ownerId]=(board.control[place.ownerId]||0)+(until-place.heldSince)*TERRITORY_TYPES[place.type].value;place.heldSince=Math.max(place.heldSince,until);}}
export function conquestView(state,id,now=Date.now()){
 const event=contract(state,id);if(event?.type!=='guild-conquest')return null;
 const board=C.clone(state.social.conquests?.[id]||initialConquest(event));accrue(board,event,now);
 const ranking=Object.values(board.contributions).sort((a,b)=>b.points-a.points||b.captures-a.captures||a.userId.localeCompare(b.userId));
 const guildIds=[...new Set(ranking.map(p=>p.guildId))];const guildRanking=guildIds.map(guildId=>({guildId,control:board.control[guildId]||0,territories:Object.values(board.territories).filter(p=>p.ownerId===guildId).length})).sort((a,b)=>b.control-a.control||a.guildId.localeCompare(b.guildId));
 return {...board,event,ranking,guildRanking,phase:event.enabled===false?'paused':now<event.startsAt?'upcoming':now>=event.endsAt?'ended':'active'};
}
export function conquestOrder(state,id,territoryId,uid,move,expectedVersion,now=Date.now()){
 requireSocialDemo(state);const event=contract(state,id),own=membership(state),actor=currentId(state);
 if(!socialConfig(state).guildEnabled||!own)throw new Error('Entre em uma guilda para participar.');
 if(event?.type!=='guild-conquest'||event.enabled===false||now<event.startsAt||now>=event.endsAt)throw new Error('O evento de conquista não está aberto.');
 const rules=event.conquest,board=state.social.conquests?.[id]||initialConquest(event);
 if(!Number.isSafeInteger(expectedVersion)||expectedVersion!==board.version)throw new Error('O mapa foi atualizado. Confira o local e tente novamente.');
 if(!Object.hasOwn(board.territories,territoryId))throw new Error('Local não encontrado.');
 if(!['attack','special','repair','fortify'].includes(move))throw new Error('Ordem de cerco inválida.');
 const prior=board.contributions[actor];if(prior&&prior.guildId!==own.guild.id)throw new Error('Você representa uma única guilda nesta edição.');
 const {r}=assertTradable(state,actor,uid,now),robot=C.robotInfo(state,r,now);if(!robot.remainingBattles)throw new Error('Este robô esgotou seus usos.');
 const pilot=board.pilots[actor]||{energy:0,nextOrderAt:0,date:C.dayKey(now),used:0};
 if(now<pilot.nextOrderAt)throw new Error('Aguarde a recarga da próxima ordem.');
 const used=pilot.date===C.dayKey(now)?pilot.used:0;if(used>=rules.dailyOrders)throw new Error('Suas ordens de hoje acabaram.');
 const place=board.territories[territoryId],def=TERRITORY_TYPES[place.type],friendly=place.ownerId===own.guild.id,offensive=['attack','special'].includes(move);
 if(offensive&&friendly)throw new Error('Este local já pertence à sua guilda.');
 if(!offensive&&!friendly)throw new Error('Só é possível defender locais da sua guilda.');
 if(offensive&&now<place.protectedUntil)throw new Error('O local tem proteção temporária após a conquista.');
 if(move==='special'&&pilot.energy<3||move==='repair'&&pilot.energy<2)throw new Error('Acumule energia antes desta habilidade.');
 if(move==='repair'&&place.hp>=def.health||move==='fortify'&&place.shield>=Math.floor(def.health*.3))throw new Error('A defesa já está completa.');
 let amount=0,captured=false;
 accrue(board,event,now);
 if(offensive){const power=Math.min(140,Math.max(30,Math.round(robot.attack*.65))),damage=Math.round(power*(move==='special'?2:1)*(move==='special'?1:1-def.armor)),absorbed=Math.min(place.shield,damage);place.shield-=absorbed;const hit=Math.min(place.hp,damage-absorbed);place.hp-=hit;amount=hit+absorbed;
  if(place.hp===0){captured=true;place.ownerId=own.guild.id;place.hp=Math.ceil(def.health*.6);place.shield=0;place.protectedUntil=now+rules.protectionSeconds*1000;place.heldSince=now;}
 }else if(move==='repair'){amount=Math.min(def.health-place.hp,Math.round(Math.max(30,Math.min(160,robot.defense))*(place.type==='house'?1.4:1)));place.hp+=amount;
 }else{amount=Math.min(Math.floor(def.health*.3)-place.shield,Math.max(20,Math.min(100,Math.round(robot.defense*.6))));place.shield+=amount;}
 const cabin=Object.values(board.territories).some(p=>p.type==='cabin'&&p.ownerId===own.guild.id);
 pilot.energy=move==='special'?pilot.energy-3:move==='repair'?pilot.energy-2:Math.min(4,pilot.energy+(cabin?2:1));pilot.nextOrderAt=now+rules.cooldownSeconds*1000;pilot.date=C.dayKey(now);pilot.used=used+1;board.pilots[actor]=pilot;
 const contribution=prior||{userId:actor,name:state.profile.name,guildId:own.guild.id,guildName:own.guild.name,points:0,damage:0,repairs:0,captures:0,orders:0};contribution.points+=amount;contribution[offensive?'damage':'repairs']+=amount;contribution.captures+=Number(captured);contribution.orders++;board.contributions[actor]=contribution;
 board.version++;r.used++;const result={id:C.uuid(),userId:actor,name:state.profile.name,guildId:own.guild.id,guildName:own.guild.name,territoryId,move,amount,captured,at:now,version:board.version};board.history.unshift(result);board.history=board.history.slice(0,80);
 state.social.conquests ||= {};state.social.conquests[id]=board;state.social.eventSnapshots[id] ||= C.clone(event);return result;
}
export function conquestReward(view,userId){if(!view||view.phase!=='ended')return 0;const winner=view.guildRanking[0];if(!winner?.control)return 0;const members=view.ranking.filter(p=>p.guildId===winner.guildId),pilot=members.find(p=>p.userId===userId),total=members.reduce((sum,p)=>sum+p.points,0);return pilot&&total?Math.floor(view.event.rewardPoolRC*pilot.points/total):0;}
export function claimConquestReward(state,id,now=Date.now()){
 requireSocialDemo(state);const view=conquestView(state,id,now),actor=currentId(state);if(!view||view.phase!=='ended')throw new Error('Aguarde o fim da conquista.');
 if(!view.contributions[actor])throw new Error('Participe do cerco para resgatar.');
 return receipt(state,'guild-conquest:'+id+':'+actor,'Prêmio limitado de conquista',conquestReward(view,actor),actor,now);
}
