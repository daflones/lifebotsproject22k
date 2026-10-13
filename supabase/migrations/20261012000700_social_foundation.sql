-- LifeBots 0.5: additive DEMO foundation, not connected trading or realtime chat.
-- Apply in an isolated LifeBots database. No client writes or real-money activation.
-- IMPORTANT: legacy composite ownership FKs are preserved. Complete the asset/ownership
-- adapter described in docs/SOCIAL_BACKEND.md before enabling any server transfer.
begin;

alter table public.lr_profiles add column if not exists first_guild_joined_at timestamptz;
alter table public.lr_part_catalog drop constraint if exists lr_part_catalog_slot_check;
alter table public.lr_part_catalog add constraint lr_part_catalog_slot_check
  check (slot in ('core','arm','shield','booster','legs','sensor'));
update public.lr_robot_catalog set identity=jsonb_build_object('slots',jsonb_build_array('core','arm','shield'))||identity;

insert into public.lr_settings(key,value,visibility) values ('social',
'{"guildEnabled":true,"tradeEnabled":true,"chatEnabled":true,"guildInviteOncePerPilot":true,"guildCreateCost":500,"guildCapacity":20,"guildMaxLevel":10,"guildXPPerLevel":100,"guildDuelTimeoutSeconds":300,"guildDailyBattles":2,"guildWinPoints":10,"guildLossPoints":3,"guildXPPerPoint":2,"guildBattleRewardRC":50,"guildParticipationRC":30,"guildPrizePoolRC":1000,"guildLevelRewardRC":60,"guildInviteLevel1":25,"guildInviteLevel2":10,"guildInviteLevel3":5,"guildEventDays":7,"tradeFeePercent":2,"tradeSwapFeeRC":20,"tradeMinPriceLC":1,"tradeMaxPriceLC":100000,"tradeMaxListings":3,"tradeExpireDays":7,"chatMaxLength":300,"chatCooldownSeconds":2,"chatHistoryLimit":100}'::jsonb,'public')
on conflict(key) do update set value=excluded.value||public.lr_settings.value;
update public.lr_settings set value='{"chat_connected":false,"trading_connected":false,"guilds_connected":false}'::jsonb||value where key='deployment';

-- Stable economic identity: do not UPDATE lr_owned_robots.user_id or its historical FKs.
create table if not exists public.lr_robot_assets (
  id uuid primary key references public.lr_owned_robots(id),
  mode text not null default 'demo' check (mode='demo'),
  original_owner_id uuid not null references public.lr_profiles(id),
  current_owner_id uuid not null references public.lr_profiles(id),
  acquisition_contract jsonb,
  acquired_at timestamptz not null,
  expires_at timestamptz not null,
  principal_return_lc_minor bigint not null default 0 check (principal_return_lc_minor>=0),
  principal_returned_at timestamptz,
  principal_return_ledger_id uuid references public.lr_ledger(id),
  state_snapshot jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version>0),
  unique(id,mode),
  check (expires_at>acquired_at)
);
create index if not exists lr_assets_current_owner_idx on public.lr_robot_assets(current_owner_id,mode,expires_at);
insert into public.lr_robot_assets(id,mode,original_owner_id,current_owner_id,acquisition_contract,acquired_at,expires_at,principal_return_lc_minor,principal_returned_at,principal_return_ledger_id,state_snapshot)
 select r.id,r.mode,r.user_id,r.user_id,r.acquisition_contract,r.acquired_at,r.expires_at,r.principal_return_lc_minor,r.principal_returned_at,r.principal_return_ledger_id,
 jsonb_build_object('catalogId',r.catalog_id,'level',r.level,'battleLimit',r.battle_limit,'battlesUsed',r.battles_used,'productionDailyMinor',r.production_daily_minor)
 from public.lr_owned_robots r where r.mode='demo' on conflict(id) do nothing;

