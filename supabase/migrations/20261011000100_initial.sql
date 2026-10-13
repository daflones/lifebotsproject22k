-- LifeBots only. Use a NEW Supabase project, never the Eletrify database.
-- Amounts are integer minor units: 100 minor units = 1 LC, 1 RC or R$1.
-- This foundation deliberately permits settlement only in the demo namespace.
begin;

create table if not exists public.lr_profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null check (length(display_name) between 1 and 80),
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{10,15}$'),
  referral_code text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
  referrer_id uuid references public.lr_profiles(id) on delete restrict,
  status text not null default 'active' check (status in ('active','blocked','archived')),
  created_at timestamptz not null default now(),
  check (referrer_id is distinct from id)
);
create index if not exists lr_profiles_referrer_idx on public.lr_profiles(referrer_id);

-- This table is writable only by trusted SQL/migrations, never user metadata.
create table if not exists public.lr_admin_roles (
  user_id uuid primary key references public.lr_profiles(id) on delete restrict,
  role text not null default 'admin' check (role = 'admin'),
  granted_at timestamptz not null default now()
);

create table if not exists public.lr_settings (
  key text primary key,
  value jsonb not null check (jsonb_typeof(value) = 'object'),
  visibility text not null default 'public' check (visibility in ('public','server')),
  version integer not null default 1 check (version > 0),
  updated_by uuid references public.lr_profiles(id),
  updated_at timestamptz not null default now(),
  constraint lr_real_money_disabled check (
    key <> 'deployment' or coalesce((value->>'real_money_enabled')::boolean, false) = false
  )
);

create table if not exists public.lr_robot_catalog (
  id text primary key,
  name text not null,
  robot_type text not null,
  rarity text not null,
  description text not null default '',
  asset text not null,
  color text not null default '#bddf91',
  price_minor bigint not null check (price_minor between 1 and 9000000000000000),
  currency text not null check (currency in ('LC','RC')),
  daily_rc_minor bigint not null check (daily_rc_minor between 0 and 9000000000000000),
  lifetime_days integer not null check (lifetime_days between 1 and 3650),
  max_battles integer not null check (max_battles between 0 and 1000000),
  max_level integer not null default 10 check (max_level between 1 and 100),
  attack integer not null check (attack >= 0),
  defense integer not null check (defense >= 0),
  health integer not null check (health > 0),
  active boolean not null default true,
  sort_order integer not null default 0,
  version integer not null default 1 check (version > 0)
);
create table if not exists public.lr_part_catalog (
  id text primary key,
  name text not null,
  slot text not null check (slot in ('core','arm','shield','legs','sensor')),
  description text not null default '',
  asset text,
  price_minor bigint not null check (price_minor between 1 and 9000000000000000),
  currency text not null check (currency in ('LC','RC')),
  production_boost_bp integer not null check (production_boost_bp between 0 and 100000),
  attack integer not null default 0 check (attack >= 0),
  defense integer not null default 0 check (defense >= 0),
  max_level integer not null default 10 check (max_level between 1 and 100),
  display_level integer not null default 1 check (display_level >= 1),
  active boolean not null default true,
  version integer not null default 1 check (version > 0)
);
create table if not exists public.lr_part_compatibility (
  part_id text not null references public.lr_part_catalog(id),
  robot_type text not null,
  primary key (part_id,robot_type)
);

create table if not exists public.lr_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  currency text not null check (currency in ('LC','RC','BRL')),
  available_minor bigint not null default 0 check (available_minor between 0 and 9000000000000000),
  reserved_minor bigint not null default 0 check (reserved_minor between 0 and 9000000000000000),
  updated_at timestamptz not null default now(),
  unique(user_id,mode,currency),
  unique(id,user_id,mode,currency)
);
create table if not exists public.lr_ledger (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null,
  user_id uuid not null,
  mode text not null,
  currency text not null,
  operation text not null check (operation in ('credit','debit','reserve','release','capture')),
  amount_minor bigint not null check (amount_minor between 1 and 9000000000000000),
  available_after_minor bigint not null check (available_after_minor >= 0),
  reserved_after_minor bigint not null check (reserved_after_minor >= 0),
  reference_type text not null,
  idempotency_key text not null check (length(idempotency_key) between 8 and 180),
  created_at timestamptz not null default now(),
  foreign key (wallet_id,user_id,mode,currency) references public.lr_wallets(id,user_id,mode,currency),
  unique(wallet_id,idempotency_key)
);
create index if not exists lr_ledger_user_date_idx on public.lr_ledger(user_id,mode,created_at desc);

