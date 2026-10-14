import {mediaUrl} from './media.js';
// Música gravada e efeitos originais sintetizados no aparelho, sem samples externos.
import {EFFECT_CUES} from './audio-effects.js';
import {DEFAULT_AUDIO} from './content.js';
import {assetUrl} from './game-ui.js';
import {MUSIC_TRACKS,musicProfile} from './music-catalog.js';
import {robotCombatProfile} from './combat-profiles.js';
export {MUSIC_TRACKS} from './music-catalog.js';
export const musicTheme=(config,scene)=>musicProfile(config,scene).theme;
const PREF_KEY='liferobots-audio-v1';
export function createGameAudio({getConfig=()=>DEFAULT_AUDIO,storage=globalThis.localStorage,AudioElement=globalThis.Audio,AudioContext=globalThis.window?.AudioContext||globalThis.window?.webkitAudioContext}={}){
 let preferences={enabled:false,music:true,effects:true,volume:1};
 try{preferences={...preferences,...JSON.parse(storage?.getItem(PREF_KEY)||'{}')};}catch{}
 let context=null,master=null,musicBus=null,effectsBus=null,interval=null,scene='home',step=0,musicPlayer=null,previousPlayer=null,musicKey='',fadeTimer=null,fadeGeneration=0;
 const effectPlayers=new Set();
 const stopEffects=()=>{for(const player of effectPlayers)player.pause?.();effectPlayers.clear();};
 const config=()=>({...DEFAULT_AUDIO,...getConfig()});
 const persist=()=>{try{storage?.setItem(PREF_KEY,JSON.stringify(preferences));}catch{}};
 function gains(){if(!context)return;const c=config(),at=context.currentTime;if(!c.enabled||!c.effects||!preferences.enabled||!preferences.effects)stopEffects();for(const player of effectPlayers)player.volume=Math.min(1,c.masterVolume*c.effectsVolume*(c[player._effectGroup]??1)*preferences.volume);
  master.gain.setTargetAtTime(c.enabled&&preferences.enabled?c.masterVolume*preferences.volume:0,at,.04);
  musicBus.gain.setTargetAtTime(c.music&&preferences.music?c.musicVolume:0,at,.04);
  effectsBus.gain.setTargetAtTime(c.effects&&preferences.effects?c.effectsVolume:0,at,.01);
  if(musicPlayer)musicPlayer.volume=musicVolume();
 }
 function tone(frequency,at,duration=.12,volume=.15,type='sine',bus=effectsBus,endFrequency=frequency){
  if(!context||!bus)return;const oscillator=context.createOscillator(),gain=context.createGain();
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,at);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  oscillator.connect(gain);gain.connect(bus);oscillator.start(at);oscillator.stop(at+duration+.02);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 function noise(at,duration,volume,cutoff){
  if(!context?.createBuffer||!context.createBufferSource||!context.createBiquadFilter)return;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate),samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/samples.length)**.7;
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.setValueAtTime(Math.min(cutoff,context.sampleRate*.4),at);gain.gain.setValueAtTime(volume,at);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);source.connect(filter);filter.connect(gain);gain.connect(effectsBus);source.start(at);source.stop(at+duration);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
 }
 function musicVolume(){const c=config();return c.enabled&&c.music&&preferences.enabled&&preferences.music?Math.min(1,c.masterVolume*preferences.volume*c.musicVolume):0;}
 function stopMusic(){if(interval!==null){clearInterval(interval);interval=null;}fadeGeneration++;if(fadeTimer!=null){clearTimeout(fadeTimer);fadeTimer=null;}musicPlayer?.pause?.();previousPlayer?.pause?.();previousPlayer=null;}
 function mediaSource(profile){if(profile.url)return profile.url;
  const probe=new AudioElement(),extension=probe.canPlayType?.('audio/ogg')?'ogg':'mp3';return assetUrl('music-'+profile.theme+'-v'+MUSIC_TRACKS[profile.theme].version+'.'+extension);
 }
 function startMediaMusic(){const profile=musicProfile(config(),scene),source=mediaSource(profile),rate=profile.url?1:Math.max(.4,Math.min(2,profile.tempo/MUSIC_TRACKS[profile.theme].bpm));if(source===musicKey&&musicPlayer){musicPlayer.volume=musicVolume();musicPlayer.playbackRate=rate;void musicPlayer.play().catch(()=>{});return;}
  previousPlayer?.pause?.();previousPlayer=musicPlayer;const oldVolume=previousPlayer?.volume||0;
  musicPlayer=new AudioElement(source);musicKey=source;musicPlayer.loop=true;musicPlayer.preload='none';musicPlayer.volume=0;musicPlayer.playbackRate=rate;musicPlayer.preservesPitch=true;
  const player=musicPlayer,generation=++fadeGeneration;void player.play().then(()=>{let frame=0;const fade=()=>{if(generation!==fadeGeneration)return;frame++;const portion=Math.min(1,frame/15);player.volume=musicVolume()*portion;if(previousPlayer)previousPlayer.volume=oldVolume*(1-portion);if(portion<1)fadeTimer=setTimeout(fade,40);else{previousPlayer?.pause?.();previousPlayer=null;fadeTimer=null;}};fade();}).catch(()=>{if(generation!==fadeGeneration)return;previousPlayer?.pause?.();previousPlayer=null;musicKey='';if(interval!==null)clearInterval(interval);musicTick();interval=setInterval(musicTick,60000/profile.tempo/2);});
 }

 function musicTick(){if(!context||context.state!=='running'||!preferences.enabled||!config().enabled)return;
  const c=config();if(!c.music||!preferences.music)return;const profile=musicProfile(c,scene),combat=profile.kind==='combat';
  const themes={aurora:[0,7,12,10,3,7,15,10],pulse:[0,3,7,12,0,7,10,15],cosmos:[0,7,14,12,3,10,17,14]};
  const sequence=themes[profile.theme]||(profile.theme.startsWith('starlight')?themes.cosmos:profile.theme.startsWith('frontier')?themes.pulse:themes.aurora),base=combat?130.81:98,frequency=base*2**(sequence[step%sequence.length]/12),at=context.currentTime+.03;
  tone(frequency,at,combat?.2:.45,combat?.11:.09,'triangle',musicBus);if(step%4===0){tone(base/2,at,.6,.07,'sine',musicBus);[0,3,7].forEach((semitone,i)=>tone(base*2**(semitone/12),at,.75,.028,'sine',musicBus));}step++;
 }
 function startMusic(){const c=config();if(!context||!c.enabled||!c.music||!preferences.enabled||!preferences.music){stopMusic();return;}if(AudioElement){startMediaMusic();return;}if(interval!==null)clearInterval(interval);musicTick();const profile=musicProfile(c,scene);interval=setInterval(musicTick,60000/profile.tempo/(profile.kind==='combat'?2:1));}
 async function unlock(){if(!config().enabled||!preferences.enabled||!AudioContext)return false;
  try{if(!context){context=new AudioContext();master=context.createGain();musicBus=context.createGain();effectsBus=context.createGain();master.connect(context.destination);musicBus.connect(master);effectsBus.connect(master);}
   if(context.state==='suspended'){const resumed=context.resume();if(AudioElement)startMusic();await resumed;}gains();if(interval===null)startMusic();return context.state==='running';
  }catch{return false;}
 }
 async function toggle(){preferences.enabled=!preferences.enabled;persist();if(preferences.enabled){const ready=await unlock();if(!ready){preferences.enabled=false;persist();return false;}play('select');}else{stopEffects();gains();stopMusic();}return preferences.enabled;}
 async function setPreferences(next){preferences={...preferences,...next,volume:Math.max(0,Math.min(1,Number(next.volume??preferences.volume)))};persist();if(preferences.enabled)await unlock();gains();if(preferences.enabled)startMusic();else stopMusic();}
 function play(kind,robot){const c=config();if(!context||context.state!=='running'||!c.enabled||!c.effects||!preferences.enabled||!preferences.effects)return;
  const at=context.currentTime+.005,cue=EFFECT_CUES[kind==='coins'?'collect':kind];if(cue&&c.customEffects?.[cue.volume]&&AudioElement){const url=mediaUrl(c.customEffects[cue.volume]);if(url&&c[cue.volume]>0){if(effectPlayers.size>=8){const old=effectPlayers.values().next().value;old.pause?.();effectPlayers.delete(old);}const player=new AudioElement(url);effectPlayers.add(player);player._effectGroup=cue.volume;player.volume=Math.min(1,c.masterVolume*c.effectsVolume*c[cue.volume]*preferences.volume);player.onended=player.onerror=()=>effectPlayers.delete(player);Promise.resolve(player.play()).catch(()=>effectPlayers.delete(player));return;}}
  if(cue){const level=Math.max(0,Math.min(1,Number(c[cue.volume]??1)));if(!level)return;const profile=robot?robotCombatProfile(robot):null,pitch=profile?.pitch||1;for(const [frequency,start,duration,volume,type,endFrequency] of cue.notes)tone(frequency*pitch,at+start,duration,volume*level,type,effectsBus,(endFrequency??frequency)*pitch);for(const [start,duration,volume,cutoff] of cue.noise||[])noise(at+start,duration,volume*level,cutoff*pitch);return;}
  tone(660,at,.06,.06,'sine',effectsBus,880);
 }
 function setScene(next){if(JSON.stringify(scene)===JSON.stringify(next))return;scene=typeof next==='object'?{...next,season:next.season?{...next.season}:null}:next;step=0;if(context)startMusic();}
 function refresh(){gains();startMusic();}
 function suspend(){stopEffects();stopMusic();context?.suspend?.();}
 function dispose(){stopEffects();stopMusic();if(musicPlayer){musicPlayer.removeAttribute?.('src');musicPlayer.load?.();}musicPlayer=null;context?.close?.();context=null;}
 return {unlock,toggle,setPreferences,play,setScene,refresh,suspend,dispose,get nowPlaying(){return musicProfile(config(),scene);},get preferences(){return {...preferences};},get available(){return !!AudioContext;},get active(){return !!context&&context.state==='running'&&preferences.enabled&&config().enabled;}};
}