create table if not exists public.lr_robot_ownership_periods (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null,
  user_id uuid not null references public.lr_profiles(id),
  mode text not null default 'demo' check (mode='demo'),
  starts_at timestamptz not null,
  ends_at timestamptz,
  earned_rc_minor bigint not null default 0 check (earned_rc_minor>=0),
  transfer_reference uuid,
  foreign key(asset_id,mode) references public.lr_robot_assets(id,mode),
  unique(asset_id,starts_at),
  check (ends_at is null or ends_at>starts_at)
);
create unique index if not exists lr_asset_one_owner_period_idx on public.lr_robot_ownership_periods(asset_id) where ends_at is null;
insert into public.lr_robot_ownership_periods(asset_id,user_id,mode,starts_at)
 select a.id,a.current_owner_id,a.mode,a.acquired_at from public.lr_robot_assets a
 where not exists(select 1 from public.lr_robot_ownership_periods p where p.asset_id=a.id);

create or replace function public.lr_guard_asset_contract() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.id is distinct from old.id or new.mode is distinct from old.mode or new.original_owner_id is distinct from old.original_owner_id
 or new.acquisition_contract is distinct from old.acquisition_contract or new.acquired_at is distinct from old.acquired_at
 or new.expires_at is distinct from old.expires_at or new.principal_return_lc_minor is distinct from old.principal_return_lc_minor then
   raise exception 'ASSET_ACQUISITION_IMMUTABLE';
 end if;
 if old.principal_returned_at is not null and (new.principal_returned_at is distinct from old.principal_returned_at
 or new.principal_return_ledger_id is distinct from old.principal_return_ledger_id) then raise exception 'ASSET_RETURN_IMMUTABLE'; end if;
 return new;
end; $$;
drop trigger if exists lr_asset_contract_guard on public.lr_robot_assets;
create trigger lr_asset_contract_guard before update on public.lr_robot_assets for each row execute function public.lr_guard_asset_contract();
create or replace function public.lr_guard_ownership_period() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 perform 1 from public.lr_robot_assets a where a.id=new.asset_id for update;
 if tg_op='UPDATE' then
  if new.asset_id is distinct from old.asset_id or new.user_id is distinct from old.user_id or new.mode is distinct from old.mode or new.starts_at is distinct from old.starts_at
   or old.ends_at is not null and new is distinct from old then raise exception 'OWNERSHIP_HISTORY_IMMUTABLE'; end if;
 end if;
 if exists(select 1 from public.lr_robot_ownership_periods p where p.asset_id=new.asset_id and p.id<>new.id
  and (p.ends_at is null or p.ends_at>new.starts_at) and (new.ends_at is null or new.ends_at>p.starts_at)) then
   raise exception 'OWNERSHIP_PERIOD_OVERLAP';
 end if;
 return new;
end; $$;
drop trigger if exists lr_ownership_period_guard on public.lr_robot_ownership_periods;
create trigger lr_ownership_period_guard before insert or update on public.lr_robot_ownership_periods for each row execute function public.lr_guard_ownership_period();

-- One lease per economic asset across story, arena, guilds and trading.
create table if not exists public.lr_asset_locks (
 asset_id uuid primary key,
 mode text not null default 'demo' check (mode='demo'),
 user_id uuid not null references public.lr_profiles(id),
 kind text not null check (kind in ('listing','proposal','story','arena','guild')),
 reference_id uuid not null,
 acquired_at timestamptz not null default now(),
 expires_at timestamptz not null,
 foreign key(asset_id,mode) references public.lr_robot_assets(id,mode),
 check(expires_at>acquired_at)
);
create or replace function public.lr_validate_part() returns trigger
language plpgsql security definer set search_path='' as $$
declare v_slot text; v_type text; v_slots jsonb; v_robot public.lr_owned_robots;
begin
 select p.slot into v_slot from public.lr_part_catalog p where p.id=new.catalog_id;
 if new.slot is distinct from v_slot then raise exception 'PART_SLOT_MISMATCH'; end if;
 if new.equipped_robot_id is not null then
  select r.* into strict v_robot from public.lr_owned_robots r where r.id=new.equipped_robot_id for update;
  if v_robot.user_id is distinct from new.user_id or v_robot.mode is distinct from new.mode then raise exception 'PART_NOT_OWNED'; end if;
  if v_robot.expires_at<=now() then raise exception 'ROBOT_EXPIRED'; end if;
  select c.robot_type,coalesce(v_robot.acquisition_contract->'slots',c.identity->'slots','["core","arm","shield"]'::jsonb)
   into v_type,v_slots from public.lr_robot_catalog c where c.id=v_robot.catalog_id;
  if not (v_slots ? new.slot) then raise exception 'ROBOT_SLOT_UNAVAILABLE'; end if;
  if not exists(select 1 from public.lr_part_compatibility c where c.part_id=new.catalog_id and c.robot_type=v_type) then raise exception 'PART_INCOMPATIBLE'; end if;
  if exists(select 1 from public.lr_asset_locks l where l.asset_id=new.equipped_robot_id and l.expires_at>now()) then raise exception 'ROBOT_BUSY'; end if;
 end if;
 return new;
