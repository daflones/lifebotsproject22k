#!/usr/bin/env node
// Simulador de chat do LifeBots — povoia o chat global/mercado de produção
// com conversas entre pilotos simulados. Requer a service role (uso LOCAL apenas).
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/simulate-chat.mjs
//
// Opções:
//   --players=100   quantidade de pilotos simulados (cria usuários de auth + perfis)
//   --min=25s       intervalo mínimo entre mensagens (aceita s/m/h)
//   --max=90s       intervalo máximo entre mensagens
//   --threads=4     conversas simultâneas em andamento
//   --gap=15s       intervalo base entre réplicas na mesma conversa
//   --count=0       total de mensagens antes de parar (0 = infinito)
//   --mode=real     mundo alvo (real|demo)
//   --once          envia uma única mensagem e sai (teste rápido)
//   --dry           apenas imprime o que seria enviado (não toca o banco)
//   --purge         remove do mundo as mensagens marcadas como simuladas e sai
//
// As credenciais podem ficar num arquivo .env na raiz (não comitado).
// Os pilotos provisionados ficam em cache em .chat-sim-pilots.json (não comitado).

import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {randomUUID,createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const CACHE_FILE=join(ROOT,'.chat-sim-pilots.json');

// ---------- helpers ----------
function loadEnv(){for(const name of ['.env.local','.env']){const p=join(ROOT,name);if(!existsSync(p))continue;for(const line of readFileSync(p,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,'');}}}
loadEnv();

const args=Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>{const[k,v]=a.slice(2).split('=');return [k,v??true];}));
const num=(k,d)=>{const v=args[k];if(v==null||v===true)return d;const n=Number(v);return Number.isFinite(n)?n:d;};
const dur=(k,d)=>{const v=args[k];if(v==null||v===true)return d;const m=String(v).match(/^(\d+(?:\.\d+)?)(s|m|h)?$/);if(!m)return d;return Math.round(Number(m[1])*({s:1000,m:60000,h:3600000}[m[2]||'s']));};

