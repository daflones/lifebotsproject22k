export function cents(value){if(typeof value!=='number'||!Number.isFinite(value)||value<=0||Math.abs(value*100-Math.round(value*100))>1e-6)throw new Error('Valor monetário inválido.');return Math.round(value*100);}
function providerCents(value){if(typeof value!=='string')return cents(value);if(!/^\d+(?:\.\d{1,2})?$/.test(value))throw new Error('Valor do gateway inválido.');const [whole,fraction='']=value.split('.'),amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));if(!Number.isSafeInteger(amount)||amount<=0)throw new Error('Valor do gateway inválido.');return amount;}
export function chargeRecord(raw){const d=raw?.data||raw;if(!d||typeof d.id!=='string'||typeof d.reference_id!=='string'||typeof d.status!=='string')throw new Error('Resposta do gateway incompleta.');return {id:d.id,reference:d.reference_id,status:d.status,amountCents:providerCents(d.amount),feeCents:d.fee===undefined?null:(Number(d.fee)===0?0:providerCents(d.fee)),totalDebitCents:d.total_debit===undefined?null:providerCents(d.total_debit),qrCode:typeof d.qr_code==='string'?d.qr_code:null};}
export async function verifySignature(headers,raw,secret,now=Date.now()){
 const timestamp=headers.get('x-mercosulpay-timestamp'),signature=headers.get('x-mercosulpay-signature'),delivery=headers.get('x-mercosulpay-delivery'),event=headers.get('x-mercosulpay-event');
 if(!timestamp||!/^\d{10}$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300||!delivery||delivery.length>160||!['pix.received','pix.sent','pix.refunded'].includes(event)||!/^sha256=[a-f0-9]{64}$/i.test(signature||''))throw new Error('Assinatura inválida.');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']),prefix=new TextEncoder().encode(timestamp+'.'),message=new Uint8Array(prefix.length+raw.length);message.set(prefix);message.set(raw,prefix.length);
 const bytes=Uint8Array.from(signature.slice(7).match(/../g),h=>parseInt(h,16));if(!await crypto.subtle.verify('HMAC',key,bytes,message))throw new Error('Assinatura inválida.');
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw))).map(n=>n.toString(16).padStart(2,'0')).join('');return {deliveryId:delivery,eventType:event,payloadHash:hash};
}
export function providerFailure(status,body){
 const code=body?.error?.code,expected={unauthorized:401,kyc_required:403,validation_error:422,limit_exceeded:422,charge_failed:422};
 const definitive=Object.hasOwn(expected,code)&&expected[code]===status;
 const messages={unauthorized:'Credencial do gateway inválida. Solicite suporte.',kyc_required:'A conta do gateway precisa de aprovação cadastral.',validation_error:'O gateway recusou os dados da operação.',limit_exceeded:'O limite de operações do gateway foi atingido.',charge_failed:'O gateway recusou a operação de forma definitiva.'};
 return {definitive,retryable:status===429&&code==='rate_limited'||status===502&&code==='provider_unavailable',reason:definitive?messages[code]:'Conciliação necessária: não reenvie esta operação.'};
}
export function pixDestination(body){
 const type=String(body.pix_key_type||''),raw=String(body.pix_key||'').trim(),document=String(body.recipient_document||'').replace(/\D/g,'');
 if(!['cpf','cnpj','email','phone','evp','emv'].includes(type)||raw.length<5||raw.length>200)throw new Error('Chave Pix inválida.');
 if((['email','phone','evp'].includes(type)||document)&&![11,14].includes(document.length))throw new Error('Informe o documento do titular da chave Pix.');
 if(['cpf','cnpj','phone'].includes(type)&&!/^\+?[\d().\s/-]+$/.test(raw))throw new Error('Formato da chave Pix inválido.');
 const key=['cpf','cnpj','phone'].includes(type)?raw.replace(/[^\d+]/g,''):raw;
 if(type==='cpf'&&!/^\d{11}$/.test(key)||type==='cnpj'&&!/^\d{14}$/.test(key)||type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)||type==='phone'&&!/^\+?\d{10,15}$/.test(key)||type==='evp'&&!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(key))throw new Error('Formato da chave Pix inválido.');
 return {pix_key:key,pix_key_type:type,...(document?{recipient_document:document}:{})};
}
