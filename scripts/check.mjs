import {readdir,readFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {ROBOT_ASSETS,PART_ASSETS,SCENES} from '../src/content.js';
import {sceneAsset} from '../src/game-ui.js';
import {MUSIC_TRACKS} from '../src/music-catalog.js';
const root=resolve(import.meta.dirname,'..');
const files=await readdir(resolve(root,'src'));
for(const f of files.filter(x=>x.endsWith('.js'))){const p=spawnSync(process.execPath,['--check',resolve(root,'src',f)],{stdio:'inherit'});if(p.status)process.exit(p.status);}
for(const f of (await readdir(resolve(root,'scripts'))).filter(x=>x.endsWith('.mjs'))){const p=spawnSync(process.execPath,['--check',resolve(root,'scripts',f)],{stdio:'inherit'});if(p.status)process.exit(p.status);}
for(const f of ['manifest.webmanifest'])JSON.parse(await readFile(resolve(root,'src',f),'utf8'));
const required=['hangar.png','story-map.png','moss-sprites.png','volt-sprites.png','titan-sprites.png','icon.svg','icon-192.png','icon-512.png','lifecoin.png','robotcoin.png','plasma-core.png','magnetic-arm.png','kinetic-shield.png','quantum-reactor.png','hangar.webp','story-map.webp','moss-sprites.webp','volt-sprites.webp','titan-sprites.webp','lifecoin.webp','robotcoin.webp'];
const newMedia=[...Object.values(PART_ASSETS),...SCENES.map(sceneAsset),'battle-arena.png','game-backdrop.png','nexa-guide.png','map-beacon.png','reward-chest.png','guild-crest.png','trade-terminal.png'];
for(const f of newMedia){await access(resolve(root,'dist/assets',f));await access(resolve(root,'dist/assets',f.replace('.png','.webp')));}
for(const [theme,track] of Object.entries(MUSIC_TRACKS))for(const extension of ['ogg','mp3'])await access(resolve(root,'dist/assets',`music-${theme}-v${track.version}.${extension}`));
for(const f of [...new Set([...required,...ROBOT_ASSETS,'game-mark.png',...['ember','frost','sky','space'].map(id=>`sector-${id}.png`),...[...required,...ROBOT_ASSETS,'game-mark.png',...['ember','frost','sky','space'].map(id=>`sector-${id}.png`)].filter(f=>f.endsWith('.png')&&!f.startsWith('icon-')).map(f=>f.replace('.png','.webp'))])])await access(resolve(root,'dist/assets',f));
const config=await readFile(resolve(root,'src/config.js'),'utf8');
if(!/mode:\s*'(?:demo|server)'/.test(config))throw new Error('Modo de conexão inválido.');
if(/SUPABASE_SERVICE_ROLE_KEY|MERCOSULPAY_API_KEY/.test(config))throw new Error('Segredo encontrado na configuração pública.');
console.log('Sintaxe JavaScript, manifest, configuração pública e assets: OK.');
