import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import {robotOffer,approximateBRL} from '../src/robot-offer.js';
test('a oferta usa a produção base, o prazo e as duas cotações sem alterar o saldo',()=>{
 const s=C.initialState(),balances=C.clone(s.balances),q=robotOffer(s,'volt');
 assert.equal(q.dailyRC,1800);assert.equal(q.totalRC,54000);assert.ok(Math.abs(q.dailyBRL-1.8)<1e-12);assert.equal(q.totalBRL,54);assert.equal(q.priceBRL,14);assert.deepEqual(s.balances,balances);
 s.settings.rcPerLC=20;const changed=robotOffer(s,'volt');assert.ok(Math.abs(changed.dailyBRL-.9)<1e-12);assert.equal(changed.priceBRL,14);
 s.settings.lcPerReal=200;assert.ok(Math.abs(robotOffer(s,'volt').dailyBRL-.45)<1e-12);
});
test('preço em RobotCoins segue a conversão e estimativas pequenas conservam precisão',()=>{
 const s=C.initialState(),model={...s.catalog[0],currency:'RC',price:1000,daily:1};
 assert.equal(robotOffer(s,model).priceBRL,1);assert.match(approximateBRL(.001),/0,001/);
 assert.throws(()=>robotOffer({...s,settings:{...s.settings,rcPerLC:0}},model),/Cotação/);
});
