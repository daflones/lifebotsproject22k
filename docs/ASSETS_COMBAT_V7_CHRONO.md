# Assets de combate v7 — TICTON e VÉSPER

Criados para LifeBots com `imagegen` built-in, uma chamada por robô, sem regeração. `dist/assets/moss-combat-v6.png` foi inspecionado apenas como referência de acabamento e proporções; os personagens novos têm desenhos e silhuetas próprios. As imagens não contêm texto, nomes, rótulos ou interface.

| Modelo / nome | PNG original | WebP lossless | Dimensões | Poses | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|---:|
| chrono / TICTON | `dist/assets/chrono-combat-v7.png` | `dist/assets/chrono-combat-v7.webp` | 1254 × 1254 RGBA | 36 | 2605918 | 1887384 |
| vesper / VÉSPER | `dist/assets/vesper-combat-v7.png` | `dist/assets/vesper-combat-v7.webp` | 1254 × 1254 RGBA | 36 | 2373146 | 1673170 |

Os PNGs são cópias byte a byte dos resultados originais do imagegen. Nenhum pixel foi desenhado, recortado, realinhado ou repetido por Python. Pillow foi usado somente para codificar cópias WebP lossless, sem alterar dimensões. A verificação confirmou igualdade do canal alpha e do RGB de todos os pixels visíveis com alpha maior que zero. As imagens têm alpha de 0 a 255, com transparência real.

## Organização e estados

Cada imagem contém seis linhas de seis poses sequenciais, totalizando 36 corpos completos. As margens e o espaçamento produzidos pelo imagegen não são idênticos em todas as células; usar os retângulos reais de frames em vez de recortes percentuais rígidos.

| Linha | Estado | Sequência |
|---:|---|---|
| 0 | `idle` | Repouso e respiração; pequenas variações de antenas/asas |
| 1 | `attack` | Preparação, avanço, golpe compacto, extensão/conclusão, recolhe, neutro |
| 2 | `hurt` | Impacto, recuo, cambaleio, estabiliza, volta, neutro |
| 3 | `down` | Seis etapas de queda/derrota, mantendo o corpo íntegro |
| 4 | `shield` | Ergue escudo, abaixa, segura, pulso, baixa, neutro |
| 5 | `special` | Carga do núcleo, energia, disparo curto, descarga, recuperação, neutro |

## Metadados e âncoras

`docs/COMBAT_V7_CHRONO_FRAMES.json` usa objeto keyed por `chrono` e `vesper`. Cada modelo tem `{asset,width,height,rows,columns,states,frames}`, com `rows: 6`, `columns: 6` e mapa dos estados da tabela acima. `asset` referencia o PNG original no formato `assets/{model}-combat-v7.png`; o WebP homônimo tem as mesmas coordenadas.

Cada frame tem `{row,column,x,y,width,height,anchorX,anchorY}`. Linha e coluna usam índice zero. Bbox e âncoras usam **coordenadas absolutas do atlas**; para converter âncora em posição relativa dentro do recorte, subtrair `x` e `y`. As bboxes foram extraídas das componentes globais de alpha corporal (alpha ≥ 200) com aproximadamente dois pixels de margem. `anchorX` é o centro da extensão dos contatos junto à base, e `anchorY` a base dos pés/patas. Nas fases tombadas de `down`, a âncora usa a base do corpo deitado. Essas âncoras são aproximações visuais, sem rig esquelético.

Os quatro ataques de TICTON em linha 1, colunas 1–4, e os três ataques de VÉSPER em linha 1, colunas 2–4, incluem `clipPath` opcional de contorno SVG absoluto, apenas comandos `M/L/Z` e números. Esses contornos isolam o corpo e sua margem, excluindo pixels de corpos vizinhos incluídos pela bbox. Um brilho azul conecta as poses de ataque de TICTON nas colunas 3 e 4; a separação foi feita exclusivamente em metadados por contornos, mantendo o atlas original intacto.

## QA

Inspeção visual confirmou silhuetas distintas, seis corpos por linha e estados de queda/defesa/especial reconhecíveis. A análise global encontrou 36 componentes corporais independentes para VÉSPER; TICTON tinha 35 devido ao brilho que conectava duas poses, separado nos metadados para obter os 36 frames. Nenhum pixel da componente corporal opaca toca as bordas do canvas. Bboxes e âncoras permanecem dentro da imagem e os recortes protegidos retêm o corpo escolhido, excluindo as outras componentes corporais.

