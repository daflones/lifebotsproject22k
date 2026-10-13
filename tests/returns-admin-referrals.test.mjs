import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import {robotOffer} from '../src/robot-offer.js';
import {normalizeReferral,referralFromUrl,referralLink,acceptDemoReferral,teamSummary,whatsappLink} from '../src/referrals.js';
import {ensureDemoAdmin,adjustDemoBalance,updateDemoRobot,resolveDemoWithdrawal,paged} from '../src/admin-operations.js';
const NOW=Date.UTC(2026,9,12,6);
function account(){const s=C.initialState(NOW);s.robots=[];s.inventory=[];s.transactions=[];ensureDemoAdmin(s);return s;}

test('produção padrão é dez vezes maior e a estimativa acompanha a cotação',()=>{
 const s=account(),r=C.buyRobot(s,'volt',NOW);assert.equal(C.robotInfo(s,r,NOW).daily,1800);assert.equal(robotOffer(s,'volt').dailyBRL,1.8);
 s.settings.productionMultiplier=2;assert.equal(C.robotInfo(s,r,NOW).daily,360);C.validateSettings(s.settings);
 assert.throws(()=>C.validateSettings({...s.settings,productionMultiplier:0}),/Multiplicador/);
});
test('expiração devolve LC uma vez, liquida RC e devolve peças sem gerar comissão',()=>{
 const s=account(),r=C.buyRobot(s,'moss',NOW),item=C.buyPart(s,'core');C.equip(s,r.uid,item.uid,NOW);
 const LC=s.balances.LC,RC=s.balances.RC;assert.deepEqual(C.settleExpirations(s,NOW+7*C.DAY-1),{count:0,LC:0});
 assert.deepEqual(C.settleExpirations(s,NOW+7*C.DAY),{count:1,LC:300});assert.equal(s.balances.LC,LC+300);assert.equal(s.balances.RC,RC+2520);assert.equal(item.equippedOn,null);assert.equal(r.equipment.length,0);assert.equal(s.commissionTotal,0);
 const reloaded=C.hydrateState(C.clone(s),NOW+8*C.DAY);assert.deepEqual(C.settleExpirations(reloaded,NOW+20*C.DAY),{count:0,LC:0});assert.equal(reloaded.balances.LC,LC+300);
 assert.equal(reloaded.transactions.filter(t=>t.idempotencyKey==='expiration:'+r.uid).length,1);
});
test('preço, prazo, câmbio e regra de devolução de um robô comprado permanecem congelados',()=>{
 const s=account();s.catalog[0].currency='RC';s.catalog[0].price=1009;s.settings.principalReturnPercent=80;
 const r=C.buyRobot(s,'moss',NOW);assert.equal(r.contract.principalReturnLC,80);
 s.catalog[0].price=90000;s.catalog[0].lifetime=1;s.settings.rcPerLC=300;s.settings.principalReturnPercent=100;
 assert.equal(C.robotInfo(s,r,NOW+2*C.DAY).active,true);assert.deepEqual(C.settleExpirations(s,NOW+7*C.DAY),{count:1,LC:80});
});
test('recuperação de um recibo existente evita novo crédito e dados remotos não liquidam no cliente',()=>{
 const s=account(),r=C.buyRobot(s,'moss',NOW);s.transactions.unshift({idempotencyKey:'expiration:'+r.uid,at:NOW});const balance=s.balances.LC;
 C.settleExpirations(s,NOW+8*C.DAY);assert.equal(s.balances.LC,balance);assert.equal(r.principalReturnedAt,NOW);
 const remote=account();remote.serverAuthoritative=true;assert.deepEqual(C.settleExpirations(remote,NOW+99*C.DAY),{count:0,LC:0});
 assert.throws(()=>adjustDemoBalance(remote,'demo-self','LC',10,'teste'),/servidor/);
});
test('migração preserva saldo e taxa anterior no intervalo já produzido',()=>{
 const s=C.initialState(NOW);s.contentRevision=3;delete s.settings.productionMultiplier;s.robots=s.robots.slice(0,1);delete s.robots[0].contract;
 const balance=C.clone(s.balances),before=C.robotInfo(s,s.robots[0],NOW).available,customPrice=s.catalog[0].price=444;
 C.hydrateState(s,NOW);assert.deepEqual(s.balances,balance);assert.equal(C.robotInfo(s,s.robots[0],NOW).available,before);assert.equal(s.catalog[0].price,customPrice);
 assert.equal(C.robotInfo(s,s.robots[0],NOW+C.DAY/4).available,before+90);
});
test('cadastro aceita convite nas duas URLs, normaliza e recusa autoindicação/alteração posterior',()=>{
 assert.equal(normalizeReferral(' lr-abc123 '),'LR-ABC123');assert.equal(referralFromUrl('https://game.test/?ref=lr-abc#signup'),'LR-ABC');
 assert.equal(referralFromUrl('https://game.test/#login?ref=lr-abc'),'LR-ABC');const url=referralLink('https://game.test/?v=old#arena','LR-ABC');assert.equal(new URL(url).hash,'#signup');assert.equal(new URL(url).searchParams.get('ref'),'LR-ABC');
 assert.throws(()=>normalizeReferral('<script>'),/código/);const s=account();assert.throws(()=>acceptDemoReferral(s,s.profile.referralCode),/outro piloto/);
 acceptDemoReferral(s,'LR-XYZ');assert.equal(s.profile.referredByCode,'LR-XYZ');assert.throws(()=>acceptDemoReferral(s,'LR-OUTRO'),/já foi registrada/);
 const noReferral=account();acceptDemoReferral(noReferral,'');assert.equal(noReferral.profile.referredByCode,null);
});
test('informações da rede respeitam os níveis e links de WhatsApp aceitam apenas telefones',()=>{
 const s=account();assert.equal(teamSummary(s).members,3);assert.equal(teamSummary(s,2).members,1);assert.equal(teamSummary(s).estimated,15.9);
 assert.equal(whatsappLink('21 99999-1234'),'https://wa.me/5521999991234');assert.equal(whatsappLink('javascript:alert(1)'),null);assert.equal(whatsappLink(''),null);
});
test('ajustes de saldo têm motivo, auditoria e não podem gastar a reserva do saque',()=>{
 const s=account(),old=s.balances.LC;adjustDemoBalance(s,'demo-self','LC',200,'Correção de teste');assert.equal(s.balances.LC,old+200);assert.equal(s.adminAudit.length,1);
 const unchanged=C.clone(s);assert.throws(()=>adjustDemoBalance(s,'demo-self','LC',-999999,'Correção'),/insuficiente/);assert.deepEqual(s,unchanged);
 assert.throws(()=>adjustDemoBalance(s,'demo-self','LC',12,''),/motivo/);C.withdraw(s,1000);assert.equal(s.reservedLC,1000);
 adjustDemoBalance(s,'demo-self','RC',10,'Recompensa de teste');assert.equal(s.reservedLC,1000);
});
test('saque manual reserva uma vez; aprovação captura e recusa devolve uma vez',()=>{
 const s=account(),old=s.balances.LC,q=C.withdraw(s,1000);assert.equal(q.status,'pending');assert.equal(s.balances.LC,old-1000);assert.equal(s.reservedLC,1000);assert.equal(s.withdrawnCents,0);
 resolveDemoWithdrawal(s,q.requestId,true,'Revisão aprovada');assert.equal(s.balances.LC,old-1000);assert.equal(s.reservedLC,0);assert.equal(s.withdrawnCents,1000);
 assert.throws(()=>resolveDemoWithdrawal(s,q.requestId,true,'Outra revisão'),/pendente/);
 const second=C.withdraw(s,1000);resolveDemoWithdrawal(s,second.requestId,false,'Destino rejeitado');assert.equal(s.balances.LC,old-1000);assert.equal(s.reservedLC,0);
 assert.throws(()=>resolveDemoWithdrawal(s,second.requestId,false,'Outra revisão'),/pendente/);
});
test('saques automáticos obedecem ao teto, preservam taxa/cotação e depósitos ficam registrados',()=>{
 const s=account();s.settings.autoWithdrawals=true;s.settings.autoWithdrawalMax=10;s.settings.withdrawFee=2;
 const q=C.withdraw(s,1000);assert.equal(q.status,'paid');assert.equal(q.debitLC,1020);assert.equal(s.reservedLC,0);assert.equal(s.withdrawnCents,1000);
 const pending=C.withdraw(s,1100);assert.equal(pending.status,'pending');s.settings.withdrawFee=25;s.settings.lcPerReal=300;
 const original=s.withdrawals.find(w=>w.id===pending.requestId);assert.equal(original.feeCents,22);assert.equal(original.quote.lcPerReal,100);
 C.deposit(s,2000);assert.equal(s.deposits[0].amountCents,2000);assert.equal(s.deposits[0].LC,6000);assert.equal(s.deposits[0].status,'confirmed');
});
test('editar produção de um robô liquida a taxa anterior e audita os atributos',()=>{
 const s=account(),r=C.buyRobot(s,'moss',Date.now()-C.DAY),old=C.robotInfo(s,r).available;
 updateDemoRobot(s,'demo-self',r.uid,{daily:900,attack:50,defense:35,health:200},'Balanceamento individual');assert.ok(r.earned>=old);assert.equal(C.robotInfo(s,r).daily,900);assert.equal(C.robotInfo(s,r).attack,50);assert.equal(s.adminAudit[0].action,'robot_attributes');
});
test('paginação mantém limites e não perde itens ao mudar de página',()=>{
 const rows=Array.from({length:19},(_,i)=>i);assert.deepEqual(paged(rows,1).items,[0,1,2,3,4,5,6,7]);assert.deepEqual(paged(rows,3).items,[16,17,18]);assert.equal(paged(rows,99).page,3);assert.equal(paged([],1).pages,1);
});
