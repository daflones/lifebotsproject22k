import * as C from '../../../../src/core.js';
import * as G from '../../../../src/guilds.js';
import * as T from '../../../../src/trading.js';
import * as Chat from '../../../../src/chat.js';
import * as A from '../../../../src/admin-operations.js';
import {DEFAULT_SOCIAL,validateSocial,membership,socialConfig,currentId} from '../../../../src/social-core.js';
export const freshWorld=()=>({guilds:[],messages:[],muted:{},chatLastSent:{},listings:[],proposals:[],trades:[],events:[],eventSnapshots:{},warScores:{},warParticipantGuild:{},rewardReceipts:[],guildDaily:{},queue:[],matches:[],commissions:{}});
const configKeys=['settings','catalog','parts','chapters','seasons','arenaRoster'];
const ephemeral=['adminAccounts','adminUsers','affiliates','social','serverAuthoritative','wallets',...configKeys];
export function storedState(s){const out=C.clone(Object.fromEntries(Object.entries(s).filter(([k])=>!ephemeral.includes(k))));if(out.transactions.length>500)out.transactions=out.transactions.slice(0,500);return out;}
export function sessionContext(context,actorId){
 const cfg={...context.config,settings:{...C.clone(C.DEFAULT_SETTINGS),...context.config.settings,rules:{...C.DEFAULT_SETTINGS.rules,...context.config.settings.rules},audio:{...C.DEFAULT_AUDIO,...context.config.settings.audio},copy:{...C.DEFAULT_COPY,...context.config.settings.copy},social:{...DEFAULT_SOCIAL,...context.config.settings.social}}};
 const world={...freshWorld(),...C.clone(context.world.data)};if(world.socialSettings)cfg.settings.social=world.socialSettings;const accounts=new Map(),source=new Map();
 for(const row of context.accounts){const profile=context.profiles.find(p=>p.id===row.userId);if(!profile)continue;
  const s={...C.initialState(),...C.clone(row.data),profile:{...C.clone(row.data.profile||{}),...profile},balances:{...row.wallets},robots:row.data.robots||[],inventory:row.data.inventory||[],transactions:row.data.transactions||[],affiliates:[],adminAccounts:[],social:world,serverAuthoritative:false,adminAudit:row.data.adminAudit||[],deposits:row.data.deposits||[],withdrawals:row.data.withdrawals||[],reservedLC:row.data.reservedLC||0,reservedRC:row.data.reservedRC||0};
  for(const k of configKeys)s[k]=cfg[k];s.settings=cfg.settings;
  accounts.set(row.userId,s);source.set(row.userId,{revision:row.revision,state:JSON.stringify(storedState(s))});
 }
 const state=accounts.get(actorId);if(!state)throw new Error('Piloto não encontrado.');
 // Helpers puros recebem só dados carregados pelo serviço, jamais estado do cliente.
 for(const [id,s] of accounts)s.adminAccounts=[...accounts].filter(([other])=>other!==id).map(([,a])=>a);
 return {state,accounts,source,world,worldRevision:context.world.revision,profiles:context.profiles,mode:context.mode||'demo'};
}
function int(v,min=0,max=100000000){if(!Number.isSafeInteger(v)||v<min||v>max)throw new Error('Quantidade inválida.');return v;}
function owned(s,uid){const r=s.robots.find(r=>r.uid===uid);if(!r)throw new Error('Este robô não pertence ao piloto.');return r;}
function activeGuild(s,id){return membership(s,id)?.guild.id||null;}
function wallet(s,currency,operation,amount,label,now){if(!amount)return;int(amount,1);const field=currency==='LC'?'reservedLC':'reservedRC';s[field] ||= 0;
 if(operation==='reserve'){C.transaction(s,label,currency,-amount,'servidor',now);s[field]+=amount;}
 else if(operation==='release'){if(s[field]<amount)throw new Error('Reserva inconsistente.');s[field]-=amount;C.transaction(s,label,currency,amount,'servidor',now);}
 else if(operation==='capture'){if(s[field]<amount)throw new Error('Reserva inconsistente.');s[field]-=amount;C.transaction(s,label,currency,0,'servidor',now);}
 else C.transaction(s,label,currency,operation==='credit'?amount:-amount,'servidor',now);
 Object.assign(s.transactions[0],{walletOperation:operation,ledgerAmount:amount});
}
export function settleProduction(session,now,uid=null){return {amount:C.collect(session.state,uid,now),expired:C.settleExpirations(session.state,now)};}
function trackProduction(session,now,day=C.dayKey(now)){
 for(const [id,s] of session.accounts){const old=JSON.parse(session.source.get(id).state),previous=new Map((old.robots||[]).map(r=>[r.uid,r.earned||0]));
  const produced=s.robots.reduce((n,r)=>n+Math.max(0,(r.earned||0)-(previous.get(r.uid)??r.earned??0)),0);if(!produced)continue;
  let parent=s.profile.referrerId;const seen=new Set([id]);
  for(let level=1;parent&&level<=3;level++){if(seen.has(parent))throw new Error('Indicação circular.');seen.add(parent);const profile=session.profiles.find(p=>p.id===parent);if(profile?.status!=='active'){parent=profile?.referrerId;continue;}const beneficiary=session.accounts.get(parent);if(!beneficiary)throw new Error('ACCOUNT_REQUIRED:'+parent);
   const key=day+':'+id+':'+level,record=session.world.commissions[key]||{day,sourceId:id,beneficiaryId:parent,level,dueBasis:0,paid:0};record.dueBasis=(record.dueBasis??Math.round((record.due||0)*10000))+produced*Math.round((s.settings.commissions[level-1]||0)*100);session.world.commissions[key]=record;parent=beneficiary.profile.referrerId;
  }
 }
 for(const record of Object.values(session.world.commissions)){if(typeof record!=='object'||record.day>=C.dayKey(now))continue;const amount=Math.floor((record.dueBasis??Math.round((record.due||0)*10000))/10000)-record.paid;if(amount<=0)continue;const s=session.accounts.get(record.beneficiaryId);if(!s)continue;
  C.transaction(s,'Comissão diária · nível '+record.level,'RC',amount,'servidor',now);record.paid+=amount;s.commissionTotal=(s.commissionTotal||0)+amount;s.commissionReceipts ||= [];s.commissionReceipts.unshift({affiliateId:record.sourceId,level:record.level,day:record.day,amount,at:now});
 }
}
function checkpointRates(session,now){for(const account of session.accounts.values())for(const r of account.robots){const info=C.robotInfo(account,r,now),old=r.productionPeriod;if(old&&old.daily!==info.daily){const till=Math.min(now,info.expires),from=Math.max(r.lastCollected,r.createdAt);r.pendingProductionRC=(r.pendingProductionRC||0)+Math.max(0,till-from)/C.DAY*old.daily;r.lastCollected=till;}r.productionPeriod={daily:info.daily,start:now};}}
export function handleAction(session,body,now=Date.now()){checkpointRates(session,now);const result=dispatchAction(session,body,now);for(const account of session.accounts.values())for(const r of account.robots)r.productionPeriod={daily:C.robotInfo(account,r,now).daily,start:now};trackProduction(session,now,body.action==='daily_settle'?body.day:C.dayKey(now));for(const [id,account] of session.accounts){const prior=new Set((JSON.parse(session.source.get(id).state).transactions||[]).map(t=>t.id));for(const tx of account.transactions)if(!prior.has(tx.id))tx.status=session.mode==='real'?'confirmado':'teste-servidor';}return result;}

