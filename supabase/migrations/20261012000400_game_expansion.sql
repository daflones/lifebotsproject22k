-- LifeBots 0.3: conteúdo e configuração. Não ativa dinheiro real.
begin;
alter table public.lr_settings drop constraint if exists lr_settings_value_check;
alter table public.lr_settings add constraint lr_settings_value_check check(jsonb_typeof(value) in ('object','array'));

alter table public.lr_story_chapters add column if not exists definition jsonb not null default '{}'::jsonb;

insert into public.lr_robot_catalog(id,name,robot_type,rarity,description,asset,color,price_minor,currency,daily_rc_minor,lifetime_days,max_battles,max_level,attack,defense,health,sort_order) values
('ember','EMBER-04','striker','Raro','Uma raposa de metal com um coração de fogo. Seus ataques aquecem a arena.','ember-sprites.png','#ffab79',190000,'LC',23000,30,128,10,58,30,160,4),
('glacier','GLACIER-05','guardian','Épico','Cristais de gelo protegem este guardião. Uma fortaleza que caminha.','glacier-sprites.png','#a3e5f3',290000,'LC',34000,35,150,10,43,70,280,5),
('nimbus','NIMBUS-06','explorer','Raro','Leve como o vento, curioso como um explorador. Encontra passagens além das nuvens.','nimbus-sprites.png','#c3e7ee',120000,'LC',14500,25,100,10,39,34,165,6),
('orbit','ORBIT-07','explorer','Épico','Um viajante das estrelas, equipado para seguir transmissões de mundos distantes.','orbit-sprites.png','#f2d39b',440000,'LC',48000,45,200,10,70,65,290,7),
('nova','NOVA-08','striker','Lendário','Plasma violeta e precisão estelar. Um atacante preparado para os últimos setores.','nova-sprites.png','#e2b1f4',620000,'LC',65000,50,220,10,102,57,320,8),
('onyx','ONYX-09','guardian','Lendário','O colosso de obsidiana. Sua armadura dourada protege a equipe nas missões mais difíceis.','onyx-sprites.png','#eac58b',780000,'LC',79000,60,260,10,84,110,440,9)
on conflict(id) do nothing;

insert into public.lr_part_catalog(id,name,slot,description,asset,price_minor,currency,production_boost_bp,attack,defense,display_level,max_level) values
('ember-core','Núcleo de ignição','core','Reforça a produção e concentra o calor de cada ataque.','plasma-core.png',110000,'RC',2800,12,3,1,10),
('frost-shield','Barreira glacial','shield','Camadas de energia fria protegem o seu robô.','kinetic-shield.png',160000,'RC',1500,2,25,1,10),
('nova-arm','Lâmina de pulsar','arm','Tecnologia estelar para enfrentar os guardiões finais.','magnetic-arm.png',75000,'LC',1800,28,5,2,10),
('orbit-reactor','Reator orbital','core','Amplia a produção com um circuito de energia contínua.','quantum-reactor.png',100000,'LC',5500,16,15,2,10)
on conflict(id) do nothing;
insert into public.lr_part_compatibility(part_id,robot_type) values
('ember-core','striker'),
('ember-core','explorer'),
('frost-shield','guardian'),
('frost-shield','explorer'),
('nova-arm','striker'),
('nova-arm','guardian'),
('orbit-reactor','explorer'),
('orbit-reactor','striker'),
('orbit-reactor','guardian')
on conflict(part_id,robot_type) do nothing;