end; $$;

create index if not exists lr_asset_lock_expiry_idx on public.lr_asset_locks(expires_at);
create table if not exists public.lr_trade_listings (
 id uuid primary key default gen_random_uuid(),
 seller_id uuid not null references public.lr_profiles(id),
 asset_id uuid not null,
 mode text not null default 'demo' check (mode='demo'),
 kind text not null check (kind in ('sale','swap')),
 price_lc_minor bigint not null default 0 check (price_lc_minor between 0 and 1000000000),
 fee_bp integer not null check (fee_bp between 0 and 10000),
 swap_fee_rc_minor bigint not null default 0 check (swap_fee_rc_minor between 0 and 10000000),
 robot_snapshot jsonb not null,
 settings_version integer not null check (settings_version>0),
 status text not null default 'open' check(status in ('open','proposal','settled','cancelled','expired')),
 created_at timestamptz not null default now(),
 expires_at timestamptz not null,
 settled_at timestamptz,
 idempotency_key text not null,
 foreign key(asset_id,mode) references public.lr_robot_assets(id,mode),
 unique(seller_id,mode,idempotency_key),unique(id,mode),
 check(expires_at>created_at and expires_at<=created_at+interval '90 days'),
 check((kind='sale' and price_lc_minor>0) or (kind='swap' and price_lc_minor=0))
);
create unique index if not exists lr_trade_one_listing_idx on public.lr_trade_listings(asset_id) where status in ('open','proposal');
create index if not exists lr_trade_market_page_idx on public.lr_trade_listings(status,created_at desc,id);
create table if not exists public.lr_trade_proposals (
 id uuid primary key default gen_random_uuid(),listing_id uuid not null,
 buyer_id uuid not null references public.lr_profiles(id),seller_id uuid not null references public.lr_profiles(id),
 offered_asset_id uuid not null,mode text not null default 'demo' check (mode='demo'),
 status text not null default 'pending' check(status in ('pending','accepted','declined','expired')),
 created_at timestamptz not null default now(),reviewed_at timestamptz,idempotency_key text not null,
 foreign key(listing_id,mode) references public.lr_trade_listings(id,mode),
 foreign key(offered_asset_id,mode) references public.lr_robot_assets(id,mode),
 unique(buyer_id,mode,idempotency_key),check(buyer_id<>seller_id)
);
create unique index if not exists lr_trade_one_proposal_idx on public.lr_trade_proposals(listing_id) where status='pending';
create table if not exists public.lr_trade_receipts (
 id uuid primary key default gen_random_uuid(),listing_id uuid not null,mode text not null default 'demo' check(mode='demo'),
 seller_id uuid not null references public.lr_profiles(id),buyer_id uuid not null references public.lr_profiles(id),
 asset_id uuid not null references public.lr_robot_assets(id),other_asset_id uuid references public.lr_robot_assets(id),
 price_lc_minor bigint not null check(price_lc_minor>=0),fee_lc_minor bigint not null check(fee_lc_minor>=0),
 buyer_swap_fee_rc_minor bigint not null default 0 check(buyer_swap_fee_rc_minor>=0),seller_swap_fee_rc_minor bigint not null default 0 check(seller_swap_fee_rc_minor>=0),
 before_after jsonb not null,created_at timestamptz not null default now(),
 foreign key(listing_id,mode) references public.lr_trade_listings(id,mode),unique(listing_id,mode),check(buyer_id<>seller_id)
);