function player(s,uid,now){return C.clone(C.arenaEligibility(s,uid,now));}
function botFor(s,p){const roster=s.arenaRoster.filter(r=>r.enabled!==false),entry=roster[Math.floor(Math.random()*roster.length)];if(!entry)throw new Error('Nenhum adversário configurado.');const def=s.catalog.find(r=>r.id===entry.robotId);return {name:entry.name,def:C.clone(def),attack:Math.round(p.attack*entry.attackFactor),defense:Math.round(p.defense*entry.defenseFactor),health:Math.round(p.health*entry.healthFactor),isBot:true};}
function battleActor(s,uid,stats,now,kind,eventId){
 const r=owned(s,uid);if(kind==='arena'){C.dailyBattles(s,now);s.daily.used++;r.used++;wallet(s,'RC','reserve',s.settings.battleLoss,'Reserva da disputa',now);}
 else {const ticket=G.beginGuildBattle(s,eventId,uid,now);s.guildBattle=ticket;s.social.activeGuildBattle=null;}
 return {userId:s.profile.id,uid,name:s.profile.name,stats:C.clone(stats),hp:stats.health,energy:0,stance:'attack',reserved:kind==='arena'?s.settings.battleLoss:0};
}
function makeMatch(session,ownEntry,otherEntry,now){const s=session.state;s.arenaQueue=null;const queuedPeer=otherEntry?session.accounts.get(otherEntry.userId):null;if(queuedPeer)queuedPeer.arenaQueue=null;const a=ownEntry.kind==='arena'?player(s,ownEntry.uid,now):C.robotInfo(s,owned(s,ownEntry.uid),now),other=otherEntry?session.accounts.get(otherEntry.userId):null;if(otherEntry&&!other)throw new Error('ACCOUNT_REQUIRED:'+otherEntry.userId);
 let b;if(other){if(ownEntry.kind==='arena')b=player(other,otherEntry.uid,now);else b=C.robotInfo(other,owned(other,otherEntry.uid),now);}else b=botFor(s,a);
 const first=battleActor(s,ownEntry.uid,a,now,ownEntry.kind,ownEntry.eventId),second=other?battleActor(other,otherEntry.uid,b,now,ownEntry.kind,ownEntry.eventId):{userId:null,uid:null,name:b.name,stats:{...b,name:b.name},hp:b.health,energy:0,stance:'attack',reserved:0};
 const match={id:C.uuid(),kind:ownEntry.kind,scene:s.guildBattle?.scene||'arena',eventId:ownEntry.eventId||null,players:[first,second],isBot:!other,status:'active',winnerId:null,version:0,round:1,turnUserId:first.userId,turnDeadline:now+45000,createdAt:now,expiresAt:ownEntry.kind==='guild'?Math.min(s.guildBattle?.deadlineAt||now+300000,other?.guildBattle?.deadlineAt||now+300000):now+900000,lastMove:null,rules:C.combatRules(s),reward:ownEntry.kind==='guild'?s.guildBattle?.reward||0:s.settings.battleReward,loss:ownEntry.kind==='guild'?0:s.settings.battleLoss};
 s.arenaQueue=null;if(other)other.arenaQueue=null;s.activeArena={matchId:match.id,uid:first.uid};if(other)other.activeArena={matchId:match.id,uid:second.uid};session.world.matches.unshift(match);session.world.queue=session.world.queue.filter(q=>![first.userId,second.userId].includes(q.userId));return match;
}
function finishMatch(session,m,winnerId,now){if(m.status==='completed')return;m.status='completed';m.winnerId=winnerId;m.finishedAt=now;m.version++;
 for(const p of m.players){if(!p.userId)continue;const s=session.accounts.get(p.userId);if(!s)throw new Error('ACCOUNT_REQUIRED:'+p.userId);const win=p.userId===winnerId;
  if(m.kind==='arena'){wallet(s,'RC',win?'release':'capture',p.reserved,win?'Reserva da arena devolvida':'Derrota na arena',now);if(win)wallet(s,'RC','credit',m.reward,'Vitória na arena',now);s.battles ||= [];s.battles.unshift({id:m.id,opponent:m.players.find(x=>x!==p).name,opponentKind:m.isBot?'bot':'user',win,amount:win?m.reward:-p.reserved,at:now});}
  else {const t=s.guildBattle;if(t){t.status=win?'won':'lost';s.social.activeGuildBattle=t;G.settleGuildBattle(s,t,now);s.social.activeGuildBattle=null;s.guildBattle=null;}}
  s.activeArena=null;
 }
}
function attackMatch(session,m,actor,move,now){if(!['attack','shield','special'].includes(move))throw new Error('Movimento inválido.');const target=m.players.find(p=>p!==actor),rules=m.rules;
 if(move==='special'&&actor.energy<rules.energyMax)throw new Error('Carregue seu especial.');const multiplier=move==='special'?rules.specialMultiplier:move==='shield'?rules.shieldAttackMultiplier:rules.attackMultiplier;
 const damage=Math.max(rules.damageMin,Math.round((actor.stats.attack*multiplier-target.stats.defense*rules.defenseAbsorption)*(target.stance==='shield'?rules.shieldReduction:1)));
 actor.energy=move==='special'?0:Math.min(rules.energyMax,actor.energy+1);actor.stance=move;target.hp=Math.max(0,target.hp-damage);m.lastMove={id:C.uuid(),actorId:actor.userId,move,damage,at:now};m.round++;m.version++;
 if(!target.hp){finishMatch(session,m,actor.userId,now);return;}m.turnUserId=target.userId;m.turnDeadline=now+45000;
}
export function matchView(m,id){const p=m.players.find(p=>p.userId===id);
 const enemy=m.players.find(x=>x!==p),publicEnemy=Object.fromEntries(['id','catalogId','name','type','rarity','asset','animationAsset','artKind','color','combatStyle','soundPitch','poseScales','attack','defense','health','power','level'].filter(k=>enemy.stats[k]!==undefined).map(k=>[k,enemy.stats[k]]));return {id:m.id,version:m.version,kind:m.kind,status:m.status,win:m.status==='completed'&&m.winnerId===id,yourTurn:m.turnUserId===id,turnDeadline:m.turnDeadline,round:m.round,lastMove:m.lastMove,playerHP:p.hp,enemyHP:enemy.hp,energy:p.energy,player:p.stats,opponent:{...publicEnemy,name:enemy.name,def:enemy.stats.def||publicEnemy,isBot:m.isBot},reward:m.reward,loss:p.reserved,rules:m.rules,scene:m.scene||(m.kind==='guild'?'guild-canyon':'arena')};}