Efeitos translúcidos podem se aproximar dos limites entre células e parte desses brilhos periféricos fica fora das bboxes corporais; as imagens completas preservam todos os efeitos originais. Não houve execução no navegador nesta tarefa de assets.

## TICTON

Besouro tanque steampunk de relógio, com carapaça de latão, seis patas articuladas, engrenagens e núcleo azul.

Prompt final usado no built-in:

```text
Use case: stylized-concept.
Asset type: a NEW 2D robot RPG combat animation sprite atlas, ONE SQUARE image with EXACTLY SIX COLUMNS AND SIX ROWS, thirty-six cells, TRUE TRANSPARENT ALPHA.
Primary request: design TICTON, an ORIGINAL creative clockwork BEETLE TANK ROBOT for LifeBots. This must be a distinctive non-humanoid robot, not a recolored biped.
Subject/design: a low compact armored beetle with six short articulated mechanical legs/claws supporting its tank-like domed brass carapace. Burnished golden brass armor, dark blue mechanical joints, visible interlocking clockwork gears and small cobalt luminous gear-shaped core recessed in shell. Rounded mechanical beetle head with two blue optical eyes, short curved bronze mandibles, two little gear-tipped antennae. Clockwork mechanisms suggest a ticking watch without any numbers/letters or readable text. Small brass clock hands and gear silhouettes may be decorative in shell. Heroic cute tank robot, full body including all legs/claws and antennae. Consistent design in all poses.
Style: premium painted 2D/2.5D chibi sci-fi mobile RPG illustration, rich cel-shaded volume, sharp clean edges, beautiful metal highlights, same compact polished robot-battler visual quality as ceramic RPG robots. Fixed three-quarter camera FACING RIGHT. Never flip camera.
CRITICAL GRID: exactly 6 equal columns × 6 equal rows. ONE COMPLETE BEETLE ROBOT IN EVERY CELL, SIX COMPLETE ROBOTS PER ROW, 36 total. Every cell square, no empty/effect-only cell. Robot plus effects must fit inside TWO THIRDS of each cell width/height, leaving at least 15% empty TRANSPARENT margin on all four sides. Same character scale throughout, leg contact baseline anchored near 84% cell height. Antennae, raised claws, shell, mandibles, gear effects MUST be fully inside their own cell. NO overlapping neighbor or sheet edge.
Six row animations, top to bottom, six distinct frames left to right:
ROW 0 idle: neutral six-legged guard; slight inhale shell rises; antennae tick forward; little leg weight shift; shell settles; neutral with antennae back.
ROW 1 attack: legs crouch and mandibles draw back; advance low torso slightly; compact rightward mandible/head ram; complete short ram with tiny blue flash close to mandibles; retract legs and head; neutral stance. SIX FULL ROBOTS, no long weapon/projectile/beam.
ROW 2 hurt: flinch shell tilted from small shoulder spark; recoil; stagger one side legs; brace with front claws; stabilize body; neutral with cautious blue eyes.
ROW 3 DOWN/DEFEAT: body tips sideways; legs buckle; shell sinks down; robot rolls gently onto side still entirely visible; claws settle folded; complete beetle lying defeated with dim blue eyes. Six full-body distinct defeat phases, no destruction/debris or disappearing body. Keep same size, all parts intact.
ROW 4 shield: forelegs rise and a small blue clock-glass energy shield forms close to front; crouch behind shield; hold; shield pulses and legs brace; lower shield; neutral guard.
ROW 5 special: gear core begins winding up and claws draw close; visible small gear rings glow around shell; a compact blue pulse flashes at mandibles; discharge tiny gear sparks close around body; cool core and legs recover; neutral stance. Effects tiny and contained inside cell; NEVER a long beam or projectile, NEVER an effect-only cell.
Background: genuine transparent alpha around every silhouette and through gaps between limbs; no floor/shadow plane, environment, gradient, checkerboard texture or colored backdrop.
Text: none. No labels, letters, digits, logos, row numbers, grid lines, border or watermark.
Output one square 6x6 transparent atlas, 36 visibly distinct sequential full-body poses of the same new brass-and-blue mechanical beetle. Maintain clear gaps between all poses.
```

