"""Três trilhas originais para LifeBots. Sem samples externos ou melodias licenciadas.
Recriação: python scripts/compose-music.py (numpy, scipy e ffmpeg).
"""
from pathlib import Path
import tempfile, subprocess
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io.wavfile import write

SR=32000
OUT=Path(__file__).resolve().parents[1]/'dist'/'assets'
OUT.mkdir(parents=True,exist_ok=True)
THEMES={
 'aurora':{'bpm':96,'roots':[57,53,60,55,57,53,62,52], 'color':[0,4,7,11], 'lead':[[12,16,19,16,14,12,7,11],[12,14,16,19,21,19,16,14],[19,16,14,12,11,7,9,12],[16,19,23,21,19,16,14,11]],'drums':.55},
 'pulse':{'bpm':112,'roots':[50,46,53,48,50,46,55,45], 'color':[0,3,7,10], 'lead':[[12,15,19,22,19,15,14,12],[19,22,24,22,19,17,15,14],[12,19,15,22,17,24,22,19],[24,22,19,17,15,14,12,10]],'drums':.9},
 'cosmos':{'bpm':84,'roots':[52,48,55,50,52,48,57,47], 'color':[0,4,7,14], 'lead':[[19,16,14,12,7,11,14,16],[12,19,23,21,19,16,14,12],[16,14,12,11,7,9,12,14],[19,23,26,23,21,19,16,14]],'drums':.35}
}

