import {serverClient} from './auth.ts';
import {ApiError,requireEnv} from './response.ts';
import {chargeRecord,verifySignature,pixDestination,providerFailure} from './payment-contract.js';
import {actionHash,executeGameAction} from './runtime/service.ts';
const base='https://mercosulpay.com/api/public/v1';
async function provider(path:string,method='GET',body?:unknown,key?:string){
 for(let attempt=0;;attempt++){
  const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+requireEnv('MERCOSULPAY_API_KEY'),'Content-Type':'application/json',...(key?{'Idempotency-Key':key}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20000)});
  let data;try{data=await response.json();}catch{throw new ApiError(502,'GATEWAY_RESPONSE','Resposta incompleta do gateway.');}
  if(!response.ok){const failure=providerFailure(response.status,data);if(failure.retryable&&attempt<1){await new Promise(resolve=>setTimeout(resolve,1000));continue;}throw new ApiError(response.status>=500?502:400,failure.definitive?'GATEWAY_REJECTED':'GATEWAY_UNCERTAIN',failure.reason);}return data;
 }
}
async function rpc(name:string,args:Record<string,unknown>){const {data,error}=await serverClient().rpc(name,args);if(error){if(error.message.includes('INSUFFICIENT_FUNDS'))throw new ApiError(400,'INSUFFICIENT_FUNDS','Saldo insuficiente.');if(error.message.includes('REAL_MONEY_DISABLED'))throw new ApiError(403,'REAL_MONEY_DISABLED','Pagamentos pausados pelo administrador.');if(error.message.includes('IDEMPOTENCY_CONFLICT'))throw new ApiError(409,'IDEMPOTENCY_CONFLICT','Identificação usada por outra operação.');throw new ApiError(400,'PAYMENT_RULE','Não foi possível concluir. Verifique o valor e o estado da operação.');}return data;}
export function publicPayment(r:any){return {id:r.id,userId:r.user_id,kind:r.kind,amountCents:r.amount_cents,feeCents:r.fee_cents,LC:r.lc_amount,debitLC:r.kind==='withdrawal'?r.lc_amount:0,requestedCents:r.amount_cents,receiveCents:r.amount_cents,status:({completed:r.kind==='deposit'?'confirmed':'paid',review:'pending',created:'processing',dispatching:'processing'})[r.status]||r.status,providerStatus:r.status,autoApproved:r.quote?.autoApproved,createdAt:Date.parse(r.created_at),simulated:false,qrCode:r.qr_code,providerId:r.provider_id,providerTotalDebitCents:r.provider_total_debit_cents,reason:r.reason};}
async function update(r:any,status:string,record?:any,reason?:string){return rpc('lr_cash_update',{p_id:r.id,p_status:status,p_provider:record?.id||null,p_qr:record?.qrCode||null,p_total:record?.totalDebitCents||null,p_reason:reason||null});}
async function dispatch(id:string){const claim=await rpc('lr_cash_claim',{p_id:id});if(!claim.claimed)return claim.operation;const r=claim.operation;
 try{const raw=await provider(r.kind==='deposit'?'/pix/charges':'/pix/withdrawals','POST',r.kind==='deposit'?{amount:r.amount_cents/100,currency:'BRL',description:'LifeCoins · LifeBots',reference_id:r.id}:{amount:r.amount_cents/100,...r.destination,reference_id:r.id},r.id);const data=raw?.data||raw;if(!data||typeof data.id!=='string')throw new Error('Resposta sem identificação.');let record;try{record=chargeRecord({...data,reference_id:data.reference_id||r.id});}catch{return update(r,'pending',{id:data.id},'Aguardando confirmação financeira assinada do gateway.');}
  if(record.reference!==r.id||record.amountCents!==r.amount_cents)throw new Error('Resposta não corresponde à cotação.');
  if(record.status==='completed'&&(r.kind==='deposit'||record.totalDebitCents!==null))return update(r,'completed',record);
  if(['failed','cancelled','rejected'].includes(record.status))return update(r,'failed',record);
  return update(r,'pending',record);
 }catch(e){return e instanceof ApiError&&e.code==='GATEWAY_REJECTED'?update(r,'failed',undefined,e.message):update(r,'uncertain',undefined,'Conciliação necessária: não reenvie esta operação.');}
}
export async function paymentAction(actor:string,body:Record<string,any>){
 const client=serverClient(),key=String(body.idempotency_key||'');if(!/^[A-Za-z0-9:_-]{8,160}$/.test(key))throw new ApiError(400,'IDEMPOTENCY_REQUIRED','Identifique a operação.');
 await executeGameAction(actor,{action:'snapshot',mode:'real'});let operation;
 if(body.action==='payment_status'){
  const found=await client.from('lr_cash_operations').select('*').eq('id',body.payment_id).eq('user_id',actor).maybeSingle();if(!found.data)throw new ApiError(404,'PAYMENT_NOT_FOUND','Pagamento não encontrado.');operation=found.data;
  if(operation.kind==='deposit'&&operation.provider_id&&['pending','uncertain','dispatching'].includes(operation.status))operation=await reconcileCharge(operation);
 }else if(body.action==='admin_review_withdrawal'){
  if(typeof body.approve!=='boolean')throw new ApiError(400,'INVALID_REVIEW','Informe a decisão.');operation=await rpc('lr_cash_review',{p_actor:actor,p_id:body.withdrawal_id,p_approve:body.approve,p_reason:String(body.reason||'')});if(body.approve)operation=await dispatch(operation.id);
 }else{
  const amount=body.amount_cents;if(!Number.isSafeInteger(amount)||amount<1||amount>10000000)throw new ApiError(400,'INVALID_AMOUNT','Valor inválido.');let destination=null;
  if(body.action==='withdraw')try{destination=pixDestination(body);}catch(e){throw new ApiError(400,'INVALID_PIX',(e as Error).message);}
  operation=await rpc('lr_cash_prepare',{p_actor:actor,p_kind:body.action==='deposit'?'deposit':'withdrawal',p_amount:amount,p_destination:destination,p_key:key,p_hash:await actionHash(body)});if(operation.status==='created')operation=await dispatch(operation.id);
 }
 return {ok:true,data:{result:publicPayment(operation),snapshot:(await executeGameAction(actor,{action:'snapshot',mode:'real'})).data}};
}
async function reconcileCharge(r:any){const record=chargeRecord(await provider('/pix/charges/'+encodeURIComponent(r.provider_id)));if(record.id!==r.provider_id||record.reference!==r.id||record.amountCents!==r.amount_cents)throw new ApiError(409,'GATEWAY_MISMATCH','Dados do gateway não correspondem ao depósito.');if(record.status==='completed')return update(r,'completed',record);if(['expired','failed','cancelled'].includes(record.status))return update(r,'failed',record);return r;}
export async function verifyMercosulWebhook(headers:Headers,raw:Uint8Array){try{return await verifySignature(headers,raw,requireEnv('MERCOSULPAY_WEBHOOK_SECRET'));}catch{throw new ApiError(401,'INVALID_SIGNATURE','Assinatura inválida.');}}
export async function processMercosulWebhook(envelope:any,payload:any){const c=serverClient(),d=payload?.data||payload?.object||payload,reference=d?.reference_id;
 if(typeof reference!=='string'||!/^[-0-9a-f]{36}$/i.test(reference))throw new ApiError(400,'WEBHOOK_SCHEMA','Referência do evento inválida.');
 const existing=await c.from('lr_cash_deliveries').select('*').eq('delivery_id',envelope.deliveryId).maybeSingle();if(existing.data){if(existing.data.payload_hash!==envelope.payloadHash)throw new ApiError(409,'DELIVERY_CONFLICT','Entrega já registrada com outro conteúdo.');if(existing.data.status==='processed')return;}
 else {const inserted=await c.from('lr_cash_deliveries').insert({delivery_id:envelope.deliveryId,payload_hash:envelope.payloadHash,event_type:envelope.eventType});if(inserted.error&&inserted.error.code!=='23505')throw new ApiError(503,'EVENT_NOT_RECORDED','Não foi possível registrar o evento.');}
 const found=await c.from('lr_cash_operations').select('*').eq('id',reference).maybeSingle(),r=found.data;if(!r)throw new ApiError(404,'REFERENCE_NOT_FOUND','Operação não encontrada.');
 let handled=false;
 if(envelope.eventType==='pix.received'&&r.kind==='deposit'&&r.provider_id){await reconcileCharge(r);handled=true;}
 if(envelope.eventType==='pix.sent'&&r.kind==='withdrawal'){
  let record;try{record=chargeRecord(d);}catch{throw new ApiError(422,'WEBHOOK_SCHEMA','Evento sem os campos financeiros necessários.');}
  if(record.reference!==r.id||record.amountCents!==r.amount_cents||!r.provider_id||record.id!==r.provider_id)throw new ApiError(409,'PAYMENT_MISMATCH','Evento não corresponde ao saque.');
  if(record.status==='completed'&&record.totalDebitCents!==null&&record.totalDebitCents>=r.amount_cents){await update(r,'completed',record);handled=true;}
  else if(['failed','cancelled','rejected'].includes(record.status)){await update(r,'failed',record);handled=true;}
 }
 // Reembolso exige conciliação: nunca cria crédito ou saldo negativo automaticamente.
 const done=await c.from('lr_cash_deliveries').update({operation_id:r.id,status:handled?'processed':'review'}).eq('delivery_id',envelope.deliveryId);if(done.error)throw new ApiError(503,'EVENT_SAVE_FAILED','Não foi possível registrar a confirmação.');
}
export async function processPaymentOutbox(limit=50){const c=serverClient(),rows=await c.from('lr_cash_operations').select('*').in('status',['created','dispatching','pending']).order('created_at').limit(limit);if(rows.error)throw new ApiError(503,'OUTBOX_FAILED','Não foi possível carregar os pagamentos.');let processed=0;for(const r of rows.data||[]){try{if(r.status==='created'||r.status==='dispatching')await dispatch(r.id);else if(r.kind==='deposit'&&r.provider_id)await reconcileCharge(r);processed++;}catch{}}return {processed};}