create table if not exists public.lr_guilds (
 id uuid primary key default gen_random_uuid(),mode text not null default 'demo' check(mode='demo'),
 name text not null check(length(name) between 3 and 35),tag text not null check(tag~'^[A-Z0-9]{2,5}$'),
 description text not null default '' check(length(description)<=300),invite_code text not null unique,
 founder_id uuid not null references public.lr_profiles(id),xp bigint not null default 0 check(xp>=0),
 level integer not null default 1 check(level between 1 and 100),created_at timestamptz not null default now(),archived_at timestamptz,
 unique(mode,tag),unique(id,mode)
);
create table if not exists public.lr_guild_members (
 guild_id uuid not null,user_id uuid not null references public.lr_profiles(id),mode text not null default 'demo' check(mode='demo'),
 role text not null check(role in ('leader','officer','member')),joined_at timestamptz not null default now(),left_at timestamptz,
 invited_by uuid references public.lr_profiles(id),first_join_settings jsonb not null default '{}'::jsonb,
 foreign key(guild_id,mode) references public.lr_guilds(id,mode),primary key(guild_id,user_id,mode),
 check(invited_by is distinct from user_id),check(left_at is null or left_at>=joined_at)
);
create unique index if not exists lr_guild_one_active_membership_idx on public.lr_guild_members(user_id,mode) where left_at is null;
create unique index if not exists lr_guild_one_leader_idx on public.lr_guild_members(guild_id,mode) where left_at is null and role='leader';
create index if not exists lr_guild_roster_idx on public.lr_guild_members(guild_id,left_at,joined_at,user_id);
create table if not exists public.lr_guild_invite_rewards (
 id uuid primary key default gen_random_uuid(),guild_id uuid not null,mode text not null default 'demo' check(mode='demo'),
 invited_user_id uuid not null references public.lr_profiles(id),beneficiary_id uuid not null references public.lr_profiles(id),
 level integer not null check(level between 1 and 3),amount_rc_minor bigint not null check(amount_rc_minor>=0),
 policy text not null check(policy in ('first-guild','per-guild')),reward_key text not null,
 settings_snapshot jsonb not null,ledger_id uuid references public.lr_ledger(id),created_at timestamptz not null default now(),
 foreign key(guild_id,mode) references public.lr_guilds(id,mode),unique(mode,reward_key),check(invited_user_id<>beneficiary_id)
);
create unique index if not exists lr_guild_first_invite_unique_idx on public.lr_guild_invite_rewards(invited_user_id,mode,level) where policy='first-guild';
create unique index if not exists lr_guild_per_invite_unique_idx on public.lr_guild_invite_rewards(guild_id,invited_user_id,mode,level) where policy='per-guild';
create table if not exists public.lr_guild_level_rewards (
 guild_id uuid not null,mode text not null default 'demo' check(mode='demo'),level integer not null check(level between 2 and 100),
 reward_rc_minor bigint not null check(reward_rc_minor>=0),eligible_ids uuid[] not null,created_at timestamptz not null default now(),
 foreign key(guild_id,mode) references public.lr_guilds(id,mode),primary key(guild_id,mode,level)
);
create table if not exists public.lr_guild_events (
 id uuid primary key default gen_random_uuid(),mode text not null default 'demo' check(mode='demo'),
 name text not null check(length(name) between 1 and 80),description text not null default '',
 scene text not null check(scene in ('guild-canyon','guild-boreal')),starts_at timestamptz not null,ends_at timestamptz not null,
 reward_pool_rc_minor bigint not null check(reward_pool_rc_minor between 0 and 100000000),
 participation_rc_minor bigint not null check(participation_rc_minor between 0 and 10000000),
 battle_reward_rc_minor bigint not null check(battle_reward_rc_minor between 0 and 10000000),
 enabled boolean not null default true,version integer not null default 1 check(version>0),
 created_by uuid references public.lr_profiles(id),created_at timestamptz not null default now(),unique(id,mode),
 check(ends_at>starts_at and ends_at<=starts_at+interval '90 days')
);
create index if not exists lr_guild_event_dates_idx on public.lr_guild_events(starts_at,ends_at);
create table if not exists public.lr_guild_event_contracts (
 event_id uuid primary key,mode text not null default 'demo' check(mode='demo'),snapshot jsonb not null,
 created_at timestamptz not null default now(),foreign key(event_id,mode) references public.lr_guild_events(id,mode)
);
create table if not exists public.lr_guild_war_participants (
 event_id uuid not null,user_id uuid not null references public.lr_profiles(id),guild_id uuid not null,
 mode text not null default 'demo' check(mode='demo'),joined_at timestamptz not null default now(),points bigint not null default 0 check(points>=0),
 foreign key(event_id,mode) references public.lr_guild_events(id,mode),foreign key(guild_id,mode) references public.lr_guilds(id,mode),
 primary key(event_id,user_id,mode)
);
create table if not exists public.lr_guild_daily_usage (
 user_id uuid not null references public.lr_profiles(id),mode text not null default 'demo' check(mode='demo'),
 day date not null,used integer not null default 0 check(used>=0),primary key(user_id,mode,day)
);
create table if not exists public.lr_guild_duels (
 id uuid primary key default gen_random_uuid(),event_id uuid not null,user_id uuid not null,guild_id uuid not null,rival_guild_id uuid not null,
 asset_id uuid not null,mode text not null default 'demo' check(mode='demo'),opponent_kind text not null check(opponent_kind in ('user','bot')),
 opponent_user_id uuid references public.lr_profiles(id),opponent_asset_id uuid references public.lr_robot_assets(id),
 rules_snapshot jsonb not null,combat_state jsonb not null,turn_version integer not null default 0 check(turn_version>=0),
 status text not null check(status in ('waiting','fighting','won','lost','timeout','settled')),deadline_at timestamptz not null,
 points integer not null default 0 check(points>=0),reward_rc_minor bigint not null default 0 check(reward_rc_minor>=0),
 created_at timestamptz not null default now(),settled_at timestamptz,idempotency_key text not null,
 foreign key(event_id,user_id,mode) references public.lr_guild_war_participants(event_id,user_id,mode),
 foreign key(guild_id,mode) references public.lr_guilds(id,mode),foreign key(rival_guild_id,mode) references public.lr_guilds(id,mode),
 foreign key(asset_id,mode) references public.lr_robot_assets(id,mode),unique(user_id,mode,idempotency_key),
 check(guild_id<>rival_guild_id),check(deadline_at>created_at),
 check((opponent_kind='user' and opponent_user_id is not null and opponent_asset_id is not null) or opponent_kind='bot')
);
create unique index if not exists lr_guild_one_active_duel_idx on public.lr_guild_duels(user_id,mode) where status in ('waiting','fighting');
create table if not exists public.lr_guild_reward_claims (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references public.lr_profiles(id),mode text not null default 'demo' check(mode='demo'),
 guild_id uuid not null,event_id uuid,level integer,kind text not null check(kind in ('level','duel','event')),reward_key text not null,
 amount_rc_minor bigint not null check(amount_rc_minor>=0),ledger_id uuid references public.lr_ledger(id),contract_snapshot jsonb not null,
 created_at timestamptz not null default now(),foreign key(guild_id,mode) references public.lr_guilds(id,mode),
 foreign key(event_id,mode) references public.lr_guild_events(id,mode),unique(user_id,mode,reward_key)
);