create table if not exists public.lr_owned_robots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  catalog_id text not null references public.lr_robot_catalog(id),
  catalog_version integer not null default 1 check (catalog_version > 0),
  acquired_at timestamptz not null default now(),
  expires_at timestamptz not null,
  level integer not null default 1 check (level > 0),
  max_level integer not null default 10 check (max_level between 1 and 100),
  base_daily_minor bigint not null check (base_daily_minor >= 0),
  production_daily_minor bigint not null check (production_daily_minor >= 0),
  battle_limit integer not null check (battle_limit >= 0),
  battles_used integer not null default 0 check (battles_used >= 0),
  earned_minor bigint not null default 0 check (earned_minor >= 0),
  last_settled_at timestamptz,
  unique(id,user_id,mode),
  check (expires_at > acquired_at),
  check (level <= max_level),
  check (battles_used <= battle_limit)
);
create index if not exists lr_owned_robots_owner_idx on public.lr_owned_robots(user_id,mode);
create table if not exists public.lr_owned_parts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  catalog_id text not null references public.lr_part_catalog(id),
  catalog_version integer not null default 1 check (catalog_version > 0),
  level integer not null default 1 check (level > 0),
  max_level integer not null default 10 check (max_level between 1 and 100),
  slot text not null,
  equipped_robot_id uuid,
  acquired_at timestamptz not null default now(),
  foreign key (equipped_robot_id,user_id,mode) references public.lr_owned_robots(id,user_id,mode),
  unique(equipped_robot_id,slot),
  check (level <= max_level)
);
create index if not exists lr_owned_parts_owner_idx on public.lr_owned_parts(user_id,mode);

-- Append rate intervals on every upgrade/equip/rate change; never rewrite history.
create table if not exists public.lr_production_periods (
  id uuid primary key default gen_random_uuid(),
  robot_id uuid not null,
  user_id uuid not null,
  mode text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  daily_rc_minor bigint not null check (daily_rc_minor >= 0),
  foreign key (robot_id,user_id,mode) references public.lr_owned_robots(id,user_id,mode),
  check (ends_at > starts_at),
  unique(robot_id,starts_at)
);
create index if not exists lr_production_periods_robot_idx on public.lr_production_periods(robot_id,starts_at,ends_at);
create table if not exists public.lr_daily_rewards (
  id uuid primary key default gen_random_uuid(),
  robot_id uuid not null,
  user_id uuid not null,
  mode text not null,
  production_date date not null,
  amount_minor bigint not null check (amount_minor >= 0),
  commission_rates_bp integer[] not null check (cardinality(commission_rates_bp) = 3),
  created_at timestamptz not null default now(),
  foreign key (robot_id,user_id,mode) references public.lr_owned_robots(id,user_id,mode),
  unique(robot_id,mode,production_date),
  unique(id,mode)
);
create index if not exists lr_daily_rewards_owner_idx on public.lr_daily_rewards(user_id,mode,production_date desc);
create table if not exists public.lr_commissions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null,
  mode text not null,
  beneficiary_id uuid not null references public.lr_profiles(id),
  source_user_id uuid not null references public.lr_profiles(id),
  level integer not null check (level between 1 and 3),
  rate_bp integer not null check (rate_bp between 0 and 10000),
  amount_minor bigint not null check (amount_minor > 0),
  created_at timestamptz not null default now(),
  foreign key (reward_id,mode) references public.lr_daily_rewards(id,mode),
  unique(reward_id,level),
  check (source_user_id <> beneficiary_id)
);
create index if not exists lr_commissions_beneficiary_idx on public.lr_commissions(beneficiary_id,created_at desc);

