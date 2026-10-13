import test from 'node:test';
import assert from 'node:assert/strict';
import {publicAppearance} from '../supabase/functions/_shared/public-content.js';
test('login público recebe personalização e mídias sem informações de contas ou pagamentos',()=>{
 const view=publicAppearance({name:'Meu jogo',logoArt:'media:logo',copy:{loginTitle:'Bem-vindo'},audio:{customMusicUrl:'media:music'},secret:'private',commissions:[100],real_money_enabled:true},[{id:'hero',name:'Guardião',asset:'media:hero',identity:{artKind:'portrait',price:999},private:'private'}]);
 assert.equal(view.settings.copy.loginTitle,'Bem-vindo');assert.equal(view.catalog[0].artKind,'portrait');assert.deepEqual(view.mediaRefs,['media:logo','media:music','media:hero']);assert.equal(view.settings.secret,undefined);assert.equal(view.settings.real_money_enabled,undefined);assert.equal(view.catalog[0].private,undefined);assert.equal(view.catalog[0].price,undefined);
});