create table if not exists public.lr_chat_messages (
 id uuid primary key default gen_random_uuid(),mode text not null default 'demo' check(mode='demo'),
 room text not null check(room in ('global','market','guild')),guild_id uuid references public.lr_guilds(id),
 author_id uuid not null references public.lr_profiles(id),display_name text not null,
 body text not null check(length(btrim(body)) between 1 and 2000),created_at timestamptz not null default now(),removed_at timestamptz,
 idempotency_key text not null,unique(author_id,mode,idempotency_key),
 check((room='guild' and guild_id is not null) or (room in ('global','market') and guild_id is null))
);
create index if not exists lr_chat_room_page_idx on public.lr_chat_messages(room,guild_id,created_at desc,id) where removed_at is null;
create table if not exists public.lr_chat_rate_limits (
 user_id uuid primary key references public.lr_profiles(id),last_sent_at timestamptz not null
);
create table if not exists public.lr_chat_moderation (
 user_id uuid primary key references public.lr_profiles(id),muted_until timestamptz,
 updated_by uuid not null references public.lr_profiles(id),reason text not null,updated_at timestamptz not null default now()
);

-- No user may directly change wallets, locks, ownership, role, chat or rewards.
do $$ declare v_table text; begin
 foreach v_table in array array['lr_robot_assets','lr_robot_ownership_periods','lr_asset_locks','lr_trade_listings','lr_trade_proposals','lr_trade_receipts',
 'lr_guilds','lr_guild_members','lr_guild_invite_rewards','lr_guild_level_rewards','lr_guild_events','lr_guild_event_contracts','lr_guild_war_participants',
 'lr_guild_daily_usage','lr_guild_duels','lr_guild_reward_claims','lr_chat_messages','lr_chat_rate_limits','lr_chat_moderation'] loop
  execute format('alter table public.%I enable row level security',v_table);
  execute format('revoke all on public.%I from public,anon,authenticated,service_role',v_table);
  execute format('grant select on public.%I to service_role',v_table);
 end loop;
