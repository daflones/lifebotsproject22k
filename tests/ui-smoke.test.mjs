import {test} from 'node:test';
import assert from 'node:assert/strict';
const listeners={},data=new Map(),elements=new Map();
function el(){return {innerHTML:'',setAttribute(){},focus(){},append(){},classList:{add(){},remove(){},toggle(){}},dataset:{}};}
for(const id of ['#app','#modal-root','#toast-root','#main-content','#chat-root'])elements.set(id,el());
globalThis.document={querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],addEventListener:(name,fn,options)=>{if(name==='click'&&options===true)listeners.clickCapture=fn;else listeners[name]=fn;},createElement:()=>({...el(),click(){},remove(){}}),activeElement:el(),body:el(),documentElement:{style:{setProperty(){}}}};
elements.get('#modal-root').addEventListener=()=>{};
let browserHash='#home';globalThis.location={get hash(){return browserHash;},set hash(value){browserHash=value.startsWith('#')?value:'#'+value;},get href(){return this.origin+'/'+this.hash;},origin:'https://liferobots.test',protocol:'https:'};
globalThis.window={LIFEBOTS_CONFIG:{mode:'demo',allowDemo:true},addEventListener:(name,fn,options)=>{if(name==='click'&&options===true)listeners.clickCapture=fn;else listeners[name]=fn;},scrollTo(){}};
globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
Object.defineProperty(globalThis,'navigator',{value:{},configurable:true});
globalThis.setInterval=()=>0;globalThis.setTimeout=fn=>{fn();return 0;};
globalThis.FormData=class{constructor(form){this.entriesValue=Object.entries(form.fields||{});}*[Symbol.iterator](){yield* this.entriesValue;}getAll(k){return this.entriesValue.filter(x=>x[0]===k).map(x=>x[1]);}};
await import('../src/app.js');
const html=()=>elements.get('#app').innerHTML+elements.get('#chat-root').innerHTML;
const chatHTML=()=>elements.get('#chat-root').innerHTML;
const modal=()=>elements.get('#modal-root').innerHTML;
const click=async(action,id,more={})=>{const target={dataset:{a:action,id,...more},disabled:false};await listeners.click({target:{closest:()=>target}});};
test('o novo hangar identifica a versão, exibe as duas moedas e usa imagens nos três robôs',()=>{
 location.hash='#home';listeners.hashchange();assert.match(html(),/v0\.8\.0/);
 for(const name of ['lifecoin','robotcoin'])assert.match(html(),new RegExp(`<img[^>]+${name}\\.webp\\?v=0\\.8\\.0`));
 location.hash='#shop';listeners.hashchange();
 for(const name of ['moss','volt','titan'])assert.match(html(),new RegExp(`<img[^>]+${name}-sprites\\.webp`));
});
test('todas as telas principais produzem conteúdo navegável sem erro',()=>{
 for(const [route,phrase] of [['home','Hangar principal'],['robots','Pequenos robôs.'],['story','O mundo tem uma nova chance.'],['arena','Encontre seu próximo adversário.'],['shop','Construa sua próxima versão.'],['wallet','Tudo em um só lugar.'],['affiliates','Uma jornada que cresce junto.'],['admin','O universo, do seu jeito.'],['login','Seu hangar espera por você.']]){
  location.hash='#'+route;listeners.hashchange();assert.ok(html().includes(phrase),`Faltou conteúdo em ${route}`);
 }
});
test('botões de compra abrem confirmação e atualizam a equipe',async()=>{
 location.hash='#shop';listeners.hashchange();await click('buy-robot','moss');assert.match(modal(),/Um novo companheiro/);
 assert.match(modal(),/GERAÇÃO POR DIA/);assert.match(modal(),/Estimativa em 7 dias/);assert.match(modal(),/0,30/);
 await click('buy-robot-confirm','moss');const s=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(s.robots.length,3);assert.equal(s.balances.LC,2350);assert.equal(modal(),'');
 await click('buy-part','core');assert.match(modal(),/Muitas possibilidades/);await click('buy-part-confirm','core');
 assert.equal(JSON.parse(data.get('liferobots-demo-v1')).inventory.length,1);
});
test('abas administrativas e de oficina mostram seus controles',async()=>{
 location.hash='#admin';listeners.hashchange();await click('admin-tab','layout');assert.match(html(),/Título do aviso/);
 await click('admin-tab','parts');assert.match(html(),/Equipamentos e compatibilidade/);
 location.hash='#shop';listeners.hashchange();await click('shop-tab','inventory');assert.match(html(),/Pulso Verde/);
});
test('tutorial usa quatro passos e paga uma única vez pela interface',async()=>{
 await click('tutorial');assert.match(modal(),/PASSO 1 DE 4/);
 for(let i=0;i<3;i++)await click('tutorial-next');assert.match(modal(),/Resgatar 300 LC/);
 await click('tutorial-claim');assert.equal(JSON.parse(data.get('liferobots-demo-v1')).profile.tutorial,true);
 await click('tutorial');assert.equal(modal(),'');
});
test('login demo não persiste senha e mantém nome escapado no HTML',async()=>{
 location.hash='#login';listeners.hashchange();elements.set('#auth-status',{textContent:''});
 const button={disabled:false},form={id:'auth-form',fields:{name:'<Nova>',email:'nova@example.test',password:'nunca-persista-esta-senha'},querySelector:()=>button};
 await listeners.submit({preventDefault(){},target:form});
 const raw=data.get('liferobots-demo-v1');assert.ok(!raw.includes('nunca-persista-esta-senha'));assert.ok(!raw.includes('password'));
 listeners.hashchange();assert.ok(html().includes('&lt;Nova&gt;'));assert.ok(!html().includes('<Nova>'));
});
test('o botão Explorar inicia a missão e o prêmio só aparece após o combate',async()=>{
 location.hash='#story';listeners.hashchange();await click('chapter','1');assert.match(modal(),/data-a="story-start"/);
 assert.match(modal(),/ENCONTROS/);await click('story-start','1');assert.match(modal(),/NEXA/);await click('story-skipintro');
 const s=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(s.story,1);assert.equal(s.storyRuns[0].win,true);
 assert.match(modal(),/MISSÃO CONCLUÍDA/);assert.match(modal(),/\+120 RC/);
});

