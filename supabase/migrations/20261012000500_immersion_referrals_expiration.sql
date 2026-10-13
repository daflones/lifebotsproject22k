-- LifeBots 0.4. Preparada para revisão e execução pelo CLI. Não ativa dinheiro real.
begin;
alter table public.lr_robot_catalog add column if not exists identity jsonb not null default '{}'::jsonb;
alter table public.lr_part_catalog add column if not exists identity jsonb not null default '{}'::jsonb;
alter table public.lr_owned_robots add column if not exists acquisition_contract jsonb;
alter table public.lr_owned_robots add column if not exists principal_return_lc_minor bigint not null default 0 check (principal_return_lc_minor>=0);
alter table public.lr_owned_robots add column if not exists principal_returned_at timestamptz;
alter table public.lr_owned_robots add column if not exists principal_return_ledger_id uuid references public.lr_ledger(id);
create index if not exists lr_pending_expirations_idx on public.lr_owned_robots(expires_at,id)
 where mode='demo' and acquisition_contract is not null and principal_returned_at is null;

create or replace function public.lr_handle_signup() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_phone text; v_ref uuid; v_code text;
begin
 v_phone:=nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'whatsapp',''),'[^0-9]','','g'),'');
 if v_phone is not null and v_phone !~ '^[0-9]{10,15}$' then v_phone:=null; end if;
 v_code:=nullif(upper(btrim(coalesce(new.raw_user_meta_data->>'referral_code',''))),'');
 if v_code is not null then
  if v_code !~ '^[A-Z0-9][A-Z0-9-]{2,23}$' then raise exception 'INVALID_REFERRAL_CODE'; end if;
  select p.id into v_ref from public.lr_profiles p where p.referral_code=v_code and p.status='active';
  if v_ref is null or v_ref=new.id then raise exception 'INVALID_REFERRAL_CODE'; end if;
 end if;
 insert into public.lr_profiles(id,display_name,whatsapp,referrer_id)
 values(new.id,coalesce(nullif(left(btrim(coalesce(new.raw_user_meta_data->>'display_name',new.raw_user_meta_data->>'name')),80),''),'Piloto'),v_phone,v_ref)
 on conflict(id) do nothing;
 insert into public.lr_wallets(user_id,mode,currency)
 select new.id,m.mode,c.currency from (values('demo'),('real')) m(mode) cross join (values('LC'),('RC'),('BRL')) c(currency)
 on conflict(user_id,mode,currency) do nothing;
 return new;
end;
$$;

create or replace function public.lr_guard_acquisition() returns trigger
language plpgsql set search_path='' as $$
begin
 if old.acquisition_contract is not null and
  (new.acquisition_contract is distinct from old.acquisition_contract or new.principal_return_lc_minor<>old.principal_return_lc_minor
   or new.acquired_at is distinct from old.acquired_at or new.expires_at is distinct from old.expires_at)
 then raise exception 'ROBOT_ACQUISITION_IMMUTABLE'; end if;
 if old.principal_returned_at is not null and
  (new.principal_returned_at is distinct from old.principal_returned_at or new.principal_return_ledger_id is distinct from old.principal_return_ledger_id)
 then raise exception 'ROBOT_EXPIRATION_IMMUTABLE'; end if;
 return new;
end;
$$;
drop trigger if exists lr_acquisition_guard on public.lr_owned_robots;
create trigger lr_acquisition_guard before update on public.lr_owned_robots for each row execute function public.lr_guard_acquisition();

