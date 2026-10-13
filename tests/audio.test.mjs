import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../src/audio.js';
import {MUSIC_TRACKS} from '../src/music-catalog.js';
import {EFFECT_CUES,successfulActionSound} from '../src/audio-effects.js';
import {DEFAULT_AUDIO} from '../src/content.js';
import {DEFAULT_SEASONS} from '../src/content.js';
import * as C from '../src/core.js';
import {musicProfile} from '../src/music-catalog.js';
function fixture(t){let created=0,notes=0,id=0;const tones=[],values=new Map(),timers=new Set(),originalSet=globalThis.setInterval,originalClear=globalThis.clearInterval;
 globalThis.setInterval=()=>{timers.add(++id);return id;};globalThis.clearInterval=id=>timers.delete(id);t.after(()=>{globalThis.setInterval=originalSet;globalThis.clearInterval=originalClear;});
 const parameter=()=>({value:null,setTargetAtTime(v){this.value=v;},setValueAtTime(){},exponentialRampToValueAtTime(){}});
 class Context{constructor(){created++;this.currentTime=1;this.state='suspended';this.destination={};}async resume(){this.state='running';}suspend(){this.state='suspended';}close(){this.state='closed';}createGain(){return {gain:parameter(),connect(){},disconnect(){}};}createOscillator(){notes++;return {frequency:{...parameter(),setValueAtTime(frequency,time){tones.push({frequency,time});}},connect(){},disconnect(){},start(){},stop(){}};}}
 const config={...DEFAULT_AUDIO},storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},audio=createGameAudio({getConfig:()=>config,storage,AudioContext:Context});
 return {audio,config,storage,timers,Context,tones,get created(){return created;},get notes(){return notes;}};
}
test('áudio começa silencioso, só cria contexto por ativação e respeita efeitos/mute/admin',async t=>{
 const f=fixture(t);f.audio.play('attack');await f.audio.unlock();assert.equal(f.created,0);
 assert.equal(await f.audio.toggle(),true);assert.equal(f.created,1);assert.equal(f.audio.active,true);assert.equal(f.timers.size,1);
 const notes=f.notes;f.audio.play('special');assert.ok(f.notes>notes);
 await f.audio.setPreferences({effects:false});const muted=f.notes;f.audio.play('attack');assert.equal(f.notes,muted);
 f.audio.setScene('combat');assert.equal(f.created,1);assert.equal(f.timers.size,1);
 f.config.enabled=false;f.audio.refresh();assert.equal(f.timers.size,0);assert.equal(f.audio.active,false);const blocked=f.notes;f.audio.play('victory');assert.equal(f.notes,blocked);
 f.audio.dispose();
});
test('preferências ficam salvas e navegador sem suporte não simula áudio funcionando',async t=>{
 const f=fixture(t);await f.audio.toggle();await f.audio.setPreferences({music:false,volume:.4});
 const saved=JSON.parse(f.storage.getItem('liferobots-audio-v1'));assert.equal(saved.music,false);assert.equal(saved.volume,.4);f.audio.dispose();
 const unsupported=createGameAudio({AudioContext:null,storage:f.storage});assert.equal(unsupported.available,false);await unsupported.toggle();assert.equal(unsupported.active,false);unsupported.dispose();
});
test('trilhas gravadas carregam só após ativação, trocam no combate e respeitam mute/suspensão',async t=>{
 const f=fixture(t),players=[];
 class Media{constructor(src=''){this.src=src;this.volume=0;this.played=0;this.paused=true;players.push(this);}canPlayType(){return 'probably';}async play(){this.played++;this.paused=false;}pause(){this.paused=true;}removeAttribute(){this.src='';}load(){}}
 const audio=createGameAudio({getConfig:()=>f.config,storage:f.storage,AudioContext:f.Context,AudioElement:Media});
 assert.equal(players.length,0);await audio.toggle();assert.ok(players.some(p=>p.src.includes('music-aurora-v2.ogg')&&!p.paused));
 audio.setScene('combat');await Promise.resolve();assert.ok(players.some(p=>p.src.includes('music-pulse-v2.ogg')&&!p.paused));
 await audio.setPreferences({music:false});assert.ok(players.every(p=>p.paused));audio.suspend();assert.equal(audio.active,false);audio.dispose();
});

