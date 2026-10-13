const config=window.LIFEBOTS_CONFIG;
export const isDemo=config.mode==='demo'&&config.allowDemo===true;
let clientPromise;
export async function publicAppearance(){const r=await fetch(config.supabaseUrl+'/functions/v1/game-api',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.supabasePublishableKey},body:JSON.stringify({action:'public_config'}),signal:AbortSignal.timeout(12000)});if(!r.ok)throw new Error('Não foi possível carregar o visual do jogo.');return (await r.json()).data;}
export async function supabase(){
 if(isDemo)return null;
 if(!config.supabaseUrl||!config.supabasePublishableKey)throw new Error('Configure a URL e a chave pública do Supabase em config.js.');
 if(!clientPromise)clientPromise=import(config.supabaseJsUrl).then(sdk=>sdk.createClient(config.supabaseUrl,config.supabasePublishableKey)).catch(error=>{clientPromise=null;throw error;});
 return clientPromise;
}
export async function signIn(email,password){const c=await supabase();const {data,error}=await c.auth.signInWithPassword({email,password});if(error)throw error;return data;}
export async function signUp(email,password,name,whatsapp,referralCode='',shareWhatsApp=false){const c=await supabase();const {data,error}=await c.auth.signUp({email,password,options:{data:{name,display_name:name,whatsapp,referral_code:referralCode||null,share_team_whatsapp:shareWhatsApp},emailRedirectTo:window.location.origin+'/#login'}});if(error)throw error;return data;}
export async function signOut(){const c=await supabase();if(c){const {error}=await c.auth.signOut();if(error)throw error;}}
export async function resetPassword(email){const c=await supabase();const {error}=await c.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/#recover'});if(error)throw error;}
export async function session(){const c=await supabase();if(!c)return null;const {data,error}=await c.auth.getSession();if(error)throw error;return data.session;}
export async function action(name,payload={}){
 if(isDemo)throw new Error('Chamadas remotas não são usadas na demonstração.');
 const body={...payload,action:name,mode:'real'};if(!body.idempotency_key)body.idempotency_key=crypto.randomUUID();const c=await supabase();const {data,error}=await c.functions.invoke('game-api',{body});
 if(error){let response;try{response=await error.context?.json?.();}catch{}throw new Error(response?.error?.message||data?.error?.message||error.message);}
 if(data?.error||data?.ok===false)throw new Error(data?.error?.message||String(data?.error||'Falha ao concluir a operação.'));return data;
}
export async function updatePassword(password){const c=await supabase();const {error}=await c.auth.updateUser({password});if(error)throw error;}
export async function onRecovery(callback){const c=await supabase();return c.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')callback();});}
export async function subscribeUpdates(onUpdate){const c=await supabase();if(!c)return ()=>{};const channel=c.channel('lifebots-updates-'+crypto.randomUUID()).on('postgres_changes',{event:'INSERT',schema:'public',table:'lr_game_signals'},onUpdate).on('postgres_changes',{event:'*',schema:'public',table:'lr_live_chat'},onUpdate).subscribe();return ()=>c.removeChannel(channel);}
export function mediaAdapter(){return {
 async list(){const c=await supabase(),{data,error}=await c.from('lr_media').select('*');if(error)throw new Error('Não foi possível carregar os arquivos.');return data.map(r=>({...r,createdAt:r.created_at,scope:'server',url:c.storage.from('lr-media').getPublicUrl(r.path).data.publicUrl}));},
 async upload(file,record){const c=await supabase(),user=(await c.auth.getUser()).data.user;if(!user)throw new Error('Entre na conta de administrador.');const extension=({'image/png':'png','image/jpeg':'jpg','image/webp':'webp','audio/mpeg':'mp3','audio/ogg':'ogg','audio/wav':'wav','audio/x-wav':'wav'})[file.type],path=user.id+'/'+record.id+'.'+extension;const uploaded=await c.storage.from('lr-media').upload(path,file,{contentType:file.type,upsert:false});if(uploaded.error)throw new Error('Não foi possível enviar o arquivo.');const {error}=await c.from('lr_media').insert({id:record.id,ref:record.ref,name:record.name,kind:record.kind,mime:record.mime,size:record.size,width:record.width||null,height:record.height||null,path,created_by:user.id,created_at:record.createdAt});if(error){await c.storage.from('lr-media').remove([path]);throw new Error('Não foi possível registrar o arquivo.');}return {path,url:c.storage.from('lr-media').getPublicUrl(path).data.publicUrl};},
 async remove(record){const c=await supabase(),{error}=await c.from('lr_media').delete().eq('id',record.id);if(error)throw new Error('O arquivo está em uso ou não pode ser removido.');const removed=await c.storage.from('lr-media').remove([record.path]);if(removed.error)throw new Error('A limpeza do arquivo precisa ser retomada.');}
};}
