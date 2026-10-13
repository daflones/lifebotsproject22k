import {serverClient} from '../_shared/auth.ts';
import {ApiError,errorResponse,jsonResponse,readJson,requireEnv,secretsMatch} from '../_shared/response.ts';
import {executeGameAction} from '../_shared/runtime/service.ts';
import {processPaymentOutbox} from '../_shared/mercosulpay.ts';
import {dayKey,DAY} from '../../../src/core.js';
Deno.serve(async(request:Request)=>{try{
 if(request.method!=='POST')throw new ApiError(405,'METHOD_NOT_ALLOWED','Use POST.');const configured=requireEnv('DAILY_JOB_SECRET'),provided=request.headers.get('x-liferobots-job-secret')||'';
 if(configured.length<32||!await secretsMatch(provided,configured))throw new ApiError(401,'INVALID_JOB_SECRET','Acesso não autorizado.');
 const body=await readJson(request),mode=body.mode==='demo'?'demo':'real',day=typeof body.day==='string'?body.day:dayKey(Date.now()-DAY),today=dayKey();
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||day>=today||Date.now()-Date.parse(day+'T00:00:00-03:00')>31*DAY)throw new ApiError(400,'INVALID_SETTLEMENT_DATE','Informe um dia concluído nos últimos 30 dias.');
 const limit=body.limit??100;if(!Number.isInteger(limit)||Number(limit)<1||Number(limit)>300)throw new ApiError(400,'INVALID_BATCH_LIMIT','Lote inválido.');
 const client=serverClient(),checkpoint=await client.from('lr_job_checkpoint').select('*').eq('name','daily').maybeSingle(),after=body.after||(checkpoint.data?.day===day?checkpoint.data.after_id:null);
 let query=client.from('lr_profiles').select('id').eq('status','active').order('id').limit(Number(limit));if(after)query=query.gt('id',String(after));const {data,error}=await query;if(error)throw new ApiError(503,'JOB_LOAD_FAILED','Não foi possível carregar o lote.');
 let processed=0,failed=0;for(const user of data||[]){try{await executeGameAction(user.id,{action:'daily_settle',mode,day,idempotency_key:'daily:'+mode+':'+day+':'+user.id});await executeGameAction(user.id,{action:'maintenance',mode,idempotency_key:'maintenance:'+Math.floor(Date.now()/300000)+':'+user.id});processed++;}catch{failed++;}}
 const payments=mode==='real'?await processPaymentOutbox(50):{processed:0};const nextAfter=data?.length===limit?data.at(-1).id:null;await client.from('lr_job_checkpoint').upsert({name:'daily',day,after_id:nextAfter,updated_at:new Date().toISOString()});await client.from('lr_job_runs').insert({day,processed,failed,payments:payments.processed});return jsonResponse({ok:true,data:{day,mode,processed,failed,payments:payments.processed,nextAfter}});
}catch(e){return errorResponse(e);}});
