-- Esquema autoritativo recuperado por leitura do catálogo PostgreSQL, sem dados de usuários.

-- Inclui os checkpoints 010 a 013; versões existentes permanecem registradas no banco.

begin;

alter table public.lr_settings drop constraint if exists lr_real_money_disabled;

create extension if not exists pg_cron with schema pg_catalog;

create extension if not exists pg_net with schema extensions;

create table if not exists public."lr_game_world" ("mode" text not null,
"revision" bigint default 0 not null,
"state" jsonb default '{}'::jsonb not null,
"updated_at" timestamp with time zone default now() not null);

create table if not exists public."lr_game_signals" ("id" bigint generated always as identity not null,
"mode" text not null,
"recipient_id" uuid,
"kind" text not null,
"created_at" timestamp with time zone default now() not null);

create table if not exists public."lr_media" ("id" uuid not null,
"ref" text not null,
"name" text not null,
"kind" text not null,
"mime" text not null,
"size" bigint not null,
"width" integer,
"height" integer,
"path" text not null,
"created_by" uuid not null,
"created_at" bigint not null);

create table if not exists public."lr_engine_ownership" ("asset_id" uuid not null,
"user_id" uuid not null,
"mode" text not null,
"started_at" timestamp with time zone not null,
"ended_at" timestamp with time zone,
"contract" jsonb not null);

create table if not exists public."lr_game_accounts" ("user_id" uuid not null,
"mode" text not null,
"revision" bigint default 0 not null,
"state" jsonb default '{}'::jsonb not null,
"updated_at" timestamp with time zone default now() not null);

create table if not exists public."lr_game_requests" ("user_id" uuid not null,
"mode" text not null,
"request_key" text not null,
"payload_hash" text not null,
"action" text not null,
"response" jsonb not null,
"created_at" timestamp with time zone default now() not null);

create table if not exists public."lr_live_chat" ("id" uuid not null,
"mode" text not null,
"room" text not null,
"author_id" uuid not null,
"display_name" text not null,
"message" text not null,
"created_at" timestamp with time zone default now() not null);

create table if not exists public."lr_cash_operations" ("id" uuid default gen_random_uuid() not null,
"user_id" uuid not null,
"mode" text default 'real'::text not null,
"kind" text not null,
"request_key" text not null,
"request_hash" text not null,
"amount_cents" bigint not null,
"fee_cents" bigint default 0 not null,
"lc_amount" bigint not null,
"quote" jsonb not null,
"destination" jsonb,
"status" text not null,
"provider_id" text,
"provider_total_debit_cents" bigint,
"qr_code" text,
"lease_until" timestamp with time zone,
"reason" text,
"created_at" timestamp with time zone default now() not null,
"updated_at" timestamp with time zone default now() not null);

create table if not exists public."lr_cash_deliveries" ("delivery_id" text not null,
"payload_hash" text not null,
"event_type" text not null,
"status" text default 'verified'::text not null,
"operation_id" uuid,
"created_at" timestamp with time zone default now() not null);

create table if not exists public."lr_job_checkpoint" ("name" text not null,
"day" date,
"after_id" uuid,
"updated_at" timestamp with time zone default now() not null);

create table if not exists public."lr_job_runs" ("id" uuid default gen_random_uuid() not null,
"day" date,
"processed" integer not null,
"failed" integer not null,
"payments" integer not null,
"created_at" timestamp with time zone default now() not null);

alter table public."lr_profiles" add column if not exists "share_team_whatsapp" boolean default false not null;

alter table public."lr_robot_catalog" add column if not exists "identity" jsonb default '{}'::jsonb not null;

alter table public."lr_part_catalog" add column if not exists "identity" jsonb default '{}'::jsonb not null;

alter table public."lr_announcements" drop constraint if exists "lr_announcements_buttons_check";

alter table public."lr_announcements" add constraint "lr_announcements_buttons_check" CHECK ((jsonb_typeof(buttons) = 'array'::text));

alter table public."lr_announcements" drop constraint if exists "lr_announcements_check";

alter table public."lr_announcements" add constraint "lr_announcements_check" CHECK (((expires_at IS NULL) OR (expires_at > starts_at)));

alter table public."lr_announcements" drop constraint if exists "lr_announcements_message_check";

alter table public."lr_announcements" add constraint "lr_announcements_message_check" CHECK ((length(message) <= 4000));

alter table public."lr_announcements" drop constraint if exists "lr_announcements_title_check";

alter table public."lr_announcements" add constraint "lr_announcements_title_check" CHECK (((length(title) >= 1) AND (length(title) <= 120)));

alter table public."lr_announcements" enable row level security;

alter table public."lr_guild_event_contracts" drop constraint if exists "lr_guild_event_contracts_mode_check";

alter table public."lr_guild_event_contracts" add constraint "lr_guild_event_contracts_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_event_contracts" enable row level security;

alter table public."lr_admin_roles" drop constraint if exists "lr_admin_roles_role_check";

alter table public."lr_admin_roles" add constraint "lr_admin_roles_role_check" CHECK ((role = 'admin'::text));

alter table public."lr_admin_roles" enable row level security;

alter table public."lr_chat_rate_limits" enable row level security;

alter table public."lr_chat_moderation" enable row level security;

alter table public."lr_robot_assets" drop constraint if exists "lr_robot_assets_check";

alter table public."lr_robot_assets" add constraint "lr_robot_assets_check" CHECK ((expires_at > acquired_at));

alter table public."lr_robot_assets" drop constraint if exists "lr_robot_assets_mode_check";

alter table public."lr_robot_assets" add constraint "lr_robot_assets_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_robot_assets" drop constraint if exists "lr_robot_assets_principal_return_lc_minor_check";

alter table public."lr_robot_assets" add constraint "lr_robot_assets_principal_return_lc_minor_check" CHECK ((principal_return_lc_minor >= 0));

alter table public."lr_robot_assets" drop constraint if exists "lr_robot_assets_version_check";

alter table public."lr_robot_assets" add constraint "lr_robot_assets_version_check" CHECK ((version > 0));

CREATE INDEX IF NOT EXISTS lr_assets_current_owner_idx ON public.lr_robot_assets USING btree (current_owner_id, mode, expires_at);

alter table public."lr_robot_assets" enable row level security;

alter table public."lr_robot_ownership_periods" drop constraint if exists "lr_robot_ownership_periods_check";

alter table public."lr_robot_ownership_periods" add constraint "lr_robot_ownership_periods_check" CHECK (((ends_at IS NULL) OR (ends_at > starts_at)));

alter table public."lr_robot_ownership_periods" drop constraint if exists "lr_robot_ownership_periods_earned_rc_minor_check";

alter table public."lr_robot_ownership_periods" add constraint "lr_robot_ownership_periods_earned_rc_minor_check" CHECK ((earned_rc_minor >= 0));

alter table public."lr_robot_ownership_periods" drop constraint if exists "lr_robot_ownership_periods_mode_check";

alter table public."lr_robot_ownership_periods" add constraint "lr_robot_ownership_periods_mode_check" CHECK ((mode = 'demo'::text));

CREATE UNIQUE INDEX IF NOT EXISTS lr_asset_one_owner_period_idx ON public.lr_robot_ownership_periods USING btree (asset_id) WHERE (ends_at IS NULL);

alter table public."lr_robot_ownership_periods" enable row level security;

alter table public."lr_asset_locks" drop constraint if exists "lr_asset_locks_check";

alter table public."lr_asset_locks" add constraint "lr_asset_locks_check" CHECK ((expires_at > acquired_at));

alter table public."lr_asset_locks" drop constraint if exists "lr_asset_locks_kind_check";

alter table public."lr_asset_locks" add constraint "lr_asset_locks_kind_check" CHECK ((kind = ANY (ARRAY['listing'::text, 'proposal'::text, 'story'::text, 'arena'::text, 'guild'::text])));

alter table public."lr_asset_locks" drop constraint if exists "lr_asset_locks_mode_check";

alter table public."lr_asset_locks" add constraint "lr_asset_locks_mode_check" CHECK ((mode = 'demo'::text));

CREATE INDEX IF NOT EXISTS lr_asset_lock_expiry_idx ON public.lr_asset_locks USING btree (expires_at);

alter table public."lr_asset_locks" enable row level security;

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_check" CHECK (((expires_at > created_at) AND (expires_at <= (created_at + '90 days'::interval))));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_check1";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_check1" CHECK ((((kind = 'sale'::text) AND (price_lc_minor > 0)) OR ((kind = 'swap'::text) AND (price_lc_minor = 0))));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_fee_bp_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_fee_bp_check" CHECK (((fee_bp >= 0) AND (fee_bp <= 10000)));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_kind_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_kind_check" CHECK ((kind = ANY (ARRAY['sale'::text, 'swap'::text])));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_mode_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_price_lc_minor_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_price_lc_minor_check" CHECK (((price_lc_minor >= 0) AND (price_lc_minor <= 1000000000)));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_settings_version_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_settings_version_check" CHECK ((settings_version > 0));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_status_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_status_check" CHECK ((status = ANY (ARRAY['open'::text, 'proposal'::text, 'settled'::text, 'cancelled'::text, 'expired'::text])));

alter table public."lr_trade_listings" drop constraint if exists "lr_trade_listings_swap_fee_rc_minor_check";

alter table public."lr_trade_listings" add constraint "lr_trade_listings_swap_fee_rc_minor_check" CHECK (((swap_fee_rc_minor >= 0) AND (swap_fee_rc_minor <= 10000000)));

CREATE UNIQUE INDEX IF NOT EXISTS lr_trade_one_listing_idx ON public.lr_trade_listings USING btree (asset_id) WHERE (status = ANY (ARRAY['open'::text, 'proposal'::text]));

CREATE INDEX IF NOT EXISTS lr_trade_market_page_idx ON public.lr_trade_listings USING btree (status, created_at DESC, id);

alter table public."lr_trade_listings" enable row level security;

alter table public."lr_trade_proposals" drop constraint if exists "lr_trade_proposals_check";

alter table public."lr_trade_proposals" add constraint "lr_trade_proposals_check" CHECK ((buyer_id <> seller_id));

alter table public."lr_trade_proposals" drop constraint if exists "lr_trade_proposals_mode_check";

alter table public."lr_trade_proposals" add constraint "lr_trade_proposals_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_trade_proposals" drop constraint if exists "lr_trade_proposals_status_check";

alter table public."lr_trade_proposals" add constraint "lr_trade_proposals_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'declined'::text, 'expired'::text])));

CREATE UNIQUE INDEX IF NOT EXISTS lr_trade_one_proposal_idx ON public.lr_trade_proposals USING btree (listing_id) WHERE (status = 'pending'::text);

alter table public."lr_trade_proposals" enable row level security;

alter table public."lr_trade_receipts" drop constraint if exists "lr_trade_receipts_buyer_swap_fee_rc_minor_check";

alter table public."lr_trade_receipts" add constraint "lr_trade_receipts_buyer_swap_fee_rc_minor_check" CHECK ((buyer_swap_fee_rc_minor >= 0));

alter table public."lr_trade_receipts" drop constraint if exists "lr_trade_receipts_check";

alter table public."lr_trade_receipts" add constraint "lr_trade_receipts_check" CHECK ((buyer_id <> seller_id));

alter table public."lr_trade_receipts" drop constraint if exists "lr_trade_receipts_fee_lc_minor_check";

alter table public."lr_trade_receipts" add constraint "lr_trade_receipts_fee_lc_minor_check" CHECK ((fee_lc_minor >= 0));

alter table public."lr_trade_receipts" drop constraint if exists "lr_trade_receipts_mode_check";

alter table public."lr_trade_receipts" add constraint "lr_trade_receipts_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_trade_receipts" drop constraint if exists "lr_trade_receipts_price_lc_minor_check";

alter table public."lr_trade_receipts" add constraint "lr_trade_receipts_price_lc_minor_check" CHECK ((price_lc_minor >= 0));

alter table public."lr_trade_receipts" drop constraint if exists "lr_trade_receipts_seller_swap_fee_rc_minor_check";

alter table public."lr_trade_receipts" add constraint "lr_trade_receipts_seller_swap_fee_rc_minor_check" CHECK ((seller_swap_fee_rc_minor >= 0));

alter table public."lr_trade_receipts" enable row level security;

alter table public."lr_guilds" drop constraint if exists "lr_guilds_description_check";

alter table public."lr_guilds" add constraint "lr_guilds_description_check" CHECK ((length(description) <= 300));

alter table public."lr_guilds" drop constraint if exists "lr_guilds_level_check";

alter table public."lr_guilds" add constraint "lr_guilds_level_check" CHECK (((level >= 1) AND (level <= 100)));

alter table public."lr_guilds" drop constraint if exists "lr_guilds_mode_check";

alter table public."lr_guilds" add constraint "lr_guilds_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guilds" drop constraint if exists "lr_guilds_name_check";

alter table public."lr_guilds" add constraint "lr_guilds_name_check" CHECK (((length(name) >= 3) AND (length(name) <= 35)));

alter table public."lr_guilds" drop constraint if exists "lr_guilds_tag_check";

alter table public."lr_guilds" add constraint "lr_guilds_tag_check" CHECK ((tag ~ '^[A-Z0-9]{2,5}$'::text));

alter table public."lr_guilds" drop constraint if exists "lr_guilds_xp_check";

alter table public."lr_guilds" add constraint "lr_guilds_xp_check" CHECK ((xp >= 0));

