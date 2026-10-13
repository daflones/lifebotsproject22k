"""Seis loops originais: exploração e batalha de cada temporada.
Executar: python scripts/compose-season-music.py. Sem samples externos.
"""
from pathlib import Path
import runpy
render=runpy.run_path(str(Path(__file__).with_name('compose-music.py')))['render']
THEMES={
 'verdant':{'bpm':92,'roots':[55,60,57,53,55,62,60,57],'color':[0,4,7,9],'lead':[[12,14,16,19,16,14,12,9],[7,12,14,16,19,16,14,12],[16,19,21,19,16,14,12,7],[12,16,14,12,9,7,9,12]],'drums':.32,'leadVoice':'flute','arpVoice':'marimba','padVoice':'strings'},
 'verdant-duel':{'bpm':116,'roots':[52,55,60,57,52,55,62,59],'color':[0,3,7,10],'lead':[[12,19,15,22,19,17,15,12],[19,22,24,19,22,24,27,24],[15,12,19,17,22,19,15,14],[24,22,19,17,15,19,14,12]],'drums':.83,'leadVoice':'brass','arpVoice':'marimba','padVoice':'strings','kickPattern':[0,1.75,2.5]},
 'frontier':{'bpm':104,'roots':[50,57,53,55,50,58,57,55],'color':[0,3,7,14],'lead':[[12,15,19,22,19,15,14,12],[14,19,22,24,22,19,15,14],[19,17,15,12,10,12,15,19],[22,24,22,19,17,15,14,12]],'drums':.56,'leadVoice':'marimba','arpVoice':'pluck','padVoice':'pad'},
 'frontier-duel':{'bpm':128,'roots':[45,53,50,52,45,55,53,52],'color':[0,3,7,10],'lead':[[12,15,12,19,17,22,19,15],[24,22,19,22,24,27,24,22],[19,15,17,12,15,19,22,17],[27,24,22,19,22,17,15,12]],'drums':1,'leadVoice':'lead','arpVoice':'brass','padVoice':'strings','kickPattern':[0,.75,2,2.75]},
 'starlight':{'bpm':82,'roots':[56,52,59,54,56,61,59,54],'color':[0,4,7,14],'lead':[[19,14,16,23,21,19,14,12],[12,19,26,23,21,19,16,14],[23,21,19,16,14,12,11,14],[19,23,26,28,26,23,21,19]],'drums':.23,'leadVoice':'glass','arpVoice':'glass','padVoice':'pad'},
 'starlight-duel':{'bpm':122,'roots':[49,57,54,52,49,59,57,54],'color':[0,3,7,14],'lead':[[12,19,26,22,19,24,22,15],[24,26,27,24,22,19,22,26],[19,15,22,26,24,22,19,14],[27,26,24,22,19,22,15,12]],'drums':.9,'leadVoice':'lead','arpVoice':'glass','padVoice':'strings','kickPattern':[0,1.5,2,3.25]}
}
if __name__=='__main__':
 for name,theme in THEMES.items():render(name,theme,6)