test('campanha, temporadas, adversários e áudio têm editores acessíveis no admin',async()=>{
 location.hash='#admin';listeners.hashchange();
 for(const [tab,phrase] of [['campaign','Temporadas (6)'],['arena-config','Adversários (15)'],['combat','Combate, progressão'],['audio','Sons do universo'],['copy','Títulos e navegação']]){await click('admin-tab',tab);assert.ok(html().includes(phrase));}
 await click('edit-chapter','7');assert.match(modal(),/Quantidade de encontros/);assert.match(modal(),/Nome/);await click('close');
 await click('edit-season','frontiers');assert.match(modal(),/Mensagem e história do guia/);await click('close');
 await click('edit-rival','flare');assert.match(modal(),/Flare/);await click('close');
 location.hash='#story';listeners.hashchange();await click('season-select','stars');assert.match(html(),/Além das estrelas/);assert.match(html(),/O farol da vida/);
 location.hash='#login';listeners.hashchange();assert.match(html(),/game-auth/);assert.match(html(),/auth-team/);await click('auth-tab','signup');assert.match(html(),/Criar meu piloto/);assert.match(html(),/Nome do piloto/);
});
test('seleção de robô tem imagens, atualiza a equipe no hangar e preserva o nível',async()=>{
 location.hash='#arena';listeners.hashchange();assert.match(html(),/robot-picker-options/);assert.match(html(),/picker-portrait/);
 await click('pick-robot','demo-volt');assert.equal(JSON.parse(data.get('liferobots-demo-v1')).selectedRobot,'demo-volt');
 assert.match(html(),/LÚMEN/);location.hash='#home';listeners.hashchange();assert.match(html(),/hangar-crew-member/);assert.match(html(),/game-mark.webp/);
});
test('Rede fica na navegação, convites abrem cadastro e perfis mostram informações da equipe',async()=>{
 location.hash='#affiliates';listeners.hashchange();assert.match(html(),/href="#affiliates"/);assert.match(html(),/Compartilhar convite/);assert.match(html(),/network-tier/);
 await click('affiliate-detail','npc-1');assert.match(modal(),/WhatsApp/);assert.match(modal(),/Vitórias/);assert.match(modal(),/BASTIÃO/);await click('close');
 await click('preview-ref');listeners.hashchange();assert.match(html(),/Criar meu piloto/);assert.match(html(),/Código de indicação \(opcional\)/);
});
test('admin navega por usuários, perfil, depósitos, saques e avisos globais',async()=>{
 location.hash='#admin';listeners.hashchange();await click('admin-tab','users');assert.match(html(),/Pilotos cadastrados/);assert.match(html(),/Página 1/);
 await click('admin-user','demo-self');assert.match(modal(),/Robôs adquiridos/);assert.match(modal(),/WhatsApp/);assert.match(modal(),/Ajustar saldo/);await click('close');
 for(const [tab,text] of [['deposits','Depósitos e confirmações'],['withdrawals','Processar novos saques automaticamente'],['notices','Aviso para todos os pilotos']]){await click('admin-tab',tab);assert.ok(html().includes(text));}
});
test('o admin registra ajuste de saldo e publica aviso de teste pela interface',async()=>{
 const original=JSON.parse(data.get('liferobots-demo-v1')).balances.LC;
 await listeners.submit({preventDefault(){},target:{id:'admin-balance-form',dataset:{id:'demo-self'},fields:{currency:'LC',amount:'150',reason:'Recompensa administrativa'}}});
 let saved=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(saved.balances.LC,original+150);assert.equal(saved.adminAudit[0].action,'balance_adjustment');
 await listeners.submit({preventDefault(){},target:{id:'admin-notice-form',fields:{announcement:'Novo sinal',announcementBody:'A equipe recebeu um novo capítulo.',announcementButton:'Explorar',announcementLink:'#story',announcementImage:'',announcementActive:'on'}}});
 saved=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(saved.settings.announcement,'Novo sinal');assert.equal(saved.settings.announcementVersion,1);
});

