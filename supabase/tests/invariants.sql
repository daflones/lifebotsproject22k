-- Run only against a disposable LOCAL Supabase database after both migrations.
-- Every fixture and mutation is rolled back. Supabase CLI uses pg_prove/pgTAP.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users(id,email,role,aud,email_confirmed_at,raw_user_meta_data) values
('f0000000-0000-4000-8000-000000000001','lr-test-a@example.invalid','authenticated','authenticated',now(),'{"name":"Piloto A","role":"admin"}');
insert into auth.users(id,email,role,aud,email_confirmed_at,raw_user_meta_data)
select 'f0000000-0000-4000-8000-000000000002','lr-test-b@example.invalid','authenticated','authenticated',now(),
  jsonb_build_object('name','Piloto B','referral_code',p.referral_code) from public.lr_profiles p where p.id='f0000000-0000-4000-8000-000000000001';
insert into auth.users(id,email,role,aud,email_confirmed_at,raw_user_meta_data)
select 'f0000000-0000-4000-8000-000000000003','lr-test-c@example.invalid','authenticated','authenticated',now(),
  jsonb_build_object('name','Piloto C','referral_code',p.referral_code) from public.lr_profiles p where p.id='f0000000-0000-4000-8000-000000000002';
insert into auth.users(id,email,role,aud,email_confirmed_at,raw_user_meta_data)
select 'f0000000-0000-4000-8000-000000000004','lr-test-d@example.invalid','authenticated','authenticated',now(),
  jsonb_build_object('name','Piloto D','whatsapp','+55 (11) 99999-9999','referral_code',p.referral_code) from public.lr_profiles p where p.id='f0000000-0000-4000-8000-000000000003';

select is((select count(*) from public.lr_admin_roles where user_id='f0000000-0000-4000-8000-000000000001'),0::bigint,'role in signup metadata does not grant admin');
select is((select whatsapp from public.lr_profiles where id='f0000000-0000-4000-8000-000000000004'),'5511999999999','signup normalizes WhatsApp digits');
select ok(not has_table_privilege('authenticated','public.lr_wallets','UPDATE'),'client has no balance mutation privilege');
select ok(not has_table_privilege('authenticated','public.lr_ledger','INSERT'),'client cannot insert ledger rows');
select ok(not has_function_privilege('authenticated','public.lr_wallet_apply(uuid,text,text,text,bigint,text,text)','EXECUTE'),'client cannot call money RPC');
select ok(not has_table_privilege('anon','public.lr_wallets','SELECT'),'anonymous users cannot read wallets');
select throws_ok($$select public.lr_wallet_apply('f0000000-0000-4000-8000-000000000004','real','LC','credit',100,'test','test-real-disabled')$$,'P0001','REAL_MONEY_DISABLED','real credit fails even from trusted procedure caller');
select throws_ok($$update public.lr_settings set value=value||'{"real_money_enabled":true}'::jsonb where key='deployment'$$,'23514',null,'configuration cannot enable real money');

select public.lr_wallet_apply('f0000000-0000-4000-8000-000000000004','demo','LC','credit',200000,'fixture','test-credit-once');
select public.lr_wallet_apply('f0000000-0000-4000-8000-000000000004','demo','LC','credit',200000,'fixture','test-credit-once');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000004' and mode='demo' and currency='LC'),200000::bigint,'credit retry does not increase balance twice');
select is((select count(*) from public.lr_ledger where user_id='f0000000-0000-4000-8000-000000000004' and idempotency_key='test-credit-once'),1::bigint,'one journal entry per idempotency key');
select throws_ok($$select public.lr_wallet_apply('f0000000-0000-4000-8000-000000000004','demo','LC','credit',200001,'fixture','test-credit-once')$$,'P0001','IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD','same key with different amount is rejected');
select throws_ok($$select public.lr_wallet_apply('f0000000-0000-4000-8000-000000000004','demo','LC','debit',200001,'fixture','test-overdraw-once')$$,'P0001','INSUFFICIENT_FUNDS','overdraft rolls back');
select throws_ok($$select public.lr_complete_tutorial('f0000000-0000-4000-8000-000000000004')$$,'P0001','TUTORIAL_NOT_VERIFIED','tutorial requires server evidence');
insert into public.lr_tutorial_progress(user_id,step,evidence)
select 'f0000000-0000-4000-8000-000000000004',x.step,'{"source":"local-test-fixture"}'::jsonb from (values('intro'),('wallet'),('robot_catalog')) x(step);
select is((public.lr_complete_tutorial('f0000000-0000-4000-8000-000000000004')->>'amountMinor')::bigint,30000::bigint,'tutorial uses configured bonus in minor units');
select is((public.lr_complete_tutorial('f0000000-0000-4000-8000-000000000004')->>'replayed')::boolean,true,'tutorial retry returns existing claim');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000004' and mode='demo' and currency='LC'),230000::bigint,'tutorial bonus credited only once');