function dispatchAction(session,body,now=Date.now()){
 const s=session.state,w=session.world,uid=body.robot_id,action=body.action;
 if(s.arenaQueue&&(!w.queue.some(q=>q.userId===s.profile.id&&q.expiresAt>now))){s.arenaQueue=null;w.queue=w.queue.filter(q=>q.userId!==s.profile.id);}
 if(action.startsWith('admin_')&&s.profile.role!=='admin')throw new Error('ADMIN_REQUIRED');
 if(action==='snapshot'||action==='social_snapshot')return null;
 let result;
 switch(action){
 case 'buy_robot':result=C.buyRobot(s,body.catalog_id,now);break;
 case 'buy_part':result=C.buyPart(s,body.part_id);break;
 case 'buy_equip_part':result=C.buyPart(s,body.part_id);C.equip(s,uid,result.uid,now);break;
 case 'equip':result=C.equip(s,uid,body.equipment_id,now);break;
 case 'upgrade_robot':result=C.levelUp(s,uid,now);break;
 case 'upgrade_part':result=C.levelPart(s,body.equipment_id,now);break;
 case 'collect':if(uid)owned(s,uid);result=settleProduction(session,now,uid);break;
 case 'maintenance':result=C.settleExpirations(s,now);T.expireListings(s,now);for(const m of w.matches.filter(m=>m.status==='active'&&m.players.some(p=>p.userId===s.profile.id))){if(now>=m.expiresAt)finishMatch(session,m,null,now);else if(now>m.turnDeadline){const loser=m.players.find(p=>p.userId===m.turnUserId);finishMatch(session,m,m.players.find(p=>p!==loser).userId,now);}}break;
 case 'daily_settle':{const end=Date.parse(body.day+'T00:00:00-03:00')+C.DAY;if(!Number.isFinite(end)||body.day>=C.dayKey(now))throw new Error('Data de liquidação inválida.');result=settleProduction(session,Math.min(now,end));break;}
 case 'select_robot':owned(s,uid);s.selectedRobot=uid;result={uid};break;
 case 'convert':result=C.convert(s,body.from,int(body.amount,1));break;
 case 'pass':result=C.buyPass(s,int(body.count??1,1,20));break;
 case 'tutorial_step':{s.tutorialSteps ||= [];const step=int(body.step,1,4);if(step>1&&!s.tutorialSteps.includes(step-1))throw new Error('Conclua a etapa anterior.');if(!s.tutorialSteps.includes(step))s.tutorialSteps.push(step);result={step};break;}
 case 'tutorial':if(!s.profile.emailConfirmed)throw new Error('Confirme seu e-mail.');if(![1,2,3,4].every(n=>s.tutorialSteps?.includes(n)))throw new Error('Conclua o tutorial.');result=C.tutorialReward(s);break;
 case 'profile':{const name=String(body.display_name||'').trim();if(!name||name.length>80)throw new Error('Nome inválido.');s.profile.name=name;if(body.share_whatsapp!==undefined){if(typeof body.share_whatsapp!=='boolean')throw new Error('Preferência inválida.');s.profile.shareWhatsApp=body.share_whatsapp;}result={name};break;}
 case 'story_start':result=C.beginStory(s,int(body.chapter_id,1,100000),uid,now);if(['auto','manual'].includes(body.control_mode))result.controlMode=body.control_mode;break;
 case 'story_enter':result=C.enterStory(s.activeStory);break;
 case 'story_move':{const t=s.activeStory;if(!t)throw new Error('Expedição não encontrada.');if(t.lastMoveAt&&now-t.lastMoveAt<t.rules.actionMs)throw new Error('Aguarde a animação do turno.');result=C.storyTurn(t,body.move,Math.random());t.lastMoveAt=now;break;}
 case 'story_next':result=C.nextStoryWave(s.activeStory);break;
 case 'story_finish':result={amount:C.resolveStory(s,s.activeStory)};break;
 case 'story_cancel':if(s.activeStory)C.cancelStory(s.activeStory);s.activeStory=null;result={cancelled:true};break;
 case 'chat_send':result=Chat.sendMessage(s,body.room,String(body.message||''),now);break;
 case 'guild_create':result=G.createGuild(s,body.name,body.tag,body.description,now);break;
 case 'guild_join':{let inviter=body.inviter_id;if(body.inviter_code)inviter=session.profiles.find(p=>p.referralCode===body.inviter_code)?.id||null;result=G.joinGuild(s,body.guild_id,inviter,s.profile.id,now);break;}
 case 'guild_member':if(s.guildBattle&&body.user_id===s.profile.id)throw new Error('Termine o duelo antes de sair da guilda.');result=G.manageMember(s,body.guild_id,body.user_id,body.operation);break;
 case 'guild_level_claim':result=G.claimGuildLevel(s,int(body.level,2,100),now);break;
 case 'guild_event_claim':result=G.claimWarReward(s,body.event_id,now);break;
 case 'trade_create':result=T.createListing(s,uid,body.kind,body.price_lc,now);result.robotSnapshot=C.robotInfo(s,{...owned(s,uid),equipment:[]},now);result.sellerName=s.profile.name;break;
 case 'trade_cancel':result=T.cancelListing(s,body.listing_id,now);break;
 case 'trade_accept_sale':{const listing=w.listings.find(l=>l.id===body.listing_id),seller=session.accounts.get(listing?.sellerId);if(seller)C.assertRobotAvailable(seller,listing.robotUid);}result=T.acceptListing(s,body.listing_id,null,now);break;
 case 'trade_propose':result=T.proposeSwap(s,body.listing_id,uid,now);break;
 case 'trade_review':{const proposal=w.proposals.find(p=>p.id===body.proposal_id);if(proposal){for(const [id,asset] of [[proposal.sellerId,proposal.sellerRobotUid],[proposal.buyerId,proposal.buyerRobotUid]]){const account=session.accounts.get(id);if(account&&asset)C.assertRobotAvailable(account,asset);}}}if(typeof body.accept!=='boolean')throw new Error('Resposta inválida.');result=T.reviewSwap(s,body.proposal_id,body.accept,s.profile.id,now);break;
 case 'admin_adjust_balance':result=A.adjustDemoBalance(s,body.user_id,body.currency,int(body.amount,-100000000,100000000),body.reason);break;
 case 'admin_update_robot':result=A.updateDemoRobot(s,body.user_id,uid,body.values,body.reason);break;
 case 'admin_social_settings':validateSocial(body.settings);s.settings.social=body.settings;w.socialSettings=body.settings;result={settings:body.settings};break;
 case 'admin_guild_event_save':result=G.saveGuildEvent(s,body.event);break;
 case 'admin_chat_mute':result=Chat.mutePilot(s,body.user_id,int(body.minutes,0,43200),now);break;
 case 'admin_chat_remove':result=Chat.moderateMessage(s,body.message_id);break;
 case 'arena_find_match':case 'guild_find_battle':{
  const kind=action==='guild_find_battle'?'guild':'arena',active=w.matches.find(m=>m.status==='active'&&m.players.some(p=>p.userId===s.profile.id));if(active)return {match:matchView(active,s.profile.id)};
  let q=w.queue.find(q=>q.userId===s.profile.id);if(!q){if(kind==='arena')player(s,uid,now);else{const r=owned(s,uid);C.assertRobotAvailable(s,uid);if(!C.robotInfo(s,r,now).active)throw new Error('Robô expirado.');if(!membership(s))throw new Error('Entre numa guilda.');}
   q={id:C.uuid(),userId:s.profile.id,uid,kind,eventId:body.event_id||null,guildId:activeGuild(s,s.profile.id),joinedAt:now,expiresAt:now+90000};w.queue.push(q);s.arenaQueue={id:q.id,uid:q.uid,expiresAt:q.expiresAt};}
  const peer=w.queue.find(p=>p.userId!==q.userId&&session.profiles.some(profile=>profile.id===p.userId&&profile.status==='active')&&p.kind===kind&&p.expiresAt>now&&(kind==='arena'||p.eventId===q.eventId&&p.guildId!==q.guildId));
  if(peer){const m=makeMatch(session,q,peer,now);return {match:matchView(m,s.profile.id)};}if(now-q.joinedAt>=(s.settings.matchTimeoutSeconds||8)*1000){const m=makeMatch(session,q,null,now);return {match:matchView(m,s.profile.id)};}return {queueId:q.id,status:'searching'};
 }
 case 'arena_cancel_match':{const active=w.matches.find(m=>m.status==='active'&&m.players.some(p=>p.userId===s.profile.id));if(active)return {cancelled:false,match:matchView(active,s.profile.id)};}s.arenaQueue=null;w.queue=w.queue.filter(q=>q.userId!==s.profile.id);result={cancelled:true};break;
 case 'arena_poll_match':case 'arena_move':case 'guild_move':case 'arena_finish':case 'guild_finish':{
  const m=w.matches.find(m=>m.id===body.match_id&&m.players.some(p=>p.userId===s.profile.id));if(!m)throw new Error('Disputa não encontrada.');
  if(m.status==='active'&&now>=m.expiresAt)finishMatch(session,m,null,now);
  if(m.status==='active'&&now>m.turnDeadline){const loser=m.players.find(p=>p.userId===m.turnUserId);finishMatch(session,m,m.players.find(p=>p!==loser).userId,now);}
  if(['arena_move','guild_move'].includes(action)&&m.status==='active'){if(m.turnUserId!==s.profile.id)throw new Error('Aguarde o turno do adversário.');if(body.expected_version!==m.version)throw new Error('MATCH_VERSION_CONFLICT');const actor=m.players.find(p=>p.userId===s.profile.id);attackMatch(session,m,actor,body.move,now);if(m.status==='active'&&m.isBot){const bot=m.players.find(p=>!p.userId);attackMatch(session,m,bot,bot.energy>=m.rules.energyMax?'special':Math.random()<.18?'shield':'attack',now);}}
  if(body.forfeit===true&&m.status==='active')finishMatch(session,m,m.players.find(p=>p.userId!==s.profile.id).userId,now);
  return {match:matchView(m,s.profile.id)};
 }
 default:throw new Error('UNKNOWN_ACTION');
 }
 return result??{ok:true};
}
export function changedAccounts(session){const result=[];for(const [id,s] of session.accounts){const data=storedState(s),old=session.source.get(id);if(JSON.stringify(data)!==old.state)result.push({userId:id,revision:old.revision,data});}return result;}
export function visibleSnapshot(session){const s=session.state,id=s.profile.id,own=activeGuild(s,id),admin=s.profile.role==='admin',data={...storedState(s),serverAuthoritative:true,mode:session.mode,realMoneyEnabled:session.mode==='real'&&s.settings.realMoneyEnabled===true};for(const key of configKeys)data[key]=s[key];if(!admin)delete data.adminAudit;if(s.arenaQueue?.expiresAt<=Date.now())data.arenaQueue=null;
 data.robots=s.robots.map(r=>{const info=C.robotInfo(s,r),old=r.productionPeriod;let view=r;if(old&&old.daily!==info.daily){const till=Math.min(Date.now(),info.expires);view={...r,lastCollected:till,pendingProductionRC:(r.pendingProductionRC||0)+Math.max(0,till-Math.max(r.lastCollected,r.createdAt))/C.DAY*old.daily};}return {...view,expiresAt:info.expires,productionDailyMinor:info.daily*100};});
 data.social=C.clone(session.world);data.social.messages=data.social.messages.filter(m=>['global','market'].includes(m.room)||m.room==='guild:'+own);data.social.activeGuildBattle=s.guildBattle||null;delete data.social.queue;delete data.social.matches;delete data.social.commissions;delete data.productionDays;data.social.rewardReceipts=data.social.rewardReceipts.filter(r=>admin||r.userId===id);data.social.muted=admin?data.social.muted:{[id]:data.social.muted[id]||0};data.social.guildDaily={[id]:data.social.guildDaily[id]};data.social.chatLastSent={[id]:data.social.chatLastSent[id]};data.social.proposals=data.social.proposals.filter(p=>admin||p.buyerId===id||p.sellerId===id);data.social.trades=data.social.trades.filter(p=>admin||p.buyerId===id||p.sellerId===id);
 data.adminAccounts=session.profiles.map(p=>({profile:{id:p.id,name:p.name,referralCode:p.referralCode},robots:[],inventory:[],balances:{LC:0,RC:0}}));
 if(admin)data.adminUsers=[...session.accounts.values()].map(a=>({...storedState(a),profile:{...a.profile}}));
 data.affiliates=[];let parents=new Set([id]);for(let level=1;level<=3;level++){const descendants=session.profiles.filter(p=>parents.has(p.referrerId));for(const p of descendants){const a=session.accounts.get(p.id),robots=a?.robots||[];data.affiliates.push({id:p.id,name:p.name,level,whatsapp:p.shareWhatsApp?p.whatsapp:'',robots:robots.length,robotId:robots[0]?.catalogId,daily:a?robots.reduce((sum,r)=>sum+(C.robotInfo(a,r).active?C.robotInfo(a,r).daily:0),0):0,commission:(s.commissionReceipts||[]).filter(r=>r.affiliateId===p.id).reduce((n,r)=>n+r.amount,0),battles:{played:a?.battles?.length||0,wins:a?.battles?.filter(b=>b.win).length||0},acquisitions:robots.map(r=>({catalogId:r.catalogId,level:r.level,active:C.robotInfo(a,r).active,paidAmount:r.contract?.paidAmount,currency:r.contract?.paidCurrency}))});}parents=new Set(descendants.map(p=>p.id));}
 const m=session.world.matches.find(m=>m.status==='active'&&m.players.some(p=>p.userId===id));data.activeArena=m?matchView(m,id):null;
 return data;
}