create table if not exists public.lr_tutorial_progress (
  user_id uuid not null references public.lr_profiles(id),
  step text not null check (step in ('intro','wallet','robot_catalog')),
  evidence jsonb not null check (jsonb_typeof(evidence) = 'object'),
  verified_at timestamptz not null default now(),
  primary key(user_id,step)
);
create table if not exists public.lr_tutorial_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  amount_minor bigint not null check (amount_minor >= 0),
  claimed_at timestamptz not null default now(),
  unique(user_id,mode)
);

create table if not exists public.lr_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  kind text not null check (kind in ('robot','part','upgrade_robot','upgrade_part','conversion','arena_pass','deposit','withdrawal')),
  currency text not null check (currency in ('LC','RC','BRL')),
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'created' check (status in ('created','pending','reserved','completed','failed','cancelled','review')),
  quote jsonb not null default '{}'::jsonb check (jsonb_typeof(quote)='object'),
  idempotency_key text not null check (length(idempotency_key) between 8 and 180),
  provider text,
  provider_reference_id text,
  created_at timestamptz not null default now(),
  unique(user_id,mode,idempotency_key),
  unique(id,user_id,mode),
  unique(provider,provider_reference_id)
);
create index if not exists lr_orders_user_date_idx on public.lr_orders(user_id,created_at desc);
create table if not exists public.lr_deposits (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique,
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  requested_brl_cents bigint not null check (requested_brl_cents > 0),
  quoted_lc_minor bigint not null check (quoted_lc_minor > 0),
  provider text,
  provider_reference_id text,
  status text not null default 'pending' check (status in ('pending','confirmed','expired','failed','review')),
  created_at timestamptz not null default now(),
  foreign key (order_id,user_id,mode) references public.lr_orders(id,user_id,mode),
  unique(provider,provider_reference_id)
);
create table if not exists public.lr_withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  requested_brl_cents bigint not null check (requested_brl_cents > 0),
  fee_brl_cents bigint not null check (fee_brl_cents >= 0),
  total_debit_lc_minor bigint not null check (total_debit_lc_minor > 0),
  provider_total_debit_cents bigint check (provider_total_debit_cents >= 0),
  quote jsonb not null check (jsonb_typeof(quote)='object'),
  destination_token text not null,
  status text not null default 'reserved' check (status in ('reserved','pending','paid','failed','cancelled','review')),
  idempotency_key text not null check (length(idempotency_key) between 8 and 160),
  provider text,
  provider_reference_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,mode,idempotency_key),
  unique(provider,provider_reference_id)
);
create index if not exists lr_withdrawals_owner_idx on public.lr_withdrawals(user_id,created_at desc);
create table if not exists public.lr_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  delivery_id text not null,
  reference_id text not null,
  event_type text not null,
  payload_sha256 text not null check (payload_sha256 ~ '^[a-f0-9]{64}$'),
  order_id uuid references public.lr_orders(id),
  status text not null default 'verified' check (status in ('verified','processed','review','rejected')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique(provider,delivery_id)
);