const OPT={players:num('players',100),min:dur('min',25000),max:dur('max',90000),gap:dur('gap',15000),threads:num('threads',4),count:num('count',0),mode:String(args.mode||'real'),once:!!args.once,dry:!!args.dry,purge:!!args.purge,rename:!!args.rename};
const URL_BASE=(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
const SERVICE_KEY=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
if(!OPT.dry&&(!URL_BASE||!SERVICE_KEY)){console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (env ou .env).');process.exit(1);}

const H={'apikey':SERVICE_KEY,'Authorization':'Bearer '+SERVICE_KEY,'Content-Type':'application/json'};
async function rest(path,init={}){const r=await fetch(URL_BASE+'/rest/v1/'+path,{...init,headers:{...H,...(init.headers||{})}});if(!r.ok)throw new Error('REST '+path+' → '+r.status+' '+await r.text());const t=await r.text();return t?JSON.parse(t):null;}
async function authAdmin(path,init={}){const r=await fetch(URL_BASE+'/auth/v1/'+path,{...init,headers:{...H,...(init.headers||{})}});const t=await r.text();return {ok:r.ok,status:r.status,body:t?JSON.parse(t):null};}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const rnd=()=>Math.random().toString(36).slice(2,10);
const log=(...a)=>console.log(new Date().toLocaleTimeString('pt-BR'),...a);

// ---------- pilotos simulados (nomes humanizados — estilo usernames BR reais) ----------
const FIRST=['Lucas','Gabriel','Pedro','Matheus','Rafael','Bruno','Thiago','Felipe','Gustavo','Diego','Vinicius','Joao','Arthur','Enzo','Nicolas','Davi','Miguel','Eduardo','Henrique','Caio','Leonardo','Vitor','Daniel','Marcos','Andre','Igor','Rodrigo','Samuel','Fernando','Erick','Ana','Maria','Julia','Beatriz','Larissa','Camila','Fernanda','Amanda','Leticia','Gabriela','Mariana','Isabela','Carolina','Sophia','Alice','Laura','Manuela','Helena','Valentina','Bianca','Yasmin','Clara','Vitoria','Natalia','Bruna','Renata','Paula','Carlos','Jorge','Marcelo','Paulo','Ricardo','Sergio','Alex','Roberto','Antonio','Francisco','Wesley','Adriano','Cristian','Wallace','Jefferson','Maicon','Leandro','Otavio','Caua','Kauan','Ryan','Breno','Heitor','Luan','Kaique','Everton','Fabio','Guilherme','Jonathan','Julio','Renan','Thales','Murilo','Danilo','Douglas','Alan','Wesley','Caique','Emanuel','Bryan'];
const LAST=['Silva','Santos','Oliveira','Souza','Costa','Pereira','Ferreira','Almeida','Ribeiro','Carvalho','Gomes','Martins','Rocha','Lima','Araujo','Cardoso','Barbosa','Nunes','Moreira','Teixeira','Fernandes','Vieira','Cavalcante','Dias','Freitas','Ramos','Melo','Correia','Moraes','Pinto'];
const DIMF=['inho','inha','zinho','zinha','ito','ita','zika','Boy','Girl','Gamer','plays','_play','_br','_ff','_yt','.xz','_rp','Oficial'];
function makeName(){const r=Math.random(),f=pick(FIRST),l=pick(LAST);
 if(r<.30)return `${f} ${l}`;
 if(r<.45)return `${f}${l}${Math.random()<.4?ri(2,99):''}`;
 if(r<.58)return `${f}${pick(DIMF)}`;
 if(r<.68)return `${f}${ri(10,999)}`;
 if(r<.76)return `xX ${f} Xx`;
 if(r<.84)return `${f.toLowerCase()}.${l.toLowerCase()}`;
 if(r<.92)return `${f} ${pick(['Jr','Neto','Filho','da Silva','Santos'])}`;
 return `${pick(['Sr.','Dona','Pro','Rei','Mestre','Cap.'])} ${f}`;}
function makeNames(n){const out=new Set();while(out.size<n)out.add(makeName());return [...out];}

async function provision(n){
 let cache=[];if(existsSync(CACHE_FILE)){try{cache=JSON.parse(readFileSync(CACHE_FILE,'utf8'));}catch{}}
 if(cache.length>=n){log('reutilizando',cache.length,'pilotos do cache.');return cache.slice(0,n);}
 const names=makeNames(n);const pilots=[...cache];
 for(let i=pilots.length;i<n;i++){
  const email=`sim.pilot.${String(i+1).padStart(3,'0')}@lifebots-sim.test`,name=names[i];
  let id=null;
  // O trigger lr_handle_signup cria lr_profiles + carteiras automaticamente.
  const created=await authAdmin('admin/users',{method:'POST',body:JSON.stringify({email,password:'Sim-'+rnd()+rnd()+'!A9',email_confirm:true,user_metadata:{simulated:true,name}})});
  if(created.ok)id=created.body.id;
  else{for(let page=1;page<=20&&!id;page++){const list=await authAdmin(`admin/users?page=${page}&per_page=200`);const u=(list.body?.users||[]).find(u=>u.email===email);if(u)id=u.id;if(!list.body?.users?.length)break;}}
  if(!id)throw new Error('Não foi possível provisionar '+email+': '+JSON.stringify(created.body));
  pilots.push({id,name});if(i%10===9)log('pilotos provisionados:',i+1,'/',n);
  await sleep(120);
 }
 writeFileSync(CACHE_FILE,JSON.stringify(pilots,null,1));
 return pilots;
}

// ---------- conversas ----------
const ROBOTS=['BROTTO','LÚMEN','BASTIÃO','KIRA','NIVAL','ZÉFIRO','KEPLER','PRISMA','ÉREBO','CORALLIS','NAUTILUS','TICTON','VÉSPER','MICÉLIO','AURÉLIA'];
const lc=()=>ri(300,4200),rc=()=>ri(50,900),lv=()=>ri(1,10);
const GLOBAL=[
 ['Bom dia, pilotos! Equipe pronta pro dia?','Bom dia! Só coletei a produção agora','a minha já rendeu {rc} RC hoje','Boa! Meta é fechar {lc} LC essa semana'],
 ['Alguém mais achou a arena difícil hoje?','ganhei 3 seguidas, o segredo é peça de defesa','perdi pro mesmo cara duas vezes kkk','montei escudo nível {lv} e mudou tudo'],
 ['Qual robô vcs acham que vale mais a pena?','Pra começar eu iria de {robot}, custo-benefício ótimo','o {robot} paga a produção rápido','depende do seu LC disponível né'],
 ['Coletei a produção de hoje: {rc} RC','aqui deu {rc} RC com 4 robôs','quantos robôs vc tem na equipe?'],
 ['Alguém do horário da tarde por aqui?','sempre!','chegando agora do trabalho'],
 ['O evento de conquista tá valendo a pena?','se sua guilda dominar território sim','meu time tomou o castelo ontem','tem que coordenar os ataques, sozinho não vai'],
 ['Vale a pena guardar RC pra melhoria ou converter?','eu guardo até fechar a peça que quero','converter só rende se a cotação compensar','depende do seu objetivo, saque ou evolução'],
 ['Meu {robot} nível {lv} tá uma máquina','produção dele é boa mesmo','qual peça vc colocou nele?'],
 ['Alguém já fez saque? Quanto tempo demora?','o meu caiu certinho, segue as regras da carteira','precisa bater o mínimo primeiro'],
 ['Quem mais entrou pelo anúncio essa semana?','eu! tô aprendendo ainda','bem vindo, qualquer dúvida pergunta aqui'],
 ['A landing nova ficou bonita demais','sim, bem estilo jogo','vim por ela também'],
 ['Como tá a produção de vcs hoje?','padrão, {rc} RC por robô','o meu {robot} rende mais que os outros'],
 ['O tutorial novo ajudou bastante pra entender a economia','verdade, agora explica a arena e a carteira','eu pulei e me arrependi kkk'],
 ['Bora formar guilda pra próxima conquista?','tô dentro se tiver vaga','procuro guilda ativa, tenho 3 robôs','guilda boa é a que coordena ataque junto'],
 ['Resgatei um cupom agora, saldo caiu na hora','qual código vc usou?','checa a área de resgate na carteira'],
 ['Arena ou aventura, o que rende mais?','aventura paga bem mas é uma vez só','arena é grátis e diária, faço as duas'],
];
const MARKET=[
 ['Vendo {robot} nível {lv} por {lc} LC, chama na proposta','manda proposta que eu vejo','tá caro, faria por {lc2}?','fechamos por {lc2}, enviei'],
 ['Alguém vende {robot}? Pago até {lc} LC','tenho um nível {lv}, aceita {lc2}?','se estiver ativo eu aceito'],
 ['Troco {robot} por {robot2} + {lc} LC de volta','tenho interesse, me manda proposta no mercado','só se o seu for nível {lv} pra cima'],
 ['Leilão informal: {robot} nv {lv}, lance inicial {lc} LC','{lc2} LC','{lc3} LC aqui','fechado pro lance de {lc3}!'],
 ['Comprei {robot} por {lc} LC, fiz bom negócio?','tá na média, bom preço','depende do nível, mas valeu','eu pagaria um pouco menos'],
 ['Procuro {robot} barato pra completar a equipe','anuncia no mercado que aparece','eu tenho um parado, te faço {lc} LC'],
 ['Vendo peça de ataque nv {lv}, aceito RC também','quanto em RC?','{rc} RC e fechamos'],
 ['O mercado tá inflacionado hoje kkk','normal, fim de evento sempre sobe','aproveita e vende os seus'],
 ['Aceito {robot} como parte do pagamento num {robot2}','interessante, vou te mandar proposta'],
 ['Fechei troca agora: {robot} + {lc} LC por um {robot2} nv {lv}','bom negócio','eu faria essa troca fácil'],
 ['Vale mais vender ou guardar o {robot}?','se não usa na equipe, vende e reinveste','guarda até subir de preço'],
 ['Oferta relâmpago: {robot} por {lc} LC só hoje','vi o anúncio, mandei proposta','passou rápido kkk'],
 ['Vendo lote: {robot} + {robot2} por {lc} LC os dois','faz separado?','se ninguém fechar o lote eu separo'],
];
function resolve(text,ctx){return text.replace(/\{(\w+)\}/g,(_,k)=>{if(ctx[k]!=null)return String(ctx[k]);const gen={robot:pick(ROBOTS),robot2:pick(ROBOTS),lc:lc(),lc2:lc(),lc3:lc(),rc:rc(),lv:lv(),pilot:pick(ctx.pilots).name};ctx[k]=gen[k];return String(gen[k]??k);});}

// ---------- escrita no backend (caminho oficial do engine: load → commit) ----------
async function rpc(name,body){const r=await fetch(`${URL_BASE}/rest/v1/rpc/${name}`,{method:'POST',headers:H,body:JSON.stringify(body)});const t=await r.text();let data=null;try{data=JSON.parse(t);}catch{}if(!r.ok){const e=new Error(`${name} → ${r.status} ${data?.message||t}`);e.status=r.status;e.body=t;throw e;}return data;}
async function commit(entry){
 for(let attempt=0;attempt<8;attempt++){
  const loaded=await rpc('lr_engine_load',{p_actor:entry.authorId,p_extra_ids:[],p_mode:OPT.mode});
  const world=loaded.world,state=world.data||{};state.messages=state.messages||[];
  state.messages.unshift(entry);
  for(const room of ['global','market']){const list=state.messages.filter(m=>m.room===room);if(list.length>150){const drop=new Set(list.slice(150).map(m=>m.id));state.messages=state.messages.filter(m=>!drop.has(m.id));}}
  const hash=createHash('sha256').update(JSON.stringify({action:'chat_send',room:entry.room,message:entry.text})).digest('hex');
  const response={ok:true,data:{result:entry}};
  try{
   await rpc('lr_engine_commit',{p_actor:entry.authorId,p_mode:OPT.mode,p_world_revision:world.revision,p_world:state,p_accounts:[],p_key:'sim-'+randomUUID(),p_hash:hash,p_action:'chat_send',p_response:response});
   return; // o RPC já sincroniza lr_live_chat e emite sinal realtime
  }catch(e){if(e.body?.includes('REVISION_CONFLICT')||e.body?.includes('IDEMPOTENCY_CONFLICT')){await sleep(300+attempt*400);continue;}throw e;}
 }
 throw new Error('Não consegui gravar a mensagem após várias tentativas.');
}
async function purgeSimulated(){
 const pilots=existsSync(CACHE_FILE)?JSON.parse(readFileSync(CACHE_FILE,'utf8')):[];
 if(!pilots.length)throw new Error('Sem cache de pilotos para usar como ator.');
 const loaded=await rpc('lr_engine_load',{p_actor:pilots[0].id,p_extra_ids:[],p_mode:OPT.mode});
 const world=loaded.world,state=world.data||{};const before=(state.messages||[]).length;
 state.messages=(state.messages||[]).filter(m=>!m.simulated);
 // commit sem mensagens simuladas → o RPC também apaga essas linhas de lr_live_chat
 await rpc('lr_engine_commit',{p_actor:pilots[0].id,p_mode:OPT.mode,p_world_revision:world.revision,p_world:state,p_accounts:[],p_key:'sim-purge-'+randomUUID(),p_hash:createHash('sha256').update('purge').digest('hex'),p_action:'chat_purge',p_response:{ok:true,data:{removed:before-state.messages.length}}});
 log('removidas',before-state.messages.length,'mensagens simuladas.');
}

// renomeia pilotos já provisionados: atualiza lr_profiles via commit 'profile' do engine
async function renamePilots(){
 if(!existsSync(CACHE_FILE))throw new Error('Sem cache de pilotos.');
 const pilots=JSON.parse(readFileSync(CACHE_FILE,'utf8')),names=makeNames(pilots.length);
 for(let i=0;i<pilots.length;i++){
  const p=pilots[i],loaded=await rpc('lr_engine_load',{p_actor:p.id,p_extra_ids:[],p_mode:OPT.mode});
  const acct=(loaded.accounts||[]).find(a=>a.userId===p.id);
  if(!acct){log('conta não encontrada para',p.name,'— pulando');continue;}
  const data={...acct.data,profile:{...(acct.data.profile||{}),name:names[i]}};
  for(let attempt=0;attempt<5;attempt++){
   try{await rpc('lr_engine_commit',{p_actor:p.id,p_mode:OPT.mode,p_world_revision:loaded.world.revision,p_world:loaded.world.data,p_accounts:[{userId:p.id,revision:acct.revision,data}],p_key:'sim-rename-'+randomUUID(),p_hash:createHash('sha256').update('rename'+p.id).digest('hex'),p_action:'profile',p_response:{ok:true,data:{renamed:names[i]}}});break;}
   catch(e){if(e.body?.includes('REVISION_CONFLICT')){const rl=await rpc('lr_engine_load',{p_actor:p.id,p_extra_ids:[],p_mode:OPT.mode});Object.assign(loaded,{world:rl.world});acct.revision=rl.accounts.find(a=>a.userId===p.id)?.revision;continue;}throw e;}
  }
  p.name=names[i];log('renomeado →',p.name);
 }
 writeFileSync(CACHE_FILE,JSON.stringify(pilots,null,1));
 log('cache atualizado:',pilots.length,'pilotos.');
}

// ---------- motor de conversa ----------
async function main(){
 if(OPT.purge){await purgeSimulated();return;}
 if(OPT.rename){await renamePilots();return;}
 const pilots=OPT.dry?makeNames(OPT.players).map((name,i)=>({id:'00000000-0000-4000-8000-'+String(i).padStart(12,'0'),name})):await provision(OPT.players);
 log(pilots.length,'pilotos simulados prontos.');
 if(OPT.once&&!OPT.count)OPT.count=1;
 let sent=0;const active=[];
 const newSpeaker=exclude=>{let p=pick(pilots),guard=0;while(p.id===exclude&&guard++<20&&pilots.length>1)p=pick(pilots);return p;};
 const startThread=()=>{const room=Math.random()<0.65?'global':'market';active.push({room,lines:[...pick(room==='global'?GLOBAL:MARKET)],ctx:{pilots},speakerId:null,nextAt:Date.now()+ri(0,12000)});};
 const fire=t=>{const p=newSpeaker(t.speakerId);t.speakerId=p.id;const text=resolve(t.lines.shift(),t.ctx);const entry={id:randomUUID(),room:t.room,authorId:p.id,name:p.name,text,at:Date.now(),simulated:true};if(OPT.dry)console.log(`[${t.room}] ${p.name}: ${text}`);else commit(entry).then(()=>log(`[${t.room}] ${p.name}: ${text.slice(0,80)}`)).catch(e=>console.error('falha ao enviar:',e.message));sent++;if(t.lines.length)t.nextAt=Date.now()+ri(OPT.gap,OPT.gap*4);else active.splice(active.indexOf(t),1);};
 for(let i=0;i<OPT.threads;i++)startThread();
 log('simulação rodando — Ctrl+C para parar.',OPT.dry?'(dry-run)':'',OPT.count?`alvo: ${OPT.count} mensagens.`:'');
 while(true){
  const now=Date.now();for(const t of [...active])if(t.nextAt<=now)fire(t);
  while(active.length<OPT.threads&&(!OPT.count||sent<OPT.count)&&Math.random()<0.6)startThread();
  if(OPT.count&&sent>=OPT.count&&(OPT.once||!active.length))break;
  const soonest=active.length?Math.min(...active.map(t=>t.nextAt)):Infinity;
  await sleep(Math.max(60,Math.min(ri(OPT.min,OPT.max),soonest-Date.now()+30)));
 }
 log('concluído:',sent,'mensagens.');
 if(!OPT.dry)await sleep(3000); // aguarda os commits pendentes
}
main().catch(e=>{console.error(e);process.exit(1);});