insert into public.lr_story_chapters(id,title,place,story,required_power,reward_rc_minor) values
(7,'Faíscas no deserto','Dunas de cobre','Uma tempestade revelou trilhos enterrados. Atravesse as dunas e encontre a forja que ainda pulsa.',112,78000),
(8,'A forja perdida','Fornalha Rubra','A fornalha está acordada. Seus guardiões confundem visitantes com invasores. Desative a patrulha e recupere o mapa.',125,90000),
(9,'O silêncio do gelo','Cordilheira Boreal','O sinal desaparece entre cristais congelados. Abra caminho e reative as antenas da cordilheira.',140,105000),
(10,'Coração congelado','Câmara de Cristal','O reator está preso no gelo. Enfrente os defensores da câmara e devolva calor à região.',152,120000),
(11,'Acima das nuvens','Arquipélago Suspenso','Pontes flutuantes conectam antigos laboratórios. NIMBUS encontrou uma rota; siga suas pistas.',165,140000),
(12,'A torre dos ventos','Farol Celeste','A torre transmite para fora do planeta. Reconquiste o farol e descubra de onde vem o chamado.',178,165000),
(13,'Órbita desconhecida','Estação Horizonte','O elevador orbital voltou a funcionar. Explore a estação e reúna as coordenadas do próximo setor.',190,190000),
(14,'Ecos da estação','Anel de Kepler','Um eco percorre o anel vazio. Recupere os registros antes que o sistema de defesa os apague.',202,215000),
(15,'A chama violeta','Nebulosa Prisma','Cristais de plasma alimentam uma nova geração de robôs. Abra uma passagem entre as sentinelas.',214,245000),
(16,'Tempestade estelar','Portal Nova','O portal está instável. Vença a patrulha e sincronize os núcleos antes da tempestade.',226,275000),
(17,'O vale de obsidiana','Cidadela Onyx','Uma cidadela ergue-se entre pedras negras. Seu último guardião protege uma memória do antigo mundo.',238,310000),
(18,'O farol da vida','Santuário Life','Todos os sinais convergem aqui. Reúna sua equipe, vença os guardiões e acenda o farol de uma nova era.',250,360000)
on conflict(id) do nothing;