end; $$;
revoke all on function public.lr_guard_asset_contract(),public.lr_guard_ownership_period() from public,anon,authenticated;
grant execute on function public.lr_guard_asset_contract(),public.lr_guard_ownership_period() to service_role;
create or replace function public.lr_is_guild_member(p_guild_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lr_guild_members m where m.guild_id=p_guild_id and m.user_id=(select auth.uid()) and m.mode='demo' and m.left_at is null);
$$;
revoke all on function public.lr_is_guild_member(uuid) from public,anon;
grant execute on function public.lr_is_guild_member(uuid) to authenticated,service_role;
grant select on public.lr_robot_assets,public.lr_robot_ownership_periods,public.lr_asset_locks,public.lr_trade_listings,public.lr_trade_proposals,public.lr_trade_receipts,
 public.lr_guilds,public.lr_guild_members,public.lr_guild_events,public.lr_guild_level_rewards,public.lr_guild_war_participants,
 public.lr_guild_duels,public.lr_guild_daily_usage,public.lr_guild_reward_claims,public.lr_guild_invite_rewards,public.lr_chat_messages,public.lr_chat_moderation to authenticated;

create policy lr_asset_owner_read on public.lr_robot_assets for select to authenticated using(current_owner_id=(select auth.uid()));
create policy lr_ownership_owner_read on public.lr_robot_ownership_periods for select to authenticated using(user_id=(select auth.uid()));
create policy lr_lock_owner_read on public.lr_asset_locks for select to authenticated using(user_id=(select auth.uid()));
create policy lr_trade_visible_read on public.lr_trade_listings for select to authenticated using(status in ('open','proposal') or seller_id=(select auth.uid()));
create policy lr_proposal_party_read on public.lr_trade_proposals for select to authenticated using(buyer_id=(select auth.uid()) or seller_id=(select auth.uid()));
create policy lr_receipt_party_read on public.lr_trade_receipts for select to authenticated using(buyer_id=(select auth.uid()) or seller_id=(select auth.uid()));
create policy lr_guild_public_read on public.lr_guilds for select to authenticated using(archived_at is null or public.lr_is_guild_member(id));
create policy lr_member_roster_read on public.lr_guild_members for select to authenticated using(user_id=(select auth.uid()) or public.lr_is_guild_member(guild_id));
create policy lr_event_public_read on public.lr_guild_events for select to authenticated using(true);
create policy lr_level_member_read on public.lr_guild_level_rewards for select to authenticated using(public.lr_is_guild_member(guild_id));
create policy lr_war_member_read on public.lr_guild_war_participants for select to authenticated using(user_id=(select auth.uid()) or public.lr_is_guild_member(guild_id));
create policy lr_duel_party_read on public.lr_guild_duels for select to authenticated using(user_id=(select auth.uid()) or opponent_user_id=(select auth.uid()));
create policy lr_daily_guild_owner_read on public.lr_guild_daily_usage for select to authenticated using(user_id=(select auth.uid()));
create policy lr_guild_claim_owner_read on public.lr_guild_reward_claims for select to authenticated using(user_id=(select auth.uid()));
create policy lr_guild_invite_owner_read on public.lr_guild_invite_rewards for select to authenticated using(beneficiary_id=(select auth.uid()));
create policy lr_chat_room_read on public.lr_chat_messages for select to authenticated using(removed_at is null and (room in ('global','market') or public.lr_is_guild_member(guild_id)));
create policy lr_chat_moderation_owner_read on public.lr_chat_moderation for select to authenticated using(user_id=(select auth.uid()));

-- Realtime publication and mutation RPC grants intentionally absent until their
-- authorization/rate-limit/ownership/concurrency implementations are complete.
commit;
