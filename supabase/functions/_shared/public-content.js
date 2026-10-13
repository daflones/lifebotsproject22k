const fields=['name','tagline','accent','logoArt','authBackgroundArt','authBackground','authRobotIds','copy','textOverrides','audio','visualMotion','backgroundIntensity'];
const robotFields=['id','name','type','rarity','description','asset','color','artKind','animationAsset','poseScales','combatStyle','soundPitch'];
export function publicAppearance(presentation,rows){
 const settings=Object.fromEntries(fields.filter(k=>presentation?.[k]!==undefined).map(k=>[k,presentation[k]]));
 const catalog=rows.map(r=>{const model={...r.identity,...r};delete model.identity;return Object.fromEntries(robotFields.filter(k=>model[k]!==undefined).map(k=>[k,model[k]]));});
 const refs=new Set();function visit(value){if(typeof value==='string'&&/^media:[a-zA-Z0-9-]{1,80}$/.test(value))refs.add(value);else if(value&&typeof value==='object')Object.values(value).forEach(visit);}visit({settings,catalog});
 return {settings,catalog,mediaRefs:[...refs]};
}
