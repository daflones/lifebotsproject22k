import {mediaUrl,mediaReference} from './media.js';
// Trilhas originais; os BPMs também orientam a velocidade real de reprodução.
export const MUSIC_TRACKS={
 tides:{bpm:88,name:'Marés — coral e ecos',version:7},'tides-duel':{bpm:118,name:'Marés — pressão abissal',version:7},clockwork:{bpm:102,name:'Tempo — ponteiros de âmbar',version:7},'clockwork-duel':{bpm:132,name:'Tempo — engrenagem de combate',version:7},memory:{bpm:80,name:'Memória — jardim de vidro',version:7},'memory-duel':{bpm:124,name:'Memória — asas da aurora',version:7},
 aurora:{bpm:96,name:'Aurora — novo sinal',version:2},
 pulse:{bpm:112,name:'Pulse — arena de luz',version:2},
 cosmos:{bpm:84,name:'Cosmos — além do horizonte',version:2},
 verdant:{bpm:92,name:'Despertar — raízes de Aurora',version:6},
 'verdant-duel':{bpm:116,name:'Despertar — patrulha das raízes',version:6},
 frontier:{bpm:104,name:'Fronteiras — fogo, gelo e vento',version:6},
 'frontier-duel':{bpm:128,name:'Fronteiras — guardiões da forja',version:6},
 starlight:{bpm:82,name:'Estrelas — transmissão distante',version:6},
 'starlight-duel':{bpm:122,name:'Estrelas — tempestade de plasma',version:6}
};
export const MUSIC_OPTIONS=Object.entries(MUSIC_TRACKS).map(([id,t])=>[id,t.name]);
export function seasonMusicDefaults(scene){
 const theme=({coral:'tides',clockwork:'clockwork',memory:'memory'})[scene]||(['space','nebula','night','core'].includes(scene)?'starlight':['ember','forge','frost','crystal','sky'].includes(scene)?'frontier':'verdant');
 return {musicTheme:theme,combatTheme:theme+'-duel',musicTempo:MUSIC_TRACKS[theme].bpm,combatTempo:MUSIC_TRACKS[theme+'-duel'].bpm,customMusicUrl:'',customCombatMusicUrl:''};
}
export function musicProfile(config,scene){
 const kind=typeof scene==='string'?scene:scene?.kind||'home',combat=kind==='combat',season=typeof scene==='object'?scene?.season:null;
 const seasonal=season&&config.seasonMusic!==false;
 const seasonTheme=seasonal?(combat?season.combatTheme:season.musicTheme):null;
 const theme=Object.hasOwn(MUSIC_TRACKS,seasonTheme)?seasonTheme:(combat?config.combatTheme:config.theme)||'aurora';
 const safeTheme=Object.hasOwn(MUSIC_TRACKS,theme)?theme:'aurora';
 const rawTempo=seasonTheme?(combat?season.combatTempo:season.musicTempo):config.tempo;
 const tempo=Number.isFinite(rawTempo)?Math.max(40,Math.min(180,rawTempo)):MUSIC_TRACKS[safeTheme].bpm;
 const custom=seasonTheme?(combat?season.customCombatMusicUrl:season.customMusicUrl):(combat?config.customCombatMusicUrl:config.customMusicUrl);
 let url=mediaReference(custom)?mediaUrl(custom):'';try{if(custom&&new URL(custom).protocol==='https:')url=new URL(custom).href;}catch{}
 return {kind,theme:safeTheme,tempo,url,seasonId:seasonal?season.id:null,name:MUSIC_TRACKS[safeTheme].name};
}
