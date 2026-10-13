import {serverClient} from '../auth.ts';
import {ApiError} from '../response.ts';
import {publicPayment} from '../mercosulpay.ts';
import {sessionContext,handleAction,changedAccounts,visibleSnapshot} from './engine.js';

const readActions=new Set(['snapshot','social_snapshot','admin_users','admin_user_detail','admin_deposits','admin_withdrawals','admin_guilds','admin_trades','admin_chat_messages']);
function stable(value:unknown):string {if(value===null||typeof value!=='object')return JSON.stringify(value);if(Array.isArray(value))return '['+value.map(stable).join(',')+']';return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+stable((value as Record<string,unknown>)[k])).join(',')+'}';}
export async function actionHash(body:Record<string,unknown>){const filtered={...body};delete filtered.idempotency_key;delete filtered.idempotencyKey;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(stable(filtered))))).map(b=>b.toString(16).padStart(2,'0')).join('');}
function targetIds(ctx:any,actor:string,body:any){const ids=new Set<string>([actor]);const profiles=ctx.profiles,w=ctx.world.data;
 let parent=profiles.find((p:any)=>p.id===actor)?.referrerId;for(let n=0;parent&&n<3;n++){ids.add(parent);parent=profiles.find((p:any)=>p.id===parent)?.referrerId;}
 if(body.user_id)ids.add(body.user_id);
 const m=w.matches?.find((m:any)=>m.id===body.match_id||m.status==='active'&&m.players.some((p:any)=>p.userId===actor));for(const p of m?.players||[])if(p.userId)ids.add(p.userId);
 const listing=w.listings?.find((l:any)=>l.id===body.listing_id),proposal=w.proposals?.find((p:any)=>p.id===body.proposal_id);if(listing)ids.add(listing.sellerId);if(proposal){ids.add(proposal.sellerId);ids.add(proposal.buyerId);}
 if(body.action==='maintenance')for(const listing of w.listings||[])if(listing.expiresAt<Date.now())ids.add(listing.sellerId);
 if(['arena_find_match','guild_find_battle'].includes(body.action))for(const p of w.queue||[])ids.add(p.userId);
 if(body.action==='guild_join')for(const m of w.guilds?.find((g:any)=>g.id===body.guild_id)?.members||[])ids.add(m.userId);
 if(readActions.has(body.action)){let parents=new Set([actor]);for(let n=0;n<3;n++){const children=profiles.filter((p:any)=>parents.has(p.referrerId));children.forEach((p:any)=>ids.add(p.id));parents=new Set(children.map((p:any)=>p.id));}
  if(profiles.find((p:any)=>p.id===actor)?.role==='admin')profiles.forEach((p:any)=>ids.add(p.id));}
 return [...ids].filter(id=>/^[0-9a-f-]{36}$/i.test(id));}