-- Apenas contratos conhecidos são devolvidos. Não estima o custo histórico de aquisições antigas.
create or replace function public.lr_settle_demo_expirations(p_limit integer default 200) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_robot public.lr_owned_robots; v_entry uuid; v_count integer:=0; v_total bigint:=0;
begin
 if p_limit is null or p_limit not between 1 and 500 then raise exception 'INVALID_BATCH_LIMIT'; end if;
 for v_robot in
  select r.* from public.lr_owned_robots r join public.lr_profiles p on p.id=r.user_id
  where r.mode='demo' and p.status='active' and r.expires_at<=now() and r.acquisition_contract is not null and r.principal_returned_at is null
  order by r.expires_at,r.id limit p_limit for update of r skip locked
 loop
  v_entry:=null;
  if v_robot.principal_return_lc_minor>0 then
   v_entry:=public.lr_wallet_apply(v_robot.user_id,'demo','LC','credit',v_robot.principal_return_lc_minor,
    'robot_expiration','expiration:'||v_robot.id::text);
  end if;
  update public.lr_owned_robots set principal_returned_at=now(),principal_return_ledger_id=v_entry where id=v_robot.id;
  update public.lr_owned_parts set equipped_robot_id=null where equipped_robot_id=v_robot.id and user_id=v_robot.user_id and mode='demo';
  -- Períodos históricos e recompensas RC permanecem para a liquidação proporcional.
  v_count:=v_count+1;v_total:=v_total+v_robot.principal_return_lc_minor;
 end loop;
 return jsonb_build_object('mode','demo','processed',v_count,'returnedLCMinor',v_total,'batchLimit',p_limit);
end;
$$;

create or replace function public.lr_run_demo_day(p_day date,p_limit integer default 200) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_production jsonb; v_expirations jsonb;
begin
 v_production:=public.lr_settle_demo_day(p_day,p_limit);
 v_expirations:=public.lr_settle_demo_expirations(p_limit);
 return v_production||jsonb_build_object('expirations',v_expirations);
end;
$$;

-- O caller Edge usa o auth.uid validado. Contatos são retornados somente para a própria descendência (3 níveis).
create or replace function public.lr_team_snapshot(p_user_id uuid) returns jsonb
language sql security definer set search_path='' as $$
 with recursive team as (
  select p.id,p.display_name,p.whatsapp,1 as depth,array[p_user_id,p.id] as path
  from public.lr_profiles p where p.referrer_id=p_user_id and p.status='active'
  union all
  select p.id,p.display_name,p.whatsapp,t.depth+1,t.path||p.id
  from public.lr_profiles p join team t on p.referrer_id=t.id
  where t.depth<3 and p.status='active' and not p.id=any(t.path)
 )
 select coalesce(jsonb_agg(jsonb_build_object(
  'id',t.id,'name',t.display_name,'whatsapp',t.whatsapp,'level',t.depth,
  'robots',(select count(*) from public.lr_owned_robots r where r.user_id=t.id and r.mode='demo'),
  'daily',coalesce((select sum(r.production_daily_minor)/100.0 from public.lr_owned_robots r where r.user_id=t.id and r.mode='demo' and r.expires_at>now()),0),
  'commission',coalesce((select sum(c.amount_minor)/100.0 from public.lr_commissions c where c.beneficiary_id=p_user_id and c.source_user_id=t.id and c.mode='demo'),0),
  'robotId',(select r.catalog_id from public.lr_owned_robots r where r.user_id=t.id and r.mode='demo' order by r.acquired_at desc limit 1),
  'acquisitionCount',(select count(*) from public.lr_owned_robots r where r.user_id=t.id and r.mode='demo'),
  'battles',jsonb_build_object('played',(select count(*) from public.lr_arena_matches m where m.mode='demo' and m.status='settled' and (m.challenger_id=t.id or m.opponent_id=t.id))),
  'acquisitions',coalesce((select jsonb_agg(x.data order by x.acquired_at desc) from
   (select r.acquired_at,jsonb_build_object('catalogId',r.catalog_id,'level',r.level,'active',r.expires_at>now(),
    'paidAmount',(r.acquisition_contract->>'paidAmountMinor')::numeric/100.0,'currency',r.acquisition_contract->>'paidCurrency') data
    from public.lr_owned_robots r where r.user_id=t.id and r.mode='demo' order by r.acquired_at desc limit 8) x),'[]'::jsonb)
 ) order by t.depth,t.display_name),'[]'::jsonb) from team t;
$$;
revoke all on function public.lr_settle_demo_expirations(integer),public.lr_run_demo_day(date,integer),public.lr_team_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.lr_settle_demo_expirations(integer),public.lr_run_demo_day(date,integer),public.lr_team_snapshot(uuid) to service_role;

