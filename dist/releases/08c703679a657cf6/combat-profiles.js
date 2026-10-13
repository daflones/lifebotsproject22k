export const COMBAT_STYLES=[['organic','Pulso de raízes'],['electric','Arco elétrico'],['impact','Punho sísmico'],['fire','Chama rubra'],['frost','Lança glacial'],['wind','Corte dos ventos'],['orbital','Disparo orbital'],['plasma','Lâmina de plasma'],['shadow','Onda de obsidiana']];
const models={moss:['organic',1.02],volt:['electric',1.28],titan:['impact',.68],ember:['fire',1.12],glacier:['frost',.87],nimbus:['wind',1.42],orbit:['orbital',1.06],nova:['plasma',1.32],onyx:['shadow',.56],coral:['frost',.78],abyss:['orbital',.83],chrono:['impact',.61],vesper:['wind',1.65],mycel:['organic',.92],aurelia:['plasma',1.46]};
export const COMBAT_ASSETS=Object.keys(models).map(id=>id+'-combat-v'+(['coral','abyss','chrono','vesper','mycel','aurelia'].includes(id)?7:6)+'.png');
export function robotCombatProfile(def){
 const model=/^(moss|volt|titan|ember|glacier|nimbus|orbit|nova|onyx|coral|abyss|chrono|vesper|mycel|aurelia)-(?:sprites|combat-v[67])\.png$/.exec(def?.asset||'')?.[1]||'moss';
 const [style,pitch]=models[model];
 return {model,style:COMBAT_STYLES.some(([id])=>id===def?.combatStyle)?def.combatStyle:style,pitch:Number.isFinite(def?.soundPitch)?Math.max(.5,Math.min(2,def.soundPitch)):pitch,color:/^#[\da-f]{6}$/i.test(def?.color||'')?def.color:'#9deba8'};
}
export function robotAnimation(def,combat=false){
 if(['atlas6x6','atlas4x4'].includes(def?.artKind)&&/^(media:|https:)/.test(def?.asset||'')){const size=def.artKind==='atlas6x6'?6:4;return {asset:def.asset,columns:size,rows:size};}
 const profile=robotCombatProfile(def),legacy=def?.asset?.endsWith('-sprites.png');
 let asset=COMBAT_ASSETS.includes(def?.asset)?def.asset:legacy?def.asset:'moss-sprites.png';
 if(combat&&def?.animationAsset!=='legacy')asset=COMBAT_ASSETS.includes(def?.animationAsset)?def.animationAsset:COMBAT_ASSETS.find(x=>x.startsWith(profile.model+'-'));
 const modern=COMBAT_ASSETS.includes(asset);
 return {asset,columns:modern?6:4,rows:modern?6:4};
}
