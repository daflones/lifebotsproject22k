import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as C from '../src/core.js';
import {applyTextOverrides,safeRobotAsset} from '../src/game-ui.js';
function win(ticket){if(ticket.status==='travel')C.enterStory(ticket);for(let i=0;i<120&&!['won','lost'].includes(ticket.status);i++){if(ticket.status==='wave-cleared')C.nextStoryWave(ticket);else C.storyTurn(ticket,ticket.energy>=ticket.rules.energyMax?'special':'attack',.5);}assert.equal(ticket.status,'won');}
test('a atualização preserva saldos, robôs, preços editados e progresso sem repor exclusões posteriores',()=>{
 const s=C.initialState();delete s.contentRevision;delete s.chapters;delete s.seasons;delete s.arenaRoster;
 s.catalog=s.catalog.slice(0,3);s.catalog[0].price=1337;s.parts=s.parts.slice(0,4);s.story=6;s.balances.RC=321;delete s.settings.rules;delete s.settings.audio;
 const robots=C.clone(s.robots);C.hydrateState(s);assert.equal(s.catalog.length,15);assert.equal(s.parts.length,8);assert.equal(s.chapters.length,54);assert.equal(s.seasons.length,6);
 assert.equal(s.catalog[0].price,1337);assert.equal(s.balances.RC,321);assert.equal(s.story,6);assert.deepEqual(s.robots,robots);
 s.catalog=s.catalog.filter(x=>x.id!=='ember');C.hydrateState(s);assert.equal(s.catalog.length,14);
});
test('replay aceita preço e moeda por fase, falha antes de debitar e não paga novamente',()=>{
 const s=C.initialState();s.story=1;const c=s.chapters[0];c.replayCost=25;c.replayCurrency='LC';s.balances.LC=24;const before=C.clone(s);
 assert.throws(()=>C.beginStory(s,1,s.robots[0].uid),/Saldo insuficiente/);assert.deepEqual(s,before);
 s.balances.LC=100;const ticket=C.beginStory(s,1,s.robots[0].uid);assert.equal(s.balances.LC,75);assert.equal(ticket.entryFee.currency,'LC');
 win(ticket);assert.equal(C.resolveStory(s,ticket),0);assert.equal(s.balances.LC,75);
});
test('recarregar mantém a missão e sua entrada; mudanças do admin não alteram o contrato iniciado',()=>{
 let s=C.initialState();s.story=1;const t=C.beginStory(s,1,s.robots[0].uid),before=s.balances.RC;C.enterStory(t);C.storyTurn(t,'attack');
 const id=t.id,damage=t.rules.attackMultiplier;s=C.clone(s);s.settings.replayCost=900;s.settings.rules.attackMultiplier=4;s.chapters[0].power=999;s.chapters[0].enabled=false;
 const resumed=C.beginStory(s,1,s.robots[0].uid);assert.equal(resumed.id,id);assert.equal(resumed.turns,1);assert.equal(resumed.rules.attackMultiplier,damage);assert.equal(s.balances.RC,before);
 win(resumed);assert.equal(C.resolveStory(s,resumed),0);assert.equal(s.activeStory,null);
});
test('a primeira recompensa usa o valor congelado e novas fases/temporadas são validadas',()=>{
 const s=C.initialState(),t=C.beginStory(s,1,s.robots[0].uid);s.chapters[0].reward=999;win(t);assert.equal(C.resolveStory(s,t),120);
 const phase={...C.clone(s.chapters[0]),id:43,title:'Novo sinal'};C.saveChapter(s,phase);assert.equal(s.chapters.length,55);
 C.saveSeason(s,{id:'new',number:7,title:'Nova temporada',subtitle:'O próximo sinal',intro:'Explore.',from:43,to:43,scene:'space',guideRobotId:'orbit'});assert.equal(s.seasons.length,7);
 assert.throws(()=>C.saveChapter(s,{...phase,id:45}),/em ordem/);assert.throws(()=>C.saveSeason(s,{...s.seasons[6],id:'conflict'}),/em comum/);
});
test('novas artes são selecionáveis e textos personalizados não injetam HTML nem ocultam a identificação',()=>{
 assert.equal(safeRobotAsset({asset:'nova-sprites.png'}),'nova-sprites.png');
 const escape=s=>s.replaceAll('<','&lt;').replaceAll('>','&gt;');
 assert.equal(applyTextOverrides('<h1>Meu hangar</h1><small>Controlado pelo jogo</small>',{'Meu hangar':'<img src=x>','Controlado pelo jogo':'Jogador online'},escape),'<h1>&lt;img src=x&gt;</h1><small>Controlado pelo jogo</small>');
 assert.throws(()=>C.validateSettings({...C.DEFAULT_SETTINGS,replayCost:-1}),/replay/);assert.throws(()=>C.validateSettings({...C.DEFAULT_SETTINGS,audio:{...C.DEFAULT_AUDIO,masterVolume:9}}),/Volume/);
});
test('a migração de trilhas preserva personalizações, saldos e progresso e o admin valida as temporadas',()=>{
 const state=C.initialState();state.contentRevision=5;state.story=8;state.seasons[0].musicTheme='cosmos';state.seasons[0].musicTempo=90;delete state.seasons[1].musicTheme;delete state.seasons[1].combatTheme;const balances=C.clone(state.balances);
 C.hydrateState(state);assert.equal(state.seasons[0].musicTheme,'cosmos');assert.equal(state.seasons[0].musicTempo,90);assert.equal(state.seasons[1].musicTheme,'frontier');assert.equal(state.seasons[1].combatTheme,'frontier-duel');assert.equal(state.story,8);assert.deepEqual(state.balances,balances);
 const season=C.clone(state.seasons[1]);assert.throws(()=>C.saveSeason(state,{...season,musicTheme:'unknown'}),/Trilha/);assert.throws(()=>C.saveSeason(state,{...season,combatTempo:900}),/Ritmo/);assert.throws(()=>C.saveSeason(state,{...season,customMusicUrl:'http://bad.test/music'}),/HTTPS/);C.saveSeason(state,{...season,musicTheme:'starlight',combatTempo:112});assert.equal(state.seasons[1].musicTheme,'starlight');
});