alter table public."lr_guilds" enable row level security;

alter table public."lr_guild_members" drop constraint if exists "lr_guild_members_check";

alter table public."lr_guild_members" add constraint "lr_guild_members_check" CHECK ((invited_by IS DISTINCT FROM user_id));

alter table public."lr_guild_members" drop constraint if exists "lr_guild_members_check1";

alter table public."lr_guild_members" add constraint "lr_guild_members_check1" CHECK (((left_at IS NULL) OR (left_at >= joined_at)));

alter table public."lr_guild_members" drop constraint if exists "lr_guild_members_mode_check";

alter table public."lr_guild_members" add constraint "lr_guild_members_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_members" drop constraint if exists "lr_guild_members_role_check";

alter table public."lr_guild_members" add constraint "lr_guild_members_role_check" CHECK ((role = ANY (ARRAY['leader'::text, 'officer'::text, 'member'::text])));

CREATE UNIQUE INDEX IF NOT EXISTS lr_guild_one_active_membership_idx ON public.lr_guild_members USING btree (user_id, mode) WHERE (left_at IS NULL);

CREATE UNIQUE INDEX IF NOT EXISTS lr_guild_one_leader_idx ON public.lr_guild_members USING btree (guild_id, mode) WHERE ((left_at IS NULL) AND (role = 'leader'::text));

CREATE INDEX IF NOT EXISTS lr_guild_roster_idx ON public.lr_guild_members USING btree (guild_id, left_at, joined_at, user_id);

alter table public."lr_guild_members" enable row level security;

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_battle_reward_rc_minor_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_battle_reward_rc_minor_check" CHECK (((battle_reward_rc_minor >= 0) AND (battle_reward_rc_minor <= 10000000)));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_check" CHECK (((ends_at > starts_at) AND (ends_at <= (starts_at + '90 days'::interval))));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_mode_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_name_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_name_check" CHECK (((length(name) >= 1) AND (length(name) <= 80)));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_participation_rc_minor_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_participation_rc_minor_check" CHECK (((participation_rc_minor >= 0) AND (participation_rc_minor <= 10000000)));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_reward_pool_rc_minor_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_reward_pool_rc_minor_check" CHECK (((reward_pool_rc_minor >= 0) AND (reward_pool_rc_minor <= 100000000)));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_scene_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_scene_check" CHECK ((scene = ANY (ARRAY['guild-canyon'::text, 'guild-boreal'::text])));

alter table public."lr_guild_events" drop constraint if exists "lr_guild_events_version_check";

alter table public."lr_guild_events" add constraint "lr_guild_events_version_check" CHECK ((version > 0));

CREATE INDEX IF NOT EXISTS lr_guild_event_dates_idx ON public.lr_guild_events USING btree (starts_at, ends_at);

alter table public."lr_guild_events" enable row level security;

alter table public."lr_guild_level_rewards" drop constraint if exists "lr_guild_level_rewards_level_check";

alter table public."lr_guild_level_rewards" add constraint "lr_guild_level_rewards_level_check" CHECK (((level >= 2) AND (level <= 100)));

alter table public."lr_guild_level_rewards" drop constraint if exists "lr_guild_level_rewards_mode_check";

alter table public."lr_guild_level_rewards" add constraint "lr_guild_level_rewards_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_level_rewards" drop constraint if exists "lr_guild_level_rewards_reward_rc_minor_check";

alter table public."lr_guild_level_rewards" add constraint "lr_guild_level_rewards_reward_rc_minor_check" CHECK ((reward_rc_minor >= 0));

alter table public."lr_guild_level_rewards" enable row level security;

alter table public."lr_guild_war_participants" drop constraint if exists "lr_guild_war_participants_mode_check";

alter table public."lr_guild_war_participants" add constraint "lr_guild_war_participants_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_war_participants" drop constraint if exists "lr_guild_war_participants_points_check";

alter table public."lr_guild_war_participants" add constraint "lr_guild_war_participants_points_check" CHECK ((points >= 0));

alter table public."lr_guild_war_participants" enable row level security;

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_check" CHECK ((guild_id <> rival_guild_id));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_check1";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_check1" CHECK ((deadline_at > created_at));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_check2";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_check2" CHECK ((((opponent_kind = 'user'::text) AND (opponent_user_id IS NOT NULL) AND (opponent_asset_id IS NOT NULL)) OR (opponent_kind = 'bot'::text)));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_mode_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_opponent_kind_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_opponent_kind_check" CHECK ((opponent_kind = ANY (ARRAY['user'::text, 'bot'::text])));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_points_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_points_check" CHECK ((points >= 0));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_reward_rc_minor_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_reward_rc_minor_check" CHECK ((reward_rc_minor >= 0));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_status_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'fighting'::text, 'won'::text, 'lost'::text, 'timeout'::text, 'settled'::text])));

alter table public."lr_guild_duels" drop constraint if exists "lr_guild_duels_turn_version_check";

alter table public."lr_guild_duels" add constraint "lr_guild_duels_turn_version_check" CHECK ((turn_version >= 0));

CREATE UNIQUE INDEX IF NOT EXISTS lr_guild_one_active_duel_idx ON public.lr_guild_duels USING btree (user_id, mode) WHERE (status = ANY (ARRAY['waiting'::text, 'fighting'::text]));

alter table public."lr_guild_duels" enable row level security;

alter table public."lr_guild_daily_usage" drop constraint if exists "lr_guild_daily_usage_mode_check";

alter table public."lr_guild_daily_usage" add constraint "lr_guild_daily_usage_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_daily_usage" drop constraint if exists "lr_guild_daily_usage_used_check";

alter table public."lr_guild_daily_usage" add constraint "lr_guild_daily_usage_used_check" CHECK ((used >= 0));

alter table public."lr_guild_daily_usage" enable row level security;

alter table public."lr_guild_reward_claims" drop constraint if exists "lr_guild_reward_claims_amount_rc_minor_check";

alter table public."lr_guild_reward_claims" add constraint "lr_guild_reward_claims_amount_rc_minor_check" CHECK ((amount_rc_minor >= 0));

alter table public."lr_guild_reward_claims" drop constraint if exists "lr_guild_reward_claims_kind_check";

alter table public."lr_guild_reward_claims" add constraint "lr_guild_reward_claims_kind_check" CHECK ((kind = ANY (ARRAY['level'::text, 'duel'::text, 'event'::text])));

alter table public."lr_guild_reward_claims" drop constraint if exists "lr_guild_reward_claims_mode_check";

alter table public."lr_guild_reward_claims" add constraint "lr_guild_reward_claims_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_reward_claims" enable row level security;

alter table public."lr_guild_invite_rewards" drop constraint if exists "lr_guild_invite_rewards_amount_rc_minor_check";

alter table public."lr_guild_invite_rewards" add constraint "lr_guild_invite_rewards_amount_rc_minor_check" CHECK ((amount_rc_minor >= 0));

alter table public."lr_guild_invite_rewards" drop constraint if exists "lr_guild_invite_rewards_check";

alter table public."lr_guild_invite_rewards" add constraint "lr_guild_invite_rewards_check" CHECK ((invited_user_id <> beneficiary_id));

alter table public."lr_guild_invite_rewards" drop constraint if exists "lr_guild_invite_rewards_level_check";

alter table public."lr_guild_invite_rewards" add constraint "lr_guild_invite_rewards_level_check" CHECK (((level >= 1) AND (level <= 3)));

alter table public."lr_guild_invite_rewards" drop constraint if exists "lr_guild_invite_rewards_mode_check";

alter table public."lr_guild_invite_rewards" add constraint "lr_guild_invite_rewards_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_guild_invite_rewards" drop constraint if exists "lr_guild_invite_rewards_policy_check";

alter table public."lr_guild_invite_rewards" add constraint "lr_guild_invite_rewards_policy_check" CHECK ((policy = ANY (ARRAY['first-guild'::text, 'per-guild'::text])));

CREATE UNIQUE INDEX IF NOT EXISTS lr_guild_first_invite_unique_idx ON public.lr_guild_invite_rewards USING btree (invited_user_id, mode, level) WHERE (policy = 'first-guild'::text);

CREATE UNIQUE INDEX IF NOT EXISTS lr_guild_per_invite_unique_idx ON public.lr_guild_invite_rewards USING btree (guild_id, invited_user_id, mode, level) WHERE (policy = 'per-guild'::text);

alter table public."lr_guild_invite_rewards" enable row level security;

alter table public."lr_chat_messages" drop constraint if exists "lr_chat_messages_body_check";

alter table public."lr_chat_messages" add constraint "lr_chat_messages_body_check" CHECK (((length(btrim(body)) >= 1) AND (length(btrim(body)) <= 2000)));

alter table public."lr_chat_messages" drop constraint if exists "lr_chat_messages_check";

alter table public."lr_chat_messages" add constraint "lr_chat_messages_check" CHECK ((((room = 'guild'::text) AND (guild_id IS NOT NULL)) OR ((room = ANY (ARRAY['global'::text, 'market'::text])) AND (guild_id IS NULL))));

alter table public."lr_chat_messages" drop constraint if exists "lr_chat_messages_mode_check";

alter table public."lr_chat_messages" add constraint "lr_chat_messages_mode_check" CHECK ((mode = 'demo'::text));

alter table public."lr_chat_messages" drop constraint if exists "lr_chat_messages_room_check";

alter table public."lr_chat_messages" add constraint "lr_chat_messages_room_check" CHECK ((room = ANY (ARRAY['global'::text, 'market'::text, 'guild'::text])));

CREATE INDEX IF NOT EXISTS lr_chat_room_page_idx ON public.lr_chat_messages USING btree (room, guild_id, created_at DESC, id) WHERE (removed_at IS NULL);

alter table public."lr_chat_messages" enable row level security;

alter table public."lr_production_periods" drop constraint if exists "lr_production_periods_check";

alter table public."lr_production_periods" add constraint "lr_production_periods_check" CHECK ((ends_at > starts_at));

alter table public."lr_production_periods" drop constraint if exists "lr_production_periods_daily_rc_minor_check";

alter table public."lr_production_periods" add constraint "lr_production_periods_daily_rc_minor_check" CHECK ((daily_rc_minor >= 0));

CREATE INDEX IF NOT EXISTS lr_production_periods_robot_idx ON public.lr_production_periods USING btree (robot_id, starts_at, ends_at);

alter table public."lr_production_periods" enable row level security;

alter table public."lr_game_world" drop constraint if exists "lr_game_world_mode_check";

alter table public."lr_game_world" add constraint "lr_game_world_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_game_world" drop constraint if exists "lr_game_world_pkey";

alter table public."lr_game_world" add constraint "lr_game_world_pkey" PRIMARY KEY (mode);

alter table public."lr_game_world" enable row level security;

alter table public."lr_game_signals" drop constraint if exists "lr_game_signals_pkey";

alter table public."lr_game_signals" add constraint "lr_game_signals_pkey" PRIMARY KEY (id);

alter table public."lr_game_signals" drop constraint if exists "lr_game_signals_recipient_id_fkey";

alter table public."lr_game_signals" add constraint "lr_game_signals_recipient_id_fkey" FOREIGN KEY (recipient_id) REFERENCES lr_profiles(id);

CREATE INDEX IF NOT EXISTS lr_game_signals_date ON public.lr_game_signals USING btree (created_at);

alter table public."lr_game_signals" enable row level security;

alter table public."lr_media" drop constraint if exists "lr_media_check";

alter table public."lr_media" add constraint "lr_media_check" CHECK ((ref = ('media:'::text || (id)::text)));

alter table public."lr_media" drop constraint if exists "lr_media_check1";

alter table public."lr_media" add constraint "lr_media_check1" CHECK ((path ~~ ((created_by)::text || '/%'::text)));

alter table public."lr_media" drop constraint if exists "lr_media_check2";

alter table public."lr_media" add constraint "lr_media_check2" CHECK (((kind <> 'image'::text) OR (size <= 10485760)));

alter table public."lr_media" drop constraint if exists "lr_media_created_by_fkey";

alter table public."lr_media" add constraint "lr_media_created_by_fkey" FOREIGN KEY (created_by) REFERENCES lr_profiles(id);

alter table public."lr_media" drop constraint if exists "lr_media_kind_check";

alter table public."lr_media" add constraint "lr_media_kind_check" CHECK ((kind = ANY (ARRAY['image'::text, 'audio'::text])));

alter table public."lr_media" drop constraint if exists "lr_media_mime_check";

alter table public."lr_media" add constraint "lr_media_mime_check" CHECK ((mime = ANY (ARRAY['image/png'::text, 'image/jpeg'::text, 'image/webp'::text, 'audio/mpeg'::text, 'audio/ogg'::text, 'audio/wav'::text, 'audio/x-wav'::text])));

alter table public."lr_media" drop constraint if exists "lr_media_name_check";

alter table public."lr_media" add constraint "lr_media_name_check" CHECK (((length(name) >= 1) AND (length(name) <= 120)));

alter table public."lr_media" drop constraint if exists "lr_media_path_key";

alter table public."lr_media" add constraint "lr_media_path_key" UNIQUE (path);

alter table public."lr_media" drop constraint if exists "lr_media_pkey";

alter table public."lr_media" add constraint "lr_media_pkey" PRIMARY KEY (id);

alter table public."lr_media" drop constraint if exists "lr_media_ref_key";

alter table public."lr_media" add constraint "lr_media_ref_key" UNIQUE (ref);

