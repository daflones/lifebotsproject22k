begin;
create function public.lr_admin_delete_content(p_actor uuid,p_kind text,p_id text) returns void language plpgsql security definer set search_path='' as $$
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
 update public.lr_game_world set revision=revision+1;
 insert into public.lr_game_signals(mode,kind) values('real','catalog_updated');
end;$$;
revoke all on function public.lr_admin_delete_content(uuid,text,text) from public,anon,authenticated;grant execute on function public.lr_admin_delete_content(uuid,text,text) to service_role;

alter function public.lr_engine_commit(uuid,text,bigint,jsonb,jsonb,text,text,text,jsonb) rename to lr_engine_commit_v14;
create function public.lr_engine_commit(p_actor uuid,p_mode text,p_world_revision bigint,p_world jsonb,p_accounts jsonb,p_key text,p_hash text,p_action text,p_response jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare before jsonb;after jsonb;item jsonb;result jsonb;
begin
 if not exists(select 1 from public.lr_profiles where id=p_actor and status='active') then raise exception 'USER_NOT_ACTIVE';end if;
 if p_action like 'admin_%' and not exists(select 1 from public.lr_admin_roles where user_id=p_actor) then raise exception 'ADMIN_REQUIRED';end if;
 select state->'adminAudit' into before from public.lr_game_accounts where user_id=p_actor and mode=p_mode;
 result=public.lr_engine_commit_v14(p_actor,p_mode,p_world_revision,p_world,p_accounts,p_key,p_hash,p_action,p_response);
 select state->'adminAudit' into after from public.lr_game_accounts where user_id=p_actor and mode=p_mode;
 for item in select x from jsonb_array_elements(coalesce(after,'[]')) x where not exists(select 1 from jsonb_array_elements(coalesce(before,'[]')) old where old->>'id'=x->>'id') loop
  insert into public.lr_admin_audit(id,actor_id,action,resource,before_data,after_data) values((item->>'id')::uuid,p_actor,item->>'action',item->>'userId',item->'before',jsonb_build_object('value',item->'after','reason',item->>'reason')) on conflict do nothing;
 end loop;
 return result;
end;$$;
revoke all on function public.lr_engine_commit(uuid,text,bigint,jsonb,jsonb,text,text,text,jsonb) from public,anon,authenticated;grant execute on function public.lr_engine_commit(uuid,text,bigint,jsonb,jsonb,text,text,text,jsonb) to service_role;
commit;
