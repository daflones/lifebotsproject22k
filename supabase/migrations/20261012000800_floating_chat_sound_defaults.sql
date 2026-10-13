-- Presentation-only defaults. No financial, ownership or Realtime gate changes.
begin;
update public.lr_settings set value=
 '{"chatFloatingEnabled":true,"chatStartMinimized":false,"chatWindowWidth":380,"chatWindowHeight":360}'::jsonb||value
 where key='social';
update public.lr_settings set value=jsonb_set(value,'{audio}',
 '{"notificationsVolume":0.8,"collectionVolume":1,"acquisitionVolume":1,"equipmentVolume":0.9,"progressionVolume":1,"chatVolume":0.7}'::jsonb||coalesce(value->'audio','{}'::jsonb),true)
 where key='presentation';
update public.lr_settings set value=jsonb_set(value,'{copy}',
 '{"robotsLabel":"Meus robôs"}'::jsonb||coalesce(value->'copy','{}'::jsonb),true)
 where key='presentation';
commit;
