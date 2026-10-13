begin;

create or replace function public.lr_admin_save_content(p_actor uuid,p_kind text,p_value jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 perform public.lr_admin_save_content_v10(p_actor,p_kind,p_value);
 update public.lr_game_world set revision=revision+1 where mode in ('demo','real');
end;$$;

create or replace function public.lr_admin_set_payments(p_actor uuid,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id where a.user_id=p_actor and p.status='active') then raise exception 'ADMIN_REQUIRED';end if;
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 update public.lr_settings set value=value||jsonb_build_object('real_money_enabled',p_enabled,'gateway_adapter','mercosulpay_v1'),version=version+1,updated_by=p_actor,updated_at=now() where key='deployment';
 update public.lr_game_world set revision=revision+1 where mode='real';
 insert into public.lr_admin_audit(actor_id,action,resource,after_data) values(p_actor,'payments_policy','deployment',jsonb_build_object('enabled',p_enabled));
 insert into public.lr_game_signals(mode,kind) values('real','payments_policy');
end;$$;

create or replace function public.lr_admin_delete_content(p_actor uuid,p_kind text,p_id text) returns void language plpgsql security definer set search_path='' as $$
declare snapshot jsonb;before jsonb;
begin
 if not exists(select 1 from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id where a.user_id=p_actor and p.status='active') then raise exception 'ADMIN_REQUIRED';end if;
 perform pg_advisory_xact_lock(hashtext('lr_engine_runtime'));
 snapshot=public.lr_snapshot(p_actor);
 if p_kind='robot' then
  if exists(select 1 from public.lr_game_accounts a,jsonb_array_elements(coalesce(a.state->'robots','[]')) r where r->>'catalogId'=p_id) or exists(select 1 from public.lr_owned_robots where catalog_id=p_id) then raise exception 'MODEL_OWNED';end if;
  if exists(select 1 from public.lr_story_chapters c,jsonb_array_elements(coalesce(c.definition->'enemies','[]')) e where e->>'robotId'=p_id) or exists(select 1 from jsonb_array_elements(snapshot->'arenaRoster') e where e->>'robotId'=p_id) or exists(select 1 from jsonb_array_elements(snapshot->'seasons') e where e->>'guideRobotId'=p_id) then raise exception 'MODEL_REFERENCED';end if;
  select to_jsonb(c) into before from public.lr_robot_catalog c where id=p_id;delete from public.lr_robot_catalog where id=p_id;
 elsif p_kind='part' then
  if exists(select 1 from public.lr_game_accounts a,jsonb_array_elements(coalesce(a.state->'inventory','[]')) i where i->>'partId'=p_id) or exists(select 1 from public.lr_owned_parts where catalog_id=p_id) then raise exception 'PART_OWNED';end if;
  select to_jsonb(c) into before from public.lr_part_catalog c where id=p_id;delete from public.lr_part_compatibility where part_id=p_id;delete from public.lr_part_catalog where id=p_id;
 else raise exception 'INVALID_CONTENT';end if;
 insert into public.lr_admin_audit(actor_id,action,resource,before_data,after_data) values(p_actor,'content_delete',p_kind||':'||p_id,before,'{}');
 update public.lr_game_world set revision=revision+1 where mode in ('demo','real');
 insert into public.lr_game_signals(mode,kind) values('real','catalog_updated');
end;$$;

commit;