create table if not exists public.lr_daily_arena (
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  day date not null,
  free_limit integer not null default 4 check (free_limit >= 0),
  purchased integer not null default 0 check (purchased >= 0),
  used integer not null default 0 check (used >= 0),
  primary key(user_id,mode,day),
  check (used <= free_limit + purchased)
);
create table if not exists public.lr_arena_matches (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('demo','real')),
  challenger_id uuid not null references public.lr_profiles(id),
  opponent_id uuid not null references public.lr_profiles(id),
  challenger_robot_id uuid not null,
  opponent_robot_id uuid not null,
  status text not null default 'reserved' check (status in ('reserved','running','settled','cancelled')),
  request_key text not null unique,
  server_seed_commitment text,
  replay jsonb,
  created_at timestamptz not null default now(),
  foreign key (challenger_robot_id,challenger_id,mode) references public.lr_owned_robots(id,user_id,mode),
  foreign key (opponent_robot_id,opponent_id,mode) references public.lr_owned_robots(id,user_id,mode),
  check (challenger_id <> opponent_id)
);
create table if not exists public.lr_story_chapters (
  id integer primary key check (id > 0),
  title text not null,
  place text not null,
  story text not null,
  required_power integer not null check (required_power >= 0),
  reward_rc_minor bigint not null check (reward_rc_minor >= 0),
  active boolean not null default true
);
create table if not exists public.lr_story_progress (
  user_id uuid not null references public.lr_profiles(id),
  mode text not null check (mode in ('demo','real')),
  chapter_id integer not null references public.lr_story_chapters(id),
  reward_rc_minor bigint not null check (reward_rc_minor >= 0),
  completed_at timestamptz not null default now(),
  primary key(user_id,mode,chapter_id)
);
create table if not exists public.lr_admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.lr_profiles(id),
  action text not null,
  resource text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.lr_handle_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_phone text; v_ref uuid;
begin
  v_phone := nullif(regexp_replace(coalesce(new.raw_user_meta_data->>'whatsapp',''), '[^0-9]', '', 'g'), '');
  if v_phone is not null and v_phone !~ '^[0-9]{10,15}$' then v_phone := null; end if;
  select p.id into v_ref from public.lr_profiles p
    where p.referral_code = upper(new.raw_user_meta_data->>'referral_code') and p.status = 'active';
  insert into public.lr_profiles(id,display_name,whatsapp,referrer_id)
  values(new.id,coalesce(nullif(left(btrim(new.raw_user_meta_data->>'name'),80),''),'Piloto'),v_phone,v_ref)
  on conflict(id) do nothing;
  insert into public.lr_wallets(user_id,mode,currency)
    select new.id,m.mode,c.currency from (values('demo'),('real')) m(mode)
    cross join (values('LC'),('RC'),('BRL')) c(currency)
    on conflict(user_id,mode,currency) do nothing;
  return new;
end;
$$;
drop trigger if exists lr_auth_signup on auth.users;
create trigger lr_auth_signup after insert on auth.users for each row execute function public.lr_handle_signup();

create or replace function public.lr_validate_part() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_slot text; v_type text; v_robot public.lr_owned_robots;
begin
  select p.slot into v_slot from public.lr_part_catalog p where p.id = new.catalog_id;
  if new.slot is distinct from v_slot then raise exception 'PART_SLOT_MISMATCH'; end if;
  if new.equipped_robot_id is not null then
    select r.* into v_robot from public.lr_owned_robots r where r.id = new.equipped_robot_id for update;
    if v_robot.user_id is distinct from new.user_id or v_robot.mode is distinct from new.mode then
      raise exception 'PART_NOT_OWNED';
    end if;
    if v_robot.expires_at <= now() then raise exception 'ROBOT_EXPIRED'; end if;
    select c.robot_type into v_type from public.lr_robot_catalog c where c.id = v_robot.catalog_id;
    if not exists(select 1 from public.lr_part_compatibility c where c.part_id = new.catalog_id and c.robot_type = v_type) then
      raise exception 'PART_INCOMPATIBLE';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists lr_part_validation on public.lr_owned_parts;
create trigger lr_part_validation before insert or update on public.lr_owned_parts for each row execute function public.lr_validate_part();

