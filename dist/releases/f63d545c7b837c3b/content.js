import {NEW_ROBOTS,NEW_CHAPTERS,SIDE_CHAPTERS,NEW_SEASONS,NEW_RIVALS} from './expansion-v7.js';
import {seasonMusicDefaults} from './music-catalog.js';
// Conteúdo versionado. O painel edita cópias no estado; nunca o progresso do jogador.
export const CONTENT_REVISION=7;
export const ROBOT_ASSETS=['moss','volt','titan','ember','glacier','nimbus','orbit','nova','onyx','coral','abyss','chrono','vesper','mycel','aurelia'].flatMap(id=>['coral','abyss','chrono','vesper','mycel','aurelia'].includes(id)?[`${id}-combat-v7.png`]:[`${id}-sprites.png`,`${id}-combat-v6.png`]);
export const SCENES=['aurora','roots','city','steel','sunset','core','ember','frost','sky','space','nebula','night','forge','crystal','arena','guild-canyon','guild-boreal','coral','clockwork','memory'];
export const EXTRA_ROBOTS=[
 {id:'ember',name:'EMBER-04',type:'striker',rarity:'Raro',description:'Uma raposa de metal com um coração de fogo. Seus ataques aquecem a arena.',price:1900,currency:'LC',daily:230,lifetime:30,maxBattles:128,attack:58,defense:30,health:160,asset:'ember-sprites.png',color:'#ffab79'},
 {id:'glacier',name:'GLACIER-05',type:'guardian',rarity:'Épico',description:'Cristais de gelo protegem este guardião. Uma fortaleza que caminha.',price:2900,currency:'LC',daily:340,lifetime:35,maxBattles:150,attack:43,defense:70,health:280,asset:'glacier-sprites.png',color:'#a3e5f3'},
 {id:'nimbus',name:'NIMBUS-06',type:'explorer',rarity:'Raro',description:'Leve como o vento, curioso como um explorador. Encontra passagens além das nuvens.',price:1200,currency:'LC',daily:145,lifetime:25,maxBattles:100,attack:39,defense:34,health:165,asset:'nimbus-sprites.png',color:'#c3e7ee'},
 {id:'orbit',name:'ORBIT-07',type:'explorer',rarity:'Épico',description:'Um viajante das estrelas, equipado para seguir transmissões de mundos distantes.',price:4400,currency:'LC',daily:480,lifetime:45,maxBattles:200,attack:70,defense:65,health:290,asset:'orbit-sprites.png',color:'#f2d39b'},
 {id:'nova',name:'NOVA-08',type:'striker',rarity:'Lendário',description:'Plasma violeta e precisão estelar. Um atacante preparado para os últimos setores.',price:6200,currency:'LC',daily:650,lifetime:50,maxBattles:220,attack:102,defense:57,health:320,asset:'nova-sprites.png',color:'#e2b1f4'},
 {id:'onyx',name:'ONYX-09',type:'guardian',rarity:'Lendário',description:'O colosso de obsidiana. Sua armadura dourada protege a equipe nas missões mais difíceis.',price:7800,currency:'LC',daily:790,lifetime:60,maxBattles:260,attack:84,defense:110,health:440,asset:'onyx-sprites.png',color:'#eac58b'},
 ...NEW_ROBOTS
];
export const EXTRA_PARTS=[
 {id:'ember-core',name:'Núcleo de ignição',slot:'core',asset:'ignition-core.png',description:'Reforça a produção e concentra o calor de cada ataque.',price:1100,currency:'RC',production:28,attack:12,defense:3,compatible:['striker','explorer'],level:1},
 {id:'frost-shield',name:'Barreira glacial',slot:'shield',asset:'glacial-barrier.png',description:'Camadas de energia fria protegem o seu robô.',price:1600,currency:'RC',production:15,attack:2,defense:25,compatible:['guardian','explorer'],level:1},
 {id:'nova-arm',name:'Lâmina de pulsar',slot:'arm',asset:'pulsar-blade.png',description:'Tecnologia estelar para enfrentar os guardiões finais.',price:750,currency:'LC',production:18,attack:28,defense:5,compatible:['striker','guardian'],level:2},
 {id:'orbit-reactor',name:'Reator orbital',slot:'core',asset:'orbital-reactor.png',description:'Amplia a produção com um circuito de energia contínua.',price:1000,currency:'LC',production:55,attack:16,defense:15,compatible:['explorer','striker','guardian'],level:2}
];
const wave=(robotId,name)=>({robotId,name});
export const LEGACY_WAVES=[
 [wave('moss','Vigia de sucata'),wave('moss','Sentinela enferrujada')],
 [wave('moss','Rastreador de raízes'),wave('volt','Caçador de sinais')],
 [wave('volt','Patrulha Aurora'),wave('moss','Vigia do distrito'),wave('volt','Comandante Aurora')],
 [wave('moss','Vigia do portão'),wave('volt','Artilheiro antigo'),wave('titan','Guardião de aço')],
 [wave('volt','Patrulha do vale'),wave('volt','Interceptor de antenas'),wave('titan','Guardião do farol')],
 [wave('moss','Vigia do núcleo'),wave('volt','Interceptor quântico'),wave('titan','Titã do núcleo')]
];
export const EXTRA_CHAPTERS=[
 {id:7,title:'Faíscas no deserto',place:'Dunas de cobre',reward:780,power:112,scene:'ember',story:'Uma tempestade revelou trilhos enterrados. Atravesse as dunas e encontre a forja que ainda pulsa.',enemies:[wave('ember','Batedor da forja'),wave('volt','Artilheiro de cobre'),wave('ember','Raposa incandescente')]},
 {id:8,title:'A forja perdida',place:'Fornalha Rubra',reward:900,power:125,scene:'forge',story:'A fornalha está acordada. Seus guardiões confundem visitantes com invasores. Desative a patrulha e recupere o mapa.',enemies:[wave('ember','Vigia rubro'),wave('titan','Guarda da fornalha'),wave('ember','Mestre da ignição')]},
 {id:9,title:'O silêncio do gelo',place:'Cordilheira Boreal',reward:1050,power:140,scene:'frost',story:'O sinal desaparece entre cristais congelados. Abra caminho e reative as antenas da cordilheira.',enemies:[wave('glacier','Sentinela boreal'),wave('nimbus','Rastreador da neve'),wave('glacier','Guardião glacial')]},
 {id:10,title:'Coração congelado',place:'Câmara de Cristal',reward:1200,power:152,scene:'crystal',story:'O reator está preso no gelo. Enfrente os defensores da câmara e devolva calor à região.',enemies:[wave('glacier','Patrulha de cristal'),wave('titan','Escudo boreal'),wave('glacier','Coração de inverno')]},
 {id:11,title:'Acima das nuvens',place:'Arquipélago Suspenso',reward:1400,power:165,scene:'sky',story:'Pontes flutuantes conectam antigos laboratórios. Zéfiro encontrou uma rota; siga suas pistas.',enemies:[wave('nimbus','Vigia das nuvens'),wave('orbit','Batedor celeste'),wave('nimbus','Guardião do vento')]},
 {id:12,title:'A torre dos ventos',place:'Farol Celeste',reward:1650,power:178,scene:'sky',story:'A torre transmite para fora do planeta. Reconquiste o farol e descubra de onde vem o chamado.',enemies:[wave('nimbus','Interceptor aéreo'),wave('ember','Artilheiro do farol'),wave('orbit','Guardião celeste')]},
 {id:13,title:'Órbita desconhecida',place:'Estação Horizonte',reward:1900,power:190,scene:'space',story:'O elevador orbital voltou a funcionar. Explore a estação e reúna as coordenadas do próximo setor.',enemies:[wave('orbit','Patrulha orbital'),wave('nova','Vigia estelar'),wave('orbit','Comandante Horizonte')]},
 {id:14,title:'Ecos da estação',place:'Anel de Kepler',reward:2150,power:202,scene:'space',story:'Um eco percorre o anel vazio. Recupere os registros antes que o sistema de defesa os apague.',enemies:[wave('orbit','Vigia de Kepler'),wave('glacier','Escudo do anel'),wave('nova','Interceptor de plasma'),wave('orbit','Núcleo orbital')]},
 {id:15,title:'A chama violeta',place:'Nebulosa Prisma',reward:2450,power:214,scene:'nebula',story:'Cristais de plasma alimentam uma nova geração de robôs. Abra uma passagem entre as sentinelas.',enemies:[wave('nova','Batedor de Prisma'),wave('ember','Chama errante'),wave('nova','Guardião violeta')]},
 {id:16,title:'Tempestade estelar',place:'Portal Nova',reward:2750,power:226,scene:'nebula',story:'O portal está instável. Vença a patrulha e sincronize os núcleos antes da tempestade.',enemies:[wave('nova','Sentinela de plasma'),wave('orbit','Guardião da órbita'),wave('onyx','Escudo do portal'),wave('nova','Arauto da tempestade')]},
 {id:17,title:'O vale de obsidiana',place:'Cidadela Onyx',reward:3100,power:238,scene:'night',story:'Uma cidadela ergue-se entre pedras negras. Seu último guardião protege uma memória do antigo mundo.',enemies:[wave('onyx','Vigia da cidadela'),wave('glacier','Escudo da memória'),wave('nova','Interceptor de obsidiana'),wave('onyx','Colosso negro')]},
 {id:18,title:'O farol da vida',place:'Santuário Life',reward:3600,power:250,scene:'core',story:'Todos os sinais convergem aqui. Reúna sua equipe, vença os guardiões e acenda o farol de uma nova era.',enemies:[wave('orbit','Guarda do santuário'),wave('nova','Guardião do prisma'),wave('glacier','Sentinela eterna'),wave('onyx','Último guardião')]}
];
EXTRA_CHAPTERS.push(...NEW_CHAPTERS,...SIDE_CHAPTERS);
export const DEFAULT_ARENA_ROSTER=[
 {id:'scout',name:'Scout',robotId:'moss',attackFactor:.95,defenseFactor:.9,healthFactor:.98},
 {id:'pulse',name:'Pulse',robotId:'volt',attackFactor:.96,defenseFactor:.92,healthFactor:1},
 {id:'sentinel',name:'Sentinel',robotId:'titan',attackFactor:.9,defenseFactor:1,healthFactor:1.05},
 {id:'flare',name:'Flare',robotId:'ember',attackFactor:1,defenseFactor:.88,healthFactor:.98},
 {id:'boreal',name:'Boreal',robotId:'glacier',attackFactor:.9,defenseFactor:1.02,healthFactor:1.05},
 {id:'zephyr',name:'Zephyr',robotId:'nimbus',attackFactor:.96,defenseFactor:.9,healthFactor:.98},
 {id:'kepler',name:'Kepler',robotId:'orbit',attackFactor:.97,defenseFactor:.94,healthFactor:1},
 {id:'prisma',name:'Prisma',robotId:'nova',attackFactor:1.02,defenseFactor:.88,healthFactor:.98},
 {id:'atlas',name:'Atlas',robotId:'onyx',attackFactor:.9,defenseFactor:1.02,healthFactor:1.05},
 ...NEW_RIVALS
];
export const DEFAULT_SEASONS=[
 {id:'awakening',number:1,title:'A era do despertar',subtitle:'Um sinal. Uma cidade. Um novo começo.',intro:'Sou NEXA, a memória do hangar. Nossos faróis se apagaram há muito tempo. Comece pelos arredores, vença as patrulhas e reúna energia para reacender Aurora.',from:1,to:6,scene:'roots',guideRobotId:'moss'},
 {id:'frontiers',number:2,title:'As fronteiras de Aurora',subtitle:'Do fogo ao gelo, rumo às nuvens.',intro:'Aurora voltou a brilhar, mas o sinal veio de mais longe. A forja rubra, a câmara glacial e o farol celeste escondem partes do mesmo mapa. Prepare equipamentos para atravessar os três setores.',from:7,to:12,scene:'ember',guideRobotId:'nimbus'},
 {id:'stars',number:3,title:'Além das estrelas',subtitle:'A última transmissão atravessa o universo.',intro:'As coordenadas levam à estação Horizonte. Os guardiões do prisma e da obsidiana protegem o Santuário Life. Evolua sua equipe; o último farol espera por você.',from:13,to:18,scene:'space',guideRobotId:'orbit'},
 ...NEW_SEASONS
].map(season=>({...season,...seasonMusicDefaults(season.scene)}));
// O schema alimenta validação e campos do painel. Novas regras devem entrar aqui.
export const RULE_FIELDS=[
 ['attackMultiplier','Multiplicador de ataque',1.05,.1,5],['specialMultiplier','Multiplicador do especial',1.9,.1,5],['shieldAttackMultiplier','Contra-ataque ao defender',.55,.1,5],
 ['defenseAbsorption','Redução pela defesa inimiga',.28,0,1],['playerDefenseAbsorption','Redução pela defesa do jogador',.22,0,1],['shieldReduction','Dano recebido ao defender',.4,0,1],
 ['randomBase','Variação: base do ataque inimigo',.8,.1,2],['randomVariance','Variação: amplitude',.3,0,2],['damageMin','Dano mínimo do ataque',7,1,100],['retaliationMin','Dano mínimo inimigo',5,1,100],['energyMax','Energia para especial',3,1,10],
 ['levelAttackStep','Ataque por nível de robô',3,0,50],['levelDefenseStep','Defesa por nível de robô',2,0,50],['levelHealthStep','Vida por nível de robô',10,0,200],['productionLevelPercent','Produção extra por nível (%)',10,0,100],['partProductionLevelPercent','Bônus de peça por nível (%)',15,0,100],
 ['waveHealPercent','Recuperação entre ondas (%)',35,0,100],['storyAttackPercent','Ataque inimigo sobre poder (%)',43,1,200],['storyDefensePercent','Defesa inimiga sobre poder (%)',22,0,200],['storyBossHealthPercent','Vida do guardião (%)',118,100,400],['storyWaveScalePercent','Força extra por onda (%)',8,0,100],['storyBaseHealth','Vida base de inimigo',52,1,500],['storyHealthPerChapter','Vida por capítulo',14,0,100],
 ['travelMs','Duração da viagem (ms)',2400,500,10000],['actionMs','Duração de ataque/dano (ms)',600,200,2000],['betweenWavesMs','Pausa entre ondas (ms)',1800,500,8000],['autoDelayMs','Pausa no automático (ms)',650,250,5000]
];
export const DEFAULT_RULES=Object.fromEntries(RULE_FIELDS.map(([id,,value])=>[id,value]));
export const DEFAULT_AUDIO={customEffects:{},enabled:true,music:true,effects:true,seasonMusic:true,masterVolume:.45,musicVolume:.3,effectsVolume:.65,theme:'aurora',combatTheme:'pulse',customMusicUrl:'',customCombatMusicUrl:'',tempo:96,notificationsVolume:.8,collectionVolume:1,acquisitionVolume:1,equipmentVolume:.9,progressionVolume:1,chatVolume:.7,battleVolume:.85,movementVolume:.65,specialVolume:1};
export const DEFAULT_COPY={homeTitle:'Hangar principal',storyTitle:'O mundo tem uma nova chance.',storyDescription:'Explore a campanha, enfrente robôs e conquiste os prêmios pelo caminho.',arenaTitle:'Encontre seu próximo adversário.',arenaDescription:'Entre na fila com seu robô e prepare sua estratégia.',shopTitle:'Construa sua próxima versão.',shopDescription:'Robôs, peças e novas possibilidades para a sua equipe.',robotsTitle:'Pequenos robôs. Grandes histórias.',walletTitle:'Tudo em um só lugar.',hangarLabel:'Hangar',robotsLabel:'Meus robôs',storyLabel:'Aventura',arenaLabel:'Arena',shopLabel:'Oficina',walletLabel:'Carteira',moreLabel:'Mais',networkLabel:'Rede',authTagline:'DÊ VIDA AO SEU PRÓXIMO CAPÍTULO',authWorldText:'Um universo de robôs espera pelo seu próximo sinal.',loginTitle:'Seu hangar espera por você.',loginDescription:'Seu próximo capítulo começa aqui.',signupTitle:'Comece sua jornada.',signupDescription:'Crie seu piloto e prepare sua primeira equipe.'};

export const PART_ASSETS={core:"plasma-core.png",arm:"magnetic-arm-v2.png",shield:"kinetic-shield-v2.png",reactor:"quantum-reactor-v2.png","ember-core":"ignition-core.png","frost-shield":"glacial-barrier.png","nova-arm":"pulsar-blade.png","orbit-reactor":"orbital-reactor.png"};
