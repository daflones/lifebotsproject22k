import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {COMBAT_ASSETS} from '../src/combat-profiles.js';
const root=resolve(import.meta.dirname,'..'),result={};
for(const group of ['V6_BASE','V6_FRONTIERS','V6_STARS','V7_CORAL','V7_CHRONO','V7_GARDEN']){
 const records=JSON.parse(await readFile(resolve(root,`docs/COMBAT_${group}_FRAMES.json`),'utf8'));
 for(const meta of Object.values(records.robots||records)){
  const asset=meta.asset.split('/').at(-1).replace(/\.webp$/,'.png');
  if(!COMBAT_ASSETS.includes(asset)||result[asset])throw new Error('Atlas desconhecido ou repetido: '+asset);
  if(!Number.isSafeInteger(meta.width)||!Number.isSafeInteger(meta.height)||meta.width<1||meta.height<1||meta.frames.length!==36)throw new Error('Atlas deve conter 36 poses completas: '+asset);
  const indices=new Set();for(const f of meta.frames){
   if(!Number.isSafeInteger(f.row)||!Number.isSafeInteger(f.column)||f.row<0||f.row>5||f.column<0||f.column>5||indices.has(f.row*6+f.column))throw new Error('Ordem de pose inválida: '+asset);indices.add(f.row*6+f.column);
   for(const key of ['x','y','width','height','anchorX','anchorY'])if(!Number.isFinite(f[key]))throw new Error('Retângulo inválido: '+asset);
   if(f.x<0||f.y<0||f.width<1||f.height<1||f.x+f.width>meta.width||f.y+f.height>meta.height||f.anchorX<f.x||f.anchorX>f.x+f.width||f.anchorY<f.y||f.anchorY>f.y+f.height)throw new Error('Pose fora do atlas: '+asset);
   if(f.clipPath!=null&&(typeof f.clipPath!=='string'||f.clipPath.length>32000||!/^[MLZ0-9.eE,\s\-]+$/.test(f.clipPath)))throw new Error('Contorno de pose inválido: '+asset);
  }
  result[asset]={asset,width:meta.width,height:meta.height,poseScales:asset==='orbit-combat-v6.png'?{4:1.28}:{},frames:meta.frames.map(f=>({...Object.fromEntries(['row','column','x','y','width','height','anchorX','anchorY'].map(key=>[key,f[key]])),...f.clipPath?{clipPath:f.clipPath}:{}})).sort((a,b)=>a.row-b.row||a.column-b.column)};
 }
}
if(COMBAT_ASSETS.some(asset=>!result[asset]))throw new Error('Finalize os quinze modelos antes de gerar o módulo.');
await writeFile(resolve(root,'src/combat-frames.js'),'// Retângulos medidos nos PNGs originais, sem alteração dos pixels.\n// Recriar: node scripts/sync-combat-frames.mjs\nexport const COMBAT_FRAMES='+JSON.stringify(result,null,1)+';\n');
console.log('15 atlas, 540 retângulos e âncoras de poses sincronizados.');