create or replace function public.lr_validate_period() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_robot public.lr_owned_robots; v_settled_through timestamptz;
begin
  select r.* into v_robot from public.lr_owned_robots r where r.id = new.robot_id for update;
  if new.starts_at < v_robot.acquired_at or new.ends_at > v_robot.expires_at then raise exception 'PERIOD_OUT_OF_ROBOT_LIFETIME'; end if;
  if exists(select 1 from public.lr_production_periods p where p.robot_id = new.robot_id and p.id <> new.id
    and p.starts_at < new.ends_at and p.ends_at > new.starts_at) then raise exception 'PRODUCTION_PERIOD_OVERLAP'; end if;
  if tg_op = 'INSERT' and exists(select 1 from public.lr_daily_rewards d where d.robot_id = new.robot_id
    and (d.production_date::timestamp at time zone 'America/Sao_Paulo') < new.ends_at
    and ((d.production_date+1)::timestamp at time zone 'America/Sao_Paulo') > new.starts_at) then
      raise exception 'SETTLED_RATE_PERIOD_IMMUTABLE';
  end if;
  if tg_op = 'UPDATE' then
    if new.robot_id is distinct from old.robot_id or new.user_id is distinct from old.user_id or new.mode is distinct from old.mode then
      raise exception 'RATE_PERIOD_IDENTITY_IMMUTABLE';
    end if;
    select max(least(old.ends_at,(d.production_date+1)::timestamp at time zone 'America/Sao_Paulo')) into v_settled_through
      from public.lr_daily_rewards d where d.robot_id=old.robot_id
      and (d.production_date::timestamp at time zone 'America/Sao_Paulo')<old.ends_at
      and ((d.production_date+1)::timestamp at time zone 'America/Sao_Paulo')>old.starts_at;
    if v_settled_through is not null and (new.starts_at is distinct from old.starts_at
      or new.daily_rc_minor is distinct from old.daily_rc_minor or new.ends_at<v_settled_through) then
      raise exception 'SETTLED_RATE_PERIOD_IMMUTABLE';
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists lr_period_validation on public.lr_production_periods;
create trigger lr_period_validation before insert or update on public.lr_production_periods for each row execute function public.lr_validate_period();

create or replace function public.lr_immutable_ledger() returns trigger
language plpgsql set search_path = '' as $$ begin raise exception 'LEDGER_APPEND_ONLY'; end; $$;
drop trigger if exists lr_ledger_immutable on public.lr_ledger;
create trigger lr_ledger_immutable before update or delete on public.lr_ledger for each row execute function public.lr_immutable_ledger();

