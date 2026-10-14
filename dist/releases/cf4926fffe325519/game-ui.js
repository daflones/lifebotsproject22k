import {mediaUrl,mediaReference,validMediaSource} from './media.js';
import {ROBOT_ASSETS,PART_ASSETS} from './content.js';
export const GAME_VERSION='0.8.0';
export const PART_ART=PART_ASSETS;
export function partAsset(part){return (mediaReference(part?.asset)||/^https:/.test(part?.asset||'')&&validMediaSource(part.asset)||Object.values(PART_ASSETS).includes(part?.asset))?part.asset:PART_ASSETS[part?.id]||PART_ASSETS[part?.slot]||PART_ASSETS.core;}
export const assetUrl=name=>{if(mediaReference(name))return mediaUrl(name);if(/^https:/.test(name||''))return new URL(name).href.replaceAll("'",'%27').replaceAll('\\','%5C');const path=`./assets/${encodeURIComponent(name.replace(/\.png$/,'.webp'))}?v=${GAME_VERSION}`;return globalThis.location?.href?new URL(path,globalThis.location.href).href:path;};
export function visibleAccent(value){
 const color=/^#[0-9a-f]{6}$/i.test(value||'')?value:'#68dce7';
 let rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const luminance=values=>values.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,b,i)=>a+b*[.2126,.7152,.0722][i],0);
 while((luminance(rgb)+.05)/(.015+.05)<4.5)rgb=rgb.map(v=>Math.min(255,Math.ceil(v+(255-v)*.1)));
 return '#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');
}
export function safeRobotAsset(def){return mediaReference(def?.asset)||/^https:/.test(def?.asset||'')&&validMediaSource(def.asset)||ROBOT_ASSETS.includes(def?.asset)?def.asset:'moss-sprites.png';}
export function applyTextOverrides(markup,overrides={},escape=String){
 return markup.replace(/(>)([^<>]+)(<)/g,(whole,left,value,right)=>{const text=value.trim();return !['Controlado pelo jogo','PRÉVIA · MOEDAS DE TESTE'].includes(text)&&Object.hasOwn(overrides,text)?left+escape(overrides[text])+right:whole;});
}

export function sceneAsset(scene){return ({coral:'coral-reef-v7.png',clockwork:'clock-city-v7.png',memory:'memory-garden-v7.png',ember:'sector-ember.png',frost:'sector-frost.png',sky:'sector-sky.png',space:'sector-space.png',nebula:'battle-nebula.png',night:'battle-obsidian.png',forge:'battle-forge.png',crystal:'battle-crystal.png',roots:'battle-roots.png',city:'battle-aurora.png',steel:'battle-arena.png',sunset:'battle-aurora.png',core:'battle-arena.png',aurora:'battle-aurora.png',arena:'battle-arena.png','guild-canyon':'guild-canyon.png','guild-boreal':'guild-boreal.png',hangar:'hangar.png'})[scene]||'hangar.png';}

export function sceneStyle(scene,art){return `--battle-art:url('${assetUrl(art||sceneAsset(scene))}')`;}