function safeError(error:unknown):never {const message=error instanceof Error?error.message:'Falha na operação.';if(message==='ADMIN_REQUIRED')throw new ApiError(403,'ADMIN_REQUIRED','Acesso restrito ao administrador.');if(message==='UNKNOWN_ACTION')throw new ApiError(400,'UNKNOWN_ACTION','Ação desconhecida.');if(message==='MATCH_VERSION_CONFLICT')throw new ApiError(409,'MATCH_VERSION_CONFLICT','O turno foi atualizado. Aguarde a sincronização.');throw new ApiError(400,'GAME_RULE',message.replace(/^ACCOUNT_REQUIRED:.*/,'A conta necessária ainda não foi carregada.'));}
export async function executeGameAction(actor:string,body:Record<string,unknown>){
 const mode=body.mode==='demo'?'demo':'real',client=serverClient(),action=String(body.action),read=readActions.has(action),key=String(body.idempotency_key||body.idempotencyKey||'');
 if(!read&&(!/^[A-Za-z0-9:_-]{8,160}$/.test(key)))throw new ApiError(400,'IDEMPOTENCY_REQUIRED','Envie uma identificação válida da operação.');
 const hash=await actionHash(body);
 if(!read){const previous=await client.from('lr_game_requests').select('payload_hash,action,response').eq('user_id',actor).eq('mode',mode).eq('request_key',key).maybeSingle();if(previous.data){if(previous.data.payload_hash!==hash||previous.data.action!==action)throw new ApiError(409,'IDEMPOTENCY_CONFLICT','Identificação já usada por outra operação.');return {...previous.data.response,data:{...previous.data.response.data,snapshot:(await executeGameAction(actor,{action:'snapshot',mode})).data}};}}
 let required:string[]=[];
 for(let attempt=0;attempt<8;attempt++){if(attempt>0&&!read){const {data:retry}=await client.from('lr_game_requests').select('payload_hash,action,response').eq('user_id',actor).eq('mode',mode).eq('request_key',key).maybeSingle();if(retry){if(retry.payload_hash!==hash||retry.action!==action)throw new ApiError(409,'IDEMPOTENCY_CONFLICT','Identificação já usada.');return {...retry.response,data:{...retry.response.data,snapshot:(await executeGameAction(actor,{action:'snapshot',mode})).data}};}}
  const first=await client.rpc('lr_engine_load',{p_actor:actor,p_extra_ids:required,p_mode:mode});if(first.error)throw new ApiError(503,'BACKEND_NOT_READY','Não foi possível carregar a conta.');
  const ids=targetIds(first.data,actor,body);required=[...new Set([...required,...ids])];
  const loaded=required.every(id=>first.data.accounts.some((a:any)=>a.userId===id))?first:await client.rpc('lr_engine_load',{p_actor:actor,p_extra_ids:required,p_mode:mode});if(loaded.error)throw new ApiError(503,'BACKEND_NOT_READY','Não foi possível carregar os participantes.');
  const session=sessionContext(loaded.data,actor);
  if(action.startsWith('admin_')&&session.state.profile.role!=='admin')throw new ApiError(403,'ADMIN_REQUIRED','Acesso restrito ao administrador.');
  if(read){const snapshot=await withPayments(client,visibleSnapshot(session),actor,mode);if(action==='admin_users'){const page=Math.max(1,Number(body.page)||1),size=8,query=String(body.query||'').toLowerCase(),all=(snapshot.adminUsers||[]).filter((a:any)=>[a.profile.name,a.profile.email,a.profile.whatsapp,a.profile.referralCode].join(' ').toLowerCase().includes(query));return {ok:true,data:{items:all.slice((page-1)*size,page*size),total:all.length,page,size}};}if(action==='admin_user_detail')return {ok:true,data:snapshot.adminUsers?.find((a:any)=>a.profile.id===body.user_id)||null};return {ok:true,data:snapshot};}
  let result;try{result=handleAction(session,body);}catch(e){const msg=e instanceof Error?e.message:'';if(msg.startsWith('ACCOUNT_REQUIRED:')){required.push(msg.split(':')[1]);continue;}safeError(e);}
  const response={ok:true,data:{result,snapshot:await withPayments(client,visibleSnapshot(session),actor,mode)}};
  const committed=await client.rpc('lr_engine_commit',{p_actor:actor,p_mode:mode,p_world_revision:session.worldRevision,p_world:session.world,p_accounts:changedAccounts(session),p_key:key,p_hash:hash,p_action:action,p_response:response});
  if(!committed.error)return committed.data;
  if(committed.error.message.includes('REVISION_CONFLICT')){await new Promise(resolve=>setTimeout(resolve,20+Math.random()*60));continue;}
  if(committed.error.message.includes('IDEMPOTENCY_CONFLICT'))throw new ApiError(409,'IDEMPOTENCY_CONFLICT','Identificação já usada por outra operação.');
  console.error('LifeBots commit failure',committed.error.code);throw new ApiError(409,'COMMIT_REJECTED','A operação não foi gravada. Atualize a conta e tente novamente.');
 }
 throw new ApiError(409,'CONCURRENT_UPDATE','A conta recebeu outra atualização. Tente novamente.');
}

async function withPayments(client:any,snapshot:any,actor:string,mode:string){if(mode!=='real')return snapshot;let query=client.from('lr_cash_operations').select('*').order('created_at',{ascending:false}).limit(300);if(snapshot.profile.role!=='admin')query=query.eq('user_id',actor);const {data,error}=await query;if(error)throw new ApiError(503,'PAYMENTS_LOAD_FAILED','Não foi possível carregar a carteira.');snapshot.deposits=data.filter((r:any)=>r.kind==='deposit').map(publicPayment);snapshot.withdrawals=data.filter((r:any)=>r.kind==='withdrawal').map(publicPayment);return snapshot;}