-- Only trusted server procedures can invoke this. Real mode always fails closed.
create or replace function public.lr_wallet_apply(
  p_user_id uuid,p_mode text,p_currency text,p_operation text,p_amount_minor bigint,p_reference_type text,p_key text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_wallet public.lr_wallets; v_entry public.lr_ledger; v_available bigint; v_reserved bigint; v_id uuid;
begin
  if p_mode is distinct from 'demo' then raise exception 'REAL_MONEY_DISABLED'; end if;
  if p_amount_minor is null or p_amount_minor < 1 or p_amount_minor > 9000000000000000 then raise exception 'INVALID_AMOUNT'; end if;
  if p_key is null or length(p_key) not between 8 and 180 then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;
  if not exists(select 1 from public.lr_profiles p where p.id=p_user_id and p.status='active') then raise exception 'USER_NOT_ACTIVE'; end if;
  insert into public.lr_wallets(user_id,mode,currency) values(p_user_id,p_mode,p_currency) on conflict(user_id,mode,currency) do nothing;
  select w.* into strict v_wallet from public.lr_wallets w where w.user_id=p_user_id and w.mode=p_mode and w.currency=p_currency for update;
  select e.* into v_entry from public.lr_ledger e where e.wallet_id=v_wallet.id and e.idempotency_key=p_key;
  if found then
    if v_entry.amount_minor <> p_amount_minor or v_entry.operation <> p_operation or v_entry.reference_type <> p_reference_type then
      raise exception 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD';
    end if;
    return v_entry.id;
  end if;
  v_available := v_wallet.available_minor; v_reserved := v_wallet.reserved_minor;
  case p_operation
    when 'credit' then v_available := v_available+p_amount_minor;
    when 'debit' then v_available := v_available-p_amount_minor;
    when 'reserve' then v_available := v_available-p_amount_minor; v_reserved := v_reserved+p_amount_minor;
    when 'release' then v_available := v_available+p_amount_minor; v_reserved := v_reserved-p_amount_minor;
    when 'capture' then v_reserved := v_reserved-p_amount_minor;
    else raise exception 'INVALID_WALLET_OPERATION';
  end case;
  if v_available < 0 or v_reserved < 0 then raise exception 'INSUFFICIENT_FUNDS'; end if;
  update public.lr_wallets set available_minor=v_available,reserved_minor=v_reserved,updated_at=now() where id=v_wallet.id;
  insert into public.lr_ledger(wallet_id,user_id,mode,currency,operation,amount_minor,available_after_minor,reserved_after_minor,reference_type,idempotency_key)
  values(v_wallet.id,p_user_id,p_mode,p_currency,p_operation,p_amount_minor,v_available,v_reserved,p_reference_type,p_key) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.lr_complete_tutorial(p_user_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_bonus bigint; v_claim public.lr_tutorial_claims; v_settings jsonb;
begin
  perform 1 from public.lr_profiles p where p.id=p_user_id and p.status='active' for update;
  if not found then raise exception 'USER_NOT_ACTIVE'; end if;
  select c.* into v_claim from public.lr_tutorial_claims c where c.user_id=p_user_id and c.mode='demo';
  if found then return jsonb_build_object('claimId',v_claim.id,'amountMinor',v_claim.amount_minor,'replayed',true,'mode','demo'); end if;
  if not exists(select 1 from auth.users u where u.id=p_user_id and u.email_confirmed_at is not null) then raise exception 'EMAIL_NOT_CONFIRMED'; end if;
  if (select count(*) from public.lr_tutorial_progress p where p.user_id=p_user_id) <> 3 then raise exception 'TUTORIAL_NOT_VERIFIED'; end if;
  select s.value into strict v_settings from public.lr_settings s where s.key='economy';
  v_bonus := (v_settings->>'tutorialBonus')::bigint * 100;
  if v_bonus is null or v_bonus < 0 then raise exception 'INVALID_TUTORIAL_BONUS'; end if;
  insert into public.lr_tutorial_claims(user_id,mode,amount_minor) values(p_user_id,'demo',v_bonus) returning * into v_claim;
  if v_bonus > 0 then perform public.lr_wallet_apply(p_user_id,'demo','LC','credit',v_bonus,'tutorial','tutorial:'||v_claim.id); end if;
  return jsonb_build_object('claimId',v_claim.id,'amountMinor',v_bonus,'replayed',false,'mode','demo');
end;
$$;

create or replace function public.lr_reserve_demo_withdrawal(p_user_id uuid,p_brl_cents bigint,p_destination_token text,p_key text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_settings jsonb; v_fee bigint; v_lc bigint; v_row public.lr_withdrawals;
begin
  if p_brl_cents is null or p_brl_cents <= 0 or p_brl_cents > 100000000 then raise exception 'INVALID_AMOUNT'; end if;
  if p_key is null or length(p_key) not between 8 and 160 then raise exception 'INVALID_IDEMPOTENCY_KEY'; end if;
  if p_destination_token is null or length(p_destination_token) not between 1 and 200 then raise exception 'INVALID_DESTINATION_TOKEN'; end if;
  perform 1 from public.lr_profiles p where p.id=p_user_id and p.status='active' for update;
  if not found then raise exception 'USER_NOT_ACTIVE'; end if;
  select w.* into v_row from public.lr_withdrawals w where w.user_id=p_user_id and w.mode='demo' and w.idempotency_key=p_key;
  if found then
    if v_row.requested_brl_cents<>p_brl_cents or v_row.destination_token<>p_destination_token then raise exception 'IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_PAYLOAD'; end if;
    return to_jsonb(v_row)-'destination_token';
  end if;
  select s.value into strict v_settings from public.lr_settings s where s.key='economy';
  if p_brl_cents < ceiling((v_settings->>'minWithdraw')::numeric*100) then raise exception 'WITHDRAWAL_BELOW_MINIMUM'; end if;
  v_fee := ceiling(p_brl_cents*(v_settings->>'withdrawFee')::numeric/100);
  v_lc := ceiling((p_brl_cents+v_fee)*(v_settings->>'lcPerReal')::numeric);
  insert into public.lr_withdrawals(user_id,mode,requested_brl_cents,fee_brl_cents,total_debit_lc_minor,destination_token,idempotency_key,quote)
  values(p_user_id,'demo',p_brl_cents,v_fee,v_lc,p_destination_token,p_key,
    jsonb_build_object('lcPerReal',v_settings->'lcPerReal','feePercent',v_settings->'withdrawFee','simulated',true)) returning * into v_row;
  perform public.lr_wallet_apply(p_user_id,'demo','LC','reserve',v_lc,'withdrawal','withdrawal:reserve:'||v_row.id);
  return to_jsonb(v_row)-'destination_token';
end;
$$;

-- Completed São Paulo calendar days only. Prorates each frozen rate interval.
create or replace function public.lr_settle_demo_day(p_day date,p_limit integer default 200) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_start timestamptz; v_end timestamptz; v_today date; v_settings jsonb; v_rates integer[];
  v_robot public.lr_owned_robots; v_reward uuid; v_amount bigint; v_ref uuid; v_next uuid;
  v_level integer; v_comm bigint; v_processed integer:=0; v_sum bigint:=0; v_seen uuid[];
begin
  v_today := (now() at time zone 'America/Sao_Paulo')::date;
  if p_day is null or p_day >= v_today or p_day < v_today-30 then raise exception 'INVALID_SETTLEMENT_DATE'; end if;
  if p_limit is null or p_limit not between 1 and 500 then raise exception 'INVALID_BATCH_LIMIT'; end if;
  perform pg_advisory_xact_lock(hashtext('liferobots-demo-settlement'));
  v_start := p_day::timestamp at time zone 'America/Sao_Paulo';
  v_end := (p_day+1)::timestamp at time zone 'America/Sao_Paulo';
  select s.value into strict v_settings from public.lr_settings s where s.key='economy';
  select array_agg((x.value::numeric*100)::integer order by x.ordinality) into v_rates
    from jsonb_array_elements_text(v_settings->'commissions') with ordinality x(value,ordinality);
  if v_rates is null or cardinality(v_rates)<>3 or exists(select 1 from unnest(v_rates) r where r<0 or r>10000)
    or (select sum(r) from unnest(v_rates) r)>10000 then raise exception 'INVALID_COMMISSION_RATES'; end if;
  for v_robot in
    select r.* from public.lr_owned_robots r join public.lr_profiles p on p.id=r.user_id
      where r.mode='demo' and p.status='active' and r.acquired_at<v_end and r.expires_at>v_start
      and not exists(select 1 from public.lr_daily_rewards d where d.robot_id=r.id and d.mode='demo' and d.production_date=p_day)
      order by r.id limit p_limit for update of r
  loop
    select coalesce(floor(sum(p.daily_rc_minor::numeric*extract(epoch from
      least(p.ends_at,v_end)-greatest(p.starts_at,v_start))/86400)),0)::bigint into v_amount
      from public.lr_production_periods p where p.robot_id=v_robot.id and p.mode='demo' and p.starts_at<v_end and p.ends_at>v_start;
    insert into public.lr_daily_rewards(robot_id,user_id,mode,production_date,amount_minor,commission_rates_bp)
      values(v_robot.id,v_robot.user_id,'demo',p_day,v_amount,v_rates) returning id into v_reward;
    if v_amount > 0 then
      perform public.lr_wallet_apply(v_robot.user_id,'demo','RC','credit',v_amount,'daily_production','production:'||v_reward);
      update public.lr_owned_robots set earned_minor=earned_minor+v_amount,last_settled_at=greatest(coalesce(last_settled_at,acquired_at),least(expires_at,v_end)) where id=v_robot.id;
      select p.referrer_id into v_ref from public.lr_profiles p where p.id=v_robot.user_id;
      v_seen:=array[v_robot.user_id];
      for v_level in 1..3 loop
        exit when v_ref is null;
        if v_ref=any(v_seen) then raise exception 'REFERRAL_CYCLE'; end if;
        v_seen:=array_append(v_seen,v_ref);
        v_comm := floor(v_amount::numeric*v_rates[v_level]/10000)::bigint;
        select p.referrer_id into v_next from public.lr_profiles p where p.id=v_ref;
        if v_comm>0 and exists(select 1 from public.lr_profiles p where p.id=v_ref and p.status='active') then
          insert into public.lr_commissions(reward_id,mode,beneficiary_id,source_user_id,level,rate_bp,amount_minor)
            values(v_reward,'demo',v_ref,v_robot.user_id,v_level,v_rates[v_level],v_comm);
          perform public.lr_wallet_apply(v_ref,'demo','RC','credit',v_comm,'referral_production','commission:'||v_reward||':'||v_level);
        end if;
        v_ref := v_next;
      end loop;
    end if;
    v_processed:=v_processed+1; v_sum:=v_sum+v_amount;
  end loop;
  return jsonb_build_object('mode','demo','day',p_day,'processed',v_processed,'producedMinor',v_sum,'batchLimit',p_limit);
end;
$$;

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

-- Apply privileges only to lr_ tables/functions; never revoke unrelated project objects.
do $$
declare v_table record; v_fn record;
begin
  for v_table in select tablename from pg_tables where schemaname='public' and left(tablename,3)='lr_' loop
    execute format('alter table public.%I enable row level security',v_table.tablename);
    execute format('revoke all on public.%I from public,anon,authenticated,service_role',v_table.tablename);
    execute format('grant select on public.%I to service_role',v_table.tablename);
  end loop;
  for v_fn in select p.oid::regprocedure signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and left(p.proname,3)='lr_' loop
    execute format('revoke all on function %s from public,anon,authenticated,service_role',v_fn.signature);
    execute format('grant execute on function %s to service_role',v_fn.signature);
  end loop;
end;
$$;

-- Reading only: no client INSERT/UPDATE/DELETE policy exists for economic tables.
grant select on public.lr_profiles,public.lr_wallets,public.lr_ledger,public.lr_owned_robots,public.lr_owned_parts,
  public.lr_daily_rewards,public.lr_commissions,public.lr_tutorial_progress,public.lr_tutorial_claims,
  public.lr_orders,public.lr_deposits,public.lr_withdrawals,public.lr_daily_arena,public.lr_arena_matches,public.lr_story_progress to authenticated;
grant select on public.lr_settings,public.lr_robot_catalog,public.lr_part_catalog,public.lr_part_compatibility,public.lr_story_chapters to authenticated;

drop policy if exists lr_profiles_own on public.lr_profiles;
create policy lr_profiles_own on public.lr_profiles for select to authenticated using (id=(select auth.uid()));
do $$ declare v_table text; begin
  foreach v_table in array array['lr_wallets','lr_ledger','lr_owned_robots','lr_owned_parts','lr_daily_rewards',
    'lr_tutorial_progress','lr_tutorial_claims','lr_orders','lr_deposits','lr_withdrawals','lr_daily_arena','lr_story_progress'] loop
    execute format('drop policy if exists lr_owner_read on public.%I',v_table);
    execute format('create policy lr_owner_read on public.%I for select to authenticated using (user_id=(select auth.uid()))',v_table);
  end loop;
end; $$;
drop policy if exists lr_commission_own on public.lr_commissions;
create policy lr_commission_own on public.lr_commissions for select to authenticated using (beneficiary_id=(select auth.uid()));
drop policy if exists lr_arena_participant on public.lr_arena_matches;
create policy lr_arena_participant on public.lr_arena_matches for select to authenticated using (challenger_id=(select auth.uid()) or opponent_id=(select auth.uid()));
drop policy if exists lr_public_settings on public.lr_settings;
create policy lr_public_settings on public.lr_settings for select to authenticated using (visibility='public');
do $$ declare v_table text; begin
  foreach v_table in array array['lr_robot_catalog','lr_part_catalog','lr_part_compatibility','lr_story_chapters'] loop
    execute format('drop policy if exists lr_catalog_read on public.%I',v_table);
    execute format('create policy lr_catalog_read on public.%I for select to authenticated using (true)',v_table);
  end loop;
end; $$;

commit;