## VÉSPER

Robô beija-flor atacante, com armadura prata, núcleo âmbar, asas compostas por lâminas e pés de ave.

Prompt final usado no built-in:

```text
Use case: stylized-concept.
Asset type: a NEW 2D robot RPG combat animation sprite atlas, ONE SQUARE image with EXACTLY SIX COLUMNS × SIX ROWS = THIRTY-SIX CELLS, TRUE TRANSPARENT ALPHA.
Primary request: design VÉSPER, an ORIGINAL creative HUMMINGBIRD ATTACKER ROBOT for LifeBots. Distinctly a graceful mechanical bird, not a humanoid recolor.
Subject/design: small agile robotic hummingbird, sleek silver ceramic/metal armor, brushed amber-gold core and accents, dark charcoal articulated joints, expressive bright amber optical eyes, slender but SHORT silver bird beak, two swept mechanical wings made of overlapping silver blade-feathers with amber glowing edges. Compact bird-shaped chest with small round amber energy core, two short jointed bird feet/claws and aerodynamic armored tail feathers. Beautiful heroic toy-like sci-fi hummingbird robot. Wings are its weapons; no human arms or fists. Preserve exact design and scale in all poses.
Style: premium painted 2D/2.5D chibi science-fiction mobile RPG art, clean polished cel-shaded volume, rich metal highlights, beautifully detailed while readable as small sprites. Fixed three-quarter camera FACING RIGHT, same side of bird visible in every frame, no mirror or camera spin.
CRITICAL LAYOUT: EXACT 6 columns AND EXACT 6 rows in one square sheet. ONE COMPLETE FULL-BODY HUMMINGBIRD ROBOT in EVERY CELL, SIX robots on each row, 36 total. Character INCLUDING OPEN WINGS, tail, beak, feet and all effects must be no more than TWO THIRDS of cell width/height, with at least 15% EMPTY TRANSPARENT padding on every side. Uniform character scale and consistent feet/contact baseline near 84% cell height. All silhouettes fully inside their own cells, no overlapping neighbor or canvas edge. Short compact wing motions, not enormous wing spans.
Six animation rows top to bottom, frames LEFT TO RIGHT:
ROW 0 idle: folded-wing calm perch; little chest inhale; wings lift slightly at shoulders; small tail/foot balance shift; chest exhales; wings settle neutral. Six subtly distinct calm poses.
ROW 1 attack: blade-wings draw back; torso leans forward; one wing makes a short compact rightward slash; slash completes with a TINY amber glow at wing tip; retract wing; neutral perch. SIX COMPLETE BIRD ROBOTS visible, no long wing trail/beam/projectile, wing tips inside own cell.
ROW 2 hurt: head flinch from tiny side spark; recoil wings open a little; stagger feet and tail; brace with one wing close to chest; stabilize; wary neutral pose.
ROW 3 DOWN/DEFEAT: head lowers and wings lose lift; legs bend and one wing droops; torso sinks; gently falls sideways with full body intact; wings settle folded close; complete robot lying defeated with dim amber eyes. Six full-body distinct down phases, bird never disappears or explodes into parts.
ROW 4 shield: bring blade-wings in front of chest as small amber shield appears; crouch behind compact crossed-wing shield; hold; small shield pulse and body braces; uncross and lower wings; neutral perch.
ROW 5 special: amber chest core charges and wings draw close; small spiral glow surrounds wrists/wing roots; both wings push slightly outward releasing a SHORT tiny amber pulse close to wing tips; FULL BIRD BODY stays visible as energy settles around chest; wings recover and core cools; neutral. Effects confined to own cell, no beam/stream, no effect-only cell.
Background: real transparent alpha around every silhouette and between all mechanical limbs; no environment, floor, shadow plane, gradient, checkerboard texture or colored background.
Text: none, no words, labels, numbers, grid lines, borders, logos or watermark.
Output exactly thirty-six new full-body silver-and-amber hummingbird robot poses on one square transparent 6x6 atlas.
```
