import {validMediaSource} from './media.js';
import {ROBOT_IDENTITIES,PART_IDENTITIES,LEGACY_ROBOT_NAMES,LEGACY_PART_NAMES} from './catalog-identities.js';
import {CONTENT_REVISION,EXTRA_ROBOTS,EXTRA_PARTS,EXTRA_CHAPTERS,LEGACY_WAVES,DEFAULT_RULES,DEFAULT_AUDIO,DEFAULT_COPY,DEFAULT_ARENA_ROSTER,DEFAULT_SEASONS,RULE_FIELDS,SCENES,ROBOT_ASSETS,PART_ASSETS} from './content.js';
import {MUSIC_TRACKS,seasonMusicDefaults} from './music-catalog.js';
export {RULE_FIELDS,SCENES,ROBOT_ASSETS,DEFAULT_AUDIO,DEFAULT_COPY} from './content.js';
export const DAY = 86400000;
export const STORAGE_KEY = 'liferobots-demo-v1';
export const DEFAULT_SETTINGS = {
  social:{},announcementActive:true,announcementPopup:false,announcementVersion:0,
  name: 'LifeBots', tagline: 'Dê vida ao seu próximo capítulo.', accent: '#d5ee87',
  lcPerReal:100,rcPerLC:10,minWithdraw:10,withdrawFee:0,autoWithdrawals:false,autoWithdrawalMax:50,
  freeBattles: 4, passCost: 80, battleReward: 80, battleLoss: 30, matchTimeoutSeconds: 8,
  tutorialBonus: 300, levelCost: 120, maxRobotLevel: 10, maxPartLevel: 10, commissions: [5, 2, 1],
  announcement: 'Uma nova era está começando.',
  announcementBody: 'Explore a Cidade Esquecida e encontre o primeiro núcleo de energia.',
  announcementLink: '#story', announcementImage: '', announcementButton: 'Explorar história',
  heroTitle: 'Seu robô.\nSua próxima evolução.', heroSubtitle: 'Construa, explore e evolua. Um novo mundo espera pela sua equipe.',
  withdrawalRules: 'Saques via Pix. O valor mínimo, a cotação e as taxas são exibidos antes de cada operação. O saldo fica reservado até a confirmação do gateway.',
  logoArt:'',worldBackgroundArt:'',hangarBackgroundArt:'',authBackgroundArt:'',layout: 'cinematic', hangarBackground:'hangar', authBackground:'hangar', authRobotIds:['ember','moss','orbit'], guideName:'NEXA', autoStoryStart:false, replayCost:40, replayCurrency:'RC', rules:{...DEFAULT_RULES}, audio:{...DEFAULT_AUDIO}, copy:{...DEFAULT_COPY}, textOverrides:{}, productionMultiplier:10, principalReturnPercent:100, defaultStoryControl:'auto', worldBackground:'city', backgroundIntensity:.55, visualMotion:true, battleAtmosphere:true
};
export const DEFAULT_ROBOTS = [
 {id:'moss',name:'MOSS-01',type:'explorer',rarity:'Comum',description:'Um pequeno explorador com um grande futuro. Equilibrado, resistente e pronto para a primeira jornada.',price:300,currency:'LC',daily:30,lifetime:7,maxBattles:24,attack:24,defense:20,health:110,asset:'moss-sprites.png',color:'#bddf91'},
 {id:'volt',name:'VOLT-X',type:'striker',rarity:'Raro',description:'Agilidade elétrica e precisão incomparável. Um atacante construído para desbravar a arena.',price:1400,currency:'LC',daily:180,lifetime:30,maxBattles:120,attack:46,defense:26,health:130,asset:'volt-sprites.png',color:'#c3b1ee'},
 {id:'titan',name:'TITAN-9',type:'guardian',rarity:'Épico',description:'Um guardião de aço. Sua blindagem reforçada transforma obstáculos em novos caminhos.',price:3600,currency:'LC',daily:420,lifetime:45,maxBattles:180,attack:35,defense:58,health:220,asset:'titan-sprites.png',color:'#edba7d'},
 ...EXTRA_ROBOTS
].map(r=>({...r,...ROBOT_IDENTITIES[r.id]}));
export const DEFAULT_PARTS = [
 {id:'core',name:'Núcleo de plasma',slot:'core',description:'Energia estável para uma produção maior.',price:450,currency:'RC',production:20,attack:6,defense:0,compatible:['explorer','striker','guardian'],level:1},
 {id:'arm',name:'Braço magnético',slot:'arm',description:'Precisão extra em cada movimento.',price:650,currency:'RC',production:5,attack:14,defense:2,compatible:['explorer','striker'],level:1},
 {id:'shield',name:'Escudo cinético',slot:'shield',description:'Um campo protetor para enfrentar desafios.',price:900,currency:'RC',production:10,attack:0,defense:18,compatible:['guardian','explorer'],level:1},
 {id:'reactor',name:'Reator quântico',slot:'core',description:'Tecnologia rara, potência extraordinária.',price:350,currency:'LC',production:40,attack:10,defense:10,compatible:['striker','guardian'],level:2},
 ...EXTRA_PARTS
].map(p=>({...p,...PART_IDENTITIES[p.id],asset:PART_ASSETS[p.id]}));
export const CHAPTERS = [
 {id:1,title:'O despertar',place:'Arredores do hangar',reward:120,power:25,story:'Após décadas de silêncio, um pequeno robô desperta. Uma transmissão distante pede ajuda. Siga o sinal.'},
 {id:2,title:'Entre as raízes',place:'Floresta de circuitos',reward:180,power:38,story:'A natureza tomou os antigos circuitos. Encontre uma rota entre as raízes e reative o primeiro farol.'},
 {id:3,title:'Cidade esquecida',place:'Distrito Aurora',reward:260,power:52,story:'O distrito está vazio, mas suas máquinas ainda se movem. Uma patrulha protege o caminho até o núcleo.'},
 {id:4,title:'O guardião',place:'Portão de aço',reward:340,power:65,story:'Um guardião antigo bloqueia a entrada. Sua força será testada antes de avançar.'},
 {id:5,title:'Além do horizonte',place:'Vale das antenas',reward:480,power:80,story:'O sinal ganha força. Na linha do horizonte, uma nova comunidade de robôs começa a surgir.'},
 {id:6,title:'Uma nova vida',place:'Núcleo da cidade',reward:650,power:100,story:'O núcleo adormecido pode devolver energia a toda a região. Esta é a hora de reacender o futuro.'},
 ...EXTRA_CHAPTERS
].map((c,i)=>({...c,objective:c.objective||`Vença os guardiões de ${c.place} e libere o próximo sinal.`,conclusion:c.conclusion||`O sinal de ${c.place} está seguro. Sua equipe abriu uma nova passagem.`,enabled:true,scene:c.scene||SCENES[i],enemies:c.enemies||LEGACY_WAVES[i]}));
export const clone = x => JSON.parse(JSON.stringify(x));
export const uuid = () => globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const dayKey = (now=Date.now()) => new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
export function initialState(now=Date.now()) {
 return {version:1,contentRevision:CONTENT_REVISION,chapters:clone(CHAPTERS),seasons:clone(DEFAULT_SEASONS),arenaRoster:clone(DEFAULT_ARENA_ROSTER),activeStory:null,profile:{name:'Nova',level:7,email:'',tutorial:false,referralCode:'LR-'+uuid().replace(/-/g,'').slice(0,10).toUpperCase()},settings:clone(DEFAULT_SETTINGS),catalog:clone(DEFAULT_ROBOTS),parts:clone(DEFAULT_PARTS).map(p=>({...p,asset:PART_ASSETS[p.id]})),
 balances:{LC:2650,RC:8420},depositedCents:2650,withdrawnCents:0,
 robots:[{uid:'demo-moss',contract:acquisitionContract({settings:DEFAULT_SETTINGS},DEFAULT_ROBOTS[0],now-DAY),catalogId:'moss',level:3,createdAt:now-DAY,lastCollected:now-12*3600000,earned:90,used:2,equipment:[]},
 {uid:'demo-volt',contract:acquisitionContract({settings:DEFAULT_SETTINGS},DEFAULT_ROBOTS[1],now-2*DAY),catalogId:'volt',level:2,createdAt:now-2*DAY,lastCollected:now-12*3600000,earned:400,used:7,equipment:[]}],
 daily:{date:dayKey(now),used:0,extra:0},story:0,inventory:[],transactions:[{id:uuid(),kind:'Saldo inicial de demonstração',currency:'LC',amount:2650,at:now-2*DAY,status:'simulado'},{id:uuid(),kind:'RobotCoins de demonstração',currency:'RC',amount:8420,at:now-DAY,status:'simulado'}],battles:[],selectedRobot:'demo-moss',commissionTotal:0,commissionDays:[],simDays:0,
 affiliates:[{id:'npc-1',name:'Piloto Atlas (exemplo)',level:1,robotId:'titan',robots:2,daily:240,commission:0,battles:{played:12,wins:8,losses:4},acquisitions:[{catalogId:'titan',level:2,active:true,paidAmount:3600,currency:'LC'},{catalogId:'moss',level:1,active:true,paidAmount:300,currency:'LC'}]},{id:'npc-2',name:'Piloto Lyra (exemplo)',level:2,robotId:'nimbus',robots:1,daily:180,commission:0,battles:{played:7,wins:4,losses:3},acquisitions:[{catalogId:'nimbus',level:1,active:true,paidAmount:1200,currency:'LC'}]},{id:'npc-3',name:'Piloto Orion (exemplo)',level:3,robotId:'orbit',robots:1,daily:30,commission:0,battles:{played:3,wins:2,losses:1},acquisitions:[{catalogId:'orbit',level:1,active:true,paidAmount:4400,currency:'LC'}]}],
 adminTab:'economy'};
}
function ensurePositive(value,label='Valor'){if(!Number.isSafeInteger(value)||value<=0)throw new Error(`${label} deve ser um inteiro positivo.`);}
export function transaction(state,kind,currency,amount,status='simulado',now=Date.now()) {
 if(!Number.isSafeInteger(amount)) throw new Error('Quantidade inválida.');
 if(!['LC','RC'].includes(currency)) throw new Error('Moeda inválida.');
 if(!Number.isSafeInteger(state.balances[currency]+amount)||state.balances[currency]+amount<0) throw new Error('Saldo insuficiente.');
 state.balances[currency]+=amount;
 state.transactions.unshift({id:uuid(),kind,currency,amount,status,at:now});
 return amount;
}
export function robotInfo(state,robot,now=Date.now()) {
 const def=state.catalog.find(x=>x.id===robot.catalogId);
 if(!def) throw new Error('Modelo não encontrado.');
 const equipment=robot.equipment.map(id=>state.inventory.find(x=>x.uid===id)).filter(Boolean).map(x=>({...x,...state.parts.find(p=>p.id===x.partId),equipmentLevel:x.level}));
 const boost=equipment.reduce((n,p)=>n+(p.production||0)*(1+((p.equipmentLevel||1)-1)*((state.settings.rules?.partProductionLevelPercent??15)/100)),0);
 const rules=combatRules(state);
 const daily=state.serverAuthoritative?Number(robot.productionDailyMinor||0)/100:robot.overrides?.daily??Math.floor(def.daily*(state.settings.productionMultiplier??1)*(1+(robot.level-1)*rules.productionLevelPercent/100)*(1+boost/100));
 const expires=state.serverAuthoritative?Number(robot.expiresAt):robot.contract?.expiresAt??robot.createdAt+def.lifetime*DAY;
 const till=Math.min(now,expires),from=Math.max(robot.lastCollected,robot.createdAt);
 const available=Math.max(0,Math.floor((robot.pendingProductionRC||0)+Math.max(0,till-from)/DAY*daily));
 const attack=robot.overrides?.attack??def.attack+(robot.level-1)*rules.levelAttackStep+equipment.reduce((n,p)=>n+(p.attack||0)*(p.equipmentLevel||1),0);
 const defense=robot.overrides?.defense??def.defense+(robot.level-1)*rules.levelDefenseStep+equipment.reduce((n,p)=>n+(p.defense||0)*(p.equipmentLevel||1),0);
 return {...def,...robot,principalReturnLC:robot.contract?.principalReturnLC??robot.principalReturnLC??0,daily,expires,active:now<expires,remainingBattles:Math.max(0,(robot.contract?.maxBattles??def.maxBattles)-robot.used),available,attack,defense,health:robot.overrides?.health??def.health+(robot.level-1)*rules.levelHealthStep,power:Math.floor(attack+defense*.7),equipment};
}
export function collect(state,uid=null,now=Date.now()) {
 let total=0; for(const r of state.robots.filter(x=>!uid||x.uid===uid)){const info=robotInfo(state,r,now);if(info.available>0){total+=info.available;r.earned+=info.available;const carry=Math.min(r.pendingProductionRC||0,info.available);if(r.pendingProductionRC)r.pendingProductionRC=Math.max(0,r.pendingProductionRC-carry);const msPerCoin=DAY/info.daily;r.lastCollected=Math.min(info.expires,Math.max(r.lastCollected,r.createdAt)+(info.available-carry)*msPerCoin);}}
 if(total)transaction(state,'Coleta dos robôs','RC',total,'simulado',now);return total;
}
export function buyRobot(state,id,now=Date.now()) {
 const def=state.catalog.find(x=>x.id===id);if(!def)throw new Error('Modelo não encontrado.');ensurePositive(def.price);
 const contract=acquisitionContract(state,def,now);
 transaction(state,`Novo robô · ${def.name}`,def.currency,-def.price,'simulado',now);
 const r={uid:uuid(),catalogId:id,level:1,createdAt:now,lastCollected:now,earned:0,used:0,equipment:[],contract};state.robots.push(r);state.selectedRobot=r.uid;return r;
}
export function buyPart(state,id){const p=state.parts.find(x=>x.id===id);if(!p)throw new Error('Peça não encontrada.');ensurePositive(p.price);transaction(state,`Peça · ${p.name}`,p.currency,-p.price);const i={uid:uuid(),partId:id,level:p.level||1,equippedOn:null};state.inventory.push(i);return i;}
export function assertRobotAvailable(state,uid){if(state.arenaQueue?.uid===uid)throw new Error('Este robô está na fila de batalha.');if(state.activeArena?.uid===uid)throw new Error('Este robô está em uma disputa de arena.');if(state.activeStory?.uid===uid&&!state.activeStory.settled||state.social?.activeGuildBattle?.uid===uid&&!state.social.activeGuildBattle.settled)throw new Error('Termine a batalha em andamento com este robô.');}
export function equip(state,robotUid,itemUid,now=Date.now()) {
 const r=state.robots.find(x=>x.uid===robotUid),i=state.inventory.find(x=>x.uid===itemUid);if(!r||!i)throw new Error('Robô ou peça não encontrado.');
 const p=state.parts.find(x=>x.id===i.partId),def=state.catalog.find(x=>x.id===r.catalogId);if(!(robotInfo(state,r,now).contract?.slots||def.slots||['core','arm','shield']).includes(p?.slot))throw new Error('Este robô não possui este espaço.');
 assertRobotAvailable(state,robotUid);if(r.tradeLock)throw new Error('Este robô está reservado em uma negociação.');if(!p?.compatible.includes(def.type))throw new Error('Esta peça não é compatível com esse robô.');
 if(i.equippedOn&&i.equippedOn!==r.uid)throw new Error('A peça já está equipada em outro robô.');
 if(!robotInfo(state,r,now).active)throw new Error('O prazo desse robô terminou.');collect(state,r.uid,now);
 const old=r.equipment.find(uid=>{const inv=state.inventory.find(x=>x.uid===uid);return state.parts.find(x=>x.id===inv?.partId)?.slot===p.slot;});
 if(old){r.equipment=r.equipment.filter(x=>x!==old);state.inventory.find(x=>x.uid===old).equippedOn=null;}
 if(!r.equipment.includes(i.uid))r.equipment.push(i.uid);i.equippedOn=r.uid;return i;
}
export function levelUp(state,uid,now=Date.now()){const r=state.robots.find(x=>x.uid===uid);if(!r)throw new Error('Robô não encontrado.');assertRobotAvailable(state,uid);if(r.tradeLock)throw new Error('Este robô está reservado em uma negociação.');if(!robotInfo(state,r,now).active)throw new Error('O prazo desse robô terminou.');if(r.level>=(state.settings.maxRobotLevel||10))throw new Error('Seu robô atingiu o nível máximo.');collect(state,uid,now);const cost=state.settings.levelCost*r.level;transaction(state,'Evolução de robô','RC',-cost);r.level++;return cost;}
export function levelPart(state,uid,now=Date.now()){const i=state.inventory.find(x=>x.uid===uid);if(!i)throw new Error('Peça não encontrada.');if(i.level>=(state.settings.maxPartLevel||10))throw new Error('A peça atingiu o nível máximo.');if(i.equippedOn){assertRobotAvailable(state,i.equippedOn);const robot=state.robots.find(r=>r.uid===i.equippedOn);if(robot?.tradeLock)throw new Error('Este robô está reservado em uma negociação.');collect(state,i.equippedOn,now);}const cost=state.settings.levelCost*i.level;transaction(state,'Evolução de peça','RC',-cost);i.level++;return cost;}
export function previewConversion(state,from,amount){ensurePositive(amount);if(from==='RC')return {from:'RC',to:'LC',debit:amount,credit:Math.floor(amount/state.settings.rcPerLC)};if(from==='LC')return {from:'LC',to:'RC',debit:amount,credit:Math.floor(amount*state.settings.rcPerLC)};throw new Error('Moeda inválida.');}
export function convert(state,from,amount){const q=previewConversion(state,from,amount);if(q.credit<=0)throw new Error('Valor abaixo da conversão mínima.');if(state.balances[from]<amount)throw new Error('Saldo insuficiente.');transaction(state,'Conversão',q.from,-q.debit);transaction(state,'Conversão',q.to,q.credit);return q;}
export function deposit(state,cents){ensurePositive(cents);const lc=Math.floor(cents*state.settings.lcPerReal/100);if(lc<=0)throw new Error('Valor muito baixo.');transaction(state,'Depósito de teste','LC',lc);state.depositedCents+=cents;state.deposits ||= [];state.deposits.unshift({id:uuid(),userId:state.profile.id||'demo-self',amountCents:cents,feeCents:0,LC:lc,status:'confirmed',createdAt:Date.now(),simulated:true});return lc;}
export function withdrawalQuote(state,cents){ensurePositive(cents);if(cents<Math.round(state.settings.minWithdraw*100))throw new Error(`Saque mínimo: R$ ${state.settings.minWithdraw.toFixed(2)}.`);const fee=Math.ceil(cents*state.settings.withdrawFee/100);const debitLC=Math.ceil((cents+fee)*state.settings.lcPerReal/100);return {requestedCents:cents,feeCents:fee,debitLC,receiveCents:cents};}
export function withdraw(state,cents){const q=withdrawalQuote(state,cents),auto=state.settings.autoWithdrawals&&(state.settings.autoWithdrawalMax===0||cents<=(state.settings.autoWithdrawalMax??50)*100);transaction(state,auto?'Saque automático · simulado':'Solicitação de saque · reserva','LC',-q.debitLC);state.withdrawals ||= [];const request={...q,id:uuid(),userId:state.profile.id||'demo-self',status:auto?'paid':'pending',autoApproved:!!auto,simulated:true,createdAt:Date.now(),quote:{lcPerReal:state.settings.lcPerReal,withdrawFee:state.settings.withdrawFee}};state.withdrawals.unshift(request);if(auto)state.withdrawnCents+=cents;else state.reservedLC=(state.reservedLC||0)+q.debitLC;return {...q,requestId:request.id,status:request.status};}
export function dailyBattles(state,now=Date.now()){const key=dayKey(now);if(state.daily.date!==key)state.daily={date:key,used:0,extra:0};return Math.max(0,state.settings.freeBattles+state.daily.extra-state.daily.used);}
export function buyPass(state,count=1){ensurePositive(count);dailyBattles(state);transaction(state,'Passe de arena','LC',-state.settings.passCost*count);state.daily.extra+=count;return dailyBattles(state);}
export function arenaEligibility(state,uid,now=Date.now()){const r=state.robots.find(x=>x.uid===uid);if(!r)throw new Error('Selecione um robô.');assertRobotAvailable(state,uid);const info=robotInfo(state,r,now);if(!info.active)throw new Error('O prazo desse robô terminou.');if(r.tradeLock)throw new Error('Este robô está reservado em uma negociação.');if(!info.remainingBattles)throw new Error('Este robô esgotou suas batalhas.');if(!dailyBattles(state,now))throw new Error('Suas batalhas de hoje acabaram.');if(state.balances.RC<state.settings.battleLoss)throw new Error('RobotCoins insuficientes para a perda máxima.');return info;}
export function beginBattle(state,uid,opponent,now=Date.now()){const info=arenaEligibility(state,uid,now),r=state.robots.find(x=>x.uid===uid);state.daily.used++;r.used++;return {id:uuid(),uid,opponent:clone(opponent),player:info,at:now,reward:state.settings.battleReward,loss:state.settings.battleLoss,rules:combatRules(state),settled:false};}
export function resolveBattle(state,ticket,win){if(ticket.settled||state.battles.some(x=>x.id===ticket.id))throw new Error('Batalha já liquidada.');ticket.settled=true;const amount=win?ticket.reward:-ticket.loss;transaction(state,win?'Vitória na arena':'Derrota na arena','RC',amount);state.battles.unshift({id:ticket.id,opponent:ticket.opponent.name,opponentKind:ticket.opponent.isBot?'bot':'user',win,amount,at:ticket.at});return amount;}
export function chapters(state){return state.chapters||CHAPTERS;}
export function mainChapters(state){return chapters(state).filter(c=>c.chapterKind!=='side').sort((a,b)=>a.id-b.id);}
export function chapterComplete(state,c){return c.chapterKind==='side'?(state.storyClaims||[]).includes(c.id):c.id<=state.story;}
export function chapterUnlocked(state,c){return c.enabled!==false&&(c.chapterKind==='side'?state.story>=(c.unlockChapter||0):c.id<=state.story+1);}
export function seasonForChapter(state,id){const c=chapters(state).find(c=>c.id===id);return seasons(state).find(s=>s.id===c?.seasonId)||seasons(state).find(s=>s.from<=id&&s.to>=id);}
export function chaptersForSeason(state,s){return chapters(state).filter(c=>c.chapterKind==='side'?c.seasonId===s.id:c.id>=s.from&&c.id<=s.to).sort((a,b)=>(a.chapterKind==='side'?a.unlockChapter+.5:a.id)-(b.chapterKind==='side'?b.unlockChapter+.5:b.id));}
export function seasons(state){return state.seasons||DEFAULT_SEASONS;}
export function validateRobot(r){
 if(typeof r.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(r.id)||!r.name?.trim()||r.name.length>40||!['explorer','striker','guardian'].includes(r.type)||!['LC','RC'].includes(r.currency)||!/^#[a-f0-9]{6}$/i.test(r.color))throw new Error('Identidade do robô inválida.');
 if(!ROBOT_ASSETS.includes(r.asset)&&!/^media:[a-zA-Z0-9-]{1,80}$/.test(r.asset||''))throw new Error('Imagem do robô inválida.');
 for(const k of ['price','daily','lifetime','maxBattles','attack','defense','health'])if(!Number.isSafeInteger(r[k])||r[k]<1||r[k]>100000000)throw new Error('Valores do robô inválidos.');
 if(r.lifetime>3650||r.maxBattles>1000000)throw new Error('Prazo ou limite de batalhas inválido.');
 if(r.slots&&(!Array.isArray(r.slots)||new Set(r.slots).size!==r.slots.length||!r.slots.length||r.slots.some(k=>!['core','arm','shield','booster','sensor'].includes(k))))throw new Error('Espaços inválidos.');
 return r;
}
export function validatePart(p){
 if(typeof p.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(p.id)||!p.name?.trim()||p.name.length>40||!['LC','RC'].includes(p.currency)||!['core','arm','shield','booster','sensor'].includes(p.slot))throw new Error('Identidade do equipamento inválida.');
 if(!Object.values(PART_ASSETS).includes(p.asset)&&!/^media:[a-zA-Z0-9-]{1,80}$/.test(p.asset||''))throw new Error('Imagem do equipamento inválida.');
 for(const k of ['price','production','attack','defense','level'])if(!Number.isSafeInteger(p[k])||p[k]<(k==='price'||k==='level'?1:0)||p[k]>100000000)throw new Error('Atributos do equipamento inválidos.');
 if(p.production>1000||p.level>100||!Array.isArray(p.compatible)||!p.compatible.length||p.compatible.some(t=>!['explorer','striker','guardian'].includes(t)))throw new Error('Compatibilidade ou bônus inválido.');return p;
}
export function combatRules(state){return {...DEFAULT_RULES,...state.settings?.rules};}
export function hydrateState(state,now=Date.now()){
 if(!state||state.version!==1)return initialState();
 const legacyRevision=state.contentRevision||0;
 if(legacyRevision<4&&!state.serverAuthoritative&&state.settings.productionMultiplier==null){for(const r of state.robots){const info=robotInfo(state,r,now),till=Math.min(now,info.expires);r.pendingProductionRC=(r.pendingProductionRC||0)+Math.max(0,till-Math.max(r.lastCollected,r.createdAt))/DAY*info.daily;r.lastCollected=till;}}
 state.settings={...clone(DEFAULT_SETTINGS),...state.settings,rules:{...DEFAULT_RULES,...state.settings?.rules},audio:{...DEFAULT_AUDIO,...state.settings?.audio},copy:{...DEFAULT_COPY,...state.settings?.copy},textOverrides:state.settings?.textOverrides||{}};
 state.chapters ||= clone(CHAPTERS);state.seasons ||= clone(DEFAULT_SEASONS);state.arenaRoster ||= clone(DEFAULT_ARENA_ROSTER);state.activeStory ||= null;
 if((state.contentRevision||0)<CONTENT_REVISION){
  if(legacyRevision<3){for(const model of EXTRA_ROBOTS)if(!state.catalog.some(x=>x.id===model.id))state.catalog.push(clone(model));
  for(const part of EXTRA_PARTS)if(!state.parts.some(x=>x.id===part.id))state.parts.push(clone(part));
  for(const chapter of CHAPTERS)if(!state.chapters.some(x=>x.id===chapter.id))state.chapters.push(clone(chapter));}
  for(const p of state.parts){const legacy=['plasma-core.png','magnetic-arm.png','kinetic-shield.png','quantum-reactor.png'];if(PART_ASSETS[p.id]&&(!p.asset||legacy.includes(p.asset)))p.asset=PART_ASSETS[p.id];}
  for(const r of state.catalog){if(ROBOT_IDENTITIES[r.id]&&r.name===LEGACY_ROBOT_NAMES[r.id])Object.assign(r,ROBOT_IDENTITIES[r.id]);}
  for(const p of state.parts){if(PART_IDENTITIES[p.id]&&p.name===LEGACY_PART_NAMES[p.id])Object.assign(p,PART_IDENTITIES[p.id]);}
  // Só corrige cenários-padrão; personalizações administrativas ficam intactas.
  for(const c of state.chapters){if(c.id===8&&c.scene==='ember')c.scene='forge';if(c.id===10&&c.scene==='frost')c.scene='crystal';}
  for(const season of state.seasons){const defaults=seasonMusicDefaults(season.scene);for(const [key,value] of Object.entries(defaults))if(season[key]===undefined)season[key]=value;}
  if(legacyRevision<7){for(const r of DEFAULT_ROBOTS)if(!state.catalog.some(x=>x.id===r.id))state.catalog.push(clone(r));for(const c of CHAPTERS)if(!state.chapters.some(x=>x.id===c.id))state.chapters.push(clone(c));for(const s of DEFAULT_SEASONS)if(!state.seasons.some(x=>x.id===s.id)&&!state.seasons.some(x=>x.from<=s.to&&x.to>=s.from))state.seasons.push(clone(s));for(const r of DEFAULT_ARENA_ROSTER)if(!state.arenaRoster.some(x=>x.id===r.id))state.arenaRoster.push(clone(r));state.settings.name='LifeBots';}
  state.contentRevision=CONTENT_REVISION;
 }
 if(legacyRevision<4){const samples=initialState(now).affiliates;for(const a of state.affiliates){const sample=samples.find(x=>x.id===a.id);if(sample){a.robotId ||= sample.robotId;a.battles ||= sample.battles;a.acquisitions ||= sample.acquisitions;}}}
 state.profile.referralCode ||= 'LR-'+uuid().replace(/-/g,'').slice(0,10).toUpperCase();
 if(!state.serverAuthoritative)for(const robot of state.robots)if(!robot.contract){const def=state.catalog.find(x=>x.id===robot.catalogId);if(def)robot.contract={...acquisitionContract(state,def,robot.createdAt),legacyDemo:true};}
 return state;
}
export function completeStory(state,id,uid){
 const chapter=chapters(state).find(x=>x.id===id);if(!chapter||id!==state.story+1)throw new Error('Este nível está bloqueado ou já foi concluído.');
 const r=state.robots.find(x=>x.uid===uid);if(!r||!robotInfo(state,r).active)throw new Error('Selecione um robô ativo.');
 if(robotInfo(state,r).power<chapter.power)throw new Error(`Melhore seu robô até ${chapter.power} de poder para avançar.`);
 transaction(state,`História · ${chapter.title}`,'RC',chapter.reward);state.story=id;return chapter.reward;
}
export function storyEnemies(state,id){
 const chapter=chapters(state).find(x=>x.id===id);if(!chapter)throw new Error('Capítulo não encontrado.');
 const rules=combatRules(state),waves=chapter.enemies||LEGACY_WAVES[id-1];
 if(!waves?.length)throw new Error('Configure os adversários deste capítulo.');
 return waves.map((entry,i,all)=>{
  const def=state.catalog.find(x=>x.id===entry.robotId)||DEFAULT_ROBOTS.find(x=>x.id===entry.robotId);if(!def)throw new Error('Robô de campanha não encontrado.');
  const scale=1+i*rules.storyWaveScalePercent/100,boss=i===all.length-1;
  return {id:`story-${id}-${i}`,name:entry.name,def:clone({...def,name:entry.name}),boss,
   attack:entry.attack??Math.round(chapter.power*rules.storyAttackPercent/100*scale),defense:entry.defense??Math.round(chapter.power*rules.storyDefensePercent/100*scale),
   health:entry.health??Math.round((rules.storyBaseHealth+(chapter.chapterKind==='side'?chapter.unlockChapter:id)*rules.storyHealthPerChapter)*(boss?rules.storyBossHealthPercent/100:1)),power:Math.round(chapter.power*scale)};
 });
}
export function storyQuote(state,id,uid,now=Date.now()){
 const existing=state.activeStory;
 if(existing&&!existing.settled&&!['cancelled'].includes(existing.status)){
  if(existing.chapter.id===id&&existing.uid===uid)return {chapter:existing.chapter,player:existing.player,replay:existing.replay,cost:0,currency:existing.entryFee?.currency||'RC',resume:true};
  throw new Error('Retome ou encerre a expedição que já está em andamento.');
 }
 const chapter=chapters(state).find(x=>x.id===id);if(!chapter||!chapterUnlocked(state,chapter))throw new Error('Conclua o capítulo anterior ou aguarde a abertura desta fase.');
 const robot=state.robots.find(x=>x.uid===uid);if(!robot)throw new Error('Selecione um robô ativo.');
 assertRobotAvailable(state,uid);if(robot.tradeLock)throw new Error('Este robô está reservado em uma negociação.');const player=robotInfo(state,robot,now);if(!player.active)throw new Error('O prazo desse robô terminou.');
 if(player.power<chapter.power)throw new Error(`Melhore seu robô até ${chapter.power} de poder para avançar.`);
 const replay=chapterComplete(state,chapter),cost=replay?(chapter.replayCost??state.settings.replayCost??40):0,currency=chapter.replayCurrency||state.settings.replayCurrency||'RC';
 if(!Number.isSafeInteger(cost)||cost<0||!['LC','RC'].includes(currency))throw new Error('Preço de replay inválido.');
 if(state.balances[currency]<cost)throw new Error(`Saldo insuficiente: o replay custa ${cost} ${currency}.`);
 return {chapter,player,replay,cost,currency,resume:false};
}
export function beginStory(state,id,uid,now=Date.now()){
 const q=storyQuote(state,id,uid,now);if(q.resume)return state.activeStory;
 const enemies=storyEnemies(state,id),ticket={id:uuid(),kind:'story',chapter:clone(q.chapter),uid,player:clone(q.player),enemies,rules:combatRules(state),
  enemyIndex:0,defeated:0,playerHP:q.player.health,enemyHP:enemies[0].health,energy:0,round:1,
  turns:0,replay:q.replay,reward:q.replay?0:q.chapter.reward,entryFee:{amount:q.cost,currency:q.currency},status:'travel',controlMode:state.settings.defaultStoryControl||'auto',settled:false,at:now};
 if(q.cost)transaction(state,`Replay · ${q.chapter.title}`,q.currency,-q.cost,'simulado',now);
 state.activeStory=ticket;return ticket;
}
export function enterStory(ticket){if(ticket.kind!=='story'||ticket.status!=='travel')throw new Error('A exploração já começou.');ticket.status='fighting';return ticket;}
export function storyTurn(ticket,move,roll=.5) {
 if(!['story','guild'].includes(ticket.kind)||ticket.status!=='fighting'||ticket.settled)throw new Error('Não há uma batalha ativa.');
 if(!['attack','shield','special'].includes(move))throw new Error('Movimento inválido.');
 const rules={...DEFAULT_RULES,...ticket.rules};
 if(move==='special'&&ticket.energy<rules.energyMax)throw new Error('Carregue a energia para usar o especial.');
 if(!Number.isFinite(roll)||roll<0||roll>1)throw new Error('Valor de batalha inválido.');
 const player=ticket.player,enemy=ticket.enemies[ticket.enemyIndex];
 const boost=move==='special'?rules.specialMultiplier:move==='shield'?rules.shieldAttackMultiplier:rules.attackMultiplier;
 const damage=Math.max(rules.damageMin,Math.round(player.attack*boost-enemy.defense*rules.defenseAbsorption));
 ticket.energy=move==='special'?0:Math.min(rules.energyMax,ticket.energy+1);
 ticket.enemyHP=Math.max(0,ticket.enemyHP-damage);ticket.turns++;
 let retaliation=0;
 if(ticket.enemyHP===0){ticket.defeated++;ticket.status=ticket.defeated===ticket.enemies.length?'won':'wave-cleared';}
 else{retaliation=Math.max(rules.retaliationMin,Math.round((enemy.attack*(rules.randomBase+roll*rules.randomVariance)-player.defense*rules.playerDefenseAbsorption)*(move==='shield'?rules.shieldReduction:1)));
  ticket.playerHP=Math.max(0,ticket.playerHP-retaliation);if(ticket.playerHP===0)ticket.status='lost';}
 ticket.round++;
 return {move,damage,retaliation,playerHP:ticket.playerHP,enemyHP:ticket.enemyHP,energy:ticket.energy,
  defeated:ticket.enemyHP===0,status:ticket.status};
}
export function nextStoryWave(ticket){
 if(ticket.status!=='wave-cleared'||ticket.settled)throw new Error('Vença a batalha atual antes de continuar.');
 ticket.enemyIndex++;ticket.enemyHP=ticket.enemies[ticket.enemyIndex].health;
 const before=ticket.playerHP;ticket.playerHP=Math.min(ticket.player.health,ticket.playerHP+Math.ceil(ticket.player.health*(ticket.rules?.waveHealPercent??35)/100));
 ticket.round=1;ticket.status='fighting';return {healed:ticket.playerHP-before,enemy:ticket.enemies[ticket.enemyIndex]};
}
export function resolveStory(state,ticket){
 if(ticket.kind!=='story'||!['won','lost'].includes(ticket.status))throw new Error('Termine as batalhas para receber o prêmio.');
 if(ticket.settled||(state.storyRuns||[]).some(x=>x.id===ticket.id))throw new Error('Esta missão já foi finalizada.');
 let amount=0;
 if(ticket.status==='won'&&!ticket.replay&&!chapterComplete(state,ticket.chapter)&&(ticket.chapter.chapterKind==='side'||ticket.chapter.id===state.story+1)){amount=ticket.reward;transaction(state,`História · ${ticket.chapter.title}`,'RC',amount);if(ticket.chapter.chapterKind==='side'){state.storyClaims ||= [];state.storyClaims.push(ticket.chapter.id);}else state.story=ticket.chapter.id;}
 const history={id:ticket.id,chapterId:ticket.chapter.id,title:ticket.chapter.title,win:ticket.status==='won',defeated:ticket.defeated,total:ticket.enemies.length,turns:ticket.turns,amount,entryFee:ticket.entryFee,at:ticket.at};
 state.storyRuns ||= [];state.storyRuns.unshift(history);ticket.settled=true;if(state.activeStory?.id===ticket.id)state.activeStory=null;return amount;
}
export function cancelStory(ticket){if(ticket.settled)throw new Error('Esta missão já foi finalizada.');ticket.status='cancelled';}
export function tutorialReward(state){if(state.profile.tutorial)throw new Error('A recompensa já foi resgatada.');state.profile.tutorial=true;transaction(state,'Recompensa do tutorial','LC',state.settings.tutorialBonus);return state.settings.tutorialBonus;}
export function simulateDay(state){const id=`test-day-${++state.simDays}`;const now=Date.now();let produced=0;for(const r of state.robots){if(robotInfo(state,r,now).active){r.createdAt-=DAY;r.lastCollected-=DAY;if(r.contract)r.contract.expiresAt-=DAY;}}produced=collect(state);settleExpirations(state,now);for(const a of state.affiliates){const c=Math.floor(a.daily*state.settings.commissions[a.level-1]/100);a.commission+=c;state.commissionTotal+=c;if(c)transaction(state,`Comissão demonstrativa · nível ${a.level}`,'RC',c);}state.commissionDays.push(id);state.daily={date:dayKey(),used:0,extra:0};return produced;}
export function validateChapter(state,c){
 if(!Number.isSafeInteger(c.id)||c.id<1||c.id>100000||!c.title?.trim()||c.title.length>80||!c.place?.trim()||c.place.length>100||typeof c.story!=='string'||c.story.length>2000)throw new Error('Dados do capítulo inválidos.');
 for(const key of ['objective','conclusion'])if(c[key]!=null&&(typeof c[key]!=='string'||c[key].length>2000))throw new Error('Mensagem de capítulo inválida.');
 if(c.interludes&&(!Array.isArray(c.interludes)||c.interludes.length>8||c.interludes.some(x=>typeof x!=='string'||x.length>2000)))throw new Error('Transmissões de capítulo inválidas.');
 for(const key of ['reward','power'])if(!Number.isSafeInteger(c[key])||c[key]<1)throw new Error('Poder e prêmio devem ser inteiros positivos.');
 if(c.chapterKind==='side'&&(!seasons(state).some(s=>s.id===c.seasonId)||!Number.isSafeInteger(c.unlockChapter)||c.unlockChapter<0||c.unlockChapter>Math.max(...mainChapters(state).map(c=>c.id))))throw new Error('Temporada ou liberação da rota opcional inválida.');
 if(!SCENES.includes(c.scene))throw new Error('Cenário inválido.');
 if(c.replayCost!=null&&(!Number.isSafeInteger(c.replayCost)||c.replayCost<0))throw new Error('Preço de replay inválido.');
 if(c.replayCurrency&&!['LC','RC'].includes(c.replayCurrency))throw new Error('Moeda de replay inválida.');
 if(!Array.isArray(c.enemies)||c.enemies.length<1||c.enemies.length>8)throw new Error('Configure entre 1 e 8 adversários.');
 for(const e of c.enemies){if(!state.catalog.some(r=>r.id===e.robotId)||!e.name?.trim()||e.name.length>60)throw new Error('Modelo ou nome de adversário inválido.');for(const k of ['attack','defense','health'])if(e[k]!=null&&(!Number.isSafeInteger(e[k])||e[k]<(k==='defense'?0:1)))throw new Error('Atributos de adversário inválidos.');}
 if(!validMediaSource(c.sceneArt))throw new Error('Imagem do capítulo inválida.');
 return c;
}
export function saveChapter(state,chapter){validateChapter(state,chapter);state.chapters ||= clone(CHAPTERS);const index=state.chapters.findIndex(c=>c.id===chapter.id);if(index<0){if(chapter.chapterKind!=='side'&&chapter.id!==Math.max(0,...mainChapters(state).map(c=>c.id))+1)throw new Error('Adicione capítulos em ordem.');state.chapters.push(clone(chapter));}else state.chapters[index]=clone(chapter);return chapter;}
export function validateArenaRoster(state,roster){
 if(!Array.isArray(roster)||!roster.length||roster.length>100)throw new Error('Configure de 1 a 100 adversários.');const ids=new Set();
 for(const r of roster){if(typeof r.id!=='string'||ids.has(r.id)||!r.name?.trim()||r.name.length>40||!state.catalog.some(m=>m.id===r.robotId))throw new Error('Nome, modelo ou identificador de adversário inválido.');ids.add(r.id);for(const key of ['attackFactor','defenseFactor','healthFactor'])if(!Number.isFinite(r[key])||r[key]<.25||r[key]>2)throw new Error('Multiplicadores devem estar entre 0,25 e 2.');}
 if(!roster.some(r=>r.enabled!==false))throw new Error('Mantenha pelo menos um adversário disponível.');return roster;
}
export function validateSettings(s){for(const key of ['logoArt','worldBackgroundArt','hangarBackgroundArt','authBackgroundArt'])if(s[key]&&!validMediaSource(s[key]))throw new Error('Use uma imagem enviada ou URL HTTPS.');const positive=['lcPerReal','rcPerLC','passCost','battleReward','levelCost'];for(const k of positive)if(!Number.isSafeInteger(s[k])||s[k]<1)throw new Error(`Configuração inválida: ${k}.`);for(const k of ['freeBattles','battleLoss','tutorialBonus'])if(!Number.isSafeInteger(s[k])||s[k]<0)throw new Error(`Configuração inválida: ${k}.`);if(s.matchTimeoutSeconds!==undefined&&(!Number.isSafeInteger(s.matchTimeoutSeconds)||s.matchTimeoutSeconds<3||s.matchTimeoutSeconds>60))throw new Error('Espera de matchmaking deve ser de 3 a 60 segundos.');if(!Number.isFinite(s.minWithdraw)||s.minWithdraw<.01||!Number.isFinite(s.withdrawFee)||s.withdrawFee<0||s.withdrawFee>100)throw new Error('Regras de saque inválidas.');if(!Array.isArray(s.commissions)||s.commissions.length!==3||s.commissions.some(x=>!Number.isFinite(x)||x<0||x>100)||s.commissions.reduce((a,b)=>a+b,0)>100)throw new Error('Comissões devem somar no máximo 100%.');validateExtendedSettings(s);if(!/^#[\da-f]{6}$/i.test(s.accent))throw new Error('Cor inválida.');return s;}

function validateExtendedSettings(s){
 if(s.autoWithdrawals!=null&&typeof s.autoWithdrawals!=='boolean')throw new Error('Aprovação automática inválida.');
 if(!Number.isFinite(s.autoWithdrawalMax??50)||(s.autoWithdrawalMax??50)<0)throw new Error('Limite automático inválido.');
 if(!Number.isFinite(s.productionMultiplier??10)||(s.productionMultiplier??10)<1||(s.productionMultiplier??10)>100)throw new Error('Multiplicador de produção deve ser entre 1 e 100.');
 if(!Number.isFinite(s.principalReturnPercent??100)||(s.principalReturnPercent??100)<0||(s.principalReturnPercent??100)>100)throw new Error('Devolução de aquisição deve ser entre 0 e 100%.');
 if(!['auto','manual'].includes(s.defaultStoryControl||'auto'))throw new Error('Modo de batalha inválido.');
 if(!SCENES.includes(s.worldBackground||'city')||!Number.isFinite(s.backgroundIntensity??.55)||(s.backgroundIntensity??.55)<0||(s.backgroundIntensity??.55)>1)throw new Error('Fundo do universo inválido.');
 for(const k of ['visualMotion','battleAtmosphere'])if(s[k]!=null&&typeof s[k]!=='boolean')throw new Error('Movimento do cenário inválido.');
 if(typeof (s.autoStoryStart??false)!=='boolean')throw new Error('Avanço automático inválido.');
 for(const k of ['hangarBackground','authBackground'])if(s[k]&&!['hangar','ember','frost','sky','space'].includes(s[k]))throw new Error('Cenário inválido.');
 if(s.authRobotIds&&(!Array.isArray(s.authRobotIds)||s.authRobotIds.length!==3||s.authRobotIds.some(id=>typeof id!=='string')))throw new Error('Robôs do login inválidos.');
 if(!Number.isSafeInteger(s.replayCost??40)||(s.replayCost??40)<0||!['LC','RC'].includes(s.replayCurrency||'RC'))throw new Error('Configuração de replay inválida.');
 for(const key of ['maxRobotLevel','maxPartLevel'])if(!Number.isSafeInteger(s[key])||s[key]<1||s[key]>100)throw new Error('Níveis máximos devem estar entre 1 e 100.');
 for(const [key,,fallback,min,max] of RULE_FIELDS){const value=s.rules?.[key]??fallback;if(!Number.isFinite(value)||value<min||value>max)throw new Error(`Regra de combate inválida: ${key}.`);}
 for(const key of ['energyMax','damageMin','retaliationMin','travelMs','actionMs','betweenWavesMs','autoDelayMs'])if(!Number.isSafeInteger(s.rules?.[key]??DEFAULT_RULES[key]))throw new Error('Energia, dano mínimo e tempos devem ser inteiros.');
 const a={...DEFAULT_AUDIO,...s.audio};if(a.effectSources&&Object.entries(a.effectSources).some(([key,value])=>!['notificationsVolume','collectionVolume','acquisitionVolume','equipmentVolume','progressionVolume','chatVolume','battleVolume','movementVolume','specialVolume'].includes(key)||!validMediaSource(value)))throw new Error('Arquivo de efeito inválido.');for(const key of ['enabled','music','effects'])if(typeof a[key]!=='boolean')throw new Error('Ativação de áudio inválida.');
 if(typeof a.seasonMusic!=='boolean')throw new Error('Trilha por temporada inválida.');
 for(const key of ['masterVolume','musicVolume','effectsVolume','notificationsVolume','collectionVolume','acquisitionVolume','equipmentVolume','progressionVolume','chatVolume','battleVolume','movementVolume','specialVolume'])if(!Number.isFinite(a[key])||a[key]<0||a[key]>1)throw new Error('Volume deve estar entre 0 e 1.');
 if(!Object.hasOwn(MUSIC_TRACKS,a.combatTheme||'pulse'))throw new Error('Tema de combate inválido.');
 for(const url of [a.customMusicUrl,a.customCombatMusicUrl,...Object.values(a.customEffects||{})].filter(Boolean))if(!validMediaSource(url))throw new Error('Escolha um áudio enviado ou uma URL HTTPS.');
 if(!Number.isFinite(a.tempo)||a.tempo<40||a.tempo>180||!Object.hasOwn(MUSIC_TRACKS,a.theme))throw new Error('Tema ou ritmo inválido.');
 for(const v of Object.values(s.copy||{}))if(typeof v!=='string'||v.length>1000)throw new Error('Texto de interface inválido.');
 if(!s.textOverrides||Array.isArray(s.textOverrides)||Object.keys(s.textOverrides).length>200)throw new Error('Configure até 200 substituições de texto.');
 for(const [k,v] of Object.entries(s.textOverrides))if(k.length>500||typeof v!=='string'||v.length>1000)throw new Error('Substituição de texto inválida.');
}

export function saveSeason(state,season){
 if(!Number.isSafeInteger(season.number)||season.number<1||season.number>100)throw new Error('Número de temporada inválido.');
 if(!season.id||!season.title?.trim()||season.title.length>100||!season.subtitle?.trim()||!season.intro?.trim()||season.intro.length>2000||!SCENES.includes(season.scene)||!state.catalog.some(r=>r.id===season.guideRobotId))throw new Error('Dados da temporada inválidos.');
 if(!Number.isSafeInteger(season.from)||!Number.isSafeInteger(season.to)||season.from<1||season.to<season.from||season.to>1000)throw new Error('Escolha um intervalo de capítulos existente.');
 for(const key of ['musicTheme','combatTheme'])if(season[key]!=null&&season[key]!==''&&!Object.hasOwn(MUSIC_TRACKS,season[key]))throw new Error('Trilha da temporada inválida.');
 for(const key of ['musicTempo','combatTempo'])if(season[key]!=null&&(!Number.isFinite(season[key])||season[key]<40||season[key]>180))throw new Error('Ritmo da temporada deve ser de 40 a 180 BPM.');
 for(const key of ['customMusicUrl','customCombatMusicUrl','sceneArt'])if(!validMediaSource(season[key]))throw new Error('Use um arquivo enviado ou URL HTTPS para a temporada.');
 state.seasons ||= clone(DEFAULT_SEASONS);if(state.seasons.some(s=>s.id!==season.id&&s.from<=season.to&&s.to>=season.from))throw new Error('Temporadas não podem ter capítulos em comum.');
 const index=state.seasons.findIndex(s=>s.id===season.id);if(index<0)state.seasons.push(clone(season));else state.seasons[index]=clone(season);state.seasons.sort((a,b)=>a.from-b.from);return season;
}

// Valor de aquisição e prazo são congelados por robô. Mudanças no catálogo não reescrevem o contrato.
export function acquisitionContract(state,def,now=Date.now()){
 const paidLC=def.currency==='LC'?def.price:Math.floor(def.price/state.settings.rcPerLC);
 const principalReturnLC=Math.floor(paidLC*(state.settings.principalReturnPercent??100)/100);
 if(!Number.isSafeInteger(principalReturnLC)||principalReturnLC<0)throw new Error('Devolução de aquisição inválida.');
 return {paidAmount:def.price,paidCurrency:def.currency,rcPerLC:state.settings.rcPerLC,lcPerReal:state.settings.lcPerReal,returnPercent:state.settings.principalReturnPercent??100,principalReturnLC,maxBattles:def.maxBattles,expiresAt:now+def.lifetime*DAY,slots:[...(def.slots||['core','arm','shield'])]};
}
export function settleExpirations(state,now=Date.now()){
 if(state.serverAuthoritative)return {count:0,LC:0};let count=0,LC=0;
 for(const robot of state.robots){const info=robotInfo(state,robot,now);if(info.active||robot.principalReturnedAt!=null||!robot.contract)continue;
  collect(state,robot.uid,now);
  const key='expiration:'+robot.uid,amount=robot.contract.principalReturnLC;
  const existing=state.transactions.find(t=>t.idempotencyKey===key);
  if(!existing&&amount>0){transaction(state,'Devolução de aquisição · '+info.name,'LC',amount,'simulado',now);state.transactions[0].idempotencyKey=key;LC+=amount;}
  robot.principalReturnedAt=existing?.at??now;count++;
  // Peças pertencem ao piloto e voltam ao inventário ao encerrar o prazo.
  for(const id of robot.equipment){const item=state.inventory.find(p=>p.uid===id);if(item)item.equippedOn=null;}robot.equipment=[];
 }
 return {count,LC};
}