test('novas telas sociais e controles administrativos aparecem na navegação',async()=>{
 for(const [route,text] of [['guilds','Uma equipe. Um só farol.'],['market','Cada robô tem uma próxima história.'],['chat','Praça de Aurora'],['events','Os faróis têm hora para despertar.']]){location.hash='#'+route;listeners.hashchange();assert.ok(html().includes(text),route);}
 location.hash='#home';listeners.hashchange();await click('mobile-menu');for(const route of ['guilds','market','chat','events'])assert.ok(modal().includes('data-page="'+route+'"'));await click('close');
 location.hash='#admin';listeners.hashchange();for(const [tab,text] of [['guild-admin','Criar guilda (RC)'],['trade-admin','Taxa de venda (%)'],['chat-admin','Intervalo entre mensagens (s)']]){await click('admin-tab',tab);assert.ok(html().includes(text));assert.match(html(),/Página 1/);}
});
test('montagem direta compra, equipa e evolui a peça no espaço do robô',async()=>{
 const r=JSON.parse(data.get('liferobots-demo-v1')).robots[2];await click('robot-detail',r.uid);assert.match(modal(),/data-a="slot-equip"/);
 await click('slot-equip',r.uid,{slot:'core'});assert.match(modal(),/Adquirir e equipar/);await click('slot-buy','core',{robot:r.uid});assert.match(modal(),/Confirmar montagem/);await click('slot-buy-confirm','core',{robot:r.uid});
 let s=JSON.parse(data.get('liferobots-demo-v1')),item=s.inventory.find(i=>i.equippedOn===r.uid);assert.ok(item);assert.ok(modal().includes('Evoluir · '+s.settings.levelCost+' RC'));
 await click('slot-upgrade',item.uid,{robot:r.uid});await click('slot-upgrade-confirm',item.uid,{robot:r.uid});s=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(s.inventory.find(i=>i.uid===item.uid).level,2);await click('close');
});
test('chat publica conteúdo escapado e exibe o canal certo para a guilda',async()=>{
 location.hash='#chat';listeners.hashchange();await listeners.submit({preventDefault(){},target:{id:'floating-chat-form',dataset:{room:'global'},fields:{message:'<script>novo sinal</script>'}}});
 assert.match(html(),/&lt;script&gt;novo sinal&lt;\/script&gt;/);assert.ok(!html().includes('<script>novo sinal</script>'));await click('chat-room','guild');assert.match(html(),/Entre em uma guilda/);assert.ok(!html().includes('data-room="guild:undefined"'));await click('chat-room','global');
});
test('criação, convite de exemplo, hierarquia e guerra são operáveis pela interface',async()=>{
 location.hash='#guilds';listeners.hashchange();await click('guild-create');assert.match(modal(),/guild-create-form/);
 await listeners.submit({preventDefault(){},target:{id:'guild-create-form',fields:{name:'Sentinelas Verdes',tag:'SV',description:'Uma equipe de teste'}}});let s=JSON.parse(data.get('liferobots-demo-v1')),g=s.social.guilds.find(g=>g.name==='Sentinelas Verdes');assert.ok(g);assert.match(html(),/Compartilhar convite/);
 await click('guild-invite');assert.match(modal(),/guild=/);assert.match(modal(),/invite=/);await click('close');
 await listeners.submit({preventDefault(){},target:{id:'guild-test-invite-form',dataset:{id:g.id},fields:{userId:'social-example-2',inviterId:s.profile.id}}});s=JSON.parse(data.get('liferobots-demo-v1'));assert.ok(s.social.rewardReceipts.some(r=>r.userId===s.profile.id&&r.amount===25));
 await click('guild-roster',g.id);assert.match(modal(),/Transferir liderança/);assert.match(modal(),/Pyxis/);await click('close');await click('guild-chat');listeners.hashchange();assert.match(html(),/Sentinelas Verdes/);
 location.hash='#guilds';listeners.hashchange();await click('guild-war-start','war-aurora');assert.match(modal(),/Iniciar duelo/);await click('guild-war-confirm','war-aurora');assert.match(modal(),/guild-combat/);assert.match(modal(),/GUERRA DE GUILDAS/);for(let i=0;i<60&&JSON.parse(data.get('liferobots-demo-v1')).social.activeGuildBattle;i++)await click('combat-move','shield');
 s=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(s.social.activeGuildBattle,null);assert.ok(s.social.warScores['war-aurora'][g.id].points>0);assert.match(modal(),/DUELO DE GUILDA ENCERRADO/);await click('close');
});
test('mercado transfere uma compra e a troca espera a contraparte',async()=>{
 location.hash='#market';listeners.hashchange();let s=JSON.parse(data.get('liferobots-demo-v1')),listing=s.social.listings.find(l=>l.kind==='sale'&&l.example),before=s.robots.length;await click('trade-open',listing.id);assert.match(modal(),/Confirmar aquisição/);await click('trade-buy',listing.id);s=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(s.robots.length,before+1);assert.equal(s.social.listings.find(l=>l.id===listing.id).status,'settled');
 const swap=s.social.listings.find(l=>l.kind==='swap'),my=s.robots.find(r=>r.uid==='demo-volt');await click('pick-robot',my.uid);await click('trade-open',swap.id);assert.match(modal(),/Enviar proposta/);await listeners.submit({preventDefault(){},target:{id:'trade-propose-form',dataset:{id:swap.id},fields:{}}});s=JSON.parse(data.get('liferobots-demo-v1'));const p=s.social.proposals[0];assert.equal(p.status,'pending');assert.equal(s.robots.find(r=>r.uid===my.uid).tradeLock,'proposal:'+p.id);assert.match(html(),/Aguardando contraparte/);
 await click('trade-demo-accept',p.id);s=JSON.parse(data.get('liferobots-demo-v1'));assert.equal(s.social.proposals[0].status,'accepted');assert.ok(!s.robots.some(r=>r.uid===my.uid));assert.equal(s.social.trades.length,2);
});


