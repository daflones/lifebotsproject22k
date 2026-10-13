-- LifeBots 0.4: leitura administrativa paginada e avisos. Nenhum pagamento real habilitado.
begin;
update public.lr_settings set value='{"autoWithdrawals":false,"autoWithdrawalMax":50}'::jsonb||value where key='economy';
create table if not exists public.lr_announcements (
 id uuid primary key default gen_random_uuid(),
 title text not null check (length(title) between 1 and 120),
 message text not null check (length(message)<=4000),
 image_url text,
 buttons jsonb not null default '[]'::jsonb check (jsonb_typeof(buttons)='array'),
 active boolean not null default true,
 show_popup boolean not null default false,
 starts_at timestamptz not null default now(),
 expires_at timestamptz,
 created_by uuid not null references public.lr_profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (expires_at is null or expires_at>starts_at)
);
alter table public.lr_announcements enable row level security;
revoke all on public.lr_announcements from anon,authenticated;
grant select on public.lr_announcements to authenticated;
grant all on public.lr_announcements to service_role;
drop policy if exists lr_active_announcements on public.lr_announcements;
create policy lr_active_announcements on public.lr_announcements for select to authenticated
 using (active and starts_at<=now() and (expires_at is null or expires_at>now()));
create index if not exists lr_orders_status_date_idx on public.lr_orders(status,created_at desc);
create index if not exists lr_withdrawals_status_date_idx on public.lr_withdrawals(status,created_at desc);

-- p_actor_id vem exclusivamente do JWT verificado no Edge; clientes não executam este RPC.
create or replace function public.lr_admin_page_users(p_actor_id uuid,p_page integer default 1,p_size integer default 8,p_query text default '') returns jsonb
language plpgsql security definer set search_path='' as $$
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
$$;
revoke all on function public.lr_admin_page_users(uuid,integer,integer,text) from public,anon,authenticated;
grant execute on function public.lr_admin_page_users(uuid,integer,integer,text) to service_role;
commit;