def render(name,theme,version=2):
 beat=60/theme['bpm'];bar=4*beat;duration=32*bar
 count=round(duration*SR);music=np.zeros((count,2),np.float64);rng=np.random.default_rng(941+sum(ord(c) for c in name))
 def mix(sound,at,level,pan=0):
  start=round(at*SR)%count;signal=np.asarray(sound)*level
  stereo=signal[:,None]*np.array([np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)])[None,:]
  # Caudas atravessam a emenda: um loop sem silêncio ou corte brusco.
  offset=0
  while offset<len(stereo):
   amount=min(count-start,len(stereo)-offset);music[start:start+amount]+=stereo[offset:offset+amount];offset+=amount;start=0
 def note(midi,at,length,level,voice='bell',pan=0):
  t=np.arange(round(length*SR))/SR;f=440*2**((midi-69)/12);phase=2*np.pi*f*t
  if voice=='pad':
   sig=(np.sin(phase)+.28*np.sin(phase*2+.11)+.14*np.sin(phase*3)+.24*np.sin(phase+2*np.pi*.35*t))/1.65
   env=np.minimum(t/.25,1)*np.minimum((length-t)/.5,1)
  elif voice=='strings':
   sig=(np.sin(phase)+.3*np.sin(phase*2)+.12*np.sin(phase*3)+.18*np.sin(phase+2*np.pi*.7*t))/1.5
   env=np.minimum(t/.16,1)*np.minimum((length-t)/.42,1)
  elif voice=='flute':
   vibrato=.012*np.sin(2*np.pi*4.6*t)*np.minimum(t/.3,1);sig=np.sin(phase+vibrato)+.18*np.sin(2*phase)+.07*np.sin(3*phase)
   env=np.minimum(t/.035,1)*np.minimum((length-t)/.16,1)*np.exp(-t*.8)
  elif voice=='marimba':sig=np.sin(phase)+.35*np.sin(phase*3.98)*np.exp(-t*15);env=(1-np.exp(-t*240))*np.exp(-t*5.5)
  elif voice=='brass':
   sig=sum(np.sin(phase*j)*np.exp(-t*j*.65)/j for j in range(1,7))/1.8;env=np.minimum(t/.035,1)*np.minimum((length-t)/.12,1)
  elif voice=='glass':sig=np.sin(phase)+.35*np.sin(phase*2.76)*np.exp(-t*3)+.18*np.sin(phase*5.4)*np.exp(-t*6);env=(1-np.exp(-t*150))*np.exp(-t*2.2)
  elif voice=='lead':sig=np.sin(phase+1.1*np.sin(phase*2)*np.exp(-t*2.5))+.14*np.sin(phase*3);env=np.minimum(t/.02,1)*np.minimum((length-t)/.1,1)*np.exp(-t*1.2)
  elif voice=='bass':sig=np.sin(phase)+.19*np.sin(2*phase);env=(1-np.exp(-t*90))*np.exp(-t*2.4)
  elif voice=='pluck':sig=np.sin(phase)+.32*np.sin(phase*2)+.13*np.sin(phase*3);env=(1-np.exp(-t*150))*np.exp(-t*7)
  else:sig=np.sin(phase+1.6*np.sin(phase*2)*np.exp(-t*5))+.12*np.sin(phase*3);env=(1-np.exp(-t*180))*np.exp(-t*3.2)
  mix(sig*env,at,level,pan)
 def noise(length,high,low):
  x=rng.normal(0,1,round(length*SR));return sosfilt(butter(2,[low,high],btype='bandpass',fs=SR,output='sos'),x)
 def drum(kind,at,level):
  if kind=='kick':
   t=np.arange(round(.32*SR))/SR;phase=2*np.pi*(44*t+(110-44)*(1-np.exp(-t*35))/35);sig=np.sin(phase)*np.exp(-t*15)
  elif kind=='snare':
   t=np.arange(round(.19*SR))/SR;sig=noise(.19,7000,900)*np.exp(-t*24)+.3*np.sin(2*np.pi*170*t)*np.exp(-t*30)
  else:
   t=np.arange(round(.08*SR))/SR;sig=noise(.08,14000,6500)*np.exp(-t*70)
  mix(sig,at,level,.23 if kind=='hat' else 0)
 for b in range(32):
  root=theme['roots'][b%8];start=b*bar;bridge=16<=b<24;intro=b<4
  # Acordes, baixo, arpejo e melodia têm partes próprias.
  for j,interval in enumerate(theme['color']):note(root+interval,start,bar+.8,.045,theme.get('padVoice','pad'),(j-1.5)*.3)
  for position in [0,1.5,2,3.5]:note(root-12+(7 if position==3.5 else 0),start+position*beat,beat*.9,.12 if not bridge else .08,'bass')
  for step in range(8):
   interval=theme['color'][(step+b)%4]+12
   note(root+interval,start+step*beat/2,beat*.7,.035 if name!='pulse' else .045,theme.get('arpVoice','pluck'),(-1 if step%2 else 1)*.55)
   if not intro and (not bridge or step%2==0):
    melody=theme['lead'][(b//2)%4];transpose=12 if b>=28 and step%4==0 else 0
    note(root+melody[step]+transpose,start+step*beat/2,beat*(.8 if not bridge else 1.4),.085 if not bridge else .07,theme.get('leadVoice','bell'),.1)
  density=theme['drums']*(.5 if intro or bridge else 1)
  for position in theme.get('kickPattern',[0,2,2.75] if name=='pulse' else [0,2]):drum('kick',start+position*beat,.18*density)
  for position in [1,3]:drum('snare',start+position*beat,.16*density)
  for step in range(8):drum('hat',start+step*beat/2,.07*density*(.7 if step%2 else 1))
  if b%8==7:
   for j in range(3):note(root+24+theme['color'][j],start+(3+j/3)*beat,beat,.06,'bell',.4-j*.4)
 dry=music.copy()
 for seconds,wet in [(.113,.13),(.227,.1),(.389,.065),(.571,.035)]:
  delay=round(seconds*SR);music[:,0]+=np.roll(dry[:,1],delay)*wet;music[:,1]+=np.roll(dry[:,0],delay)*wet
 music=sosfilt(butter(2,32,btype='highpass',fs=SR,output='sos'),music,axis=0)
 music=np.tanh(music*1.6);music*=.92/max(.001,np.abs(music).max())
 with tempfile.TemporaryDirectory(prefix='liferobots-music-') as tmp:
  wav=Path(tmp)/'track.wav';write(wav,SR,(music*32767).astype(np.int16))
  for extension,encoder in [('ogg',['-c:a','libvorbis','-q:a','5']),('mp3',['-c:a','libmp3lame','-b:a','160k'])]:
   target=OUT/f'music-{name}-v{version}.{extension}'
   subprocess.run(['ffmpeg','-loglevel','error','-y','-i',str(wav),'-af','loudnorm=I=-19:TP=-1.5:LRA=8','-ar','48000',*encoder,str(target)],check=True)
 print(f'{name}: {theme["bpm"]} BPM, {duration:.2f}s, 32 compassos, estéreo, pico de fonte {np.abs(music).max():.3f}')

if __name__=='__main__':
 for name,theme in THEMES.items():render(name,theme)
