import * as C from './core.js';
import {requireSocialDemo,socialConfig,currentId,assertTradable,accountOf,syncTeamExample} from './social-core.js';

export function createListing(state,robotUid,kind,priceLC=0,now=Date.now()){
 requireSocialDemo(state);const cfg=socialConfig(state),sellerId=currentId(state);
 if(!cfg.tradeEnabled)throw new Error('O mercado está pausado.');
 if(!['sale','swap'].includes(kind))throw new Error('Tipo de negociação inválido.');
 if(kind==='sale'&&(!Number.isSafeInteger(priceLC)||priceLC<cfg.tradeMinPriceLC||priceLC>cfg.tradeMaxPriceLC))throw new Error('Preço fora dos limites do mercado.');
 if(state.social.listings.filter(l=>l.sellerId===sellerId&&['open','proposal'].includes(l.status)&&l.expiresAt>now).length>=cfg.tradeMaxListings)throw new Error('Você atingiu o limite de ofertas.');
 const {r}=assertTradable(state,sellerId,robotUid,now),listing={id:C.uuid(),sellerId,robotUid,kind,priceLC:kind==='sale'?priceLC:0,feePercent:cfg.tradeFeePercent,swapFeeRC:cfg.tradeSwapFeeRC,status:'open',createdAt:now,expiresAt:now+cfg.tradeExpireDays*C.DAY};
 r.tradeLock=listing.id;state.social.listings.unshift(listing);return listing;
}
function collectionFits(account,r,fee=0,now){const credit=C.robotInfo(account,r,now).available;if(!Number.isSafeInteger(account.balances.RC-fee+credit))throw new Error('Saldo acima do limite.');}
function moveRobot(state,seller,buyer,r,now){
 C.collect(seller,r.uid,now);
 for(const uid of r.equipment){const item=seller.inventory.find(i=>i.uid===uid);if(item)item.equippedOn=null;}
 r.ownershipHistory ||= [];r.ownershipHistory.push({userId:seller.profile.id,from:r.ownershipAcquiredAt||r.createdAt,to:now,earnedRC:r.earned});
 r.equipment=[];seller.robots.splice(seller.robots.indexOf(r),1);
 if(seller.profile.id===currentId(state)&&state.selectedRobot===r.uid)state.selectedRobot=seller.robots[0]?.uid||null;
 r.tradeLock=null;r.lastCollected=now;r.pendingProductionRC=0;r.earned=0;r.ownershipAcquiredAt=now;buyer.robots.push(r);
 if(buyer.profile.id===currentId(state))state.selectedRobot=r.uid;
}
export function acceptListing(state,id,_offeredRobotUid=null,now=Date.now()){
 requireSocialDemo(state);const listing=state.social.listings.find(l=>l.id===id),buyerId=currentId(state),cfg=socialConfig(state);
 if(!cfg.tradeEnabled)throw new Error('O mercado está pausado.');
 if(!listing||listing.status!=='open'||listing.expiresAt<=now)throw new Error('Esta oferta não está disponível.');
 if(listing.sellerId===buyerId)throw new Error('Você não pode aceitar sua própria oferta.');
 if(listing.kind!=='sale')throw new Error('Envie uma proposta: a contraparte precisa aceitar a troca.');
 const {a:seller,r}=assertTradable(state,listing.sellerId,listing.robotUid,now,listing.id),buyer=accountOf(state,buyerId),feeLC=Math.floor(listing.priceLC*listing.feePercent/100);
 if(buyer.balances.LC<listing.priceLC)throw new Error('LifeCoins insuficientes.');
 if(!Number.isSafeInteger(seller.balances.LC+listing.priceLC-feeLC))throw new Error('Saldo acima do limite.');
 collectionFits(seller,r,0,now);
 // Valida o contrato inteiro antes de alterar carteiras. O servidor usará locks e uma transação.
 C.transaction(buyer,'Aquisição no mercado','LC',-listing.priceLC,'simulado',now);
 if(listing.priceLC-feeLC)C.transaction(seller,'Venda no mercado','LC',listing.priceLC-feeLC,'simulado',now);
 moveRobot(state,seller,buyer,r,now);
 listing.status='settled';listing.buyerId=buyerId;listing.feeLC=feeLC;listing.settledAt=now;
 state.social.trades.unshift({id:C.uuid(),listingId:id,sellerId:listing.sellerId,buyerId,robotUid:r.uid,otherUid:null,priceLC:listing.priceLC,feeLC,at:now});syncTeamExample(state);return listing;
}
export function cancelListing(state,id,now=Date.now()){
 requireSocialDemo(state);const listing=state.social.listings.find(l=>l.id===id);
 if(!listing||listing.status!=='open')throw new Error('Oferta encerrada.');
 if(listing.sellerId!==currentId(state))throw new Error('Só o autor pode cancelar a oferta.');
 const r=accountOf(state,listing.sellerId).robots.find(r=>r.uid===listing.robotUid);
 if(r?.tradeLock===id)r.tradeLock=null;listing.status='cancelled';listing.cancelledAt=now;
}
export function expireListings(state,now=Date.now()){
 if(state.serverAuthoritative||!state.social)return 0;let count=0;
 for(const listing of state.social.listings){
  if(!['open','proposal'].includes(listing.status))continue;
  const target=accountOf(state,listing.sellerId).robots.find(r=>r.uid===listing.robotUid),proposal=state.social.proposals?.find(p=>p.listingId===listing.id&&p.status==='pending'),buyer=proposal?accountOf(state,proposal.buyerId):null,offered=buyer?.robots.find(r=>r.uid===proposal.robotUid);
  if(listing.expiresAt>now&&target&&C.robotInfo(accountOf(state,listing.sellerId),target,now).active&&(!proposal||offered&&C.robotInfo(buyer,offered,now).active))continue;
  listing.status='expired';listing.expiredAt=now;if(target?.tradeLock===listing.id)target.tradeLock=null;
  if(proposal){if(offered?.tradeLock==='proposal:'+proposal.id)offered.tradeLock=null;proposal.status='expired';proposal.reviewedAt=now;}
  count++;
 }
 return count;
}
export function proposeSwap(state,id,robotUid,now=Date.now()){
 requireSocialDemo(state);if(!socialConfig(state).tradeEnabled)throw new Error('O mercado está pausado.');
 const listing=state.social.listings.find(l=>l.id===id);
 if(!listing||listing.kind!=='swap'||listing.status!=='open'||listing.expiresAt<=now)throw new Error('Troca indisponível.');
 if(listing.sellerId===currentId(state))throw new Error('Escolha uma oferta de outro piloto.');
 assertTradable(state,listing.sellerId,listing.robotUid,now,listing.id);
 const {r}=assertTradable(state,currentId(state),robotUid,now),proposal={id:C.uuid(),listingId:id,buyerId:currentId(state),sellerId:listing.sellerId,robotUid,status:'pending',createdAt:now};
 state.social.proposals ||= [];state.social.proposals.unshift(proposal);r.tradeLock='proposal:'+proposal.id;listing.status='proposal';return proposal;
}
export function reviewSwap(state,id,accept,actorId=currentId(state),now=Date.now()){
 requireSocialDemo(state);const proposal=state.social.proposals?.find(p=>p.id===id),listing=state.social.listings.find(l=>l.id===proposal?.listingId);
 if(!proposal||proposal.status!=='pending'||!listing||listing.status!=='proposal')throw new Error('Esta proposta já foi encerrada.');
 if(actorId!==proposal.sellerId&&actorId!==proposal.buyerId)throw new Error('Esta proposta não pertence ao piloto.');
 if(accept&&actorId!==proposal.sellerId)throw new Error('A contraparte precisa aceitar a proposta.');
 if(accept&&!socialConfig(state).tradeEnabled)throw new Error('O mercado está pausado.');
 const buyer=accountOf(state,proposal.buyerId),seller=accountOf(state,proposal.sellerId),offered=buyer.robots.find(r=>r.uid===proposal.robotUid),target=seller.robots.find(r=>r.uid===listing.robotUid);
 if(accept){
  assertTradable(state,proposal.sellerId,target?.uid,now,listing.id);assertTradable(state,proposal.buyerId,offered?.uid,now,'proposal:'+id);
  if(listing.expiresAt<=now)throw new Error('A oferta expirou.');
  if(buyer.balances.RC<listing.swapFeeRC||seller.balances.RC<listing.swapFeeRC)throw new Error('Saldo insuficiente para a taxa dos dois participantes.');
  collectionFits(seller,target,listing.swapFeeRC,now);collectionFits(buyer,offered,listing.swapFeeRC,now);
  if(listing.swapFeeRC){C.transaction(buyer,'Taxa de troca aceita','RC',-listing.swapFeeRC,'simulado',now);C.transaction(seller,'Taxa de troca aceita','RC',-listing.swapFeeRC,'simulado',now);}
  moveRobot(state,seller,buyer,target,now);moveRobot(state,buyer,seller,offered,now);
  listing.status='settled';listing.settledAt=now;listing.buyerId=proposal.buyerId;proposal.status='accepted';
  state.social.trades.unshift({id:C.uuid(),listingId:listing.id,sellerId:proposal.sellerId,buyerId:proposal.buyerId,robotUid:target.uid,otherUid:offered.uid,priceLC:0,feeLC:0,at:now});syncTeamExample(state);
 }else{
  if(offered?.tradeLock==='proposal:'+id)offered.tradeLock=null;
  listing.status=listing.expiresAt>now&&target&&C.robotInfo(seller,target,now).active?'open':'expired';
  if(listing.status==='expired'&&target?.tradeLock===listing.id)target.tradeLock=null;proposal.status='declined';
 }
 proposal.reviewedAt=now;return proposal;
}