alter table public."lr_media" drop constraint if exists "lr_media_size_check";

alter table public."lr_media" add constraint "lr_media_size_check" CHECK (((size >= 1) AND (size <= 25165824)));

alter table public."lr_media" enable row level security;

alter table public."lr_engine_ownership" drop constraint if exists "lr_engine_ownership_pkey";

alter table public."lr_engine_ownership" add constraint "lr_engine_ownership_pkey" PRIMARY KEY (asset_id, started_at);

alter table public."lr_engine_ownership" drop constraint if exists "lr_engine_ownership_user_id_fkey";

alter table public."lr_engine_ownership" add constraint "lr_engine_ownership_user_id_fkey" FOREIGN KEY (user_id) REFERENCES lr_profiles(id);

CREATE UNIQUE INDEX IF NOT EXISTS lr_engine_one_owner ON public.lr_engine_ownership USING btree (asset_id, mode) WHERE (ended_at IS NULL);

alter table public."lr_engine_ownership" enable row level security;

alter table public."lr_payment_events" drop constraint if exists "lr_payment_events_payload_sha256_check";

alter table public."lr_payment_events" add constraint "lr_payment_events_payload_sha256_check" CHECK ((payload_sha256 ~ '^[a-f0-9]{64}$'::text));

alter table public."lr_payment_events" drop constraint if exists "lr_payment_events_status_check";

alter table public."lr_payment_events" add constraint "lr_payment_events_status_check" CHECK ((status = ANY (ARRAY['verified'::text, 'processed'::text, 'review'::text, 'rejected'::text])));

alter table public."lr_payment_events" enable row level security;

alter table public."lr_game_accounts" drop constraint if exists "lr_game_accounts_mode_check";

alter table public."lr_game_accounts" add constraint "lr_game_accounts_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_game_accounts" drop constraint if exists "lr_game_accounts_pkey";

alter table public."lr_game_accounts" add constraint "lr_game_accounts_pkey" PRIMARY KEY (user_id, mode);

alter table public."lr_game_accounts" drop constraint if exists "lr_game_accounts_state_check";

alter table public."lr_game_accounts" add constraint "lr_game_accounts_state_check" CHECK ((jsonb_typeof(state) = 'object'::text));

alter table public."lr_game_accounts" drop constraint if exists "lr_game_accounts_user_id_fkey";

alter table public."lr_game_accounts" add constraint "lr_game_accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES lr_profiles(id);

alter table public."lr_game_accounts" enable row level security;

alter table public."lr_game_requests" drop constraint if exists "lr_game_requests_pkey";

alter table public."lr_game_requests" add constraint "lr_game_requests_pkey" PRIMARY KEY (user_id, mode, request_key);

alter table public."lr_game_requests" drop constraint if exists "lr_game_requests_request_key_check";

alter table public."lr_game_requests" add constraint "lr_game_requests_request_key_check" CHECK (((length(request_key) >= 8) AND (length(request_key) <= 160)));

alter table public."lr_game_requests" drop constraint if exists "lr_game_requests_user_id_fkey";

alter table public."lr_game_requests" add constraint "lr_game_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES lr_profiles(id);

alter table public."lr_game_requests" enable row level security;

alter table public."lr_live_chat" drop constraint if exists "lr_live_chat_author_id_fkey";

alter table public."lr_live_chat" add constraint "lr_live_chat_author_id_fkey" FOREIGN KEY (author_id) REFERENCES lr_profiles(id);

alter table public."lr_live_chat" drop constraint if exists "lr_live_chat_message_check";

alter table public."lr_live_chat" add constraint "lr_live_chat_message_check" CHECK (((length(message) >= 1) AND (length(message) <= 2000)));

alter table public."lr_live_chat" drop constraint if exists "lr_live_chat_pkey";

alter table public."lr_live_chat" add constraint "lr_live_chat_pkey" PRIMARY KEY (id);

CREATE INDEX IF NOT EXISTS lr_live_chat_room_date ON public.lr_live_chat USING btree (mode, room, created_at DESC);

alter table public."lr_live_chat" enable row level security;

alter table public."lr_admin_audit" enable row level security;

alter table public."lr_profiles" drop constraint if exists "lr_profiles_check";

alter table public."lr_profiles" add constraint "lr_profiles_check" CHECK ((referrer_id IS DISTINCT FROM id));

alter table public."lr_profiles" drop constraint if exists "lr_profiles_display_name_check";

alter table public."lr_profiles" add constraint "lr_profiles_display_name_check" CHECK (((length(display_name) >= 1) AND (length(display_name) <= 80)));

alter table public."lr_profiles" drop constraint if exists "lr_profiles_status_check";

alter table public."lr_profiles" add constraint "lr_profiles_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'blocked'::text, 'archived'::text])));

alter table public."lr_profiles" drop constraint if exists "lr_profiles_whatsapp_check";

alter table public."lr_profiles" add constraint "lr_profiles_whatsapp_check" CHECK (((whatsapp IS NULL) OR (whatsapp ~ '^[0-9]{10,15}$'::text)));

CREATE INDEX IF NOT EXISTS lr_profiles_referrer_idx ON public.lr_profiles USING btree (referrer_id);

alter table public."lr_profiles" enable row level security;

alter table public."lr_wallets" drop constraint if exists "lr_wallets_available_minor_check";

alter table public."lr_wallets" add constraint "lr_wallets_available_minor_check" CHECK (((available_minor >= 0) AND (available_minor <= '9000000000000000'::bigint)));

alter table public."lr_wallets" drop constraint if exists "lr_wallets_currency_check";

alter table public."lr_wallets" add constraint "lr_wallets_currency_check" CHECK ((currency = ANY (ARRAY['LC'::text, 'RC'::text, 'BRL'::text])));

alter table public."lr_wallets" drop constraint if exists "lr_wallets_mode_check";

alter table public."lr_wallets" add constraint "lr_wallets_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_wallets" drop constraint if exists "lr_wallets_reserved_minor_check";

alter table public."lr_wallets" add constraint "lr_wallets_reserved_minor_check" CHECK (((reserved_minor >= 0) AND (reserved_minor <= '9000000000000000'::bigint)));

alter table public."lr_wallets" enable row level security;

alter table public."lr_ledger" drop constraint if exists "lr_ledger_amount_minor_check";

alter table public."lr_ledger" add constraint "lr_ledger_amount_minor_check" CHECK (((amount_minor >= 1) AND (amount_minor <= '9000000000000000'::bigint)));

alter table public."lr_ledger" drop constraint if exists "lr_ledger_available_after_minor_check";

alter table public."lr_ledger" add constraint "lr_ledger_available_after_minor_check" CHECK ((available_after_minor >= 0));

alter table public."lr_ledger" drop constraint if exists "lr_ledger_idempotency_key_check";

alter table public."lr_ledger" add constraint "lr_ledger_idempotency_key_check" CHECK (((length(idempotency_key) >= 8) AND (length(idempotency_key) <= 180)));

alter table public."lr_ledger" drop constraint if exists "lr_ledger_operation_check";

alter table public."lr_ledger" add constraint "lr_ledger_operation_check" CHECK ((operation = ANY (ARRAY['credit'::text, 'debit'::text, 'reserve'::text, 'release'::text, 'capture'::text])));

alter table public."lr_ledger" drop constraint if exists "lr_ledger_reserved_after_minor_check";

alter table public."lr_ledger" add constraint "lr_ledger_reserved_after_minor_check" CHECK ((reserved_after_minor >= 0));

CREATE INDEX IF NOT EXISTS lr_ledger_user_date_idx ON public.lr_ledger USING btree (user_id, mode, created_at DESC);