test('o chat permanece sobre o hangar, minimiza, maximiza e troca de canal sem navegar',async()=>{
 location.hash='#home';listeners.hashchange();assert.match(elements.get('#app').innerHTML,/Hangar principal/);assert.match(chatHTML(),/data-chat-mode="window"/);assert.match(chatHTML(),/floating-chat-form/);const original=elements.get('#app').innerHTML;
 await click('floating-chat-minimize');assert.match(chatHTML(),/data-chat-mode="minimized"/);assert.ok(!chatHTML().includes('floating-chat-form'));await click('floating-chat-maximize');assert.match(chatHTML(),/data-chat-mode="maximized"/);await click('floating-chat-maximize');assert.match(chatHTML(),/data-chat-mode="window"/);await click('chat-room','market');assert.match(chatHTML(),/Negociações de robôs/);assert.equal(location.hash,'#home');assert.equal(elements.get('#app').innerHTML,original);
 await click('chat-room','global');
});
test('barra inferior tem Meus robôs e mantém Rede junto aos oito atalhos',()=>{
 location.hash='#home';listeners.hashchange();const dock=elements.get('#app').innerHTML.match(/<nav class="bottom-nav game-dock"[\s\S]*?<\/nav>/)[0];assert.match(dock,/href="#robots"/);assert.match(dock,/Meus robôs/);assert.match(dock,/href="#affiliates"/);assert.equal((dock.match(/<a /g)||[]).length,7);assert.equal((dock.match(/data-a="mobile-menu"/g)||[]).length,1);location.hash='#robots';listeners.hashchange();const robotDock=elements.get('#app').innerHTML.match(/<nav class="bottom-nav game-dock"[\s\S]*?<\/nav>/)[0];assert.equal((robotDock.match(/class="active"/g)||[]).length,1);
});
test('X fecha o chat sem deixar painel na tela e o atalho da barra superior reabre',async()=>{
 location.hash='#home';listeners.hashchange();assert.match(chatHTML(),/floating-chat-close/);await click('floating-chat-close');assert.equal(chatHTML(),'');assert.match(elements.get('#app').innerHTML,/aria-label="Reabrir chat flutuante"/);await click('floating-chat-open');assert.match(chatHTML(),/floating-chat-form/);
});
