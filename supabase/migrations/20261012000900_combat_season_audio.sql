-- Defaults de apresentação. Não altera economia, contratos, Realtime ou gates financeiros.
begin;

update public.lr_settings set value=jsonb_set(value,'{audio}',
 '{"seasonMusic":true,"battleVolume":0.85,"movementVolume":0.65,"specialVolume":1}'::jsonb||coalesce(value->'audio','{}'::jsonb),true)
 where key='presentation';

-- Definições existentes têm precedência, inclusive escolhas explícitas de herança ("").
update public.lr_settings s set value=(
 select coalesce(jsonb_agg(
  (case
   when season->>'scene' in ('space','nebula','night','core') then
    '{"musicTheme":"starlight","combatTheme":"starlight-duel","musicTempo":82,"combatTempo":122,"customMusicUrl":"","customCombatMusicUrl":""}'::jsonb
   when season->>'scene' in ('ember','forge','frost','crystal','sky') then
    '{"musicTheme":"frontier","combatTheme":"frontier-duel","musicTempo":104,"combatTempo":128,"customMusicUrl":"","customCombatMusicUrl":""}'::jsonb
   else
    '{"musicTheme":"verdant","combatTheme":"verdant-duel","musicTempo":92,"combatTempo":116,"customMusicUrl":"","customCombatMusicUrl":""}'::jsonb
   end)||season order by position),'[]'::jsonb)
 from jsonb_array_elements(s.value) with ordinality as items(season,position)
) where s.key='seasons' and jsonb_typeof(s.value)='array';

update public.lr_robot_catalog c set identity=d.presentation||c.identity from (values
 ('moss','{"animationAsset":"moss-combat-v6.png","combatStyle":"organic","soundPitch":1.02}'::jsonb),
 ('volt','{"animationAsset":"volt-combat-v6.png","combatStyle":"electric","soundPitch":1.28}'::jsonb),
 ('titan','{"animationAsset":"titan-combat-v6.png","combatStyle":"impact","soundPitch":0.68}'::jsonb),
 ('ember','{"animationAsset":"ember-combat-v6.png","combatStyle":"fire","soundPitch":1.12}'::jsonb),
 ('glacier','{"animationAsset":"glacier-combat-v6.png","combatStyle":"frost","soundPitch":0.87}'::jsonb),
 ('nimbus','{"animationAsset":"nimbus-combat-v6.png","combatStyle":"wind","soundPitch":1.42}'::jsonb),
 ('orbit','{"animationAsset":"orbit-combat-v6.png","combatStyle":"orbital","soundPitch":1.06}'::jsonb),
 ('nova','{"animationAsset":"nova-combat-v6.png","combatStyle":"plasma","soundPitch":1.32}'::jsonb),
 ('onyx','{"animationAsset":"onyx-combat-v6.png","combatStyle":"shadow","soundPitch":0.56}'::jsonb)
) as d(id,presentation) where c.id=d.id;

commit;
