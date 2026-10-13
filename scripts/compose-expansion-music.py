from pathlib import Path
import runpy
render=runpy.run_path(str(Path(__file__).with_name('compose-music.py')))['render']
THEMES={
 'tides':{'bpm':88,'roots':[50,57,53,58,50,60,57,55],'color':[0,3,7,14],'lead':[[12,19,14,22,19,17,14,12],[19,22,24,22,19,17,15,14]],'drums':.32,'leadVoice':'flute','arpVoice':'glass','padVoice':'pad'},
 'tides-duel':{'bpm':118,'roots':[45,53,50,55,45,57,53,52],'color':[0,3,7,10],'lead':[[12,19,24,22,19,17,15,12],[24,27,24,22,19,22,17,15]],'drums':.94,'leadVoice':'brass','arpVoice':'glass','padVoice':'strings'},
 'clockwork':{'bpm':102,'roots':[55,62,59,60,55,64,62,59],'color':[0,4,7,9],'lead':[[12,16,19,21,19,16,14,12],[19,16,21,24,21,19,16,14]],'drums':.45,'leadVoice':'marimba','arpVoice':'pluck','padVoice':'strings'},
 'clockwork-duel':{'bpm':132,'roots':[52,59,55,57,52,60,59,57],'color':[0,3,7,10],'lead':[[12,19,15,22,19,24,22,17],[24,27,29,27,24,22,19,15]],'drums':1,'leadVoice':'brass','arpVoice':'marimba','padVoice':'strings'},
 'memory':{'bpm':80,'roots':[56,61,59,54,56,64,61,59],'color':[0,4,7,14],'lead':[[19,23,26,23,21,19,16,14],[12,16,19,26,23,21,19,16]],'drums':.22,'leadVoice':'glass','arpVoice':'flute','padVoice':'pad'},
 'memory-duel':{'bpm':124,'roots':[49,57,54,59,49,61,57,54],'color':[0,3,7,14],'lead':[[12,19,26,24,22,19,17,15],[24,26,29,27,26,24,22,19]],'drums':.92,'leadVoice':'lead','arpVoice':'glass','padVoice':'strings'}
}
for theme in THEMES.values():
 theme['lead'] += [list(reversed(theme['lead'][0])),theme['lead'][1][2:]+theme['lead'][1][:2]]
if __name__=='__main__':
 for name,theme in THEMES.items():render(name,theme,7)