-- Acrescenta metadados sem sobrescrever escolhas pré-existentes.
update public.lr_story_chapters c set definition=d.value||c.definition from (values
(1,'{"objective":"Vença os guardiões de Arredores do hangar e libere o próximo sinal.","conclusion":"O sinal de Arredores do hangar está seguro. Sua equipe abriu uma nova passagem.","scene":"aurora","enemies":[{"robotId":"moss","name":"Vigia de sucata"},{"robotId":"moss","name":"Sentinela enferrujada"}]}'::jsonb),
(2,'{"objective":"Vença os guardiões de Floresta de circuitos e libere o próximo sinal.","conclusion":"O sinal de Floresta de circuitos está seguro. Sua equipe abriu uma nova passagem.","scene":"roots","enemies":[{"robotId":"moss","name":"Rastreador de raízes"},{"robotId":"volt","name":"Caçador de sinais"}]}'::jsonb),
(3,'{"objective":"Vença os guardiões de Distrito Aurora e libere o próximo sinal.","conclusion":"O sinal de Distrito Aurora está seguro. Sua equipe abriu uma nova passagem.","scene":"city","enemies":[{"robotId":"volt","name":"Patrulha Aurora"},{"robotId":"moss","name":"Vigia do distrito"},{"robotId":"volt","name":"Comandante Aurora"}]}'::jsonb),
(4,'{"objective":"Vença os guardiões de Portão de aço e libere o próximo sinal.","conclusion":"O sinal de Portão de aço está seguro. Sua equipe abriu uma nova passagem.","scene":"steel","enemies":[{"robotId":"moss","name":"Vigia do portão"},{"robotId":"volt","name":"Artilheiro antigo"},{"robotId":"titan","name":"Guardião de aço"}]}'::jsonb),
(5,'{"objective":"Vença os guardiões de Vale das antenas e libere o próximo sinal.","conclusion":"O sinal de Vale das antenas está seguro. Sua equipe abriu uma nova passagem.","scene":"sunset","enemies":[{"robotId":"volt","name":"Patrulha do vale"},{"robotId":"volt","name":"Interceptor de antenas"},{"robotId":"titan","name":"Guardião do farol"}]}'::jsonb),
(6,'{"objective":"Vença os guardiões de Núcleo da cidade e libere o próximo sinal.","conclusion":"O sinal de Núcleo da cidade está seguro. Sua equipe abriu uma nova passagem.","scene":"core","enemies":[{"robotId":"moss","name":"Vigia do núcleo"},{"robotId":"volt","name":"Interceptor quântico"},{"robotId":"titan","name":"Titã do núcleo"}]}'::jsonb),
(7,'{"scene":"ember","enemies":[{"robotId":"ember","name":"Batedor da forja"},{"robotId":"volt","name":"Artilheiro de cobre"},{"robotId":"ember","name":"Raposa incandescente"}],"objective":"Vença os guardiões de Dunas de cobre e libere o próximo sinal.","conclusion":"O sinal de Dunas de cobre está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(8,'{"scene":"ember","enemies":[{"robotId":"ember","name":"Vigia rubro"},{"robotId":"titan","name":"Guarda da fornalha"},{"robotId":"ember","name":"Mestre da ignição"}],"objective":"Vença os guardiões de Fornalha Rubra e libere o próximo sinal.","conclusion":"O sinal de Fornalha Rubra está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(9,'{"scene":"frost","enemies":[{"robotId":"glacier","name":"Sentinela boreal"},{"robotId":"nimbus","name":"Rastreador da neve"},{"robotId":"glacier","name":"Guardião glacial"}],"objective":"Vença os guardiões de Cordilheira Boreal e libere o próximo sinal.","conclusion":"O sinal de Cordilheira Boreal está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(10,'{"scene":"frost","enemies":[{"robotId":"glacier","name":"Patrulha de cristal"},{"robotId":"titan","name":"Escudo boreal"},{"robotId":"glacier","name":"Coração de inverno"}],"objective":"Vença os guardiões de Câmara de Cristal e libere o próximo sinal.","conclusion":"O sinal de Câmara de Cristal está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(11,'{"scene":"sky","enemies":[{"robotId":"nimbus","name":"Vigia das nuvens"},{"robotId":"orbit","name":"Batedor celeste"},{"robotId":"nimbus","name":"Guardião do vento"}],"objective":"Vença os guardiões de Arquipélago Suspenso e libere o próximo sinal.","conclusion":"O sinal de Arquipélago Suspenso está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(12,'{"scene":"sky","enemies":[{"robotId":"nimbus","name":"Interceptor aéreo"},{"robotId":"ember","name":"Artilheiro do farol"},{"robotId":"orbit","name":"Guardião celeste"}],"objective":"Vença os guardiões de Farol Celeste e libere o próximo sinal.","conclusion":"O sinal de Farol Celeste está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(13,'{"scene":"space","enemies":[{"robotId":"orbit","name":"Patrulha orbital"},{"robotId":"nova","name":"Vigia estelar"},{"robotId":"orbit","name":"Comandante Horizonte"}],"objective":"Vença os guardiões de Estação Horizonte e libere o próximo sinal.","conclusion":"O sinal de Estação Horizonte está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(14,'{"scene":"space","enemies":[{"robotId":"orbit","name":"Vigia de Kepler"},{"robotId":"glacier","name":"Escudo do anel"},{"robotId":"nova","name":"Interceptor de plasma"},{"robotId":"orbit","name":"Núcleo orbital"}],"objective":"Vença os guardiões de Anel de Kepler e libere o próximo sinal.","conclusion":"O sinal de Anel de Kepler está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(15,'{"scene":"nebula","enemies":[{"robotId":"nova","name":"Batedor de Prisma"},{"robotId":"ember","name":"Chama errante"},{"robotId":"nova","name":"Guardião violeta"}],"objective":"Vença os guardiões de Nebulosa Prisma e libere o próximo sinal.","conclusion":"O sinal de Nebulosa Prisma está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(16,'{"scene":"nebula","enemies":[{"robotId":"nova","name":"Sentinela de plasma"},{"robotId":"orbit","name":"Guardião da órbita"},{"robotId":"onyx","name":"Escudo do portal"},{"robotId":"nova","name":"Arauto da tempestade"}],"objective":"Vença os guardiões de Portal Nova e libere o próximo sinal.","conclusion":"O sinal de Portal Nova está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(17,'{"scene":"night","enemies":[{"robotId":"onyx","name":"Vigia da cidadela"},{"robotId":"glacier","name":"Escudo da memória"},{"robotId":"nova","name":"Interceptor de obsidiana"},{"robotId":"onyx","name":"Colosso negro"}],"objective":"Vença os guardiões de Cidadela Onyx e libere o próximo sinal.","conclusion":"O sinal de Cidadela Onyx está seguro. Sua equipe abriu uma nova passagem."}'::jsonb),
(18,'{"scene":"core","enemies":[{"robotId":"orbit","name":"Guarda do santuário"},{"robotId":"nova","name":"Guardião do prisma"},{"robotId":"glacier","name":"Sentinela eterna"},{"robotId":"onyx","name":"Último guardião"}],"objective":"Vença os guardiões de Santuário Life e libere o próximo sinal.","conclusion":"O sinal de Santuário Life está seguro. Sua equipe abriu uma nova passagem."}'::jsonb)) as d(id,value) where c.id=d.id;

update public.lr_settings set value='{"replayCost":40,"replayCurrency":"RC","autoStoryStart":false,"rules":{"attackMultiplier":1.05,"specialMultiplier":1.9,"shieldAttackMultiplier":0.55,"defenseAbsorption":0.28,"playerDefenseAbsorption":0.22,"shieldReduction":0.4,"randomBase":0.8,"randomVariance":0.3,"damageMin":7,"retaliationMin":5,"energyMax":3,"levelAttackStep":3,"levelDefenseStep":2,"levelHealthStep":10,"productionLevelPercent":10,"partProductionLevelPercent":15,"waveHealPercent":35,"storyAttackPercent":43,"storyDefensePercent":22,"storyBossHealthPercent":118,"storyWaveScalePercent":8,"storyBaseHealth":52,"storyHealthPerChapter":14,"travelMs":2400,"actionMs":600,"betweenWavesMs":1800,"autoDelayMs":650},"audio":{"enabled":true,"music":true,"effects":true,"masterVolume":0.45,"musicVolume":0.3,"effectsVolume":0.65,"theme":"aurora","tempo":84}}'::jsonb||value||jsonb_build_object('rules','{"attackMultiplier":1.05,"specialMultiplier":1.9,"shieldAttackMultiplier":0.55,"defenseAbsorption":0.28,"playerDefenseAbsorption":0.22,"shieldReduction":0.4,"randomBase":0.8,"randomVariance":0.3,"damageMin":7,"retaliationMin":5,"energyMax":3,"levelAttackStep":3,"levelDefenseStep":2,"levelHealthStep":10,"productionLevelPercent":10,"partProductionLevelPercent":15,"waveHealPercent":35,"storyAttackPercent":43,"storyDefensePercent":22,"storyBossHealthPercent":118,"storyWaveScalePercent":8,"storyBaseHealth":52,"storyHealthPerChapter":14,"travelMs":2400,"actionMs":600,"betweenWavesMs":1800,"autoDelayMs":650}'::jsonb||coalesce(value->'rules','{}'::jsonb),'audio','{"enabled":true,"music":true,"effects":true,"masterVolume":0.45,"musicVolume":0.3,"effectsVolume":0.65,"theme":"aurora","tempo":84}'::jsonb||coalesce(value->'audio','{}'::jsonb)) where key='economy';
update public.lr_settings set value='{"hangarBackground":"hangar","authBackground":"hangar","authRobotIds":["ember","moss","orbit"],"guideName":"NEXA","copy":{"homeTitle":"Hangar principal","storyTitle":"O mundo tem uma nova chance.","storyDescription":"Explore a campanha, enfrente robôs e conquiste os prêmios pelo caminho.","arenaTitle":"Encontre seu próximo adversário.","arenaDescription":"Entre na fila com seu robô e prepare sua estratégia.","shopTitle":"Construa sua próxima versão.","shopDescription":"Robôs, peças e novas possibilidades para a sua equipe.","robotsTitle":"Pequenos robôs. Grandes histórias.","walletTitle":"Tudo em um só lugar.","hangarLabel":"Hangar","storyLabel":"Aventura","arenaLabel":"Arena","shopLabel":"Oficina","walletLabel":"Carteira","moreLabel":"Mais","authTagline":"DÊ VIDA AO SEU PRÓXIMO CAPÍTULO","authWorldText":"Um universo de robôs espera pelo seu próximo sinal.","loginTitle":"Seu hangar espera por você.","loginDescription":"Seu próximo capítulo começa aqui.","signupTitle":"Comece sua jornada.","signupDescription":"Crie seu piloto e prepare sua primeira equipe."},"textOverrides":{}}'::jsonb||value||jsonb_build_object('copy','{"homeTitle":"Hangar principal","storyTitle":"O mundo tem uma nova chance.","storyDescription":"Explore a campanha, enfrente robôs e conquiste os prêmios pelo caminho.","arenaTitle":"Encontre seu próximo adversário.","arenaDescription":"Entre na fila com seu robô e prepare sua estratégia.","shopTitle":"Construa sua próxima versão.","shopDescription":"Robôs, peças e novas possibilidades para a sua equipe.","robotsTitle":"Pequenos robôs. Grandes histórias.","walletTitle":"Tudo em um só lugar.","hangarLabel":"Hangar","storyLabel":"Aventura","arenaLabel":"Arena","shopLabel":"Oficina","walletLabel":"Carteira","moreLabel":"Mais","authTagline":"DÊ VIDA AO SEU PRÓXIMO CAPÍTULO","authWorldText":"Um universo de robôs espera pelo seu próximo sinal.","loginTitle":"Seu hangar espera por você.","loginDescription":"Seu próximo capítulo começa aqui.","signupTitle":"Comece sua jornada.","signupDescription":"Crie seu piloto e prepare sua primeira equipe."}'::jsonb||coalesce(value->'copy','{}'::jsonb)) where key='presentation';
insert into public.lr_settings(key,value,visibility) values
('seasons','[{"id":"awakening","number":1,"title":"A era do despertar","subtitle":"Um sinal. Uma cidade. Um novo começo.","intro":"Sou NEXA, a memória do hangar. Nossos faróis se apagaram há muito tempo. Comece pelos arredores, vença as patrulhas e reúna energia para reacender Aurora.","from":1,"to":6,"scene":"roots","guideRobotId":"moss"},{"id":"frontiers","number":2,"title":"As fronteiras de Aurora","subtitle":"Do fogo ao gelo, rumo às nuvens.","intro":"Aurora voltou a brilhar, mas o sinal veio de mais longe. A forja rubra, a câmara glacial e o farol celeste escondem partes do mesmo mapa. Prepare equipamentos para atravessar os três setores.","from":7,"to":12,"scene":"ember","guideRobotId":"nimbus"},{"id":"stars","number":3,"title":"Além das estrelas","subtitle":"A última transmissão atravessa o universo.","intro":"As coordenadas levam à estação Horizonte. Os guardiões do prisma e da obsidiana protegem o Santuário Life. Evolua sua equipe; o último farol espera por você.","from":13,"to":18,"scene":"space","guideRobotId":"orbit"}]'::jsonb,'public'),
('arena_roster','[{"id":"scout","name":"Scout","robotId":"moss","attackFactor":0.95,"defenseFactor":0.9,"healthFactor":0.98},{"id":"pulse","name":"Pulse","robotId":"volt","attackFactor":0.96,"defenseFactor":0.92,"healthFactor":1},{"id":"sentinel","name":"Sentinel","robotId":"titan","attackFactor":0.9,"defenseFactor":1,"healthFactor":1.05},{"id":"flare","name":"Flare","robotId":"ember","attackFactor":1,"defenseFactor":0.88,"healthFactor":0.98},{"id":"boreal","name":"Boreal","robotId":"glacier","attackFactor":0.9,"defenseFactor":1.02,"healthFactor":1.05},{"id":"zephyr","name":"Zephyr","robotId":"nimbus","attackFactor":0.96,"defenseFactor":0.9,"healthFactor":0.98},{"id":"kepler","name":"Kepler","robotId":"orbit","attackFactor":0.97,"defenseFactor":0.94,"healthFactor":1},{"id":"prisma","name":"Prisma","robotId":"nova","attackFactor":1.02,"defenseFactor":0.88,"healthFactor":0.98},{"id":"atlas","name":"Atlas","robotId":"onyx","attackFactor":0.9,"defenseFactor":1.02,"healthFactor":1.05}]'::jsonb,'public')
on conflict(key) do nothing;

create or replace function public.lr_snapshot(p_user_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_profile public.lr_profiles; v_economy jsonb; v_presentation jsonb;
begin
  select p.* into strict v_profile from public.lr_profiles p where p.id=p_user_id and p.status='active';
  select s.value into v_economy from public.lr_settings s where s.key='economy';
  select s.value into v_presentation from public.lr_settings s where s.key='presentation';
  return jsonb_build_object(
    'serverAuthoritative',true,'mode','demo','realMoneyEnabled',false,'coinMinorScale',100,
    'profile',jsonb_build_object('id',v_profile.id,'name',v_profile.display_name,'whatsapp',v_profile.whatsapp,
      'referralCode',v_profile.referral_code,'level',1,'tutorial',exists(select 1 from public.lr_tutorial_claims t where t.user_id=p_user_id and t.mode='demo'),
      'role',case when exists(select 1 from public.lr_admin_roles a where a.user_id=p_user_id) then 'admin' else 'user' end,
      'isAdmin',exists(select 1 from public.lr_admin_roles a where a.user_id=p_user_id)),
    'settings',coalesce(v_presentation,'{}'::jsonb)||coalesce(v_economy,'{}'::jsonb)||jsonb_build_object('realMoneyEnabled',false),
    'chapters',coalesce((select jsonb_agg(c.definition||jsonb_build_object('id',c.id,'title',c.title,'place',c.place,'story',c.story,'power',c.required_power,'reward',c.reward_rc_minor/100.0,'enabled',c.active) order by c.id) from public.lr_story_chapters c),'[]'::jsonb),
    'seasons',coalesce((select s.value from public.lr_settings s where s.key='seasons'),'[]'::jsonb),
    'arenaRoster',coalesce((select s.value from public.lr_settings s where s.key='arena_roster'),'[]'::jsonb),
    'catalog',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'type',c.robot_type,'rarity',c.rarity,'description',c.description,
      'asset',c.asset,'color',c.color,'price',c.price_minor/100.0,'currency',c.currency,'daily',c.daily_rc_minor/100.0,'lifetime',c.lifetime_days,
      'maxBattles',c.max_battles,'maxLevel',c.max_level,'attack',c.attack,'defense',c.defense,'health',c.health) order by c.sort_order,c.id)
      from public.lr_robot_catalog c where c.active),'[]'::jsonb),
    'parts',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'slot',c.slot,'description',c.description,'asset',c.asset,
      'price',c.price_minor/100.0,'currency',c.currency,'production',c.production_boost_bp/100.0,'attack',c.attack,'defense',c.defense,'level',c.display_level,
      'maxLevel',c.max_level,'compatible',coalesce((select jsonb_agg(x.robot_type) from public.lr_part_compatibility x where x.part_id=c.id),'[]'::jsonb)) order by c.id)
      from public.lr_part_catalog c where c.active),'[]'::jsonb),
    'wallets',coalesce((select jsonb_agg(jsonb_build_object('mode',w.mode,'currency',w.currency,'availableMinor',w.available_minor,'reservedMinor',w.reserved_minor))
      from public.lr_wallets w where w.user_id=p_user_id),'[]'::jsonb),
    'balances',jsonb_build_object('LC',coalesce((select w.available_minor/100.0 from public.lr_wallets w where w.user_id=p_user_id and w.mode='demo' and w.currency='LC'),0),
      'RC',coalesce((select w.available_minor/100.0 from public.lr_wallets w where w.user_id=p_user_id and w.mode='demo' and w.currency='RC'),0)),
    'robots',coalesce((select jsonb_agg(jsonb_build_object('uid',r.id,'catalogId',r.catalog_id,'level',r.level,'createdAt',extract(epoch from r.acquired_at)*1000,
      'expiresAt',extract(epoch from r.expires_at)*1000,'lastCollected',extract(epoch from coalesce(r.last_settled_at,r.acquired_at))*1000,
      'earned',r.earned_minor/100.0,'used',r.battles_used,'productionDailyMinor',r.production_daily_minor,
      'equipment',coalesce((select jsonb_agg(i.id) from public.lr_owned_parts i where i.equipped_robot_id=r.id),'[]'::jsonb)) order by r.acquired_at)
      from public.lr_owned_robots r where r.user_id=p_user_id and r.mode='demo'),'[]'::jsonb),
    'inventory',coalesce((select jsonb_agg(jsonb_build_object('uid',i.id,'partId',i.catalog_id,'level',i.level,'equippedOn',i.equipped_robot_id))
      from public.lr_owned_parts i where i.user_id=p_user_id and i.mode='demo'),'[]'::jsonb),
    'transactions',coalesce((select jsonb_agg(x.data order by x.recorded_at desc) from (select e.created_at recorded_at,jsonb_build_object('id',e.id,'kind',e.reference_type,
      'currency',e.currency,'amount',case when e.operation in ('debit','reserve','capture') then -e.amount_minor/100.0 else e.amount_minor/100.0 end,
      'operation',e.operation,'at',extract(epoch from e.created_at)*1000,'status','demo-servidor') data from public.lr_ledger e
      where e.user_id=p_user_id and e.mode='demo' order by e.created_at desc limit 120) x),'[]'::jsonb),
    'story',coalesce((select max(s.chapter_id) from public.lr_story_progress s where s.user_id=p_user_id and s.mode='demo'),0),
    'commissionTotal',coalesce((select sum(c.amount_minor)/100.0 from public.lr_commissions c where c.beneficiary_id=p_user_id and c.mode='demo'),0),
    'daily',coalesce((select jsonb_build_object('date',a.day,'used',a.used,'extra',a.purchased) from public.lr_daily_arena a
      where a.user_id=p_user_id and a.mode='demo' and a.day=(now() at time zone 'America/Sao_Paulo')::date),
      jsonb_build_object('date',(now() at time zone 'America/Sao_Paulo')::date,'used',0,'extra',0))
  );
end;
$$;
revoke all on function public.lr_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.lr_snapshot(uuid) to service_role;

commit;
