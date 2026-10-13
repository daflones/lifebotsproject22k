import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
const NOW=Date.UTC(2026,9,11,23,30);
test('depósito → robô → peça → evolução → produção → conversão → saque de teste',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;s.balances={LC:0,RC:0};s.robots=[];s.inventory=[];
 assert.equal(C.deposit(s,2000),2000);
 const r=C.buyRobot(s,'moss',NOW);assert.equal(s.balances.LC,1700);
 s.balances.RC=1000;const item=C.buyPart(s,'core');C.equip(s,r.uid,item.uid,NOW);
 assert.equal(C.robotInfo(s,r,NOW).daily,36);C.levelUp(s,r.uid,NOW);
 assert.equal(C.robotInfo(s,r,NOW).daily,39);
 assert.equal(C.collect(s,r.uid,NOW+C.DAY),39);assert.equal(C.collect(s,r.uid,NOW+C.DAY),0);
 const quote=C.convert(s,'RC',100);assert.equal(quote.credit,10);
 const withdrawn=C.withdraw(s,1000);assert.equal(withdrawn.debitLC,1000);assert.equal(s.balances.LC,710);
 assert.ok(s.transactions.every(x=>Number.isSafeInteger(x.amount)));
});
test('produção termina na expiração, inclusive ao coletar depois do prazo',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;s.robots=[];const r=C.buyRobot(s,'moss',NOW);
 const info=C.robotInfo(s,r,NOW+20*C.DAY);assert.equal(info.active,false);assert.equal(info.available,210);
 C.collect(s,r.uid,NOW+20*C.DAY);assert.equal(r.earned,210);assert.equal(C.collect(s,r.uid,NOW+21*C.DAY),0);
 assert.throws(()=>C.levelUp(s,r.uid,NOW+20*C.DAY),/prazo/);
});
test('coletas parciais preservam o resto de produção e evitam crédito duplicado',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;s.robots=[];const r=C.buyRobot(s,'moss',NOW);
 C.collect(s,r.uid,NOW+3*3600000);C.collect(s,r.uid,NOW+11*3600000);C.collect(s,r.uid,NOW+C.DAY);
 assert.equal(r.earned,30);assert.equal(C.collect(s,r.uid,NOW+C.DAY),0);
});
test('upgrade liquida produção anterior usando a taxa anterior',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;s.robots=[];const r=C.buyRobot(s,'moss',NOW);C.levelUp(s,r.uid,NOW+C.DAY);
 assert.equal(r.earned,30);assert.equal(C.robotInfo(s,r,NOW+2*C.DAY).available,33);
});
test('peças respeitam classe, exclusividade e um equipamento por espaço',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;const moss=s.robots[0],volt=s.robots[1];const shield=C.buyPart(s,'shield');
 assert.throws(()=>C.equip(s,volt.uid,shield.uid,NOW),/compatível/);
 C.equip(s,moss.uid,shield.uid,NOW);assert.equal(shield.equippedOn,moss.uid);
 const core1=C.buyPart(s,'core'),core2=C.buyPart(s,'core');C.equip(s,moss.uid,core1.uid,NOW);C.equip(s,moss.uid,core2.uid,NOW);
 assert.equal(core1.equippedOn,null);assert.equal(moss.equipment.length,2);
 assert.throws(()=>C.equip(s,volt.uid,core2.uid,NOW),/outro robô/);
});
test('conversão usa piso, nunca cria créditos abaixo da unidade mínima',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;const before=s.balances.LC;C.convert(s,'RC',109);assert.equal(s.balances.LC,before+10);
 assert.throws(()=>C.convert(s,'RC',1),/mínima/);assert.throws(()=>C.convert(s,'RC',-1),/positivo/);
 assert.throws(()=>C.convert(s,'RC',1.3),/inteiro/);
});
test('saque mostra valor líquido e taxa adicional em centavos',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;s.settings.withdrawFee=2.5;const q=C.withdrawalQuote(s,1000);
 assert.deepEqual(q,{requestedCents:1000,feeCents:25,debitLC:1025,receiveCents:1000});
 assert.throws(()=>C.withdraw(s,999),/mínimo/);s.balances.LC=20;assert.throws(()=>C.withdraw(s,1000),/insuficiente/);
});
test('quatro batalhas, passe extra, uso do robô e liquidação única',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;s.daily={date:C.dayKey(NOW),used:0,extra:0};const o={name:'Scout NPC',attack:25,defense:16,health:100};
 for(let i=0;i<4;i++){const ticket=C.beginBattle(s,s.robots[0].uid,o,NOW);C.resolveBattle(s,ticket,true);assert.throws(()=>C.resolveBattle(s,ticket,true),/liquidada/);}
 assert.equal(C.dailyBattles(s,NOW),0);assert.throws(()=>C.beginBattle(s,s.robots[0].uid,o,NOW),/acabaram/);
 // Same live day prevents buying passes for a mismatched simulated date.
 s.daily.date=C.dayKey();C.buyPass(s);assert.equal(C.dailyBattles(s),1);assert.equal(s.robots[0].used,6);
});
test('limites individuais de batalha e RobotCoins para perda máxima',()=>{
 const s=C.initialState(NOW);s.settings.productionMultiplier=1;const r=s.robots[0];r.used=24;
 assert.throws(()=>C.beginBattle(s,r.uid,{name:'NPC'},NOW),/esgotou/);r.used=0;s.balances.RC=0;
 assert.throws(()=>C.beginBattle(s,r.uid,{name:'NPC'},NOW),/perda máxima/);assert.equal(r.used,0);
});
test('reset de batalhas respeita meia-noite de São Paulo, sem carregar passes',()=>{
 const s=C.initialState();const a=Date.UTC(2026,9,12,2,59),b=Date.UTC(2026,9,12,3,1);
 s.daily={date:C.dayKey(a),used:3,extra:2};assert.equal(C.dailyBattles(s,a),3);
 assert.equal(C.dailyBattles(s,b),4);assert.equal(s.daily.extra,0);
});
test('tutorial e capítulos pagam apenas uma vez',()=>{
 const s=C.initialState();const a=s.balances.LC;C.tutorialReward(s);assert.equal(s.balances.LC,a+300);
 assert.throws(()=>C.tutorialReward(s),/resgatada/);C.completeStory(s,1,s.robots[0].uid);
 assert.throws(()=>C.completeStory(s,1,s.robots[0].uid),/concluído/);
 assert.throws(()=>C.completeStory(s,3,s.robots[0].uid),/bloqueado/);
});
test('comissões da simulação são produção × nível, nunca depósito',()=>{
 const s=C.initialState();C.deposit(s,10000);C.simulateDay(s);
 assert.deepEqual(s.affiliates.map(x=>x.commission),[12,3,0]);assert.equal(s.commissionTotal,15);
});
test('configurações inválidas e débito que gera saldo negativo são recusados',()=>{
 const s=C.initialState();assert.throws(()=>C.validateSettings({...s.settings,rcPerLC:0}),/inválida/);
 assert.throws(()=>C.validateSettings({...s.settings,commissions:[80,20,10]}),/100%/);
 assert.throws(()=>C.transaction(s,'Teste','LC',-999999),/insuficiente/);
 assert.throws(()=>C.transaction(s,'Teste','USD',10),/Moeda/);
});
