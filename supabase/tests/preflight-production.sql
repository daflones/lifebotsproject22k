-- LifeBots 0.8.0: consultas no SQL Editor do projeto edzgczsnxlkhkpovtspg.
-- Sem writes, e sem leitura de valores do Vault, tokens, e-mails ou chaves Pix.

select version, name
from supabase_migrations.schema_migrations
where version between '20261011000100' and '20261013001500'
order by version;

select 'catalogo_ativo' as check_name, count(*) as quantity
from public.lr_robot_catalog where active = true
union all
select 'admins_cadastrados', count(*) from public.lr_admin_roles where role = 'admin';

select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('lr_profiles','lr_admin_roles','lr_wallets','lr_ledger',
    'lr_game_accounts','lr_game_world','lr_game_requests','lr_cash_operations',
    'lr_live_chat','lr_game_signals','lr_media')
order by c.relname;

select p.proname as function_name,
  has_function_privilege('anon', p.oid, 'execute') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'execute') as user_can_execute,
  has_function_privilege('service_role', p.oid, 'execute') as service_can_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('lr_engine_load','lr_engine_commit','lr_cash_prepare',
    'lr_cash_claim','lr_cash_review','lr_cash_update','lr_schedule_tick')
order by p.proname;

select coalesce((value ->> 'real_money_enabled')::boolean, false) as real_money_enabled
from public.lr_settings where key = 'deployment';

select jobname, schedule, active
from cron.job where jobname = 'lifebots-daily-and-payments';

select d.status, d.start_time, d.end_time
from cron.job_run_details d join cron.job j on j.jobid = d.jobid
where j.jobname = 'lifebots-daily-and-payments'
order by d.start_time desc limit 5;

select day, processed, failed, payments
from public.lr_job_runs order by day desc limit 5;

select pubname, schemaname, tablename
from pg_publication_tables
where schemaname = 'public' and tablename in ('lr_live_chat','lr_game_signals')
order by pubname, tablename;
