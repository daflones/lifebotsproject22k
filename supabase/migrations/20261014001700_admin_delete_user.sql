-- Exclusão definitiva de piloto pelo administrador.
-- O jogo limpa referências no world JSON antes; aqui removemos linhas
-- relacionais, conta de runtime, registros financeiros e o usuário do auth.

create or replace function public.lr_admin_delete_user(p_actor uuid, p_user_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare
  rec record;
  pass integer;
  done boolean;
  display text;
begin
  if not exists(select 1 from public.lr_admin_roles a join public.lr_profiles p on p.id=a.user_id and p.status='active' where a.user_id=p_actor) then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if p_actor=p_user_id then raise exception 'SELF_DELETE'; end if;
  if exists(select 1 from public.lr_admin_roles where user_id=p_user_id) then raise exception 'ADMIN_DELETE_BLOCKED'; end if;
  select display_name into display from public.lr_profiles where id=p_user_id;
  if display is null then raise exception 'USER_NOT_FOUND'; end if;
  if exists(select 1 from public.lr_cash_operations where user_id=p_user_id and kind='withdrawal' and status='pending') then
    raise exception 'PENDING_WITHDRAWAL';
  end if;

  insert into public.lr_admin_audit(actor_id,action,resource,before_data,after_data)
    values(p_actor,'user_delete',p_user_id::text,jsonb_build_object('name',display),'{}'::jsonb);

  -- Filhos que referenciam o piloto como indicador: mantemos os perfis.
  update public.lr_profiles set referrer_id=null where referrer_id=p_user_id;

  -- Tabelas de runtime sem FK declarativa.
  delete from public.lr_game_requests where user_id=p_user_id;
  delete from public.lr_live_chat where author_id=p_user_id;
  delete from public.lr_game_accounts where user_id=p_user_id;
  delete from public.lr_engine_ownership where user_id=p_user_id;
  delete from public.lr_cash_operations where user_id=p_user_id;
  delete from public.lr_game_signals where recipient_id=p_user_id;
  delete from public.lr_media where created_by=p_user_id;

  -- Todas as demais linhas com FK para o perfil, repetindo até as
  -- dependências entre filhos se resolverem (ex.: ledger -> wallets).
  for pass in 1..12 loop
    done := true;
    for rec in
      select c.conrelid::regclass::text as tbl, att.attname as col
      from pg_constraint c
      join pg_attribute att on att.attrelid=c.conrelid and att.attnum=any(c.conkey)
      where c.contype='f' and c.confrelid='public.lr_profiles'::regclass and c.conrelid<>'public.lr_profiles'::regclass
    loop
      begin
        execute format('delete from %s where %I=$1',rec.tbl,rec.col) using p_user_id;
      exception when foreign_key_violation then done:=false;
      end;
    end loop;
    exit when done;
  end loop;
  if not done then raise exception 'DELETE_BLOCKED'; end if;

  delete from public.lr_profiles where id=p_user_id;
  delete from auth.users where id=p_user_id;
end $$;

revoke all on function public.lr_admin_delete_user(uuid,uuid) from public,anon,authenticated;
grant execute on function public.lr_admin_delete_user(uuid,uuid) to service_role;
