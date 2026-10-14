import * as C from './core.js';
import {ensureDemoAdmin,demoAccount,adminAudit} from './admin-operations.js';
export const SOCIAL_FIELDS=[
 ['guildCreateCost','Criar guilda (RC)',500,0,1000000],['guildCapacity','Capacidade da guilda',20,2,100],['guildMaxLevel','Nível máximo da guilda',10,2,100],['guildXPPerLevel','XP por nível',100,1,100000],['guildDuelTimeoutSeconds','Prazo máximo do duelo (s)',300,30,1800],['guildDailyBattles','Duelos de guerra por piloto/dia',2,0,50],['guildWinPoints','Pontos por vitória',10,1,10000],['guildLossPoints','Pontos por derrota',3,0,10000],['guildXPPerPoint','XP por ponto',2,1,100],['guildBattleRewardRC','RC por vitória individual',50,0,100000],['guildParticipationRC','RC por participante ao fim do evento',30,0,100000],['guildPrizePoolRC','Prêmio da guilda vencedora (RC)',1000,0,1000000],['guildLevelRewardRC','RC por nível alcançado / membro elegível',60,0,100000],['guildInviteLevel1','Convite direto (RC)',25,0,100000],['guildInviteLevel2','Segundo nível de convite (RC)',10,0,100000],['guildInviteLevel3','Terceiro nível de convite (RC)',5,0,100000],['guildEventDays','Duração padrão de evento (dias)',7,1,90],
 ['tradeFeePercent','Taxa de venda (%)',2,0,100],['tradeSwapFeeRC','Taxa de troca por participante (RC)',20,0,100000],['tradeMinPriceLC','Preço mínimo de venda (LC)',1,1,1000000],['tradeMaxPriceLC','Preço máximo de venda (LC)',100000,1,10000000],['tradeMaxListings','Ofertas ativas por piloto',3,1,50],['tradeExpireDays','Prazo da oferta (dias)',7,1,90],['chatMaxLength','Caracteres por mensagem',300,30,2000],['chatCooldownSeconds','Intervalo entre mensagens (s)',2,0,60],['chatHistoryLimit','Mensagens por canal',100,10,500],['chatWindowWidth','Largura inicial do chat (px)',380,280,640],['chatWindowHeight','Altura inicial do chat (px)',360,260,700]
];
export const DEFAULT_SOCIAL={...Object.fromEntries(SOCIAL_FIELDS.map(([key,,value])=>[key,value])),guildEnabled:true,tradeEnabled:true,chatEnabled:true,guildInviteOncePerPilot:true,chatFloatingEnabled:true,chatStartMinimized:false,whatsappLink:'https://chat.whatsapp.com/KiXwUlykgJX1mmlnEwh1Ia',whatsappPromo:false,whatsappImage:'',whatsappTitle:'Comunidade oficial no WhatsApp',whatsappMessage:'Entre para o grupo oficial do LifeBots: estratégias, avisos de eventos, suporte da equipe e novidades em primeira mão.',whatsappButton:'Entrar no grupo'};
export function socialConfig(state){return {...DEFAULT_SOCIAL,...state.settings.social};}
export function validateSocial(config){for(const [key,,fallback,min,max] of SOCIAL_FIELDS){const value=config[key]??fallback;if(!Number.isSafeInteger(value)&&key!=='tradeFeePercent'||!Number.isFinite(value)||value<min||value>max)throw new Error('Configuração social inválida: '+key);}for(const key of ['guildEnabled','tradeEnabled','chatEnabled','guildInviteOncePerPilot','chatFloatingEnabled','chatStartMinimized','whatsappPromo'])if(typeof config[key]!=='boolean')throw new Error('Disponibilidade social inválida.');if(config.tradeMinPriceLC>config.tradeMaxPriceLC)throw new Error('Preço mínimo supera o máximo.');const link=String(config.whatsappLink||'').trim();if(link&&(!/^https:\/\/.{2,490}$/s.test(link)||/\s/.test(link)))throw new Error('Link da comunidade inválido: use uma URL https.');config.whatsappLink=link;
 for(const [key,max] of [['whatsappTitle',80],['whatsappMessage',400],['whatsappButton',40]]){const text=String(config[key]||'').trim();if(text.length>max)throw new Error('Texto da comunidade muito longo: '+key);config[key]=text;}
 const image=String(config.whatsappImage||'').trim();if(image&&!(/^https:\/\/[^"'<>\s]{2,490}$/s.test(image)||/^\/[\w\-./%]{2,490}$/s.test(image)))throw new Error('Imagem da comunidade inválida: use uma URL https ou caminho do jogo (/assets/…).');config.whatsappImage=image;return config;}
export function ensureSocial(state,now=Date.now()){
 state.settings.social={...DEFAULT_SOCIAL,...state.settings.social};if(state.serverAuthoritative)return;
 ensureDemoAdmin(state);if(state.social)return;
 for(const [i,name] of ['Halo','Vega','Pyxis'].entries()){const id='social-example-'+i,def=state.catalog[i%state.catalog.length];state.adminAccounts.push({profile:{id,name:'Piloto '+name+' (exemplo)',email:name.toLowerCase()+'@example.test',referralCode:'GUILD-'+name.toUpperCase(),whatsapp:'',role:'user',status:'active'},balances:{LC:5000,RC:12000},reservedLC:0,withdrawnCents:0,transactions:[],inventory:[],robots:[{uid:id+'-robot',catalogId:def.id,level:2,createdAt:now,lastCollected:now,earned:0,used:0,equipment:[],contract:C.acquisitionContract(state,def,now)}]});}
 state.social={messages:[{id:C.uuid(),room:'global',authorId:'npc-1',name:'Piloto Atlas (exemplo)',text:'O farol de Aurora voltou a brilhar. Qual setor sua equipe está explorando?',at:now-300000,example:true},{id:C.uuid(),room:'market',authorId:'npc-2',name:'Piloto Lyra (exemplo)',text:'As ofertas de exemplo permitem testar a troca e a transferência de robôs.',at:now-180000,example:true}],muted:{},listings:[],trades:[],guilds:[
 {id:'guild-aurora',name:'Guardiões de Aurora',tag:'AUR',description:'Uma equipe de exemplo dedicada a restaurar os sinais.',inviteCode:'AURORA-DEMO',founderId:'npc-1',xp:40,level:1,members:[{userId:'npc-1',role:'leader',joinedAt:now-C.DAY,invitedBy:null},{userId:'npc-2',role:'officer',joinedAt:now-C.DAY,invitedBy:'npc-1'}],milestones:{},createdAt:now-C.DAY,example:true},
 {id:'guild-boreal',name:'Bastião Boreal',tag:'ICE',description:'Uma equipe de exemplo que protege as rotas do gelo.',inviteCode:'BOREAL-DEMO',founderId:'npc-3',xp:20,level:1,members:[{userId:'npc-3',role:'leader',joinedAt:now-C.DAY,invitedBy:null}],milestones:{},createdAt:now-C.DAY,example:true}],
 events:[{id:'war-aurora',name:'Convergência do Farol',description:'Dispute os sinais do cânion com sua guilda. Pontos somados pelos duelos definem a equipe vencedora.',type:'guild-war',startsAt:now-C.DAY,endsAt:now+7*C.DAY,scene:'guild-canyon',enabled:true,rewardPoolRC:1000,participationRC:30,battleRewardRC:50},{id:'war-boreal',name:'Cerco Boreal',description:'Um novo confronto está chegando às pontes de cristal.',type:'guild-war',startsAt:now+8*C.DAY,endsAt:now+15*C.DAY,scene:'guild-boreal',enabled:true,rewardPoolRC:1400,participationRC:40,battleRewardRC:60}],eventSnapshots:{},warScores:{},rewardReceipts:[],guildDaily:{},activeGuildBattle:null,coupons:[]};
 const seller=state.adminAccounts.find(a=>a.profile.id==='social-example-0'),r=seller.robots[0];
 const listing={id:C.uuid(),sellerId:seller.profile.id,robotUid:r.uid,kind:'sale',priceLC:420,status:'open',createdAt:now,expiresAt:now+7*C.DAY,feePercent:2,example:true};r.tradeLock=listing.id;state.social.listings.push(listing);
 const swapSeller=state.adminAccounts.find(a=>a.profile.id==='social-example-1'),swapRobot=swapSeller.robots[0],swap={id:C.uuid(),sellerId:swapSeller.profile.id,robotUid:swapRobot.uid,kind:'swap',priceLC:0,status:'open',createdAt:now,expiresAt:now+7*C.DAY,feePercent:2,swapFeeRC:20,example:true};swapRobot.tradeLock=swap.id;state.social.listings.push(swap);for(const guild of state.social.guilds)for(const member of guild.members){const profile=profileOf(state,member.userId);if(profile)profile.guildOnboardedAt=member.joinedAt;}
}
export function requireSocialDemo(state){if(state.serverAuthoritative)throw new Error('Esta ação social será validada no servidor.');ensureSocial(state);}
export function currentId(state){return state.profile.id||'demo-self';}
export function profileOf(state,id){return id===currentId(state)?state.profile:state.adminAccounts?.find(a=>a.profile.id===id)?.profile;}
export function accountOf(state,id){return demoAccount(state,id);}
export function membership(state,id=currentId(state)){for(const guild of state.social?.guilds||[]){const member=guild.members.find(m=>m.userId===id);if(member)return {guild,member};}return null;}
export function assertTradable(state,id,uid,now=Date.now(),lock=null){const a=accountOf(state,id),r=a.robots.find(r=>r.uid===uid);if(!r)throw new Error('O piloto não possui este robô.');if(!C.robotInfo(a,r,now).active)throw new Error('Robôs expirados não podem ser negociados.');if(r.tradeLock&&r.tradeLock!==lock)throw new Error('O robô já está reservado.');C.assertRobotAvailable(state,uid);return {a,r};}
export function syncTeamExample(state){for(const affiliate of state.affiliates){const a=state.adminAccounts.find(a=>a.profile.id===affiliate.id);if(a){affiliate.robots=a.robots.length;affiliate.daily=a.robots.reduce((sum,r)=>{const info=C.robotInfo({...a,settings:state.settings,catalog:state.catalog,parts:state.parts},r);return sum+(info.active?info.daily:0);},0);affiliate.acquisitions=a.robots.map(r=>({catalogId:r.catalogId,level:r.level,active:C.robotInfo({...a,settings:state.settings,catalog:state.catalog,parts:state.parts},r).active,paidAmount:r.contract?.paidAmount,currency:r.contract?.paidCurrency}));}}}
export function receipt(state,key,kind,amount,userId=currentId(state),now=Date.now()){if(state.social.rewardReceipts.some(r=>r.key===key))throw new Error('Esta recompensa já foi recebida.');if(!Number.isSafeInteger(amount)||amount<0)throw new Error('Recompensa inválida.');if(amount)C.transaction(accountOf(state,userId),kind,'RC',amount,'simulado',now);state.social.rewardReceipts.push({key,userId,amount,at:now});return amount;}
export function saveSocialSettings(state,config){requireSocialDemo(state);validateSocial(config);const before=state.settings.social;state.settings.social={...config};adminAudit(state,'social_settings',currentId(state),before,config,'Configurações sociais atualizadas');}

/* Cupons de resgate — configurados pelo admin, resgatados com validação no servidor. */
export const COUPON_KINDS=['rc','lc','robot','part'];
export const normalizeCouponCode=code=>String(code||'').trim().toUpperCase().replace(/\s+/g,'');
export function couponList(account){return account.social?.coupons||[];}
export function couponStatus(coupon,now=Date.now()){if(coupon.enabled===false)return 'disabled';if(coupon.expiresAt&&coupon.expiresAt<=now)return 'expired';if((coupon.usedBy?.length||0)>=Math.max(1,coupon.maxUses||1))return 'exhausted';return 'active';}
export function validateCoupon(account,input,now=Date.now()){
 const code=normalizeCouponCode(input.code);
 if(!/^[A-Z0-9_-]{3,32}$/.test(code))throw new Error('Código de cupom inválido: use de 3 a 32 letras ou números.');
 const kind=String(input.reward?.kind||'').toLowerCase();
 if(!COUPON_KINDS.includes(kind))throw new Error('Escolha o tipo de prêmio do cupom.');
 const maxUses=Math.floor(Number(input.maxUses));if(!Number.isSafeInteger(maxUses)||maxUses<1||maxUses>1000000)throw new Error('Quantidade de resgates inválida.');
 const expiresAt=input.expiresAt?new Date(input.expiresAt).getTime():null;if(input.expiresAt&&!Number.isFinite(expiresAt))throw new Error('Validade do cupom inválida.');
 const reward={kind};
 if(kind==='lc'||kind==='rc'){const amount=Math.floor(Number(input.reward?.amount));if(!Number.isSafeInteger(amount)||amount<1||amount>100000000)throw new Error('Valor do prêmio inválido.');reward.amount=amount;}
 if(kind==='robot'){const robotId=String(input.reward?.robotId||'');if(!(account.catalog||[]).some(r=>r.id===robotId))throw new Error('Escolha um robô do catálogo.');reward.robotId=robotId;}
 if(kind==='part'){const partId=String(input.reward?.partId||''),part=(account.parts||[]).find(p=>p.id===partId);if(!part)throw new Error('Escolha uma melhoria do catálogo.');const level=Math.floor(Number(input.reward?.partLevel||part.level||1));reward.partId=partId;reward.partLevel=Math.min(Math.max(1,level),account.settings?.maxPartLevel||10);}
 if(couponList(account).some(c=>c.id!==input.id&&c.code===code))throw new Error('Já existe um cupom com este código.');
 return {id:String(input.id||''),code,enabled:input.enabled!==false,expiresAt,maxUses,reward,note:String(input.note||'').slice(0,120),createdAt:Number(input.createdAt)||now};
}
export function couponRewardSummary(account,reward){const r=reward||{};if(r.kind==='lc')return `${r.amount} LC`;if(r.kind==='rc')return `${r.amount} RC`;if(r.kind==='robot')return (account.catalog||[]).find(x=>x.id===r.robotId)?.name||'Robô';if(r.kind==='part')return (account.parts||[]).find(p=>p.id===r.partId)?.name||'Melhoria';return '';}
export function redeemCoupon(account,code,now=Date.now(),status='simulado'){
 const normalized=normalizeCouponCode(code);
 if(!normalized)throw new Error('Informe o código do cupom.');
 const coupon=couponList(account).find(c=>c.code===normalized);
 if(!coupon)throw new Error('Cupom não encontrado ou inválido.');
 const state=couponStatus(coupon,now);
 if(state==='disabled')throw new Error('Este cupom está desativado.');
 if(state==='expired')throw new Error('Este cupom expirou.');
 const userId=currentId(account);
 if((account.couponClaims||[]).some(c=>c.couponId===coupon.id)||(coupon.usedBy||[]).includes(userId))throw new Error('Você já resgatou este cupom.');
 if(state==='exhausted')throw new Error('Os prêmios deste cupom acabaram.');
 const reward=coupon.reward||{};
 if(reward.kind==='lc'||reward.kind==='rc')C.transaction(account,`Cupom ${coupon.code}`,reward.kind.toUpperCase(),reward.amount,status,now);
 else if(reward.kind==='robot'){const def=(account.catalog||[]).find(x=>x.id===reward.robotId);if(!def)throw new Error('Prêmio indisponível.');const contract={...C.acquisitionContract(account,def,now),paidAmount:0,paidCurrency:'LC',principalReturnLC:0,origin:'coupon'},r={uid:C.uuid(),catalogId:def.id,level:1,createdAt:now,lastCollected:now,earned:0,used:0,equipment:[],contract};account.robots.push(r);if(!account.selectedRobot)account.selectedRobot=r.uid;}
 else if(reward.kind==='part'){const part=(account.parts||[]).find(p=>p.id===reward.partId);if(!part)throw new Error('Prêmio indisponível.');account.inventory.push({uid:C.uuid(),partId:part.id,level:reward.partLevel||part.level||1,equippedOn:null});}
 else throw new Error('Prêmio indisponível.');
 coupon.usedBy ||= [];coupon.usedBy.push(userId);
 account.couponClaims ||= [];account.couponClaims.unshift({couponId:coupon.id,code:coupon.code,at:now,reward:C.clone(reward)});
 return {code:coupon.code,reward:C.clone(reward)};
}
export function saveCoupon(account,input,now=Date.now()){
 const validated=validateCoupon(account,input,now),list=account.social.coupons ||= [],existing=validated.id?list.find(c=>c.id===validated.id):null;
 if(existing){
  const usedBy=existing.usedBy||[];
  if(usedBy.length>validated.maxUses)throw new Error(`Quantidade abaixo dos resgates já feitos (${usedBy.length}).`);
  Object.assign(existing,{...validated,id:existing.id,createdAt:existing.createdAt||validated.createdAt,usedBy});
  return existing;
 }
 const coupon={...validated,id:C.uuid(),usedBy:[]};list.push(coupon);return coupon;
}
export function deleteCoupon(account,id){const list=couponList(account),index=list.findIndex(c=>c.id===id);if(index<0)throw new Error('Cupom não encontrado.');account.social.coupons.splice(index,1);}
export function adminSaveCoupon(state,input){requireSocialDemo(state);const before=couponList(state).find(c=>c.id===input.id),saved=saveCoupon(state,input);adminAudit(state,'coupon_save',currentId(state),before??null,saved,'Cupom salvo');return saved;}
export function adminDeleteCoupon(state,id){requireSocialDemo(state);const before=couponList(state).find(c=>c.id===id);deleteCoupon(state,id);adminAudit(state,'coupon_delete',currentId(state),before,null,'Cupom removido');}
