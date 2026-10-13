import {mediaUrl,mediaReference} from './media.js';
import {COMBAT_FRAMES} from './combat-frames.js';
import {robotAnimation} from './combat-profiles.js';
import {assetUrl,safeRobotAsset} from './game-ui.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stages=new Map();
let spriteSequence=0;
function poseScale(meta,def,row){const value=def?.poseScales?.[row]??meta.poseScales?.[row]??1;return Number.isFinite(value)&&value>=.5&&value<=1.5?value:1;}
function stageOf(meta,def){
 const key=meta.asset+JSON.stringify(def?.poseScales||{});if(stages.has(key))return stages.get(key);
 const left=Math.max(...meta.frames.map(f=>(f.anchorX-f.x)*poseScale(meta,def,f.row))),right=Math.max(...meta.frames.map(f=>(f.x+f.width-f.anchorX)*poseScale(meta,def,f.row))),above=Math.max(...meta.frames.map(f=>(f.anchorY-f.y)*poseScale(meta,def,f.row))),below=Math.max(...meta.frames.map(f=>(f.y+f.height-f.anchorY)*poseScale(meta,def,f.row)));
 const size=Math.ceil(Math.max(left+right,above+below)*1.08),stage={size,x:(size-left-right)/2+left,y:(size-above-below)/2+above};stages.set(key,stage);return stage;
}
// O SVG é somente uma janela de reprodução das imagens originais. Nenhum pixel é redesenhado.
export function renderRobotSprite(def,cls='',row=0,options={}){
 if((mediaReference(def?.asset)||/^https:/.test(def?.asset||''))&&def?.artKind!=='atlas6x6'&&def?.artKind!=='atlas4x4'){const url=mediaUrl(def.asset);return `<div class="sprite custom-robot-portrait ${esc(cls)}" role="img" aria-label="${esc(def?.name)}"><img src="${esc(url)}" alt="" draggable="false"></div>`;}
 const atlas=robotAnimation({...def,asset:safeRobotAsset(def)},cls.split(' ').includes('combat-sprite'));
 const actualRow=(cls.includes('result-sprite')||cls.includes('wave-winner'))&&row===3?0:atlas.rows===4&&row>3?(row===5?1:0):Math.min(atlas.rows-1,Math.max(0,Number(row)||0)),duration=Math.max(200,Math.min(2000,options.duration||1200)),offset=Math.max(0,Math.min(2000,options.offset||0));
 const meta=COMBAT_FRAMES[atlas.asset],source=assetUrl(atlas.asset);
 let images;if(meta){const stage=stageOf(meta,def),id=++spriteSequence;images=meta.frames.filter(f=>f.row===actualRow).map(f=>{const scale=poseScale(meta,def,f.row),clipId=`robot-pose-${id}-${f.column}`;return `<svg class="combat-pose pose-${f.column}" viewBox="0 0 ${stage.size} ${stage.size}" aria-hidden="true" focusable="false"><svg x="${(f.x-f.anchorX)*scale+stage.x}" y="${(f.y-f.anchorY)*scale+stage.y}" width="${f.width*scale}" height="${f.height*scale}" viewBox="${f.x} ${f.y} ${f.width} ${f.height}" overflow="hidden">${f.clipPath?`<defs><clipPath id="${clipId}" clipPathUnits="userSpaceOnUse"><path d="${f.clipPath}"/></clipPath></defs>`:''}<image href="${source}" width="${meta.width}" height="${meta.height}" ${f.clipPath?`clip-path="url(#${clipId})"`:''}/></svg></svg>`;}).join('');}
 else images=`<img class="sprite-atlas" src="${source}" alt="" decoding="async" draggable="false">`;
 return `<div class="sprite ${esc(cls)} ${atlas.columns===6?'atlas-six':''} ${options.once?'sprite-once':''} ${meta?'sprite-rects':''}" data-row="${actualRow}" role="img" aria-label="${esc(def?.name||'Robô')}" style="--frame-y:${-actualRow*100/atlas.rows}%;--sprite-duration:${duration}ms;--sprite-offset:-${offset}ms">${images}</div>`;
}
