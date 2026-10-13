begin;
do $$
declare actor uuid;enabled boolean;roster jsonb;before_revision jsonb;world record;
begin
 select a.user_id into strict actor from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id where a.role='admin' and p.status='active' order by a.user_id limit 1;
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 select jsonb_object_agg(mode,revision) into before_revision from public.lr_game_world;
 select (value->>'real_money_enabled')::boolean into strict enabled from public.lr_settings where key='deployment' for update;
 select value into strict roster from public.lr_settings where key='arena_roster' for update;
 if exists(select 1 from public.lr_part_catalog where id='__lifebots_admin_guard_probe__') then raise exception 'PROBE_ID_IN_USE';end if;
 perform public.lr_admin_set_payments(actor,enabled);
 perform public.lr_admin_save_content(actor,'arenaRoster',roster);
 perform public.lr_admin_delete_content(actor,'part','__lifebots_admin_guard_probe__');
 for world in select mode,revision from public.lr_game_world loop
  if world.revision<>((before_revision->>world.mode)::bigint+(case when world.mode='real' then 3 else 2 end)) then raise exception 'REVISION_SCOPE_MISMATCH';end if;
 end loop;
 begin
  perform public.lr_admin_set_payments(gen_random_uuid(),enabled);
  raise exception 'UNAUTHORIZED_ADMIN_ACCEPTED';
 exception when raise_exception then
  if sqlerrm<>'ADMIN_REQUIRED' then raise;end if;
 end;
 if (select (value->>'real_money_enabled')::boolean from public.lr_settings where key='deployment') is distinct from enabled then raise exception 'PAYMENT_POLICY_CHANGED';end if;
 if has_function_privilege('anon','public.lr_admin_set_payments(uuid,boolean)','execute') or has_function_privilege('authenticated','public.lr_admin_set_payments(uuid,boolean)','execute') then raise exception 'RPC_PERMISSIONS_CHANGED';end if;
end;$$;
select 'admin RPCs, revision scopes, authorization and unchanged payment policy: OK' as result;
rollback;
