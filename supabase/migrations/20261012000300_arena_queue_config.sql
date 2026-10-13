-- Adds the queue wait rule without overwriting a configured value.
-- Real matchmaking/actions remain disabled until their server implementation.
begin;
update public.lr_settings
set value=value||jsonb_build_object('matchTimeoutSeconds',8)
where key='economy' and not (value ? 'matchTimeoutSeconds');
commit;