select is(public.lr_reserve_demo_withdrawal('f0000000-0000-4000-8000-000000000004',1000,'fixture-vault-token','test-withdraw-once')->>'status','reserved','withdrawal starts by reserving funds');
select public.lr_reserve_demo_withdrawal('f0000000-0000-4000-8000-000000000004',1000,'fixture-vault-token','test-withdraw-once');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000004' and mode='demo' and currency='LC'),130000::bigint,'withdrawal reserve reduces available balance exactly once');
select is((select reserved_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000004' and mode='demo' and currency='LC'),100000::bigint,'withdrawal retains reservation pending payment');
select is((select count(*) from public.lr_withdrawals where user_id='f0000000-0000-4000-8000-000000000004'),1::bigint,'withdrawal retry creates one request');
select throws_ok($$select public.lr_reserve_demo_withdrawal('f0000000-0000-4000-8000-000000000004',1001,'fixture-vault-token','test-withdraw-once')$$,'P0001','IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD','withdrawal retry cannot change quote amount');

insert into public.lr_owned_robots(id,user_id,mode,catalog_id,acquired_at,expires_at,base_daily_minor,production_daily_minor,battle_limit)
values
('f1000000-0000-4000-8000-000000000004','f0000000-0000-4000-8000-000000000004','demo','moss',
  ((now() at time zone 'America/Sao_Paulo')::date-1)::timestamp at time zone 'America/Sao_Paulo',
  ((now() at time zone 'America/Sao_Paulo')::date+6)::timestamp at time zone 'America/Sao_Paulo',3000,3000,24),
('f2000000-0000-4000-8000-000000000004','f0000000-0000-4000-8000-000000000004','demo','titan',now(),now()+interval '45 days',42000,42000,180),
('f2000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','demo','titan',now(),now()+interval '45 days',42000,42000,180);
select throws_ok($$insert into public.lr_owned_parts(user_id,mode,catalog_id,slot,equipped_robot_id) values('f0000000-0000-4000-8000-000000000004','demo','arm','arm','f2000000-0000-4000-8000-000000000004')$$,'P0001','PART_INCOMPATIBLE','incompatible robot type is rejected');
select throws_ok($$insert into public.lr_owned_parts(user_id,mode,catalog_id,slot,equipped_robot_id) values('f0000000-0000-4000-8000-000000000004','demo','core','core','f2000000-0000-4000-8000-000000000001')$$,'P0001','PART_NOT_OWNED','cannot equip another user robot');
select throws_ok($$update public.lr_owned_robots set level=11 where id='f1000000-0000-4000-8000-000000000004'$$,'23514',null,'robot upgrade cap is enforced by database');
insert into public.lr_production_periods(robot_id,user_id,mode,starts_at,ends_at,daily_rc_minor)
select r.id,r.user_id,r.mode,r.acquired_at,r.expires_at,3000 from public.lr_owned_robots r where r.id='f1000000-0000-4000-8000-000000000004';
select throws_ok($$insert into public.lr_production_periods(robot_id,user_id,mode,starts_at,ends_at,daily_rc_minor) select r.id,r.user_id,r.mode,r.acquired_at+interval '1 second',r.expires_at,3000 from public.lr_owned_robots r where r.id='f1000000-0000-4000-8000-000000000004'$$,'P0001','PRODUCTION_PERIOD_OVERLAP','overlapping rate periods cannot double production');

select is((public.lr_settle_demo_day((now() at time zone 'America/Sao_Paulo')::date-1)->>'producedMinor')::bigint,3000::bigint,'settlement credits one full day at frozen rate');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000004' and mode='demo' and currency='RC'),3000::bigint,'source user receives production in RC');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000003' and mode='demo' and currency='RC'),150::bigint,'level one gets 5 percent of production');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000002' and mode='demo' and currency='RC'),60::bigint,'level two gets 2 percent of production');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000001' and mode='demo' and currency='RC'),30::bigint,'level three gets 1 percent of production');
select is((public.lr_settle_demo_day((now() at time zone 'America/Sao_Paulo')::date-1)->>'processed')::integer,0,'daily replay performs no duplicate settlement');
select is((select count(*) from public.lr_daily_rewards where robot_id='f1000000-0000-4000-8000-000000000004'),1::bigint,'one daily reward per robot and date');
select is((select count(*) from public.lr_commissions where source_user_id='f0000000-0000-4000-8000-000000000004'),3::bigint,'exactly one commission per level');
select is((select available_minor from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000003' and mode='demo' and currency='RC'),150::bigint,'retry cannot duplicate referral credit');
select throws_ok($$update public.lr_production_periods set daily_rc_minor=6000 where robot_id='f1000000-0000-4000-8000-000000000004'$$,'P0001','SETTLED_RATE_PERIOD_IMMUTABLE','cannot retroactively change settled production rate');
select throws_ok($$select public.lr_settle_demo_day((now() at time zone 'America/Sao_Paulo')::date)$$,'P0001','INVALID_SETTLEMENT_DATE','today cannot be paid as a full completed day');

select set_config('request.jwt.claims','{"sub":"f0000000-0000-4000-8000-000000000004","role":"authenticated"}',true);
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000004',true);
set local role authenticated;
select is((select count(*) from public.lr_profiles where id='f0000000-0000-4000-8000-000000000001'),0::bigint,'RLS prevents reading another profile');
select is((select count(*) from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000004'),6::bigint,'owner sees own distinct demo and real wallets');
select is((select count(*) from public.lr_wallets where user_id='f0000000-0000-4000-8000-000000000001'),0::bigint,'RLS prevents reading another wallet');
select throws_ok($$update public.lr_wallets set available_minor=999999 where user_id='f0000000-0000-4000-8000-000000000004'$$,'42501',null,'authenticated owner still cannot modify balance');
select throws_ok($$insert into public.lr_admin_roles(user_id) values('f0000000-0000-4000-8000-000000000004')$$,'42501',null,'authenticated user cannot self grant admin');
select throws_ok($$select public.lr_wallet_apply('f0000000-0000-4000-8000-000000000004','demo','LC','credit',100,'attack','test-forged-credit')$$,'42501',null,'authenticated direct RPC money call is denied');
select throws_ok($$select * from public.lr_payment_events$$,'42501',null,'provider payload metadata is server only');
reset role;
select * from finish();
rollback;