-- Renomeia apenas as identidades padrão; preços e atributos personalizados são preservados.
update public.lr_robot_catalog set name='BROTTO',description='Encontrado entre raízes e placas esquecidas, Brotto aprendeu a transformar pequenos sinais em novas rotas. Seu núcleo verde alimenta uma produção constante enquanto ele protege os primeiros passos da equipe.' where id='moss' and name='MOSS-01';
update public.lr_robot_catalog set identity='{"serial":"EX-01","subtitle":"O despertar da floresta","signature":"Raízes de energia"}'::jsonb||identity where id='moss';
update public.lr_robot_catalog set name='LÚMEN',description='Lúmen atravessa Aurora como um risco de luz. Construído para ataques precisos, usa seus circuitos elétricos para abrir passagens e ampliar a produção com cada nova evolução.' where id='volt' and name='VOLT-X';
update public.lr_robot_catalog set identity='{"serial":"AT-X","subtitle":"O veloz guardião do sinal","signature":"Pulso relâmpago"}'::jsonb||identity where id='volt';
update public.lr_robot_catalog set name='BASTIÃO',description='Bastião foi forjado para manter o último portão de Aurora de pé. Sua estrutura robusta suporta encontros prolongados, e equipamentos de defesa revelam a força adormecida em sua blindagem.' where id='titan' and name='TITAN-9';
update public.lr_robot_catalog set identity='{"serial":"GD-09","subtitle":"A muralha que caminha","signature":"Armadura ancestral"}'::jsonb||identity where id='titan';
update public.lr_robot_catalog set name='KIRA',description='Kira corre entre as dunas de cobre com a astúcia de uma raposa e um coração de ignição. Suas garras aquecidas favorecem o ataque; núcleos compatíveis intensificam sua produção e seu ritmo de combate.' where id='ember' and name='EMBER-04';
update public.lr_robot_catalog set identity='{"serial":"AT-04","subtitle":"A raposa da Fornalha Rubra","signature":"Coração incandescente"}'::jsonb||identity where id='ember';
update public.lr_robot_catalog set name='NIVAL',description='Nival desperta quando o gelo ameaça engolir o sinal. Cristais protegem suas juntas e distribuem energia pelo corpo, formando um guardião de grande resistência para as rotas mais difíceis.' where id='glacier' and name='GLACIER-05';
update public.lr_robot_catalog set identity='{"serial":"GD-05","subtitle":"O vigia dos cristais","signature":"Fortaleza boreal"}'::jsonb||identity where id='glacier';
update public.lr_robot_catalog set name='ZÉFIRO',description='Zéfiro conhece pontes que os mapas esqueceram. Seu corpo leve acompanha as correntes do arquipélago suspenso, equilibrando exploração, produção e defesa enquanto descobre caminhos para a equipe.' where id='nimbus' and name='NIMBUS-06';
update public.lr_robot_catalog set identity='{"serial":"EX-06","subtitle":"O explorador das nuvens","signature":"Rota dos ventos"}'::jsonb||identity where id='nimbus';
update public.lr_robot_catalog set name='KEPLER',description='Kepler guarda coordenadas de estações além do horizonte. Seu sistema orbital mantém energia circulando por longas jornadas, tornando-o um companheiro versátil para avançar entre setores distantes.' where id='orbit' and name='ORBIT-07';
update public.lr_robot_catalog set identity='{"serial":"EX-07","subtitle":"O cartógrafo das estrelas","signature":"Núcleo orbital"}'::jsonb||identity where id='orbit';
update public.lr_robot_catalog set name='PRISMA',description='Prisma nasceu da última transmissão violeta. Seus sensores transformam luz em precisão e energia em ataques intensos; peças estelares revelam o potencial desse atacante nos encontros finais.' where id='nova' and name='NOVA-08';
update public.lr_robot_catalog set identity='{"serial":"AT-08","subtitle":"A centelha da nebulosa","signature":"Lâmina de plasma"}'::jsonb||identity where id='nova';
update public.lr_robot_catalog set name='ÉREBO',description='Érebo protege memórias esculpidas em pedra negra. Sob a armadura de obsidiana e ouro pulsa um núcleo resistente, preparado para sustentar a equipe quando os últimos guardiões entram em cena.' where id='onyx' and name='ONYX-09';
update public.lr_robot_catalog set identity='{"serial":"GD-09B","subtitle":"O colosso de obsidiana","signature":"Escudo do santuário"}'::jsonb||identity where id='onyx';
update public.lr_part_catalog set name='Pulso Verde',description='Um cilindro de plasma verde estabiliza o fluxo do robô. Ideal para iniciar a montagem: amplia a produção e acrescenta potência aos ataques.' where id='core' and name='Núcleo de plasma';
update public.lr_part_catalog set asset='plasma-core.png',identity='{"rarity":"Comum","subtitle":"Energia que mantém a equipe viva"}'::jsonb||identity where id='core';
update public.lr_part_catalog set name='Punho Magnético',description='Bobinas de cobre concentram força no punho articulado. Uma peça de ataque para exploradores e atacantes que precisam romper a linha adversária.' where id='arm' and name='Braço magnético';
update public.lr_part_catalog set asset='magnetic-arm-v2.png',identity='{"rarity":"Raro","subtitle":"Precisão em cada impacto"}'::jsonb||identity where id='arm';
update public.lr_part_catalog set name='Égide Azul',description='Uma placa metálica projeta um campo cinético ciano. Reforça a defesa de guardiões e exploradores sem interromper o fluxo de produção.' where id='shield' and name='Escudo cinético';
update public.lr_part_catalog set asset='kinetic-shield-v2.png',identity='{"rarity":"Raro","subtitle":"Um campo entre você e o perigo"}'::jsonb||identity where id='shield';
update public.lr_part_catalog set name='Nexo Quântico',description='Anéis violeta estabilizam um cubo de energia suspenso. Um reator de nível inicial 2 para ampliar produção e fortalecer ataque e defesa.' where id='reactor' and name='Reator quântico';
update public.lr_part_catalog set asset='quantum-reactor-v2.png',identity='{"rarity":"Épico","subtitle":"O coração de uma nova evolução"}'::jsonb||identity where id='reactor';
update public.lr_part_catalog set name='Coração da Forja',description='Um núcleo ígneo concentra o calor da forja em uma câmara protegida. Alimenta a produção e reforça os ataques dos robôs compatíveis.' where id='ember-core' and name='Núcleo de ignição';
update public.lr_part_catalog set asset='ignition-core.png',identity='{"rarity":"Raro","subtitle":"Uma centelha da Fornalha Rubra"}'::jsonb||identity where id='ember-core';
update public.lr_part_catalog set name='Muralha de Gelo',description='Cristais triangulares distribuem impactos por uma barreira fria. Uma proteção resistente para atravessar setores hostis com guardiões e exploradores.' where id='frost-shield' and name='Barreira glacial';
update public.lr_part_catalog set asset='glacial-barrier.png',identity='{"rarity":"Épico","subtitle":"Camadas de energia boreal"}'::jsonb||identity where id='frost-shield';
update public.lr_part_catalog set name='Garra Estelar',description='Uma lâmina magenta ligada ao braço transforma energia em precisão. Já começa no nível 2, pronta para reforçar os ataques de atacantes e guardiões.' where id='nova-arm' and name='Lâmina de pulsar';
update public.lr_part_catalog set asset='pulsar-blade.png',identity='{"rarity":"Épico","subtitle":"Um corte de luz violeta"}'::jsonb||identity where id='nova-arm';
update public.lr_part_catalog set name='Anel Orbital',description='Anéis dourados giram ao redor de um núcleo de satélite. O circuito orbital aumenta a produção e distribui força por ataque e defesa em todas as classes.' where id='orbit-reactor' and name='Reator orbital';
update public.lr_part_catalog set asset='orbital-reactor.png',identity='{"rarity":"Lendário","subtitle":"Energia em movimento contínuo"}'::jsonb||identity where id='orbit-reactor';
update public.lr_story_chapters set definition=jsonb_set(definition,'{scene}','"forge"'::jsonb) where id=8 and definition->>'scene'='ember';
update public.lr_story_chapters set definition=jsonb_set(definition,'{scene}','"crystal"'::jsonb) where id=10 and definition->>'scene'='frost';
update public.lr_settings set value='{"productionMultiplier":10,"principalReturnPercent":100}'::jsonb||value where key='economy';
update public.lr_settings set value='{"worldBackground":"city","backgroundIntensity":0.55,"visualMotion":true,"battleAtmosphere":true,"defaultStoryControl":"auto"}'::jsonb||value where key='presentation';

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
      'referredByCode',(select p.referral_code from public.lr_profiles p where p.id=v_profile.referrer_id),'role',case when exists(select 1 from public.lr_admin_roles a where a.user_id=p_user_id) then 'admin' else 'user' end,
      'isAdmin',exists(select 1 from public.lr_admin_roles a where a.user_id=p_user_id)),
    'settings',coalesce(v_presentation,'{}'::jsonb)||coalesce(v_economy,'{}'::jsonb)||jsonb_build_object('realMoneyEnabled',false,'social',coalesce((select s.value from public.lr_settings s where s.key='social'),'{}'::jsonb)),
    'chapters',coalesce((select jsonb_agg(c.definition||jsonb_build_object('id',c.id,'title',c.title,'place',c.place,'story',c.story,'power',c.required_power,'reward',c.reward_rc_minor/100.0,'enabled',c.active) order by c.id) from public.lr_story_chapters c),'[]'::jsonb),
    'seasons',coalesce((select s.value from public.lr_settings s where s.key='seasons'),'[]'::jsonb),
    'arenaRoster',coalesce((select s.value from public.lr_settings s where s.key='arena_roster'),'[]'::jsonb),
    'catalog',coalesce((select jsonb_agg(c.identity||jsonb_build_object('id',c.id,'name',c.name,'type',c.robot_type,'rarity',c.rarity,'description',c.description,
      'asset',c.asset,'color',c.color,'price',c.price_minor/100.0,'currency',c.currency,'daily',c.daily_rc_minor/100.0,'lifetime',c.lifetime_days,
      'maxBattles',c.max_battles,'maxLevel',c.max_level,'attack',c.attack,'defense',c.defense,'health',c.health) order by c.sort_order,c.id)
      from public.lr_robot_catalog c where c.active),'[]'::jsonb),
    'parts',coalesce((select jsonb_agg(c.identity||jsonb_build_object('id',c.id,'name',c.name,'slot',c.slot,'description',c.description,'asset',c.asset,
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
      'principalReturnLC',r.principal_return_lc_minor/100.0,'principalReturnedAt',extract(epoch from r.principal_returned_at)*1000,
      'contract',case when r.acquisition_contract is not null then r.acquisition_contract||jsonb_build_object('principalReturnLC',r.principal_return_lc_minor/100.0,'expiresAt',extract(epoch from r.expires_at)*1000) else null end,
      'equipment',coalesce((select jsonb_agg(i.id) from public.lr_owned_parts i where i.equipped_robot_id=r.id),'[]'::jsonb)) order by r.acquired_at)
      from public.lr_owned_robots r where r.user_id=p_user_id and r.mode='demo'),'[]'::jsonb),
    'inventory',coalesce((select jsonb_agg(jsonb_build_object('uid',i.id,'partId',i.catalog_id,'level',i.level,'equippedOn',i.equipped_robot_id))
      from public.lr_owned_parts i where i.user_id=p_user_id and i.mode='demo'),'[]'::jsonb),
    'transactions',coalesce((select jsonb_agg(x.data order by x.recorded_at desc) from (select e.created_at recorded_at,jsonb_build_object('id',e.id,'kind',e.reference_type,
      'currency',e.currency,'amount',case when e.operation in ('debit','reserve','capture') then -e.amount_minor/100.0 else e.amount_minor/100.0 end,
      'operation',e.operation,'at',extract(epoch from e.created_at)*1000,'status','demo-servidor') data from public.lr_ledger e
      where e.user_id=p_user_id and e.mode='demo' order by e.created_at desc limit 120) x),'[]'::jsonb),
    'story',coalesce((select max(s.chapter_id) from public.lr_story_progress s where s.user_id=p_user_id and s.mode='demo'),0),
    'affiliates',public.lr_team_snapshot(p_user_id),
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
