import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assetUrl,visibleAccent,safeRobotAsset,GAME_VERSION} from '../src/game-ui.js';
test('moedas e robôs usam imagens com versão própria para evitar cache antigo',()=>{
 assert.equal(GAME_VERSION,'0.8.0');assert.equal(assetUrl('lifecoin.png'),'./assets/lifecoin.webp?v=0.8.0');assert.match(assetUrl(safeRobotAsset({asset:'titan-sprites.png'})),/titan-sprites.webp\?v=/);
 assert.equal(safeRobotAsset({asset:'missing.png'}),'moss-sprites.png');
});
test('uma cor antiga preta é legível sem alterar a configuração armazenada',()=>{
 const settings={accent:'#000000'},visible=visibleAccent(settings.accent);assert.equal(settings.accent,'#000000');assert.notEqual(visible,'#000000');
 assert.equal(visibleAccent('#ffda7c'),'#ffda7c');assert.match(visibleAccent('not-a-color'),/^#[a-f\d]{6}$/i);
});
