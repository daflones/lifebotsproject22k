import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import * as G from '../src/guilds.js';
import * as T from '../src/trading.js';
import {ensureSocial,accountOf,membership,currentId,socialConfig,saveSocialSettings,validateSocial,redeemCoupon,adminSaveCoupon,adminDeleteCoupon,couponStatus} from '../src/social-core.js';
import {ensureDemoAdmin,deleteDemoUser} from '../src/admin-operations.js';
import {canReadRoom,sendMessage,moderateMessage,mutePilot} from '../src/chat.js';
const NOW=Date.now();
function state(){const s=C.initialState(NOW);ensureSocial(s,NOW);return s;}
function exampleSale(s){return s.social.listings.find(l=>l.kind==='sale'&&l.example);}
function exampleSwap(s){return s.social.listings.find(l=>l.kind==='swap');}
function join(s){return G.joinGuild(s,'guild-aurora','npc-1',currentId(s),NOW);}
function won(s,now=NOW){const t=G.beginGuildBattle(s,'war-aurora',s.robots[0].uid,now);for(let i=0;i<60&&t.status==='fighting';i++)C.storyTurn(t,t.energy===t.rules.energyMax?'special':'shield',0);assert.equal(t.status,'won');return t;}

test('venda transfere o mesmo contrato, liquida produção anterior e mantém peças com o vendedor',()=>{
 const s=state(),l=exampleSale(s),seller=accountOf(s,l.sellerId),r=seller.robots[0],item=C.buyPart(seller,'core');r.tradeLock=null;C.equip(seller,r.uid,item.uid,NOW);r.tradeLock=l.id;r.lastCollected=NOW-C.DAY;
 const contract=C.clone(r.contract),beforeLC=s.balances.LC,previous=seller.balances.LC,production=C.robotInfo(seller,r,NOW).available,RC=seller.balances.RC;
 T.acceptListing(s,l.id,null,NOW);assert.equal(s.balances.LC,beforeLC-420);assert.equal(seller.balances.LC,previous+412);assert.equal(l.feeLC,8);assert.equal(seller.balances.RC,RC+production);assert.equal(seller.robots.length,0);assert.ok(s.robots.includes(r));assert.deepEqual(r.contract,contract);assert.equal(r.equipment.length,0);assert.equal(item.equippedOn,null);assert.equal(r.lastCollected,NOW);assert.equal(r.ownershipHistory[0].earnedRC,production);
 assert.throws(()=>T.acceptListing(s,l.id,null,NOW),/não está disponível/);const count=s.transactions.length;C.settleExpirations(s,contract.expiresAt);C.settleExpirations(s,contract.expiresAt);assert.equal(s.transactions.slice(0,-count).filter(t=>t.idempotencyKey==='expiration:'+r.uid).length,1);
});
test('ofertas inválidas, próprias, expiradas e saldo insuficiente não alteram carteiras',()=>{
 const s=state(),l=T.createListing(s,s.robots[0].uid,'sale',500,NOW);assert.throws(()=>T.acceptListing(s,l.id,null,NOW),/própria/);assert.throws(()=>T.createListing(s,s.robots[1].uid,'sale',.2,NOW),/Preço/);
 const ext=exampleSale(s);s.balances.LC=0;let before=C.clone(s);assert.throws(()=>T.acceptListing(s,ext.id,null,NOW),/insuficientes/);assert.deepEqual(s,before);
 s.balances.LC=1000;ext.expiresAt=NOW;before=C.clone(s);assert.throws(()=>T.acceptListing(s,ext.id,null,NOW),/não está disponível/);assert.deepEqual(s,before);
 const r=accountOf(s,ext.sellerId).robots[0];r.contract.expiresAt=NOW;ext.expiresAt=NOW+C.DAY;assert.throws(()=>T.acceptListing(s,ext.id,null,NOW),/expirados/);
});
test('anunciar reserva robô e cancelar desbloqueia sem gastar saldo',()=>{
 const s=state(),r=s.robots[0],before=s.balances.LC,l=T.createListing(s,r.uid,'sale',500,NOW);assert.equal(r.tradeLock,l.id);
 assert.throws(()=>C.equip(s,r.uid,C.buyPart(s,'core').uid,NOW),/reservado/);assert.throws(()=>C.levelUp(s,r.uid,NOW),/reservado/);assert.throws(()=>C.arenaEligibility(s,r.uid,NOW),/reservado/);assert.throws(()=>C.storyQuote(s,1,r.uid,NOW),/reservado/);assert.throws(()=>T.createListing(s,r.uid,'sale',500,NOW),/reservado/);
 T.cancelListing(s,l.id,NOW);assert.equal(r.tradeLock,null);assert.equal(s.balances.LC,before);C.levelUp(s,r.uid,NOW);
});
test('troca precisa da contraparte, congela a taxa e preserva os dois robôs',()=>{
 const s=state(),l=exampleSwap(s),mine=s.robots[0],other=accountOf(s,l.sellerId).robots[0],contract=C.clone(mine.contract),seller=accountOf(s,l.sellerId),RC=s.balances.RC,production=C.robotInfo(s,mine,NOW).available,sellerRC=seller.balances.RC;
 assert.throws(()=>T.acceptListing(s,l.id,mine.uid,NOW),/contraparte/);const p=T.proposeSwap(s,l.id,mine.uid,NOW);assert.equal(mine.tradeLock,'proposal:'+p.id);assert.throws(()=>T.reviewSwap(s,p.id,true,currentId(s),NOW),/contraparte/);assert.throws(()=>T.reviewSwap(s,p.id,true,'npc-3',NOW),/não pertence/);
 s.settings.social.tradeSwapFeeRC=900;T.reviewSwap(s,p.id,true,l.sellerId,NOW);assert.equal(s.balances.RC,RC+production-20);assert.equal(seller.balances.RC,sellerRC-20);assert.ok(s.robots.includes(other));assert.ok(seller.robots.includes(mine));assert.deepEqual(mine.contract,contract);assert.equal(mine.tradeLock,null);assert.equal(other.tradeLock,null);assert.equal(p.status,'accepted');assert.throws(()=>T.reviewSwap(s,p.id,true,l.sellerId,NOW),/encerrada/);
});
test('recusar, expirar proposta e expirar robô liberam as reservas dos participantes',()=>{
 for(const reason of ['decline','date','robot']){const s=state(),l=exampleSwap(s),r=s.robots[0],p=T.proposeSwap(s,l.id,r.uid,NOW),other=accountOf(s,l.sellerId).robots[0];
  if(reason==='decline'){T.reviewSwap(s,p.id,false,currentId(s),NOW);assert.equal(l.status,'open');assert.equal(other.tradeLock,l.id);}
  else{if(reason==='robot')r.contract.expiresAt=NOW;else l.expiresAt=NOW;assert.equal(T.expireListings(s,NOW),1);assert.equal(l.status,'expired');assert.equal(p.status,'expired');assert.equal(other.tradeLock,null);assert.equal(T.expireListings(s,NOW),0);}
  assert.equal(r.tradeLock,null);
 }
});
test('propostas pendentes contam no limite e saldo insuficiente recusa troca inteira',()=>{
 const s=state(),l=exampleSwap(s),r=s.robots[0],p=T.proposeSwap(s,l.id,r.uid,NOW),seller=accountOf(s,l.sellerId);seller.balances.RC=0;const before=C.clone(s);assert.throws(()=>T.reviewSwap(s,p.id,true,l.sellerId,NOW),/insuficiente/);assert.deepEqual(s,before);
 s.settings.social.tradeMaxListings=1;T.createListing(s,s.robots[1].uid,'sale',500,NOW);const third=C.buyRobot(s,'moss',NOW);assert.throws(()=>T.createListing(s,third.uid,'sale',500,NOW),/limite/);
});
test('chat exige acesso ao canal, tamanho, intervalo global e moderação',()=>{
 const s=state();assert.equal(canReadRoom(s,'global'),true);assert.equal(canReadRoom(s,'guild:undefined'),false);assert.throws(()=>sendMessage(s,'guild:guild-aurora','oi',NOW),/guilda/);assert.throws(()=>sendMessage(s,'global',' '.repeat(3),NOW),/vazia/);
 const m=sendMessage(s,'global','<script>alert(1)</script>',NOW);assert.equal(m.text,'<script>alert(1)</script>');moderateMessage(s,m.id);assert.throws(()=>sendMessage(s,'market','oi',NOW+500),/Aguarde/);
 join(s);assert.equal(canReadRoom(s,'guild:guild-aurora'),true);assert.equal(canReadRoom(s,'guild:guild-boreal'),false);sendMessage(s,'guild:guild-aurora','Equipe pronta',NOW+3000);
 mutePilot(s,currentId(s),10,NOW);assert.throws(()=>sendMessage(s,'global','oi',NOW+6000),/suspenso/);mutePilot(s,currentId(s),0,NOW);sendMessage(s,'global','De volta',NOW+7000);assert.throws(()=>mutePilot(s,'desconhecido',3,NOW),/piloto/);assert.throws(()=>mutePilot(s,currentId(s),.1,NOW),/período/);
 s.settings.social.chatEnabled=false;assert.throws(()=>sendMessage(s,'global','oi',NOW+10000),/pausado/);
});
test('chat mantém histórico por canal e nunca lê canal de outra guilda',()=>{
 const s=state();s.settings.social.chatHistoryLimit=10;s.settings.social.chatCooldownSeconds=0;for(let i=0;i<15;i++)sendMessage(s,'global','Sinal '+i,NOW+i);
 assert.equal(s.social.messages.filter(m=>m.room==='global').length,10);assert.equal(s.social.messages.filter(m=>m.room==='market').length,1);assert.throws(()=>sendMessage(s,'global','x'.repeat(301),NOW+100),/limite/);
});
test('guilda cobra criação uma vez, valida sigla, capacidade e vínculo exclusivo',()=>{
 const s=state(),RC=s.balances.RC,g=G.createGuild(s,'Farol Verde','fv','Exploradores',NOW);assert.equal(g.tag,'FV');assert.equal(s.balances.RC,RC-500);assert.equal(membership(s).member.role,'leader');assert.throws(()=>G.createGuild(s,'Outra','OUT','',NOW),/Saia/);assert.throws(()=>G.joinGuild(s,'guild-aurora',null,currentId(s),NOW),/pertence/);
 s.settings.social.guildCapacity=2;G.joinGuild(s,g.id,currentId(s),'social-example-0',NOW);assert.throws(()=>G.joinGuild(s,g.id,currentId(s),'social-example-1',NOW),/cheia/);
 const newState=state();assert.throws(()=>G.createGuild(newState,'ab','X','',NOW),/nome/);newState.balances.RC=0;assert.throws(()=>G.createGuild(newState,'Farol','FAR','',NOW),/insuficiente/);assert.equal(newState.social.guilds.length,2);
});
test('convites diretos e indiretos premiam três níveis apenas na primeira guilda do piloto',()=>{
 const s=state(),g=G.createGuild(s,'Expedição','EXP','',NOW),id=currentId(s),a='social-example-0',b='social-example-1',c='social-example-2',initial=s.balances.RC;
 G.joinGuild(s,g.id,id,a,NOW);G.joinGuild(s,g.id,a,b,NOW);G.joinGuild(s,g.id,b,c,NOW);assert.equal(s.balances.RC,initial+40);assert.equal(accountOf(s,a).balances.RC,12035);assert.equal(accountOf(s,b).balances.RC,12025);assert.equal(s.social.rewardReceipts.length,6);
 G.manageMember(s,g.id,a,'kick');G.joinGuild(s,g.id,id,a,NOW+1);assert.equal(s.balances.RC,initial+40);assert.equal(s.social.rewardReceipts.length,6);
 const before=C.clone(s);assert.throws(()=>G.joinGuild(s,'guild-boreal',id,'npc-2',NOW),/pertence|indicador/);assert.deepEqual(s,before);
});
test('hierarquia permite oficiais remover membros, preserva um líder e impede saída sem sucessor',()=>{
 const s=state(),g=G.createGuild(s,'Oficina','OFI','',NOW);G.joinGuild(s,g.id,currentId(s),'social-example-0',NOW);G.joinGuild(s,g.id,currentId(s),'social-example-1',NOW);
 assert.throws(()=>G.manageMember(s,g.id,currentId(s),'leave'),/Transfira/);G.manageMember(s,g.id,'social-example-0','leader');assert.equal(g.members.filter(m=>m.role==='leader').length,1);assert.equal(membership(s).member.role,'officer');assert.throws(()=>G.manageMember(s,g.id,'social-example-0','kick'),/cargo/);assert.throws(()=>G.manageMember(s,g.id,'social-example-1','officer'),/líder/);G.manageMember(s,g.id,'social-example-1','kick');G.manageMember(s,g.id,currentId(s),'leave');assert.equal(membership(s),null);
});
test('duelo usa mapa, quota diária, robô ativo e congela contrato de prêmio',()=>{
 const s=state();assert.throws(()=>G.beginGuildBattle(s,'war-aurora',s.robots[0].uid,NOW),/guilda/);join(s);assert.throws(()=>G.beginGuildBattle(s,'war-boreal',s.robots[0].uid,NOW),/aberta/);
 const RC=s.balances.RC,t=won(s);assert.equal(t.scene,'guild-canyon');assert.equal(s.social.guildDaily[currentId(s)].used,1);assert.throws(()=>C.arenaEligibility(s,t.uid,NOW),/batalha/);assert.throws(()=>C.levelUp(s,t.uid,NOW),/batalha/);assert.throws(()=>T.createListing(s,t.uid,'sale',500,NOW),/batalha/);assert.throws(()=>G.manageMember(s,'guild-aurora',currentId(s),'leave'),/duelo/);
 s.settings.social.guildBattleRewardRC=1000;s.social.events[0].battleRewardRC=1000;const outcome=G.settleGuildBattle(s,t,NOW+1000);assert.equal(outcome.reward,50);assert.equal(s.balances.RC,RC+50);assert.equal(outcome.points,10);assert.throws(()=>G.settleGuildBattle(s,t,NOW+1000),/encerrado|novamente/);
 G.settleGuildBattle(s,won(s,NOW+2000),NOW+3000);assert.throws(()=>G.beginGuildBattle(s,'war-aurora',s.robots[0].uid,NOW+4000),/acabaram/);
});
test('prazo vencido encerra duelo sem pontos ou moedas e eventuais marcos só pagam elegíveis',()=>{
 const s=state();join(s);s.settings.social.guildXPPerLevel=10;const RC=s.balances.RC,t=won(s);const out=G.settleGuildBattle(s,t,t.deadlineAt);assert.equal(out.expired,true);assert.equal(out.points,0);assert.equal(s.balances.RC,RC);
 const next=won(s,NOW+1000);G.settleGuildBattle(s,next,NOW+2000);const g=membership(s).guild;assert.ok(g.level>=2);const amount=g.milestones[2].rewardRC;G.claimGuildLevel(s,2,NOW+3000);assert.equal(s.balances.RC,RC+50+amount);assert.throws(()=>G.claimGuildLevel(s,2,NOW+3000),/já foi recebida/);assert.throws(()=>G.claimGuildLevel(s,100,NOW+3000),/participou/);
});
test('evento final usa participação registrada, divide pool, paga uma vez e funciona após sair',()=>{
 const s=state();join(s);G.settleGuildBattle(s,won(s),NOW+1000);const g=membership(s).guild,RC=s.balances.RC;assert.throws(()=>G.claimWarReward(s,'war-aurora',NOW+2000),/fim/);
 const end=s.social.eventSnapshots['war-aurora'].endsAt;s.social.events[0].rewardPoolRC=999999;G.manageMember(s,g.id,currentId(s),'leave');assert.equal(G.claimWarReward(s,'war-aurora',end+1),1030);assert.equal(s.balances.RC,RC+1030);assert.throws(()=>G.claimWarReward(s,'war-aurora',end+1),/já foi recebida/);
});
test('participante representa uma única guilda por edição e contrato ativo não pode ser reescrito',()=>{
 const s=state();join(s);G.settleGuildBattle(s,won(s),NOW+1000);const old=C.clone(s.social.events[0]);assert.throws(()=>G.saveGuildEvent(s,{...old,rewardPoolRC:2000}),/outra edição/);
 G.manageMember(s,'guild-aurora',currentId(s),'leave');G.joinGuild(s,'guild-boreal',null,currentId(s),NOW+2000);assert.throws(()=>G.beginGuildBattle(s,'war-aurora',s.robots[0].uid,NOW+3000),/única guilda/);
});
test('admin valida todos os limites sociais, cria eventos datados e audita configuração e moderação',()=>{
 const s=state(),cfg={...socialConfig(s),guildCreateCost:700,tradeFeePercent:3.5};saveSocialSettings(s,cfg);assert.equal(s.settings.social.guildCreateCost,700);assert.equal(s.adminAudit[0].action,'social_settings');assert.throws(()=>validateSocial({...cfg,guildCapacity:1}),/inválida/);assert.throws(()=>validateSocial({...cfg,tradeMinPriceLC:200000}),/mínimo/);assert.throws(()=>validateSocial({...cfg,chatEnabled:'yes'}),/Disponibilidade/);
 const event={id:'new-war',name:'Cerco Verde',description:'Evento',type:'guild-war',startsAt:NOW+C.DAY,endsAt:NOW+3*C.DAY,scene:'guild-boreal',rewardPoolRC:3000,participationRC:20,battleRewardRC:70,enabled:true};G.saveGuildEvent(s,event);assert.equal(G.eventState(s,event.id,NOW).phase,'upcoming');assert.equal(G.eventState(s,event.id,NOW+2*C.DAY).phase,'active');assert.equal(G.eventState(s,event.id,NOW+3*C.DAY).phase,'ended');assert.equal(s.adminAudit[0].action,'guild_event');assert.throws(()=>G.saveGuildEvent(s,{...event,endsAt:NOW}),/período/);
});
test('clientes conectados não fabricam chat, trading, guildas ou créditos de recompensa',()=>{
 const s=state();s.serverAuthoritative=true;for(const fn of [()=>sendMessage(s,'global','oi'),()=>G.createGuild(s,'Equipe','EQ',''),()=>T.createListing(s,s.robots[0].uid,'sale',500),()=>saveSocialSettings(s,socialConfig(s))])assert.throws(fn,/servidor/);
});
test('cupom resgata saldo e robô uma única vez, e remoção bloqueia novos resgates',()=>{
 const s=state();adminSaveCoupon(s,{code:'VIP100',maxUses:1,reward:{kind:'rc',amount:100}});assert.equal(redeemCoupon(s,' vip100 ').reward.amount,100);assert.throws(()=>redeemCoupon(s,'VIP100'),/resgatou/);assert.equal(couponStatus(s.social.coupons[0]),'exhausted');
 adminSaveCoupon(s,{code:'ROBO',maxUses:5,reward:{kind:'robot',robotId:'moss'}});const before=s.robots.length;redeemCoupon(s,'robo');assert.equal(s.robots.length,before+1);assert.equal(s.robots.at(-1).contract.paidAmount,0);assert.equal(s.robots.at(-1).contract.principalReturnLC,0);
 adminSaveCoupon(s,{code:'PECA9',maxUses:5,reward:{kind:'part',partId:'core',partLevel:2}});const items=s.inventory.length;redeemCoupon(s,'PECA9');assert.equal(s.inventory.length,items+1);assert.equal(s.inventory.at(-1).level,2);
 adminDeleteCoupon(s,s.social.coupons[1].id);assert.throws(()=>redeemCoupon(s,'ROBO'),/encontrado/);assert.equal(s.adminAudit.filter(a=>a.action.startsWith('coupon')).length,4);
});
test('whatsapp da comunidade é configurável, exige https e anúncio é booleano',()=>{
 const s=state(),cfg=socialConfig(s);assert.ok(cfg.whatsappLink.includes('chat.whatsapp.com'));assert.equal(cfg.whatsappPromo,false);
 assert.throws(()=>validateSocial({...cfg,whatsappLink:'javascript:alert(1)'}),/URL|https/);assert.throws(()=>validateSocial({...cfg,whatsappLink:'http://inseguro.test'}),/https/);assert.throws(()=>validateSocial({...cfg,whatsappPromo:'yes'}),/social/);
 validateSocial({...cfg,whatsappLink:'',whatsappPromo:true});
});

test('demo: exclusão de piloto remove conta e limpa vínculos do mundo',()=>{
 const s=state();ensureDemoAdmin(s);const victim=s.adminAccounts[0].profile.id,name=s.adminAccounts[0].profile.name;
 s.social.guilds=[{id:'g1',name:'G',tag:'G',founderId:victim,members:[{userId:victim,role:'leader'},{userId:s.profile.id,role:'member'}]}];
 s.social.listings=[{id:'l1',sellerId:victim,status:'open'}];s.social.queue=[{userId:victim}];
 const r=deleteDemoUser(s,victim);assert.equal(r.name,name);
 assert.equal(s.adminAccounts.some(a=>a.profile.id===victim),false);
 assert.equal(s.social.guilds[0].members.length,1);assert.equal(s.social.listings[0].status,'cancelled');assert.equal(s.social.queue.length,0);
 assert.equal(s.adminAudit[0].action,'user_delete');
 assert.throws(()=>deleteDemoUser(s,s.profile.id),/inválido/);assert.throws(()=>deleteDemoUser(s,'inexistente'),/encontrado/);
});
