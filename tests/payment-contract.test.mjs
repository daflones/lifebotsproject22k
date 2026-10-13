import {test} from 'node:test';import assert from 'node:assert/strict';import * as contract from '../supabase/functions/_shared/payment-contract.js';import {chargeRecord,verifySignature,pixDestination,cents} from '../supabase/functions/_shared/payment-contract.js';
test('recusas definitivas não são confundidas com indisponibilidade ou respostas desconhecidas',()=>{
 for(const [status,code] of [[401,'unauthorized'],[403,'kyc_required'],[422,'validation_error'],[422,'limit_exceeded'],[422,'charge_failed']])assert.equal(contract.providerFailure(status,{error:{code}}).definitive,true);
 for(const [status,code] of [[429,'rate_limited'],[502,'provider_unavailable'],[500,'charge_failed'],[422,'unknown']])assert.equal(contract.providerFailure(status,{error:{code}}).definitive,false);
});
test('somente erros transitórios documentados permitem retentativa automática',()=>{
 assert.equal(contract.providerFailure(429,{error:{code:'rate_limited'}}).retryable,true);
 assert.equal(contract.providerFailure(502,{error:{code:'provider_unavailable'}}).retryable,true);
 assert.equal(contract.providerFailure(422,{error:{code:'charge_failed'}}).retryable,false);
 assert.equal(contract.providerFailure(500,{error:{code:'unknown'}}).retryable,false);
});
test('conciliação de saque usa total_debit e ignora os significados conflitantes de net_amount',()=>{
 for(const net_amount of [9,11])assert.equal(chargeRecord({id:'withdrawal',reference_id:'request',status:'completed',amount:10,fee:1,net_amount,total_debit:11}).totalDebitCents,1100);
});
test('chaves e documentos Pix aceitam a pontuação documentada sem aceitar texto arbitrário',()=>{
 assert.equal(pixDestination({pix_key_type:'phone',pix_key:'(11) 99999-9999',recipient_document:'123.456.789-01'}).pix_key,'11999999999');
 assert.equal(pixDestination({pix_key_type:'cpf',pix_key:'123.456.789-01'}).pix_key,'12345678901');
 assert.throws(()=>pixDestination({pix_key_type:'phone',pix_key:'abc11999999999',recipient_document:'12345678901'}));
});
async function signed(raw,now){const secret='test-only-secret-never-production',timestamp=String(Math.floor(now/1000)),key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']),signature=Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(timestamp+'.'+raw)))).map(x=>x.toString(16).padStart(2,'0')).join('');return {secret,headers:new Headers({'x-mercosulpay-timestamp':timestamp,'x-mercosulpay-signature':'sha256='+signature,'x-mercosulpay-delivery':'delivery-test','x-mercosulpay-event':'pix.received'})};}
test('webhook valida corpo bruto e prazo; alteração ou replay antigo falham',async()=>{const now=Date.now(),raw='{"data":{"amount":10}}',v=await signed(raw,now),bytes=new TextEncoder().encode(raw);assert.equal((await verifySignature(v.headers,bytes,v.secret,now)).deliveryId,'delivery-test');await assert.rejects(()=>verifySignature(v.headers,new TextEncoder().encode(raw+' '),v.secret,now));await assert.rejects(()=>verifySignature(v.headers,bytes,v.secret,now+301000));});
test('contrato exige identidade, referência e valores exatos em centavos',()=>{assert.equal(chargeRecord({id:'charge',reference_id:'reference',status:'pending',amount:10.99}).amountCents,1099);assert.throws(()=>chargeRecord({status:'completed',amount:10}));assert.throws(()=>cents(1.001));assert.throws(()=>cents('10'));assert.equal(chargeRecord({id:'w',reference_id:'ref',status:'completed',amount:10,total_debit:10.2}).totalDebitCents,1020);});
test('chaves Pix de email e telefone exigem documento e formato válido',()=>{assert.throws(()=>pixDestination({pix_key_type:'email',pix_key:'qa@example.invalid'}));assert.deepEqual(pixDestination({pix_key_type:'email',pix_key:'qa@example.invalid',recipient_document:'12345678901'}),{pix_key_type:'email',pix_key:'qa@example.invalid',recipient_document:'12345678901'});assert.throws(()=>pixDestination({pix_key_type:'unknown',pix_key:'12345678901'}));});