test('novos efeitos têm assinaturas distintas e volumes independentes no admin',async t=>{
 const f=fixture(t);f.config.music=false;await f.audio.toggle();const signatures=new Set();for(const kind of ['notification','message','collect','purchase','equip','upgrade']){const before=f.tones.length;f.audio.play(kind);const notes=f.tones.slice(before);assert.ok(notes.length>=2);signatures.add(JSON.stringify(notes));}assert.equal(signatures.size,6);
 const before=f.notes;f.config.acquisitionVolume=0;f.audio.play('purchase');assert.equal(f.notes,before);f.config.collectionVolume=0;f.audio.play('collect');assert.equal(f.notes,before);f.audio.play('notification');assert.ok(f.notes>before);await f.audio.setPreferences({effects:false});const muted=f.notes;f.audio.play('upgrade');assert.equal(f.notes,muted);f.audio.dispose();
});
test('som de sucesso acompanha ação confirmada e coleta vazia permanece sem som de moedas',()=>{
 assert.equal(successfulActionSound('collect',0),null);assert.equal(successfulActionSound('collect',250),'collect');assert.equal(successfulActionSound('collect',{collectedRC:8}),'collect');assert.equal(successfulActionSound('tutorial',0),null);assert.equal(successfulActionSound('buy_robot',{}),'purchase');assert.equal(successfulActionSound('equip',{}),'equip');assert.equal(successfulActionSound('upgrade_part',{}),'upgrade');assert.equal(successfulActionSound('chat_send',{}),'message');assert.equal(successfulActionSound('trade_review',{}, {accept:false}),'notification');assert.equal(successfulActionSound('admin_save',{}),null);
});
test('cada temporada muda exploração e combate; arena, saídas e escolha global não herdam trilha anterior',async t=>{
 const f=fixture(t),players=[];
 class Media{constructor(src=''){this.src=src;this.volume=0;players.push(this);}canPlayType(){return 'probably';}async play(){}pause(){}removeAttribute(){}load(){}}
 const audio=createGameAudio({getConfig:()=>f.config,storage:f.storage,AudioContext:f.Context,AudioElement:Media});await audio.toggle();
 for(const season of DEFAULT_SEASONS){audio.setScene({kind:'story',season});assert.equal(audio.nowPlaying.theme,season.musicTheme);assert.ok(players.at(-1).src.includes('music-'+season.musicTheme+'-v'+MUSIC_TRACKS[season.musicTheme].version+'.ogg'));assert.equal(players.at(-1).playbackRate,1);
  audio.setScene({kind:'combat',season});assert.equal(audio.nowPlaying.theme,season.combatTheme);assert.equal(players.at(-1).playbackRate,1);assert.ok(players.at(-1).src.includes('music-'+season.combatTheme+'-v'+MUSIC_TRACKS[season.combatTheme].version+'.ogg'));
 }
 audio.setScene('combat');assert.equal(audio.nowPlaying.theme,'pulse');assert.ok(players.at(-1).src.includes('music-pulse-v2.ogg'));assert.equal(players.at(-1).playbackRate,96/112);
 audio.setScene('home');assert.equal(audio.nowPlaying.theme,'aurora');f.config.seasonMusic=false;audio.setScene({kind:'story',season:DEFAULT_SEASONS[2]});assert.equal(audio.nowPlaying.theme,'aurora');audio.dispose();
});
test('sons de motores e especiais têm tom próprio por robô e volumes do admin bloqueiam a categoria',async t=>{
 const f=fixture(t);f.config.music=false;await f.audio.toggle();const signatures=new Set();for(const robot of C.DEFAULT_ROBOTS){const start=f.tones.length;f.audio.play('special',robot);signatures.add(f.tones.slice(start).map(t=>t.frequency).join(','));}assert.equal(signatures.size,15);
 const before=f.notes;f.config.specialVolume=0;f.audio.play('special',C.DEFAULT_ROBOTS[0]);f.audio.play('charge',C.DEFAULT_ROBOTS[1]);assert.equal(f.notes,before);f.config.battleVolume=0;f.audio.play('hit');f.audio.play('block');assert.equal(f.notes,before);f.audio.play('servo');assert.ok(f.notes>before);f.audio.dispose();
});
test('perfil de música aceita HTTPS por temporada, ritmo próprio e herança explícita do tema geral',()=>{
 const season={...DEFAULT_SEASONS[0],customMusicUrl:'https://cdn.example.test/roots.ogg',musicTempo:100};const profile=musicProfile(DEFAULT_AUDIO,{kind:'story',season});assert.equal(profile.url,season.customMusicUrl);assert.equal(profile.tempo,100);
 assert.equal(musicProfile(DEFAULT_AUDIO,{kind:'combat',season}).url,'');assert.equal(musicProfile(DEFAULT_AUDIO,{kind:'story',season:{...season,musicTheme:'',customMusicUrl:''}}).theme,'aurora');assert.equal(musicProfile(DEFAULT_AUDIO,{kind:'story',season:{...season,customMusicUrl:'javascript:bad'}}).url,'');
});