alter table public."lr_ledger" enable row level security;

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_base_daily_minor_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_base_daily_minor_check" CHECK ((base_daily_minor >= 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_battle_limit_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_battle_limit_check" CHECK ((battle_limit >= 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_battles_used_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_battles_used_check" CHECK ((battles_used >= 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_catalog_version_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_catalog_version_check" CHECK ((catalog_version > 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_check" CHECK ((expires_at > acquired_at));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_check1";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_check1" CHECK ((level <= max_level));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_check2";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_check2" CHECK ((battles_used <= battle_limit));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_earned_minor_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_earned_minor_check" CHECK ((earned_minor >= 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_level_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_level_check" CHECK ((level > 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_max_level_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_max_level_check" CHECK (((max_level >= 1) AND (max_level <= 100)));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_mode_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_principal_return_lc_minor_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_principal_return_lc_minor_check" CHECK ((principal_return_lc_minor >= 0));

alter table public."lr_owned_robots" drop constraint if exists "lr_owned_robots_production_daily_minor_check";

alter table public."lr_owned_robots" add constraint "lr_owned_robots_production_daily_minor_check" CHECK ((production_daily_minor >= 0));

CREATE INDEX IF NOT EXISTS lr_owned_robots_owner_idx ON public.lr_owned_robots USING btree (user_id, mode);

CREATE INDEX IF NOT EXISTS lr_pending_expirations_idx ON public.lr_owned_robots USING btree (expires_at, id) WHERE ((mode = 'demo'::text) AND (acquisition_contract IS NOT NULL) AND (principal_returned_at IS NULL));

alter table public."lr_owned_robots" enable row level security;

alter table public."lr_owned_parts" drop constraint if exists "lr_owned_parts_catalog_version_check";

alter table public."lr_owned_parts" add constraint "lr_owned_parts_catalog_version_check" CHECK ((catalog_version > 0));

alter table public."lr_owned_parts" drop constraint if exists "lr_owned_parts_check";

alter table public."lr_owned_parts" add constraint "lr_owned_parts_check" CHECK ((level <= max_level));

alter table public."lr_owned_parts" drop constraint if exists "lr_owned_parts_level_check";

alter table public."lr_owned_parts" add constraint "lr_owned_parts_level_check" CHECK ((level > 0));

alter table public."lr_owned_parts" drop constraint if exists "lr_owned_parts_max_level_check";

alter table public."lr_owned_parts" add constraint "lr_owned_parts_max_level_check" CHECK (((max_level >= 1) AND (max_level <= 100)));

alter table public."lr_owned_parts" drop constraint if exists "lr_owned_parts_mode_check";

alter table public."lr_owned_parts" add constraint "lr_owned_parts_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

CREATE INDEX IF NOT EXISTS lr_owned_parts_owner_idx ON public.lr_owned_parts USING btree (user_id, mode);

alter table public."lr_owned_parts" enable row level security;

alter table public."lr_daily_rewards" drop constraint if exists "lr_daily_rewards_amount_minor_check";

alter table public."lr_daily_rewards" add constraint "lr_daily_rewards_amount_minor_check" CHECK ((amount_minor >= 0));

alter table public."lr_daily_rewards" drop constraint if exists "lr_daily_rewards_commission_rates_bp_check";

alter table public."lr_daily_rewards" add constraint "lr_daily_rewards_commission_rates_bp_check" CHECK ((cardinality(commission_rates_bp) = 3));

CREATE INDEX IF NOT EXISTS lr_daily_rewards_owner_idx ON public.lr_daily_rewards USING btree (user_id, mode, production_date DESC);

alter table public."lr_daily_rewards" enable row level security;

alter table public."lr_commissions" drop constraint if exists "lr_commissions_amount_minor_check";

alter table public."lr_commissions" add constraint "lr_commissions_amount_minor_check" CHECK ((amount_minor > 0));

alter table public."lr_commissions" drop constraint if exists "lr_commissions_check";

alter table public."lr_commissions" add constraint "lr_commissions_check" CHECK ((source_user_id <> beneficiary_id));

alter table public."lr_commissions" drop constraint if exists "lr_commissions_level_check";

alter table public."lr_commissions" add constraint "lr_commissions_level_check" CHECK (((level >= 1) AND (level <= 3)));

alter table public."lr_commissions" drop constraint if exists "lr_commissions_rate_bp_check";

alter table public."lr_commissions" add constraint "lr_commissions_rate_bp_check" CHECK (((rate_bp >= 0) AND (rate_bp <= 10000)));

CREATE INDEX IF NOT EXISTS lr_commissions_beneficiary_idx ON public.lr_commissions USING btree (beneficiary_id, created_at DESC);

alter table public."lr_commissions" enable row level security;

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_amount_cents_check";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_amount_cents_check" CHECK (((amount_cents >= 1) AND (amount_cents <= 10000000)));

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_kind_check";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_kind_check" CHECK ((kind = ANY (ARRAY['deposit'::text, 'withdrawal'::text])));

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_lc_amount_check";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_lc_amount_check" CHECK ((lc_amount > 0));

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_mode_check";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_mode_check" CHECK ((mode = 'real'::text));

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_pkey";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_pkey" PRIMARY KEY (id);

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_provider_id_key";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_provider_id_key" UNIQUE (provider_id);

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_status_check";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_status_check" CHECK ((status = ANY (ARRAY['created'::text, 'review'::text, 'dispatching'::text, 'pending'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'uncertain'::text, 'refunded'::text])));

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_user_id_fkey";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES lr_profiles(id);

alter table public."lr_cash_operations" drop constraint if exists "lr_cash_operations_user_id_request_key_key";

alter table public."lr_cash_operations" add constraint "lr_cash_operations_user_id_request_key_key" UNIQUE (user_id, request_key);

CREATE INDEX IF NOT EXISTS lr_cash_status_date ON public.lr_cash_operations USING btree (status, created_at);

alter table public."lr_cash_operations" enable row level security;

alter table public."lr_tutorial_progress" drop constraint if exists "lr_tutorial_progress_evidence_check";

alter table public."lr_tutorial_progress" add constraint "lr_tutorial_progress_evidence_check" CHECK ((jsonb_typeof(evidence) = 'object'::text));

alter table public."lr_tutorial_progress" drop constraint if exists "lr_tutorial_progress_step_check";

alter table public."lr_tutorial_progress" add constraint "lr_tutorial_progress_step_check" CHECK ((step = ANY (ARRAY['intro'::text, 'wallet'::text, 'robot_catalog'::text])));

alter table public."lr_tutorial_progress" enable row level security;

alter table public."lr_tutorial_claims" drop constraint if exists "lr_tutorial_claims_amount_minor_check";

alter table public."lr_tutorial_claims" add constraint "lr_tutorial_claims_amount_minor_check" CHECK ((amount_minor >= 0));

alter table public."lr_tutorial_claims" drop constraint if exists "lr_tutorial_claims_mode_check";

alter table public."lr_tutorial_claims" add constraint "lr_tutorial_claims_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_tutorial_claims" enable row level security;

alter table public."lr_orders" drop constraint if exists "lr_orders_amount_minor_check";

alter table public."lr_orders" add constraint "lr_orders_amount_minor_check" CHECK ((amount_minor > 0));

alter table public."lr_orders" drop constraint if exists "lr_orders_currency_check";

alter table public."lr_orders" add constraint "lr_orders_currency_check" CHECK ((currency = ANY (ARRAY['LC'::text, 'RC'::text, 'BRL'::text])));

alter table public."lr_orders" drop constraint if exists "lr_orders_idempotency_key_check";

alter table public."lr_orders" add constraint "lr_orders_idempotency_key_check" CHECK (((length(idempotency_key) >= 8) AND (length(idempotency_key) <= 180)));

alter table public."lr_orders" drop constraint if exists "lr_orders_kind_check";

alter table public."lr_orders" add constraint "lr_orders_kind_check" CHECK ((kind = ANY (ARRAY['robot'::text, 'part'::text, 'upgrade_robot'::text, 'upgrade_part'::text, 'conversion'::text, 'arena_pass'::text, 'deposit'::text, 'withdrawal'::text])));

alter table public."lr_orders" drop constraint if exists "lr_orders_mode_check";

alter table public."lr_orders" add constraint "lr_orders_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_orders" drop constraint if exists "lr_orders_quote_check";

alter table public."lr_orders" add constraint "lr_orders_quote_check" CHECK ((jsonb_typeof(quote) = 'object'::text));

alter table public."lr_orders" drop constraint if exists "lr_orders_status_check";

alter table public."lr_orders" add constraint "lr_orders_status_check" CHECK ((status = ANY (ARRAY['created'::text, 'pending'::text, 'reserved'::text, 'completed'::text, 'failed'::text, 'cancelled'::text, 'review'::text])));

CREATE INDEX IF NOT EXISTS lr_orders_user_date_idx ON public.lr_orders USING btree (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS lr_orders_status_date_idx ON public.lr_orders USING btree (status, created_at DESC);

alter table public."lr_orders" enable row level security;

alter table public."lr_deposits" drop constraint if exists "lr_deposits_mode_check";

alter table public."lr_deposits" add constraint "lr_deposits_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_deposits" drop constraint if exists "lr_deposits_quoted_lc_minor_check";

alter table public."lr_deposits" add constraint "lr_deposits_quoted_lc_minor_check" CHECK ((quoted_lc_minor > 0));

alter table public."lr_deposits" drop constraint if exists "lr_deposits_requested_brl_cents_check";

alter table public."lr_deposits" add constraint "lr_deposits_requested_brl_cents_check" CHECK ((requested_brl_cents > 0));

alter table public."lr_deposits" drop constraint if exists "lr_deposits_status_check";

alter table public."lr_deposits" add constraint "lr_deposits_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'expired'::text, 'failed'::text, 'review'::text])));

alter table public."lr_deposits" enable row level security;

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_fee_brl_cents_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_fee_brl_cents_check" CHECK ((fee_brl_cents >= 0));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_idempotency_key_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_idempotency_key_check" CHECK (((length(idempotency_key) >= 8) AND (length(idempotency_key) <= 160)));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_mode_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_provider_total_debit_cents_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_provider_total_debit_cents_check" CHECK ((provider_total_debit_cents >= 0));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_quote_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_quote_check" CHECK ((jsonb_typeof(quote) = 'object'::text));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_requested_brl_cents_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_requested_brl_cents_check" CHECK ((requested_brl_cents > 0));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_status_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_status_check" CHECK ((status = ANY (ARRAY['reserved'::text, 'pending'::text, 'paid'::text, 'failed'::text, 'cancelled'::text, 'review'::text])));

alter table public."lr_withdrawals" drop constraint if exists "lr_withdrawals_total_debit_lc_minor_check";

alter table public."lr_withdrawals" add constraint "lr_withdrawals_total_debit_lc_minor_check" CHECK ((total_debit_lc_minor > 0));

CREATE INDEX IF NOT EXISTS lr_withdrawals_owner_idx ON public.lr_withdrawals USING btree (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS lr_withdrawals_status_date_idx ON public.lr_withdrawals USING btree (status, created_at DESC);

alter table public."lr_withdrawals" enable row level security;

alter table public."lr_daily_arena" drop constraint if exists "lr_daily_arena_check";

alter table public."lr_daily_arena" add constraint "lr_daily_arena_check" CHECK ((used <= (free_limit + purchased)));

alter table public."lr_daily_arena" drop constraint if exists "lr_daily_arena_free_limit_check";

alter table public."lr_daily_arena" add constraint "lr_daily_arena_free_limit_check" CHECK ((free_limit >= 0));

alter table public."lr_daily_arena" drop constraint if exists "lr_daily_arena_mode_check";

alter table public."lr_daily_arena" add constraint "lr_daily_arena_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_daily_arena" drop constraint if exists "lr_daily_arena_purchased_check";

alter table public."lr_daily_arena" add constraint "lr_daily_arena_purchased_check" CHECK ((purchased >= 0));

alter table public."lr_daily_arena" drop constraint if exists "lr_daily_arena_used_check";

alter table public."lr_daily_arena" add constraint "lr_daily_arena_used_check" CHECK ((used >= 0));

alter table public."lr_daily_arena" enable row level security;

alter table public."lr_arena_matches" drop constraint if exists "lr_arena_matches_check";

alter table public."lr_arena_matches" add constraint "lr_arena_matches_check" CHECK ((challenger_id <> opponent_id));

alter table public."lr_arena_matches" drop constraint if exists "lr_arena_matches_mode_check";

alter table public."lr_arena_matches" add constraint "lr_arena_matches_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_arena_matches" drop constraint if exists "lr_arena_matches_status_check";

alter table public."lr_arena_matches" add constraint "lr_arena_matches_status_check" CHECK ((status = ANY (ARRAY['reserved'::text, 'running'::text, 'settled'::text, 'cancelled'::text])));

alter table public."lr_arena_matches" enable row level security;

alter table public."lr_story_progress" drop constraint if exists "lr_story_progress_mode_check";

alter table public."lr_story_progress" add constraint "lr_story_progress_mode_check" CHECK ((mode = ANY (ARRAY['demo'::text, 'real'::text])));

alter table public."lr_story_progress" drop constraint if exists "lr_story_progress_reward_rc_minor_check";

alter table public."lr_story_progress" add constraint "lr_story_progress_reward_rc_minor_check" CHECK ((reward_rc_minor >= 0));

alter table public."lr_story_progress" enable row level security;

alter table public."lr_settings" drop constraint if exists "lr_settings_value_check";

alter table public."lr_settings" add constraint "lr_settings_value_check" CHECK ((((key = ANY (ARRAY['seasons'::text, 'arena_roster'::text])) AND (jsonb_typeof(value) = 'array'::text)) OR ((key <> ALL (ARRAY['seasons'::text, 'arena_roster'::text])) AND (jsonb_typeof(value) = 'object'::text))));

alter table public."lr_settings" drop constraint if exists "lr_settings_version_check";

alter table public."lr_settings" add constraint "lr_settings_version_check" CHECK ((version > 0));

alter table public."lr_settings" drop constraint if exists "lr_settings_visibility_check";

alter table public."lr_settings" add constraint "lr_settings_visibility_check" CHECK ((visibility = ANY (ARRAY['public'::text, 'server'::text])));

alter table public."lr_settings" enable row level security;

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_attack_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_attack_check" CHECK ((attack >= 0));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_currency_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_currency_check" CHECK ((currency = ANY (ARRAY['LC'::text, 'RC'::text])));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_daily_rc_minor_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_daily_rc_minor_check" CHECK (((daily_rc_minor >= 0) AND (daily_rc_minor <= '9000000000000000'::bigint)));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_defense_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_defense_check" CHECK ((defense >= 0));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_health_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_health_check" CHECK ((health > 0));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_lifetime_days_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_lifetime_days_check" CHECK (((lifetime_days >= 1) AND (lifetime_days <= 3650)));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_max_battles_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_max_battles_check" CHECK (((max_battles >= 0) AND (max_battles <= 1000000)));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_max_level_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_max_level_check" CHECK (((max_level >= 1) AND (max_level <= 100)));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_price_minor_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_price_minor_check" CHECK (((price_minor >= 1) AND (price_minor <= '9000000000000000'::bigint)));

alter table public."lr_robot_catalog" drop constraint if exists "lr_robot_catalog_version_check";

alter table public."lr_robot_catalog" add constraint "lr_robot_catalog_version_check" CHECK ((version > 0));

alter table public."lr_robot_catalog" enable row level security;

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_attack_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_attack_check" CHECK ((attack >= 0));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_currency_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_currency_check" CHECK ((currency = ANY (ARRAY['LC'::text, 'RC'::text])));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_defense_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_defense_check" CHECK ((defense >= 0));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_display_level_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_display_level_check" CHECK ((display_level >= 1));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_max_level_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_max_level_check" CHECK (((max_level >= 1) AND (max_level <= 100)));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_price_minor_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_price_minor_check" CHECK (((price_minor >= 1) AND (price_minor <= '9000000000000000'::bigint)));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_production_boost_bp_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_production_boost_bp_check" CHECK (((production_boost_bp >= 0) AND (production_boost_bp <= 100000)));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_slot_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_slot_check" CHECK ((slot = ANY (ARRAY['core'::text, 'arm'::text, 'shield'::text, 'legs'::text, 'booster'::text, 'sensor'::text])));

alter table public."lr_part_catalog" drop constraint if exists "lr_part_catalog_version_check";

alter table public."lr_part_catalog" add constraint "lr_part_catalog_version_check" CHECK ((version > 0));

alter table public."lr_part_catalog" enable row level security;

alter table public."lr_part_compatibility" enable row level security;

alter table public."lr_story_chapters" drop constraint if exists "lr_story_chapters_id_check";

alter table public."lr_story_chapters" add constraint "lr_story_chapters_id_check" CHECK ((id > 0));

alter table public."lr_story_chapters" drop constraint if exists "lr_story_chapters_required_power_check";

alter table public."lr_story_chapters" add constraint "lr_story_chapters_required_power_check" CHECK ((required_power >= 0));

alter table public."lr_story_chapters" drop constraint if exists "lr_story_chapters_reward_rc_minor_check";

alter table public."lr_story_chapters" add constraint "lr_story_chapters_reward_rc_minor_check" CHECK ((reward_rc_minor >= 0));

alter table public."lr_story_chapters" enable row level security;

alter table public."lr_cash_deliveries" drop constraint if exists "lr_cash_deliveries_operation_id_fkey";

alter table public."lr_cash_deliveries" add constraint "lr_cash_deliveries_operation_id_fkey" FOREIGN KEY (operation_id) REFERENCES lr_cash_operations(id);

alter table public."lr_cash_deliveries" drop constraint if exists "lr_cash_deliveries_pkey";

alter table public."lr_cash_deliveries" add constraint "lr_cash_deliveries_pkey" PRIMARY KEY (delivery_id);

alter table public."lr_cash_deliveries" enable row level security;

alter table public."lr_job_checkpoint" drop constraint if exists "lr_job_checkpoint_pkey";

alter table public."lr_job_checkpoint" add constraint "lr_job_checkpoint_pkey" PRIMARY KEY (name);

alter table public."lr_job_checkpoint" enable row level security;

alter table public."lr_job_runs" drop constraint if exists "lr_job_runs_pkey";

alter table public."lr_job_runs" add constraint "lr_job_runs_pkey" PRIMARY KEY (id);

alter table public."lr_job_runs" enable row level security;

CREATE OR REPLACE FUNCTION public.lr_admin_page_users(p_actor_id uuid, p_page integer DEFAULT 1, p_size integer DEFAULT 8, p_query text DEFAULT ''::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_total bigint; v_rows jsonb;
begin
 if not exists(select 1 from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id where a.user_id=p_actor_id and p.status='active') then raise exception 'ADMIN_REQUIRED'; end if;
 if p_page<1 or p_size not between 1 and 100 or length(coalesce(p_query,''))>100 then raise exception 'INVALID_PAGINATION'; end if;
 select count(*) into v_total from public.lr_profiles p where
  concat_ws(' ',p.display_name,p.whatsapp,p.referral_code,(select u.email from auth.users u where u.id=p.id)) ilike '%'||coalesce(p_query,'')||'%';
 select coalesce(jsonb_agg(x.data order by x.created_at desc),'[]'::jsonb) into v_rows from (
  select p.created_at,jsonb_build_object(
   'profile',jsonb_build_object('id',p.id,'name',p.display_name,'whatsapp',p.whatsapp,'referralCode',p.referral_code,'referrerId',p.referrer_id,'status',p.status,
    'email',(select u.email from auth.users u where u.id=p.id),'role',case when exists(select 1 from public.lr_admin_roles a where a.user_id=p.id) then 'admin' else 'user' end),
   'balances',jsonb_build_object('LC',coalesce((select w.available_minor/100.0 from public.lr_wallets w where w.user_id=p.id and w.mode='demo' and w.currency='LC'),0),
    'RC',coalesce((select w.available_minor/100.0 from public.lr_wallets w where w.user_id=p.id and w.mode='demo' and w.currency='RC'),0)),
   'reservedLC',coalesce((select w.reserved_minor/100.0 from public.lr_wallets w where w.user_id=p.id and w.mode='demo' and w.currency='LC'),0),
   'robots',coalesce((select jsonb_agg(jsonb_build_object('uid',r.id,'catalogId',r.catalog_id,'level',r.level,'createdAt',extract(epoch from r.acquired_at)*1000,
    'expiresAt',extract(epoch from r.expires_at)*1000,'lastCollected',extract(epoch from coalesce(r.last_settled_at,r.acquired_at))*1000,
    'earned',r.earned_minor/100.0,'used',r.battles_used,'productionDailyMinor',r.production_daily_minor,'principalReturnLC',r.principal_return_lc_minor/100.0,
    'equipment',coalesce((select jsonb_agg(i.id) from public.lr_owned_parts i where i.equipped_robot_id=r.id),'[]'::jsonb))) from public.lr_owned_robots r where r.user_id=p.id and r.mode='demo'),'[]'::jsonb),
   'inventory',coalesce((select jsonb_agg(jsonb_build_object('uid',i.id,'partId',i.catalog_id,'level',i.level,'equippedOn',i.equipped_robot_id)) from public.lr_owned_parts i where i.user_id=p.id and i.mode='demo'),'[]'::jsonb)
  ) data from public.lr_profiles p where concat_ws(' ',p.display_name,p.whatsapp,p.referral_code,(select u.email from auth.users u where u.id=p.id)) ilike '%'||coalesce(p_query,'')||'%'
  order by p.created_at desc,p.id limit p_size offset ((p_page::bigint-1)*p_size)
 ) x;
 return jsonb_build_object('mode','demo','users',v_rows,'total',v_total,'page',p_page,'pageSize',p_size,'realMoneyEnabled',false);
end;
$function$;

CREATE OR REPLACE FUNCTION public.lr_admin_save_content(p_actor uuid, p_kind text, p_value jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));perform public.lr_admin_save_content_v10(p_actor,p_kind,p_value);update public.lr_game_world set revision=revision+1;end;$function$;

CREATE OR REPLACE FUNCTION public.lr_admin_save_content_v10(p_actor uuid, p_kind text, p_value jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_id text;v_before jsonb;c jsonb;item jsonb;v_refs text[];
begin
 if not exists(select 1 from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id where a.user_id=p_actor and p.status='active') then raise exception 'ADMIN_REQUIRED';end if;
 perform pg_advisory_xact_lock(hashtext('lr_content_studio'));
 if p_kind not in ('robot','part','chapter','season','settings','arenaRoster') then raise exception 'INVALID_CONTENT';end if;
 -- Toda referência de arquivo enviada precisa existir. Não confia no UUID do cliente.
 for v_id in select distinct x[1] from regexp_matches(p_value::text,'media:([a-zA-Z0-9-]+)','g') x loop
 if not exists(select 1 from public.lr_media m where m.ref='media:'||v_id) then raise exception 'MEDIA_NOT_FOUND';end if;
 end loop;
 v_id=p_value->>'id';
 if p_kind='robot' then
 select to_jsonb(r) into v_before from public.lr_robot_catalog r where id=v_id;
 insert into public.lr_robot_catalog(id,name,robot_type,rarity,description,asset,color,price_minor,currency,daily_rc_minor,lifetime_days,max_battles,attack,defense,health,identity)
 values(v_id,p_value->>'name',p_value->>'type',p_value->>'rarity',p_value->>'description',p_value->>'asset',p_value->>'color',(p_value->>'price')::bigint*100,p_value->>'currency',(p_value->>'daily')::bigint*100,(p_value->>'lifetime')::int,(p_value->>'maxBattles')::int,(p_value->>'attack')::int,(p_value->>'defense')::int,(p_value->>'health')::int,p_value)
 on conflict(id) do update set name=excluded.name,robot_type=excluded.robot_type,rarity=excluded.rarity,description=excluded.description,asset=excluded.asset,color=excluded.color,price_minor=excluded.price_minor,currency=excluded.currency,daily_rc_minor=excluded.daily_rc_minor,lifetime_days=excluded.lifetime_days,max_battles=excluded.max_battles,attack=excluded.attack,defense=excluded.defense,health=excluded.health,identity=excluded.identity,version=public.lr_robot_catalog.version+1;
 elsif p_kind='part' then
 select to_jsonb(r) into v_before from public.lr_part_catalog r where id=v_id;
 insert into public.lr_part_catalog(id,name,slot,description,asset,price_minor,currency,production_boost_bp,attack,defense,display_level,identity)
 values(v_id,p_value->>'name',p_value->>'slot',p_value->>'description',p_value->>'asset',(p_value->>'price')::bigint*100,p_value->>'currency',(p_value->>'production')::int*100,(p_value->>'attack')::int,(p_value->>'defense')::int,(p_value->>'level')::int,p_value)
 on conflict(id) do update set name=excluded.name,slot=excluded.slot,description=excluded.description,asset=excluded.asset,price_minor=excluded.price_minor,currency=excluded.currency,production_boost_bp=excluded.production_boost_bp,attack=excluded.attack,defense=excluded.defense,display_level=excluded.display_level,identity=excluded.identity,version=public.lr_part_catalog.version+1;
 delete from public.lr_part_compatibility where part_id=v_id;
 insert into public.lr_part_compatibility(part_id,robot_type) select v_id,jsonb_array_elements_text(p_value->'compatible');
 elsif p_kind='chapter' then
 select to_jsonb(r) into v_before from public.lr_story_chapters r where id=v_id::int;
 insert into public.lr_story_chapters(id,title,place,story,required_power,reward_rc_minor,active,definition)
 values(v_id::int,p_value->>'title',p_value->>'place',p_value->>'story',(p_value->>'power')::int,(p_value->>'reward')::bigint*100,(p_value->>'enabled')::boolean,p_value)
 on conflict(id) do update set title=excluded.title,place=excluded.place,story=excluded.story,required_power=excluded.required_power,reward_rc_minor=excluded.reward_rc_minor,active=excluded.active,definition=excluded.definition;
 elsif p_kind='season' then
 select value into v_before from public.lr_settings where key='seasons' for update;
 if exists(select 1 from jsonb_array_elements(v_before) s where s->>'id'<>v_id and (s->>'from')::int<=(p_value->>'to')::int and (s->>'to')::int>=(p_value->>'from')::int) then raise exception 'SEASON_OVERLAP';end if;
 update public.lr_settings set value=coalesce((select jsonb_agg(s) from jsonb_array_elements(v_before) s where s->>'id'<>v_id),'[]'::jsonb)||jsonb_build_array(p_value),version=version+1,updated_by=p_actor,updated_at=now() where key='seasons';
 elsif p_kind='settings' then
 select value into v_before from public.lr_settings where key='economy' for update;
 insert into public.lr_settings(key,value,visibility,updated_by) values('economy',p_value,'public',p_actor),('presentation',p_value,'public',p_actor) on conflict(key) do update set value=excluded.value,version=public.lr_settings.version+1,updated_by=p_actor,updated_at=now();
 elsif p_kind='arenaRoster' then
 select value into v_before from public.lr_settings where key='arena_roster' for update;
 update public.lr_settings set value=p_value,version=version+1,updated_by=p_actor,updated_at=now() where key='arena_roster';
 end if;
 insert into public.lr_admin_audit(actor_id,action,resource,before_data,after_data) values(p_actor,'content_save',p_kind||':'||coalesce(v_id,'global'),v_before,p_value);
end;
$function$;

CREATE OR REPLACE FUNCTION public.lr_admin_set_payments(p_actor uuid, p_enabled boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if not exists(select 1 from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id where a.user_id=p_actor and p.status='active') then raise exception 'ADMIN_REQUIRED';end if;
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 update public.lr_settings set value=value||jsonb_build_object('real_money_enabled',p_enabled,'gateway_adapter','mercosulpay_v1'),version=version+1,updated_by=p_actor,updated_at=now() where key='deployment';
 update public.lr_game_world set revision=revision+1;
 insert into public.lr_admin_audit(actor_id,action,resource,after_data) values(p_actor,'payments_policy','deployment',jsonb_build_object('enabled',p_enabled));
 insert into public.lr_game_signals(mode,kind) values('real','payments_policy');
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_can_read_live_room(p_room text, p_mode text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select p_room in ('global','market') or exists(select 1 from public.lr_game_world w,jsonb_array_elements(coalesce(w.state->'guilds','[]'::jsonb)) g,jsonb_array_elements(g->'members') m where w.mode=p_mode and 'guild:'||(g->>'id')=p_room and m->>'userId'=auth.uid()::text);
$function$;

CREATE OR REPLACE FUNCTION public.lr_cash_claim(p_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cash public.lr_cash_operations;
begin
 select * into strict cash from public.lr_cash_operations where id=p_id for update;
 if cash.status='dispatching' and cash.lease_until<now() then update public.lr_cash_operations set status='uncertain',reason='Resposta do gateway não recebida; conciliação necessária.' where id=p_id returning * into cash;end if;
 if cash.status<>'created' then return jsonb_build_object('claimed',false,'operation',to_jsonb(cash));end if;
 update public.lr_cash_operations set status='dispatching',lease_until=now()+interval '60 seconds',updated_at=now() where id=p_id returning * into cash;
 return jsonb_build_object('claimed',true,'operation',to_jsonb(cash));
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_cash_prepare(p_actor uuid, p_kind text, p_amount bigint, p_destination jsonb, p_key text, p_hash text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cash public.lr_cash_operations;s jsonb;fee bigint;coins bigint;automatic boolean;
begin
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 if not coalesce((select (value->>'real_money_enabled')::boolean from public.lr_settings where key='deployment'),false) then raise exception 'REAL_MONEY_DISABLED';end if;
 if p_kind not in ('deposit','withdrawal') or p_amount not between 1 and 10000000 or length(p_key) not between 8 and 160 then raise exception 'INVALID_PAYMENT';end if;
 if not exists(select 1 from public.lr_profiles where id=p_actor and status='active') then raise exception 'USER_NOT_ACTIVE';end if;
 select * into cash from public.lr_cash_operations where user_id=p_actor and request_key=p_key;
 if found then if cash.request_hash<>p_hash then raise exception 'IDEMPOTENCY_CONFLICT';end if;return to_jsonb(cash);end if;
 select value into strict s from public.lr_settings where key='economy';
 if p_kind='withdrawal' and p_amount<ceil((s->>'minWithdraw')::numeric*100) then raise exception 'WITHDRAWAL_BELOW_MINIMUM';end if;
 fee=case when p_kind='withdrawal' then ceil(p_amount*(s->>'withdrawFee')::numeric/100) else 0 end;
 coins=case when p_kind='withdrawal' then ceil((p_amount+fee)*(s->>'lcPerReal')::numeric/100) else floor(p_amount*(s->>'lcPerReal')::numeric/100) end;
 automatic=p_kind='deposit' or coalesce((s->>'autoWithdrawals')::boolean,false) and (coalesce((s->>'autoWithdrawalMax')::numeric,0)=0 or p_amount<=(s->>'autoWithdrawalMax')::numeric*100);
 insert into public.lr_cash_operations(user_id,kind,request_key,request_hash,amount_cents,fee_cents,lc_amount,quote,destination,status) values(p_actor,p_kind,p_key,p_hash,p_amount,fee,coins,jsonb_build_object('lcPerReal',s->'lcPerReal','withdrawFee',s->'withdrawFee','autoApproved',automatic),p_destination,case when automatic then 'created' else 'review' end) returning * into cash;
 if p_kind='withdrawal' then perform public.lr_wallet_apply(p_actor,'real','LC','reserve',coins*100,'withdrawal','cash:reserve:'||cash.id);perform public.lr_cash_sync(cash.id,'reserve');end if;
 return to_jsonb(cash);
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_cash_review(p_actor uuid, p_id uuid, p_approve boolean, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cash public.lr_cash_operations;
begin
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 if not exists(select 1 from public.lr_admin_roles where user_id=p_actor) then raise exception 'ADMIN_REQUIRED';end if;
 if length(trim(p_reason))<4 then raise exception 'REASON_REQUIRED';end if;
 select * into strict cash from public.lr_cash_operations where id=p_id for update;
 if cash.status<>'review' or cash.kind<>'withdrawal' then raise exception 'PAYMENT_ALREADY_REVIEWED';end if;
 update public.lr_cash_operations set status=case when p_approve then 'created' else 'cancelled' end,reason=p_reason,updated_at=now() where id=p_id returning * into cash;
 if not p_approve then perform public.lr_wallet_apply(cash.user_id,'real','LC','release',cash.lc_amount*100,'withdrawal_cancel','cash:release:'||cash.id);perform public.lr_cash_sync(cash.id,'release');end if;
 insert into public.lr_admin_audit(actor_id,action,resource,before_data,after_data) values(p_actor,'withdrawal_review',p_id::text,'{}',jsonb_build_object('user',cash.user_id,'reason',p_reason,'approved',p_approve));
 return to_jsonb(cash);
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_cash_sync(p_id uuid, p_operation text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cash public.lr_cash_operations;acct public.lr_game_accounts;s jsonb;tx jsonb;balance bigint;reserved bigint;delta bigint;
begin
 select * into strict cash from public.lr_cash_operations where id=p_id;
 select * into strict acct from public.lr_game_accounts where user_id=cash.user_id and mode='real' for update;s=acct.state;
 select available_minor/100,reserved_minor/100 into balance,reserved from public.lr_wallets where user_id=cash.user_id and mode='real' and currency='LC';
 s=jsonb_set(jsonb_set(jsonb_set(s,'{balances,LC}',to_jsonb(balance)),'{reservedLC}',to_jsonb(reserved)),'{cashUpdatedAt}',to_jsonb(extract(epoch from now())*1000));
 if p_operation is not null then
  delta=case when p_operation in ('reserve','debit') then -cash.lc_amount when p_operation in ('credit','release') then cash.lc_amount else 0 end;
  tx=jsonb_build_object('id',gen_random_uuid(),'kind',case when cash.kind='deposit' then 'Depósito Pix' else 'Saque Pix' end,'currency','LC','amount',delta,'walletOperation',p_operation,'ledgerAmount',cash.lc_amount,'status',cash.status,'at',extract(epoch from now())*1000);
  s=jsonb_set(s,'{transactions}',jsonb_build_array(tx)||coalesce(s->'transactions','[]'::jsonb));
  if p_operation='credit' then s=jsonb_set(s,'{depositedCents}',to_jsonb(coalesce((s->>'depositedCents')::bigint,0)+cash.amount_cents));end if;
  if p_operation='capture' then s=jsonb_set(s,'{withdrawnCents}',to_jsonb(coalesce((s->>'withdrawnCents')::bigint,0)+cash.amount_cents));end if;
 end if;
 update public.lr_game_accounts set state=s,revision=revision+1,updated_at=now() where user_id=cash.user_id and mode='real';
 insert into public.lr_game_signals(mode,recipient_id,kind) values('real',cash.user_id,'payment_updated');
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_cash_update(p_id uuid, p_status text, p_provider text DEFAULT NULL::text, p_qr text DEFAULT NULL::text, p_total bigint DEFAULT NULL::bigint, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare cash public.lr_cash_operations;previous text;op text;
begin
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 select * into strict cash from public.lr_cash_operations where id=p_id for update;previous=cash.status;
 if p_status not in ('pending','completed','failed','uncertain','refunded') then raise exception 'INVALID_PAYMENT_STATUS';end if;
 if previous in ('completed','cancelled','failed','refunded') then return to_jsonb(cash);end if;
 if p_status='completed' and (p_provider is null and cash.provider_id is null) then raise exception 'PROVIDER_ID_REQUIRED';end if;
 if p_provider is not null and cash.provider_id is not null and cash.provider_id<>p_provider then raise exception 'PROVIDER_ID_MISMATCH';end if;
 update public.lr_cash_operations set status=p_status,provider_id=coalesce(p_provider,provider_id),qr_code=coalesce(p_qr,qr_code),provider_total_debit_cents=coalesce(p_total,provider_total_debit_cents),reason=p_reason,updated_at=now() where id=p_id returning * into cash;
 if p_status='completed' then op=case when cash.kind='deposit' then 'credit' else 'capture' end;
 elsif p_status='failed' and cash.kind='withdrawal' then op='release';end if;
 if op is not null then perform public.lr_wallet_apply(cash.user_id,'real','LC',op,cash.lc_amount*100,'payment_settlement','cash:'||op||':'||cash.id);end if;
 perform public.lr_cash_sync(cash.id,op);
 return to_jsonb(cash);
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_complete_tutorial(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_engine_commit(p_actor uuid, p_mode text, p_world_revision bigint, p_world jsonb, p_accounts jsonb, p_key text, p_hash text, p_action text, p_response jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare w public.lr_game_world;previous public.lr_game_requests;entry jsonb;acct public.lr_game_accounts;tx jsonb;coin text;amount bigint;operation text;newstate jsonb;robot jsonb;owner public.lr_engine_ownership;chat jsonb;reserved bigint;existing public.lr_wallets;
begin
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 if p_mode not in ('demo','real') then raise exception 'INVALID_MODE';end if;
 select * into previous from public.lr_game_requests where user_id=p_actor and mode=p_mode and request_key=p_key;
 if found then if previous.payload_hash<>p_hash or previous.action<>p_action then raise exception 'IDEMPOTENCY_CONFLICT';end if;return previous.response;end if;
 select * into strict w from public.lr_game_world where mode=p_mode for update;
 if w.revision<>p_world_revision then raise exception 'REVISION_CONFLICT';end if;
 for entry in select e from jsonb_array_elements(p_accounts) e order by e->>'userId' loop
  select * into strict acct from public.lr_game_accounts where user_id=(entry->>'userId')::uuid and mode=p_mode for update;
  if acct.revision<>(entry->>'revision')::bigint then raise exception 'REVISION_CONFLICT';end if;
  newstate=entry->'data';
  for tx in select t from jsonb_array_elements(coalesce(newstate->'transactions','[]'::jsonb)) with ordinality as entries(t,position) where not exists(select 1 from jsonb_array_elements(coalesce(acct.state->'transactions','[]'::jsonb)) old where old->>'id'=t->>'id') order by position desc loop
   amount=coalesce((tx->>'ledgerAmount')::bigint,abs((tx->>'amount')::bigint))*100;
   operation=coalesce(tx->>'walletOperation',case when (tx->>'amount')::bigint<0 then 'debit' else 'credit' end);
   if amount>0 then perform public.lr_wallet_apply(acct.user_id,p_mode,tx->>'currency',operation,amount,left(tx->>'kind',180),'engine:'||(tx->>'id'));end if;
  end loop;
  foreach coin in array array['LC','RC'] loop
   select * into strict existing from public.lr_wallets where user_id=acct.user_id and mode=p_mode and currency=coin;
   reserved=coalesce((newstate->>case when coin='LC' then 'reservedLC' else 'reservedRC' end)::bigint,0)*100;
   if existing.available_minor<>(newstate->'balances'->>coin)::bigint*100 or existing.reserved_minor<>reserved then raise exception 'WALLET_STATE_MISMATCH';end if;
  end loop;
  if acct.user_id=p_actor and p_action='profile' then update public.lr_profiles set display_name=newstate->'profile'->>'name',share_team_whatsapp=coalesce((newstate->'profile'->>'shareWhatsApp')::boolean,false) where id=p_actor;end if;
  update public.lr_game_accounts set state=newstate,revision=revision+1,updated_at=now() where user_id=acct.user_id and mode=p_mode;
  for robot in select * from jsonb_array_elements(coalesce(newstate->'robots','[]'::jsonb)) loop
   select * into owner from public.lr_engine_ownership where asset_id=(robot->>'uid')::uuid and mode=p_mode and ended_at is null for update;
   if not found then insert into public.lr_engine_ownership(asset_id,user_id,mode,started_at,contract) values((robot->>'uid')::uuid,acct.user_id,p_mode,to_timestamp((robot->>'createdAt')::numeric/1000),robot->'contract');
   elsif owner.user_id<>acct.user_id then
    if owner.contract is distinct from robot->'contract' then raise exception 'ACQUISITION_CONTRACT_CHANGED';end if;
    update public.lr_engine_ownership set ended_at=now() where asset_id=owner.asset_id and started_at=owner.started_at;
    insert into public.lr_engine_ownership(asset_id,user_id,mode,started_at,contract) values(owner.asset_id,acct.user_id,p_mode,now(),owner.contract);
   elsif owner.contract is distinct from robot->'contract' then raise exception 'ACQUISITION_CONTRACT_CHANGED';end if;
  end loop;
  insert into public.lr_game_signals(mode,recipient_id,kind) values(p_mode,acct.user_id,p_action);
 end loop;
 update public.lr_game_world set state=p_world,revision=revision+1,updated_at=now() where mode=p_mode;
 for chat in select * from jsonb_array_elements(coalesce(p_world->'messages','[]'::jsonb)) loop
  insert into public.lr_live_chat(id,mode,room,author_id,display_name,message,created_at) values((chat->>'id')::uuid,p_mode,chat->>'room',(chat->>'authorId')::uuid,chat->>'name',chat->>'text',to_timestamp((chat->>'at')::numeric/1000)) on conflict(id) do nothing;
 end loop;
 delete from public.lr_live_chat c where mode=p_mode and not exists(select 1 from jsonb_array_elements(coalesce(p_world->'messages','[]'::jsonb)) m where m->>'id'=c.id::text);
 if p_world is distinct from w.state then insert into public.lr_game_signals(mode,kind) values(p_mode,'world_updated');end if;
 insert into public.lr_game_requests(user_id,mode,request_key,payload_hash,action,response) values(p_actor,p_mode,p_key,p_hash,p_action,p_response);
 delete from public.lr_game_signals where created_at<now()-interval '1 hour';
 return p_response;
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_engine_load(p_actor uuid, p_extra_ids uuid[] DEFAULT '{}'::uuid[], p_mode text DEFAULT 'demo'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare uid uuid;s jsonb;profiles jsonb;accounts jsonb;world public.lr_game_world;
begin
 if p_mode not in ('demo','real') then raise exception 'INVALID_MODE';end if;
 if not exists(select 1 from public.lr_profiles where id=p_actor and status='active') then raise exception 'USER_NOT_ACTIVE';end if;
 for uid in select distinct x from unnest(array_append(p_extra_ids,p_actor)) x loop
  if exists(select 1 from public.lr_profiles where id=uid and status='active') then
   s=public.lr_snapshot(uid);
   if p_mode='real' then s=s||jsonb_build_object('robots','[]'::jsonb,'inventory','[]'::jsonb,'transactions','[]'::jsonb,'balances',jsonb_build_object('LC',0,'RC',0),'story',0,'commissionTotal',0,'deposits','[]'::jsonb,'withdrawals','[]'::jsonb,'profile',(s->'profile')||jsonb_build_object('tutorial',false));end if;
   insert into public.lr_wallets(user_id,mode,currency) values(uid,p_mode,'LC'),(uid,p_mode,'RC') on conflict do nothing;
   insert into public.lr_game_accounts(user_id,mode,state) values(uid,p_mode,s-'settings'-'catalog'-'parts'-'chapters'-'seasons'-'arenaRoster'-'affiliates'-'adminUsers'-'serverAuthoritative') on conflict do nothing;
  end if;
 end loop;
 select * into strict world from public.lr_game_world where mode=p_mode;
 select jsonb_agg(jsonb_build_object('userId',a.user_id,'revision',a.revision,'data',a.state,'wallets',jsonb_build_object('LC',coalesce((select available_minor/100 from public.lr_wallets where user_id=a.user_id and mode=p_mode and currency='LC'),0),'RC',coalesce((select available_minor/100 from public.lr_wallets where user_id=a.user_id and mode=p_mode and currency='RC'),0)))) into accounts from public.lr_game_accounts a where a.mode=p_mode and a.user_id=any(array_append(p_extra_ids,p_actor));
 select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name,'whatsapp',p.whatsapp,'shareWhatsApp',p.share_team_whatsapp,'referralCode',p.referral_code,'referrerId',p.referrer_id,'status',p.status,'emailConfirmed',u.email_confirmed_at is not null,'email',u.email,'role',case when ar.user_id is null then 'user' else 'admin' end)), '[]'::jsonb) into profiles from public.lr_profiles p join auth.users u on u.id=p.id left join public.lr_admin_roles ar on ar.user_id=p.id;
 return jsonb_build_object('accounts',coalesce(accounts,'[]'::jsonb),'profiles',profiles,'world',jsonb_build_object('revision',world.revision,'data',world.state),'mode',p_mode,'config',jsonb_set(jsonb_set(public.lr_snapshot(p_actor),'{settings,social}',coalesce((select value from public.lr_settings where key='social'),'{}'::jsonb)),'{settings,realMoneyEnabled}',to_jsonb(coalesce((select (value->>'real_money_enabled')::boolean from public.lr_settings where key='deployment'),false))));
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_guard_acquisition()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_guard_asset_contract()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
 if new.id is distinct from old.id or new.mode is distinct from old.mode or new.original_owner_id is distinct from old.original_owner_id
 or new.acquisition_contract is distinct from old.acquisition_contract or new.acquired_at is distinct from old.acquired_at
 or new.expires_at is distinct from old.expires_at or new.principal_return_lc_minor is distinct from old.principal_return_lc_minor then
   raise exception 'ASSET_ACQUISITION_IMMUTABLE';
 end if;
 if old.principal_returned_at is not null and (new.principal_returned_at is distinct from old.principal_returned_at
 or new.principal_return_ledger_id is distinct from old.principal_return_ledger_id) then raise exception 'ASSET_RETURN_IMMUTABLE'; end if;
 return new;
end; $function$;

CREATE OR REPLACE FUNCTION public.lr_guard_ownership_period()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end; $function$;

CREATE OR REPLACE FUNCTION public.lr_handle_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
 insert into public.lr_profiles(id,display_name,whatsapp,referrer_id,share_team_whatsapp)
 values(new.id,coalesce(nullif(left(btrim(coalesce(new.raw_user_meta_data->>'display_name',new.raw_user_meta_data->>'name')),80),''),'Piloto'),v_phone,v_ref,coalesce(new.raw_user_meta_data->>'share_team_whatsapp','false')='true')
 on conflict(id) do nothing;
 insert into public.lr_wallets(user_id,mode,currency)
 select new.id,m.mode,c.currency from (values('demo'),('real')) m(mode) cross join (values('LC'),('RC'),('BRL')) c(currency)
 on conflict(user_id,mode,currency) do nothing;
 return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.lr_immutable_ledger()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$ begin raise exception 'LEDGER_APPEND_ONLY'; end; $function$;

CREATE OR REPLACE FUNCTION public.lr_install_scheduler(p_secret text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare id uuid;
begin
 if length(p_secret)<32 then raise exception 'INVALID_SECRET';end if;
 select s.id into id from vault.secrets s where name='lifebots_job_secret';
 if id is null then perform vault.create_secret(p_secret,'lifebots_job_secret','Autenticação da rotina diária LifeBots');else perform vault.update_secret(id,p_secret);end if;
 perform cron.schedule('lifebots-daily-and-payments','*/5 * * * *','select public.lr_schedule_tick();');
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_is_content_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(select 1 from public.lr_admin_roles where user_id=auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.lr_is_guild_member(p_guild_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(select 1 from public.lr_guild_members m where m.guild_id=p_guild_id and m.user_id=(select auth.uid()) and m.mode='demo' and m.left_at is null);
$function$;

CREATE OR REPLACE FUNCTION public.lr_media_in_use(p_ref text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select exists(select 1 from public.lr_robot_catalog where asset=p_ref or position(p_ref in identity::text)>0)
 or exists(select 1 from public.lr_part_catalog where asset=p_ref or position(p_ref in identity::text)>0)
 or exists(select 1 from public.lr_story_chapters where position(p_ref in definition::text)>0)
 or exists(select 1 from public.lr_settings where position(p_ref in value::text)>0);
$function$;

CREATE OR REPLACE FUNCTION public.lr_reserve_demo_withdrawal(p_user_id uuid, p_brl_cents bigint, p_destination_token text, p_key text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_run_demo_day(p_day date, p_limit integer DEFAULT 200)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_production jsonb; v_expirations jsonb;
begin
 v_production:=public.lr_settle_demo_day(p_day,p_limit);
 v_expirations:=public.lr_settle_demo_expirations(p_limit);
 return v_production||jsonb_build_object('expirations',v_expirations);
end;
$function$;

CREATE OR REPLACE FUNCTION public.lr_schedule_tick()
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare secret text;id bigint;
begin
 select decrypted_secret into secret from vault.decrypted_secrets where name='lifebots_job_secret';if secret is null then return null;end if;
 select net.http_post(url:='https://edzgczsnxlkhkpovtspg.supabase.co/functions/v1/daily-settlement',headers:=jsonb_build_object('Content-Type','application/json','x-liferobots-job-secret',secret),body:='{"mode":"real","limit":30}'::jsonb,timeout_milliseconds:=120000) into id;return id;
end;$function$;

CREATE OR REPLACE FUNCTION public.lr_settle_demo_day(p_day date, p_limit integer DEFAULT 200)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_settle_demo_expirations(p_limit integer DEFAULT 200)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_snapshot_v9(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_snapshot(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
 select public.lr_snapshot_v9(p_user_id)||jsonb_build_object(
 'story',coalesce((select max(p.chapter_id) from public.lr_story_progress p join public.lr_story_chapters c on c.id=p.chapter_id where p.user_id=p_user_id and p.mode='demo' and coalesce(c.definition->>'chapterKind','main')<>'side'),0),
 'storyClaims',coalesce((select jsonb_agg(p.chapter_id) from public.lr_story_progress p join public.lr_story_chapters c on c.id=p.chapter_id where p.user_id=p_user_id and p.mode='demo' and c.definition->>'chapterKind'='side'),'[]'::jsonb));
$function$;





CREATE OR REPLACE FUNCTION public.lr_team_snapshot(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_validate_part()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
end; $function$;

CREATE OR REPLACE FUNCTION public.lr_validate_period()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.lr_wallet_apply(p_user_id uuid, p_mode text, p_currency text, p_operation text, p_amount_minor bigint, p_reference_type text, p_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_wallet public.lr_wallets; v_entry public.lr_ledger; v_available bigint; v_reserved bigint; v_id uuid;
begin
  if p_mode not in ('demo','real') then raise exception 'INVALID_MODE';end if;
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
$function$;

revoke all on public."lr_announcements" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_event_contracts" from public,anon,authenticated,service_role;

revoke all on public."lr_admin_roles" from public,anon,authenticated,service_role;

revoke all on public."lr_chat_rate_limits" from public,anon,authenticated,service_role;

revoke all on public."lr_chat_moderation" from public,anon,authenticated,service_role;

revoke all on public."lr_robot_assets" from public,anon,authenticated,service_role;

revoke all on public."lr_robot_ownership_periods" from public,anon,authenticated,service_role;

revoke all on public."lr_asset_locks" from public,anon,authenticated,service_role;

revoke all on public."lr_trade_listings" from public,anon,authenticated,service_role;

revoke all on public."lr_trade_proposals" from public,anon,authenticated,service_role;

revoke all on public."lr_trade_receipts" from public,anon,authenticated,service_role;

revoke all on public."lr_guilds" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_members" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_events" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_level_rewards" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_war_participants" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_duels" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_daily_usage" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_reward_claims" from public,anon,authenticated,service_role;

revoke all on public."lr_guild_invite_rewards" from public,anon,authenticated,service_role;

revoke all on public."lr_chat_messages" from public,anon,authenticated,service_role;

revoke all on public."lr_production_periods" from public,anon,authenticated,service_role;

revoke all on public."lr_game_world" from public,anon,authenticated,service_role;

revoke all on public."lr_game_signals" from public,anon,authenticated,service_role;

revoke all on public."lr_media" from public,anon,authenticated,service_role;

revoke all on public."lr_engine_ownership" from public,anon,authenticated,service_role;

revoke all on public."lr_payment_events" from public,anon,authenticated,service_role;

revoke all on public."lr_game_accounts" from public,anon,authenticated,service_role;

revoke all on public."lr_game_requests" from public,anon,authenticated,service_role;

revoke all on public."lr_live_chat" from public,anon,authenticated,service_role;

revoke all on public."lr_admin_audit" from public,anon,authenticated,service_role;

revoke all on public."lr_profiles" from public,anon,authenticated,service_role;

revoke all on public."lr_wallets" from public,anon,authenticated,service_role;

revoke all on public."lr_ledger" from public,anon,authenticated,service_role;

revoke all on public."lr_owned_robots" from public,anon,authenticated,service_role;

revoke all on public."lr_owned_parts" from public,anon,authenticated,service_role;

revoke all on public."lr_daily_rewards" from public,anon,authenticated,service_role;

revoke all on public."lr_commissions" from public,anon,authenticated,service_role;

revoke all on public."lr_cash_operations" from public,anon,authenticated,service_role;

revoke all on public."lr_tutorial_progress" from public,anon,authenticated,service_role;

revoke all on public."lr_tutorial_claims" from public,anon,authenticated,service_role;

revoke all on public."lr_orders" from public,anon,authenticated,service_role;

revoke all on public."lr_deposits" from public,anon,authenticated,service_role;

revoke all on public."lr_withdrawals" from public,anon,authenticated,service_role;

revoke all on public."lr_daily_arena" from public,anon,authenticated,service_role;

revoke all on public."lr_arena_matches" from public,anon,authenticated,service_role;

revoke all on public."lr_story_progress" from public,anon,authenticated,service_role;

revoke all on public."lr_settings" from public,anon,authenticated,service_role;

revoke all on public."lr_robot_catalog" from public,anon,authenticated,service_role;

revoke all on public."lr_part_catalog" from public,anon,authenticated,service_role;

revoke all on public."lr_part_compatibility" from public,anon,authenticated,service_role;

revoke all on public."lr_story_chapters" from public,anon,authenticated,service_role;

revoke all on public."lr_cash_deliveries" from public,anon,authenticated,service_role;

revoke all on public."lr_job_checkpoint" from public,anon,authenticated,service_role;

revoke all on public."lr_job_runs" from public,anon,authenticated,service_role;

revoke all on function public.lr_admin_page_users(uuid,integer,integer,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_admin_save_content(uuid,text,jsonb) from public,anon,authenticated,service_role;

revoke all on function public.lr_admin_save_content_v10(uuid,text,jsonb) from public,anon,authenticated,service_role;

revoke all on function public.lr_admin_set_payments(uuid,boolean) from public,anon,authenticated,service_role;

revoke all on function public.lr_can_read_live_room(text,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_cash_claim(uuid) from public,anon,authenticated,service_role;

revoke all on function public.lr_cash_prepare(uuid,text,bigint,jsonb,text,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_cash_review(uuid,uuid,boolean,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_cash_sync(uuid,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_cash_update(uuid,text,text,text,bigint,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_complete_tutorial(uuid) from public,anon,authenticated,service_role;

revoke all on function public.lr_engine_commit(uuid,text,bigint,jsonb,jsonb,text,text,text,jsonb) from public,anon,authenticated,service_role;

revoke all on function public.lr_engine_load(uuid,uuid[],text) from public,anon,authenticated,service_role;

revoke all on function public.lr_guard_acquisition() from public,anon,authenticated,service_role;

revoke all on function public.lr_guard_asset_contract() from public,anon,authenticated,service_role;

revoke all on function public.lr_guard_ownership_period() from public,anon,authenticated,service_role;

revoke all on function public.lr_handle_signup() from public,anon,authenticated,service_role;

revoke all on function public.lr_immutable_ledger() from public,anon,authenticated,service_role;

revoke all on function public.lr_install_scheduler(text) from public,anon,authenticated,service_role;

revoke all on function public.lr_is_content_admin() from public,anon,authenticated,service_role;

revoke all on function public.lr_is_guild_member(uuid) from public,anon,authenticated,service_role;

revoke all on function public.lr_media_in_use(text) from public,anon,authenticated,service_role;

revoke all on function public.lr_reserve_demo_withdrawal(uuid,bigint,text,text) from public,anon,authenticated,service_role;

revoke all on function public.lr_run_demo_day(date,integer) from public,anon,authenticated,service_role;

revoke all on function public.lr_schedule_tick() from public,anon,authenticated,service_role;

revoke all on function public.lr_settle_demo_day(date,integer) from public,anon,authenticated,service_role;

revoke all on function public.lr_settle_demo_expirations(integer) from public,anon,authenticated,service_role;

revoke all on function public.lr_snapshot(uuid) from public,anon,authenticated,service_role;

revoke all on function public.lr_snapshot_v9(uuid) from public,anon,authenticated,service_role;

revoke all on function public.lr_team_snapshot(uuid) from public,anon,authenticated,service_role;

revoke all on function public.lr_validate_part() from public,anon,authenticated,service_role;

revoke all on function public.lr_validate_period() from public,anon,authenticated,service_role;

revoke all on function public.lr_wallet_apply(uuid,text,text,text,bigint,text,text) from public,anon,authenticated,service_role;

grant EXECUTE on function public.lr_admin_page_users(uuid,integer,integer,text) to "service_role";

grant EXECUTE on function public.lr_admin_save_content(uuid,text,jsonb) to "service_role";

grant EXECUTE on function public.lr_admin_save_content_v10(uuid,text,jsonb) to "service_role";

grant EXECUTE on function public.lr_admin_set_payments(uuid,boolean) to "service_role";

grant EXECUTE on function public.lr_can_read_live_room(text,text) to "anon";

grant EXECUTE on function public.lr_can_read_live_room(text,text) to "authenticated";

grant EXECUTE on function public.lr_can_read_live_room(text,text) to "service_role";

grant EXECUTE on function public.lr_cash_claim(uuid) to "service_role";

grant EXECUTE on function public.lr_cash_prepare(uuid,text,bigint,jsonb,text,text) to "service_role";

grant EXECUTE on function public.lr_cash_review(uuid,uuid,boolean,text) to "service_role";

grant EXECUTE on function public.lr_cash_sync(uuid,text) to "service_role";

grant EXECUTE on function public.lr_cash_update(uuid,text,text,text,bigint,text) to "service_role";

grant EXECUTE on function public.lr_complete_tutorial(uuid) to "service_role";

grant EXECUTE on function public.lr_engine_commit(uuid,text,bigint,jsonb,jsonb,text,text,text,jsonb) to "service_role";

grant EXECUTE on function public.lr_engine_load(uuid,uuid[],text) to "service_role";

grant EXECUTE on function public.lr_guard_acquisition() to public;

grant EXECUTE on function public.lr_guard_acquisition() to "anon";

grant EXECUTE on function public.lr_guard_acquisition() to "authenticated";

grant EXECUTE on function public.lr_guard_acquisition() to "service_role";

grant EXECUTE on function public.lr_guard_asset_contract() to "service_role";

grant EXECUTE on function public.lr_guard_ownership_period() to "service_role";

grant EXECUTE on function public.lr_handle_signup() to "service_role";

grant EXECUTE on function public.lr_immutable_ledger() to "service_role";

grant EXECUTE on function public.lr_install_scheduler(text) to "service_role";

grant EXECUTE on function public.lr_is_content_admin() to "anon";

grant EXECUTE on function public.lr_is_content_admin() to "authenticated";

grant EXECUTE on function public.lr_is_content_admin() to "service_role";

grant EXECUTE on function public.lr_is_guild_member(uuid) to "authenticated";

grant EXECUTE on function public.lr_is_guild_member(uuid) to "service_role";

grant EXECUTE on function public.lr_media_in_use(text) to "anon";

grant EXECUTE on function public.lr_media_in_use(text) to "authenticated";

grant EXECUTE on function public.lr_media_in_use(text) to "service_role";

grant EXECUTE on function public.lr_reserve_demo_withdrawal(uuid,bigint,text,text) to "service_role";

grant EXECUTE on function public.lr_run_demo_day(date,integer) to "service_role";

grant EXECUTE on function public.lr_schedule_tick() to "service_role";

grant EXECUTE on function public.lr_settle_demo_day(date,integer) to "service_role";

grant EXECUTE on function public.lr_settle_demo_expirations(integer) to "service_role";

grant EXECUTE on function public.lr_snapshot(uuid) to "service_role";

grant EXECUTE on function public.lr_snapshot_v9(uuid) to "service_role";

grant EXECUTE on function public.lr_team_snapshot(uuid) to "service_role";

grant EXECUTE on function public.lr_validate_part() to "service_role";

grant EXECUTE on function public.lr_validate_period() to "service_role";

grant EXECUTE on function public.lr_wallet_apply(uuid,text,text,text,bigint,text,text) to "service_role";

drop policy if exists "lr_profiles_own" on "public"."lr_profiles";

create policy "lr_profiles_own" on "public"."lr_profiles" as PERMISSIVE for SELECT to "authenticated" using ((id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_wallets";

create policy "lr_owner_read" on "public"."lr_wallets" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_ledger";

create policy "lr_owner_read" on "public"."lr_ledger" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_owned_robots";

create policy "lr_owner_read" on "public"."lr_owned_robots" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_owned_parts";

create policy "lr_owner_read" on "public"."lr_owned_parts" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_catalog_read" on "public"."lr_part_catalog";

create policy "lr_catalog_read" on "public"."lr_part_catalog" as PERMISSIVE for SELECT to "authenticated" using (true);

drop policy if exists "lr_catalog_read" on "public"."lr_part_compatibility";

create policy "lr_catalog_read" on "public"."lr_part_compatibility" as PERMISSIVE for SELECT to "authenticated" using (true);

drop policy if exists "lr_owner_read" on "public"."lr_daily_rewards";

create policy "lr_owner_read" on "public"."lr_daily_rewards" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_tutorial_progress";

create policy "lr_owner_read" on "public"."lr_tutorial_progress" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_tutorial_claims";

create policy "lr_owner_read" on "public"."lr_tutorial_claims" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_orders";

create policy "lr_owner_read" on "public"."lr_orders" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_deposits";

create policy "lr_owner_read" on "public"."lr_deposits" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_catalog_read" on "public"."lr_story_chapters";

create policy "lr_catalog_read" on "public"."lr_story_chapters" as PERMISSIVE for SELECT to "authenticated" using (true);

drop policy if exists "lr_owner_read" on "public"."lr_withdrawals";

create policy "lr_owner_read" on "public"."lr_withdrawals" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_daily_arena";

create policy "lr_owner_read" on "public"."lr_daily_arena" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_owner_read" on "public"."lr_story_progress";

create policy "lr_owner_read" on "public"."lr_story_progress" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_commission_own" on "public"."lr_commissions";

create policy "lr_commission_own" on "public"."lr_commissions" as PERMISSIVE for SELECT to "authenticated" using ((beneficiary_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_arena_participant" on "public"."lr_arena_matches";

create policy "lr_arena_participant" on "public"."lr_arena_matches" as PERMISSIVE for SELECT to "authenticated" using (((challenger_id = ( SELECT auth.uid() AS uid)) OR (opponent_id = ( SELECT auth.uid() AS uid))));

drop policy if exists "lr_public_settings" on "public"."lr_settings";

create policy "lr_public_settings" on "public"."lr_settings" as PERMISSIVE for SELECT to "authenticated" using ((visibility = 'public'::text));

drop policy if exists "lr_catalog_read" on "public"."lr_robot_catalog";

create policy "lr_catalog_read" on "public"."lr_robot_catalog" as PERMISSIVE for SELECT to "authenticated" using (true);

drop policy if exists "lr_active_announcements" on "public"."lr_announcements";

create policy "lr_active_announcements" on "public"."lr_announcements" as PERMISSIVE for SELECT to "authenticated" using ((active AND (starts_at <= now()) AND ((expires_at IS NULL) OR (expires_at > now()))));

drop policy if exists "lr_asset_owner_read" on "public"."lr_robot_assets";

create policy "lr_asset_owner_read" on "public"."lr_robot_assets" as PERMISSIVE for SELECT to "authenticated" using ((current_owner_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_ownership_owner_read" on "public"."lr_robot_ownership_periods";

create policy "lr_ownership_owner_read" on "public"."lr_robot_ownership_periods" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_lock_owner_read" on "public"."lr_asset_locks";

create policy "lr_lock_owner_read" on "public"."lr_asset_locks" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_trade_visible_read" on "public"."lr_trade_listings";

create policy "lr_trade_visible_read" on "public"."lr_trade_listings" as PERMISSIVE for SELECT to "authenticated" using (((status = ANY (ARRAY['open'::text, 'proposal'::text])) OR (seller_id = ( SELECT auth.uid() AS uid))));

drop policy if exists "lr_game_signal_read" on "public"."lr_game_signals";

create policy "lr_game_signal_read" on "public"."lr_game_signals" as PERMISSIVE for SELECT to "authenticated" using (((recipient_id IS NULL) OR (recipient_id = auth.uid())));

drop policy if exists "lr_proposal_party_read" on "public"."lr_trade_proposals";

create policy "lr_proposal_party_read" on "public"."lr_trade_proposals" as PERMISSIVE for SELECT to "authenticated" using (((buyer_id = ( SELECT auth.uid() AS uid)) OR (seller_id = ( SELECT auth.uid() AS uid))));

drop policy if exists "lr_receipt_party_read" on "public"."lr_trade_receipts";

create policy "lr_receipt_party_read" on "public"."lr_trade_receipts" as PERMISSIVE for SELECT to "authenticated" using (((buyer_id = ( SELECT auth.uid() AS uid)) OR (seller_id = ( SELECT auth.uid() AS uid))));

drop policy if exists "lr_guild_public_read" on "public"."lr_guilds";

create policy "lr_guild_public_read" on "public"."lr_guilds" as PERMISSIVE for SELECT to "authenticated" using (((archived_at IS NULL) OR lr_is_guild_member(id)));

drop policy if exists "lr_member_roster_read" on "public"."lr_guild_members";

create policy "lr_member_roster_read" on "public"."lr_guild_members" as PERMISSIVE for SELECT to "authenticated" using (((user_id = ( SELECT auth.uid() AS uid)) OR lr_is_guild_member(guild_id)));

drop policy if exists "lr_event_public_read" on "public"."lr_guild_events";

create policy "lr_event_public_read" on "public"."lr_guild_events" as PERMISSIVE for SELECT to "authenticated" using (true);

drop policy if exists "lr_level_member_read" on "public"."lr_guild_level_rewards";

create policy "lr_level_member_read" on "public"."lr_guild_level_rewards" as PERMISSIVE for SELECT to "authenticated" using (lr_is_guild_member(guild_id));

drop policy if exists "lr_war_member_read" on "public"."lr_guild_war_participants";

create policy "lr_war_member_read" on "public"."lr_guild_war_participants" as PERMISSIVE for SELECT to "authenticated" using (((user_id = ( SELECT auth.uid() AS uid)) OR lr_is_guild_member(guild_id)));

drop policy if exists "lr_duel_party_read" on "public"."lr_guild_duels";

create policy "lr_duel_party_read" on "public"."lr_guild_duels" as PERMISSIVE for SELECT to "authenticated" using (((user_id = ( SELECT auth.uid() AS uid)) OR (opponent_user_id = ( SELECT auth.uid() AS uid))));

drop policy if exists "lr_daily_guild_owner_read" on "public"."lr_guild_daily_usage";

create policy "lr_daily_guild_owner_read" on "public"."lr_guild_daily_usage" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_guild_claim_owner_read" on "public"."lr_guild_reward_claims";

create policy "lr_guild_claim_owner_read" on "public"."lr_guild_reward_claims" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_guild_invite_owner_read" on "public"."lr_guild_invite_rewards";

create policy "lr_guild_invite_owner_read" on "public"."lr_guild_invite_rewards" as PERMISSIVE for SELECT to "authenticated" using ((beneficiary_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_chat_room_read" on "public"."lr_chat_messages";

create policy "lr_chat_room_read" on "public"."lr_chat_messages" as PERMISSIVE for SELECT to "authenticated" using (((removed_at IS NULL) AND ((room = ANY (ARRAY['global'::text, 'market'::text])) OR lr_is_guild_member(guild_id))));

drop policy if exists "lr_chat_moderation_owner_read" on "public"."lr_chat_moderation";

create policy "lr_chat_moderation_owner_read" on "public"."lr_chat_moderation" as PERMISSIVE for SELECT to "authenticated" using ((user_id = ( SELECT auth.uid() AS uid)));

drop policy if exists "lr_media_read" on "public"."lr_media";

create policy "lr_media_read" on "public"."lr_media" as PERMISSIVE for SELECT to "authenticated" using (true);

drop policy if exists "lr_media_upload" on "public"."lr_media";

create policy "lr_media_upload" on "public"."lr_media" as PERMISSIVE for INSERT to "authenticated" with check ((lr_is_content_admin() AND (created_by = auth.uid())));

drop policy if exists "lr_media_remove" on "public"."lr_media";

create policy "lr_media_remove" on "public"."lr_media" as PERMISSIVE for DELETE to "authenticated" using ((lr_is_content_admin() AND (NOT lr_media_in_use(ref))));

drop policy if exists "lr_media_storage_insert" on "storage"."objects";

create policy "lr_media_storage_insert" on "storage"."objects" as PERMISSIVE for INSERT to "authenticated" with check (((bucket_id = 'lr-media'::text) AND lr_is_content_admin() AND ((storage.foldername(name))[1] = (auth.uid())::text)));

drop policy if exists "lr_media_storage_delete" on "storage"."objects";

create policy "lr_media_storage_delete" on "storage"."objects" as PERMISSIVE for DELETE to "authenticated" using (((bucket_id = 'lr-media'::text) AND lr_is_content_admin() AND (NOT (EXISTS ( SELECT 1
   FROM lr_media m
  WHERE (m.path = objects.name))))));

drop policy if exists "lr_game_own" on "public"."lr_game_accounts";

create policy "lr_game_own" on "public"."lr_game_accounts" as PERMISSIVE for SELECT to "authenticated" using ((user_id = auth.uid()));

drop policy if exists "lr_live_chat_channel" on "public"."lr_live_chat";

create policy "lr_live_chat_channel" on "public"."lr_live_chat" as PERMISSIVE for SELECT to "authenticated" using (lr_can_read_live_room(room, mode));

drop trigger if exists lr_asset_contract_guard on public.lr_robot_assets;

CREATE TRIGGER lr_asset_contract_guard BEFORE UPDATE ON public.lr_robot_assets FOR EACH ROW EXECUTE FUNCTION lr_guard_asset_contract();

drop trigger if exists lr_ownership_period_guard on public.lr_robot_ownership_periods;

CREATE TRIGGER lr_ownership_period_guard BEFORE INSERT OR UPDATE ON public.lr_robot_ownership_periods FOR EACH ROW EXECUTE FUNCTION lr_guard_ownership_period();

drop trigger if exists lr_period_validation on public.lr_production_periods;

CREATE TRIGGER lr_period_validation BEFORE INSERT OR UPDATE ON public.lr_production_periods FOR EACH ROW EXECUTE FUNCTION lr_validate_period();

drop trigger if exists lr_ledger_immutable on public.lr_ledger;

CREATE TRIGGER lr_ledger_immutable BEFORE DELETE OR UPDATE ON public.lr_ledger FOR EACH ROW EXECUTE FUNCTION lr_immutable_ledger();

drop trigger if exists lr_acquisition_guard on public.lr_owned_robots;

CREATE TRIGGER lr_acquisition_guard BEFORE UPDATE ON public.lr_owned_robots FOR EACH ROW EXECUTE FUNCTION lr_guard_acquisition();

drop trigger if exists lr_part_validation on public.lr_owned_parts;

CREATE TRIGGER lr_part_validation BEFORE INSERT OR UPDATE ON public.lr_owned_parts FOR EACH ROW EXECUTE FUNCTION lr_validate_part();

insert into public.lr_game_world(mode) values('demo'),('real') on conflict do nothing;

do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='lr_live_chat') then alter publication supabase_realtime add table public.lr_live_chat;end if;if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='lr_game_signals') then alter publication supabase_realtime add table public.lr_game_signals;end if;end $$;

commit;
