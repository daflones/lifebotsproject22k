import {test,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {t,setLocale,getLocale,resetI18n,countryToLocale,LOCALES,LOCALE_LABELS,localeTag,initI18n,translateDom} from '../src/i18n.js';

afterEach(()=>resetI18n());

test('cinco idiomas suportados com nomes nativos',()=>{
 assert.deepEqual(LOCALES,['pt','en','es','ru','ja']);
 for(const code of LOCALES)assert.ok(LOCALE_LABELS[code],code);
});
test('português é o idioma fonte e devolve o texto original',()=>{
 assert.equal(getLocale(),'pt');
 assert.equal(t('Entrar'),'Entrar');
});
test('textos conhecidos traduzem em cada idioma',()=>{
 setLocale('en',false);assert.equal(t('Entrar'),'Sign in');assert.equal(t('Carteira'),'Wallet');
 setLocale('es',false);assert.equal(t('Entrar'),'Entrar');assert.equal(t('Carteira'),'Cartera');
 setLocale('ru',false);assert.equal(t('Entrar'),'Войти');assert.equal(t('Carteira'),'Кошелёк');
 setLocale('ja',false);assert.equal(t('Entrar'),'ログイン');assert.equal(t('Carteira'),'ウォレット');
});
test('strings fora do dicionário passam sem alteração',()=>{
 setLocale('en',false);
 assert.equal(t('Nome de piloto customizado'),'Nome de piloto customizado');
});
test('espaços e quebras de linha são normalizados na busca',()=>{
 setLocale('en',false);
 assert.equal(t('  Entrar\n  no hangar'),t('Entrar no hangar'));
});
test('localStorage guarda a escolha manual',()=>{
 const mem={};globalThis.localStorage={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v;}};
 const realNavigator=globalThis.navigator;
 Object.defineProperty(globalThis,'navigator',{value:{language:'fr-FR'},configurable:true});
 initI18n();assert.equal(getLocale(),'en','idioma não suportado vira inglês');
 setLocale('es');assert.equal(mem['lifebots-lang'],'es');assert.equal(getLocale(),'es');
 initI18n();assert.equal(getLocale(),'es','escolha manual vence a detecção');
 Object.defineProperty(globalThis,'navigator',{value:realNavigator,configurable:true});
 delete globalThis.localStorage;
});
test('idioma do navegador é respeitado antes do IP responder',()=>{
 globalThis.localStorage={getItem:()=>null,setItem(){}};
 const realNavigator=globalThis.navigator;
 Object.defineProperty(globalThis,'navigator',{value:{language:'pt-BR'},configurable:true});
 initI18n();assert.equal(getLocale(),'pt');
 Object.defineProperty(globalThis,'navigator',{value:{language:'ja-JP'},configurable:true});
 resetI18n();initI18n();assert.equal(getLocale(),'ja');
 Object.defineProperty(globalThis,'navigator',{value:realNavigator,configurable:true});
 delete globalThis.localStorage;
});
test('país detectado por IP mapeia para o idioma',()=>{
 assert.equal(countryToLocale('br'),'pt');
 assert.equal(countryToLocale('MX'),'es');
 assert.equal(countryToLocale('RU'),'ru');
 assert.equal(countryToLocale('jp'),'ja');
 assert.equal(countryToLocale('US'),'en');
 assert.equal(countryToLocale('DE'),'en');
 assert.equal(countryToLocale(''),'en');
});
test('localeTag alimenta Intl.NumberFormat',()=>{
 assert.equal(localeTag(),'pt-BR');
 setLocale('ja',false);assert.equal(localeTag(),'ja');
});
test('translateDom ignora português e ambientes sem DOM',()=>{
 translateDom(null);
 setLocale('en',false);translateDom(null);
});
test('translateDom traduz nós de texto e atributos',()=>{
 setLocale('en',false);
 const mini={nodeType:1,ownerDocument:null,querySelectorAll:()=>[],getAttribute:()=>null,setAttribute(){}};
 const textNode={nodeValue:'Entrar'};
 const doc={createTreeWalker:()=>({nextNode:(()=>{let used=false;return()=>used?null:(used=true,textNode);})()})};
 mini.ownerDocument=doc;
 translateDom(mini);
 assert.equal(textNode.nodeValue,'Sign in');
});
