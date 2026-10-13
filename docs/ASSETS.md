# LifeBots — assets de arte 2D

Criação: 11/10/2026. Geração e correções feitas com a ferramenta integrada `image_gen` (sem CLI/API externo). Todos os PNGs foram inspecionados visualmente; a transparência foi preservada nos três atlas.

## Arquivos finais

Caminhos relativos à raiz do projeto. O diretório publicado contém estes cinco arquivos finais:

| Arquivo | Dimensões reais | Formato | Uso |
| --- | --- | --- | --- |
| `dist/assets/hangar.png` | 1536 × 1024 | PNG RGB opaco | Hangar principal com espaço para personagem e interface |
| `dist/assets/moss-sprites.png` | 1254 × 1254 | PNG RGBA transparente | MOSS-01: androide explorador jade e marfim |
| `dist/assets/volt-sprites.png` | 1254 × 1254 | PNG RGBA transparente | VOLT-X: androide ágil lilás, marfim e ciano |
| `dist/assets/titan-sprites.png` | 1254 × 1254 | PNG RGBA transparente | TITAN-9: androide tanque marfim, grafite e laranja |
| `dist/assets/story-map.png` | 1536 × 1024 | PNG RGB opaco | Ilha com trilha do modo história |

## Grade e frames

Cada atlas tem exatamente **4 colunas × 4 linhas**, com 16 frames. As linhas e colunas abaixo usam índice iniciado em zero. A grade é normalizada: cada célula ocupa 25% da largura e 25% da altura. Como a ferramenta devolveu 1254 px em vez dos 1024 px solicitados, o tamanho nominal de cada célula é **313,5 × 313,5 px**. Use coordenadas normalizadas, sem arredondar os limites de cada frame individualmente.

| Linha | Nome de estado | Colunas 0 a 3 | Direção |
| --- | --- | --- | --- |
| 0 | `idle` | repouso → leve compressão → repouso → leve elevação | três quartos, direita |
| 1 | `attack` | mira → carga → disparo contido no canhão → recuperação | direita |
| 2 | `hit` | susto/recuo → compressão → cambaleio → recuperação | impacto pela esquerda |
| 3 | `victory` | pose orgulhosa → punho alto → comemoração → orgulho/repouso | três quartos, direita |

Índice linear de frame: `linha * 4 + coluna`. Para um elemento quadrado com imagem de fundo, use `background-size: 400% 400%`, e posições X/Y `0%`, `33.333333%`, `66.666667%`, `100%`. Anime por saltos discretos entre frames. Espelhar o elemento com CSS permite que o oponente fique voltado à esquerda.

Não recortar a imagem inteira para uma faixa horizontal: os quatro estados estão em linhas diferentes. O canvas pode usar `sx = coluna * largura / 4`, `sy = linha * altura / 4`, `sw = largura / 4`, `sh = altura / 4`. Preserve alpha ao converter formatos.

O MOSS-01 passou por duas correções de efeitos; o VOLT-X passou por uma correção; o TITAN-9 teve o punho de vitória reduzido para caber em sua célula. Os efeitos externos de disparo foram reduzidos para não invadir as células seguintes. Variações de pose entre frames fazem parte das animações; o jogo pode suavizá-las com leve movimento do elemento. Os fundos contêm arte, sem textos de interface, marcadores de fases ou robôs embutidos.

## Paleta e direção de arte

Arte pintada em 2D com volumes mecânicos legíveis, visor expressivo, metal marfim e grafite, jade na interface ambiental, luz dourada e verde de florestas. O mapa e hangar formam o mundo de expedição; robôs usam paletas diferentes para facilitar a leitura por categoria.

## Prompts usados

Os prompts abaixo são os textos enviados à ferramenta integrada. A ferramenta foi chamada uma vez por asset ou correção. As correções usaram o PNG da versão anterior como alvo local já inspecionado.

### hangar.png — geração

Transparência solicitada: não.

```text
Use case: stylized-concept.
Asset type: finished 2D mobile game background for LifeBots, 1536 by 1024 pixel landscape illustration.
Primary request: an original futuristic robot expedition hangar, empty of characters, with a wide open central floor where the game will place a character.
Scene: a beautifully painted steel navy industrial hangar with a large rear window and open door looking onto a lush forest and distant futuristic rooftops at sunset. Chunky mechanical walls, elevated walkway on the sides, a few tasteful tool lockers and docking cables at the far edges, segmented metal floor, subtle thin jade green light strips. Keep the entire middle bottom two-thirds broad and unobstructed. Hangar viewed at a mildly elevated three-quarter perspective with strong readable architectural forms, not an isometric miniature.
Style: premium hand-painted 2D game concept art, crisp intentional edges with soft atmospheric light, detailed but uncluttered, playful adventurous science fiction, appealing sophisticated mobile RPG visual polish.
Palette and light: steel navy, graphite, desaturated jade and subtle lime status lights, warm amber sunset light spilling from the opening, lush green forest.
Constraints: no robots, no humans, no creatures, no text, no letters, no labels, no numerals, no interface, no logos, no watermarks. Full opaque background. Wide landscape composition, 1536x1024.
```

### moss-sprites.png — geração original

Transparência solicitada: sim.

```text
Use case: stylized-concept.
Asset type: precise animation sprite atlas for LifeBots; square 1024x1024 PNG with genuinely transparent background.
Primary request: exactly sixteen whole-body sprites of ONE identical small friendly expedition robot named MOSS-01, arranged in an exact uniform 4 columns x 4 rows grid. Each cell is exactly one quarter of the sheet in both directions (256x256), with no drawn cell borders, no divider lines, no labels, no background.
Robot design: compact youthful android with large rounded hands and boots, a broad helmet with a single warm glowing yellow face visor and a friendly two-eye expression, ivory/off-white armor with jade green shoulder plates and chest panel, dark graphite joints, a tiny green antenna, a small energy cannon in its right forearm. A charming explorer robot with durable detailed mechanical components. Entire robot visible head to toe in every frame.
Style: original premium illustrated 2D game character, hand-painted sharp readable outline and soft volumetric shading, rich material highlights, tasteful wear, polished RPG concept art. No photorealism, no UI.
Camera: every frame identical side three-quarter view, facing to the right. Exactly same robot identity, scale, and camera in all cells. All frames centered inside their own cell, feet on a consistent baseline 25 pixels above each cell's bottom. Character approximately 205 pixels tall, allowing at least 18 pixels clear transparent padding all around; arms and effects must stay wholly within their own cells.
Frame choreography left to right:
Row 1: four small idle/breathing variations, relaxed neutral; slight compression; relaxed neutral; slight rise.
Row 2: energy attack toward the RIGHT, first arm aims, second cannon glows, third fires one short jade energy burst staying inside cell, fourth recovers. Robot remains planted, no movement off its center.
Row 3: four damage frames when hit from the LEFT, flinch; brief compression; stagger; recover. Never falling out of cell.
Row 4: four victory frames, chest proudly raised; fist raised; both arms cheering; relaxed proud smile.
Constraints: Exactly four equal columns and four equal rows, sixteen sprites total. NO visible grid lines, NO shadows on an opaque floor, NO text or markings, NO decorative border, NO extra sprite, NO extra character, NO background. True transparent alpha across all empty areas. No limbs or energy effects crossing cell boundaries. Square 1024x1024.
```

### moss-sprites.png — correção do feixe

Transparência solicitada: sim.

```text
Use case: precise-object-edit. Asset type: a transparent 4 by 4 animation atlas. Edit the attached atlas only to fix ONE problem: remove the long green energy beam in row 2 column 3 and replace it with a small glowing muzzle at the cannon. No green effect must pass beyond the right edge of its own third cell (75% of canvas width). Preserve everything else exactly: identical robot identities, all poses, all sixteen sprites, the 4x4 grid, layout, frame baselines, colors, full square canvas, transparent background and alpha. No text or grid lines. Keep the complete arms and whole robots.
```

### volt-sprites.png — geração original

Transparência solicitada: sim.

```text
Use case: stylized-concept.
Asset type: precise animation sprite atlas for LifeBots; square 1024x1024 PNG with genuinely transparent background.
Primary request: exactly sixteen whole-body sprites of ONE identical robot, arranged in an exact uniform 4 columns x 4 rows grid. Each cell is exactly one quarter of the sheet in both directions (256x256), no drawn cell borders, divider lines, labels, or background.
Style: original premium illustrated 2D game character, hand-painted sharp readable outline and soft volumetric shading, rich material highlights, tasteful wear, polished RPG concept art. No photorealism, no UI.
Camera: every frame identical side three-quarter view, facing RIGHT. Exactly same robot identity, scale and camera in all cells. All frames centered inside their own cell with feet on the same baseline 28 pixels above each cell's bottom. The ENTIRE character and ALL limbs must fit in the central 80% of each cell, leaving 10% transparent margins on every side. Each character about 190 pixels tall.
Frame choreography left to right:
Row 1: four small idle/breathing variations, relaxed neutral, slight compression, relaxed neutral, slight rise.
Row 2: attack toward the RIGHT; first arm aims, second cannon glows, third fires with a tiny contained muzzle glow only, fourth recovers. No projectile or long energy beam. The brightest effect must fit within the character's silhouette. Robot remains planted on its center.
Row 3: four damage frames from hit on the LEFT; flinch, brief compression, stagger, recover. No extra star or outside hit effect.
Row 4: four victory frames; chest proudly raised, one fist raised, both arms cheering, relaxed proud face.
Constraints: Exact 4 by 4 equal grid, sixteen sprites total. NO visible grid, NO ground or floor shadows, NO text, NO decorative border, NO extra sprite, NO extra character, NO background. True transparent alpha across all empty areas. No character, limb or glow may cross a cell boundary. Square 1024x1024.
Robot design: VOLT-X, a slender agile medium android with ivory white armor and muted lavender/lilac plating, lit cyan chest core and cyan horizontal eye visor. Sleek helmet, athletic mechanical limbs, broad readable feet, small compact energy gauntlet on the right forearm, dark graphite articulated joints. Friendly but capable face, subtle antenna fins. Consistent design in all sixteen frames. Hand-painted style and scale should be similar to the provided MOSS-01 description, but no other robot in the sheet.
```

### titan-sprites.png — geração

Transparência solicitada: sim.

```text
Use case: stylized-concept.
Asset type: precise animation sprite atlas for LifeBots; square 1024x1024 PNG with genuinely transparent background.
Primary request: exactly sixteen whole-body sprites of ONE identical robot, arranged in an exact uniform 4 columns x 4 rows grid. Each cell is exactly one quarter of the sheet in both directions (256x256), no drawn cell borders, divider lines, labels, or background.
Style: original premium illustrated 2D game character, hand-painted sharp readable outline and soft volumetric shading, rich material highlights, tasteful wear, polished RPG concept art. No photorealism, no UI.
Camera: every frame identical side three-quarter view, facing RIGHT. Exactly same robot identity, scale and camera in all cells. All frames centered inside their own cell with feet on the same baseline 28 pixels above each cell's bottom. The ENTIRE character and ALL limbs must fit in the central 80% of each cell, leaving 10% transparent margins on every side. Each character about 190 pixels tall.
Frame choreography left to right:
Row 1: four small idle/breathing variations, relaxed neutral, slight compression, relaxed neutral, slight rise.
Row 2: attack toward the RIGHT; first arm aims, second cannon glows, third fires with a tiny contained muzzle glow only, fourth recovers. No projectile or long energy beam. The brightest effect must fit within the character's silhouette. Robot remains planted on its center.
Row 3: four damage frames from hit on the LEFT; flinch, brief compression, stagger, recover. No extra star or outside hit effect.
Row 4: four victory frames; chest proudly raised, one fist raised, both arms cheering, relaxed proud face.
Constraints: Exact 4 by 4 equal grid, sixteen sprites total. NO visible grid, NO ground or floor shadows, NO text, NO decorative border, NO extra sprite, NO extra character, NO background. True transparent alpha across all empty areas. No character, limb or glow may cross a cell boundary. Square 1024x1024.
Robot design: TITAN-9, a broad stocky heavy tank android, sturdy wide off-white ceramic plates and graphite metal torso, orange amber horizontal visor and orange glowing chest core. Heavy rounded shoulder plates, huge gauntlets and boots, pistons and dark graphite articulated joints. A friendly formidable guardian. Right forearm houses a compact contained cannon. Make its broad form fit fully inside each grid cell with at least 10% margins. Consistent design in all sixteen frames.
```

### story-map.png — geração

Transparência solicitada: não.

```text
Use case: stylized-concept.
Asset type: a complete 2D game world-map background for LifeBots, 1536x1024 landscape.
Primary request: an original large futuristic island, seen from above in a slightly angled isometric perspective, with a readable winding stone-and-metal expedition trail through abandoned futuristic city ruins overtaken by lush green forest. The path starts from a small coastal landing station on the lower left, passes through forest groves, a quiet robot-era abandoned village and broken industrial bridges, leads to a circular energy observatory on the upper right. Island surrounded by dark turquoise sea, cliffs, beaches, distant little islands, greenery intertwined with pale stone and metal architecture. A few clear empty circular gathering pads along the paths for the game to place level markers.
Style: premium hand-painted 2D mobile RPG environmental concept art, richly detailed readable shapes, stylized painted foliage and architecture, adventurous and inviting, sunset-warm highlights with softer atmospheric distance, cohesive with a navy-jade robot hangar game.
Color palette: deep teal sea, lush forest jade/green, graphite and ivory mechanical buildings, warm gold evening highlights, a few subtle lime energy sources.
Composition: whole central island visible with water margin around all sides, larger important architectural landmarks spaced clearly, winding connected trail easy to follow, no large object obscuring the paths.
Constraints: no text, no letters, no numerals, no interface, no borders, no logos, no watermarks, no level markers, no characters. Full opaque landscape image, 1536 by 1024 pixels.
```

### moss-sprites.png — correção final do brilho

Transparência solicitada: sim.

```text
Use case: precise-object-edit. Edit target: the attached transparent 4x4 robot sprite atlas. Change ONLY the two green outward energy glow clouds surrounding the muzzle in row 2 column 2 and row 2 column 3. REMOVE those energy clouds completely, leaving only the existing tiny bright circular light in the cannon's mouth itself. Do not change the robot, pose, arms, layout, alpha, grid, canvas size, camera, scale or any of the other fourteen sprites. Do not add replacement clouds, beams, light rays or particles. Preserve all sixteen complete robots exactly. Preserve the background as real transparent alpha. No text or border.
```

### volt-sprites.png — correção final do brilho

Transparência solicitada: sim.

```text
Use case: precise-object-edit. Edit target: the attached transparent 4x4 robot sprite atlas. Change ONLY the blue-cyan outward energy glow cloud surrounding the muzzle in row 2 column 3. REMOVE that cloud entirely, leaving only the tiny bright light in the cannon's mouth itself. Do not change the robot, pose, arms, layout, alpha, grid, canvas size, camera, scale or any of the other fifteen sprites. Do not add replacement clouds, beams, light rays or particles. Preserve all sixteen complete robots exactly. Preserve the background as real transparent alpha. No text or border.
```

### titan-sprites.png — correção do punho de vitória

Transparência solicitada: sim.

```text
Use case: precise-object-edit. Edit target: the attached transparent 4 columns by 4 rows animation atlas. One small technical correction only: the sprite in ROW 4 COLUMN 2 (bottom row, second column from left) has its raised fist too high, extending slightly above its own grid cell into the row above. LOWER ONLY THAT RAISED ARM AND FIST by about 25 pixels while preserving the same celebratory bent-arm pose, so the highest point of the fist is at least 15 pixels below the top of row 4 (below 75% of canvas height). Remove all pixels of that fist above its cell boundary. Keep the rest of that robot body, head, feet and exact baseline unchanged. Keep every other robot, pose, color, canvas, camera, 4x4 layout and background alpha exactly unchanged. Sixteen whole robot sprites, no new elements, no text, no border. Real transparent background preserved.
```

## Ícones individuais de moedas e equipamentos

As imagens abaixo foram geradas em seis chamadas independentes da ferramenta integrada `image_gen`, com alpha real e inspeção via `view_image`. Os sprites de robôs existentes foram preservados. A ferramenta retornou PNGs de **1254 × 1254 px**, apesar da solicitação de 1024 × 1024 no prompt. Todos os objetos estão inteiros e possuem espaço transparente ao redor.

| Arquivo | Dimensões reais | Formato | Descrição |
| --- | --- | --- | --- |
| `dist/assets/lifecoin.png` | 1254 × 1254 | PNG RGBA | Moeda dourada, borda chanfrada, L grande e raio |
| `dist/assets/robotcoin.png` | 1254 × 1254 | PNG RGBA | Moeda ciano, borda de engrenagem, R grande e núcleo |
| `dist/assets/plasma-core.png` | 1254 × 1254 | PNG RGBA | Cilindro marfim e grafite com plasma verde contido |
| `dist/assets/magnetic-arm.png` | 1254 × 1254 | PNG RGBA | Braço mecânico marfim/jade com punho robusto |
| `dist/assets/kinetic-shield.png` | 1254 × 1254 | PNG RGBA | Escudo hexagonal marfim/jade e membrana azul clara |
| `dist/assets/quantum-reactor.png` | 1254 × 1254 | PNG RGBA | Núcleo esférico violeta/ciano entre suportes de metal |

Estes seis arquivos são **ícones completos**, sem grade de animação. Usar `<img>` ou fundo com `contain`, preservando proporção 1:1; não aplicar o recorte `400%` dos atlas. As moedas foram desenhadas para distinguir os saldos por silhueta e cor, inclusive em tamanhos pequenos. Os quatro equipamentos possuem formatos diferentes: cilindro, braço dobrado, hexágono e esfera com suportes. Não contêm textos de interface; somente as letras grandes L e R nas moedas.

Validação: os seis PNGs possuem alpha de 0 a 255. Nenhum possui fundo opaco ou parte do objeto cortada na borda do canvas. Os arquivos finais somam aproximadamente 9,6 MB.

### Prompts dos seis ícones

#### lifecoin.png

Transparência solicitada: sim. Destino final: `dist/assets/lifecoin.png`.

```text
Use case: stylized-concept.
Asset type: an individual transparent PNG inventory icon for LifeBots, original premium 2D mobile robot RPG.
Style: polished hand-painted/cartoon science-fiction game icon, thick readable silhouette, sharp intentional edges, softly painted metal highlights, chunky attractive proportions. Friendly adventurous visual language matching ivory, jade and graphite illustrated robots. Readable at 32px.
Composition: just ONE object centered on a square 1024x1024 canvas, approximately 75% of canvas width and height, with at least 10% perfectly clear transparent margins on every side. Almost frontal three-quarter view, no detached ornaments.
Lighting: controlled studio-like painted highlights defining the object's volume.
Constraints: TRUE transparent alpha background everywhere around the object. No floor, no backdrop, no drop shadow on a ground surface, no other objects, no interface, no text labels, no watermark, no small inscriptions, no border around the canvas. Square 1024x1024.
Subject: a thick bright golden fictional game coin with a bold deep bevel and clearly defined chunky circular rim, almost directly facing camera with only a slight angle to reveal thickness. Warm gold metal, amber shaded edges and creamy gold highlights. In the center, one very large raised letter L integrated with a simple lightning-bolt motif. The capital L must be the only letter, large and readable. Flat broad central area, strong simple silhouette. A tiny restrained warm glint along the coin's upper rim, entirely inside the object's boundary. Gold coin appears valuable as a fantasy game pickup without any real-world denomination or currency symbol.
```

#### robotcoin.png

Transparência solicitada: sim. Destino final: `dist/assets/robotcoin.png`.

```text
Use case: stylized-concept.
Asset type: an individual transparent PNG inventory icon for LifeBots, original premium 2D mobile robot RPG.
Style: polished hand-painted/cartoon science-fiction game icon, thick readable silhouette, sharp intentional edges, softly painted metal highlights, chunky attractive proportions. Friendly adventurous visual language matching ivory, jade and graphite illustrated robots. Readable at 32px.
Composition: just ONE object centered on a square 1024x1024 canvas, approximately 75% of canvas width and height, with at least 10% perfectly clear transparent margins on every side. Almost frontal three-quarter view, no detached ornaments.
Lighting: controlled studio-like painted highlights defining the object's volume.
Constraints: TRUE transparent alpha background everywhere around the object. No floor, no backdrop, no drop shadow on a ground surface, no other objects, no interface, no text labels, no watermark, no small inscriptions, no border around the canvas. Square 1024x1024.
Subject: a thick cyan-blue fictional game coin with a distinct chunky gear-shaped outer rim containing eight broad mechanical teeth. Almost directly facing camera with only a slight angle revealing thickness. Graphite-silver inset metal rings, luminous cool cyan center, vivid blue shaded edges. Center has one very large embossed capital R shaped like a mechanical emblem, framing a simple small round cyan reactor core in the bowl of the R. The capital R is the only letter, clear and readable. Strong contrasting mechanical silhouette, no intricate micro-details. Any glow must remain tightly inside the coin's silhouette, with fully transparent surroundings. No real-world denomination or currency symbol.
```

#### plasma-core.png

Transparência solicitada: sim. Destino final: `dist/assets/plasma-core.png`.

```text
Use case: stylized-concept.
Asset type: an individual transparent PNG inventory icon for LifeBots, original premium 2D mobile robot RPG.
Style: polished hand-painted/cartoon science-fiction game icon, thick readable silhouette, sharp intentional edges, softly painted metal highlights, chunky attractive proportions. Friendly adventurous visual language matching ivory, jade and graphite illustrated robots. Readable at 32px.
Composition: just ONE object centered on a square 1024x1024 canvas, approximately 75% of canvas width and height, with at least 10% perfectly clear transparent margins on every side. Almost frontal three-quarter view, no detached ornaments.
Lighting: controlled studio-like painted highlights defining the object's volume.
Constraints: TRUE transparent alpha background everywhere around the object. No floor, no backdrop, no drop shadow on a ground surface, no other objects, no interface, no text labels, no watermark, no small inscriptions, no border around the canvas. Square 1024x1024.
Subject: one compact jade-green plasma energy core for a robot. A stout upright cylindrical ceramic ivory housing, graphite metal collars at the top and bottom, three chunky small metal braces, a wide glass central window showing bright contained jade-green energy. The cylinder has a slightly domed top and a clear broad base cap, with the green power at its center. A large readable green silhouette within pale ivory mechanical edges, very few details, no cables dangling outside. Energy stays entirely inside the cylinder, no floating mist or particles. The object should resemble a friendly advanced rechargeable power component, hand-painted game inventory art.
```

#### magnetic-arm.png

Transparência solicitada: sim. Destino final: `dist/assets/magnetic-arm.png`.

```text
Use case: stylized-concept.
Asset type: an individual transparent PNG inventory icon for LifeBots, original premium 2D mobile robot RPG.
Style: polished hand-painted/cartoon science-fiction game icon, thick readable silhouette, sharp intentional edges, softly painted metal highlights, chunky attractive proportions. Friendly adventurous visual language matching ivory, jade and graphite illustrated robots. Readable at 32px.
Composition: just ONE object centered on a square 1024x1024 canvas, approximately 75% of canvas width and height, with at least 10% perfectly clear transparent margins on every side. Almost frontal three-quarter view, no detached ornaments.
Lighting: controlled studio-like painted highlights defining the object's volume.
Constraints: TRUE transparent alpha background everywhere around the object. No floor, no backdrop, no drop shadow on a ground surface, no other objects, no interface, no text labels, no watermark, no small inscriptions, no border around the canvas. Square 1024x1024.
Subject: one compact detachable robot magnetic arm upgrade, fully visible from the rounded ivory shoulder joint to the large strong gauntlet fist. Bent slightly at the elbow into an attractive self-contained diagonal silhouette, without a torso. Ivory/off-white armored upper arm and forearm, jade-green shoulder cap and jade inset gauntlet plates, dark graphite articulated joints, chunky rounded mechanical knuckles. Friendly robust proportions matching an illustrated expedition robot, a broad gauntlet with one small green glowing magnetic ring at the wrist. The hand and arm belong to ONE cohesive component, no separate pieces. No skin, no human limb, no loose cables, no levitating extra parts, no energy haze.
```

#### kinetic-shield.png

Transparência solicitada: sim. Destino final: `dist/assets/kinetic-shield.png`.

```text
Use case: stylized-concept.
Asset type: an individual transparent PNG inventory icon for LifeBots, original premium 2D mobile robot RPG.
Style: polished hand-painted/cartoon science-fiction game icon, thick readable silhouette, sharp intentional edges, softly painted metal highlights, chunky attractive proportions. Friendly adventurous visual language matching ivory, jade and graphite illustrated robots. Readable at 32px.
Composition: just ONE object centered on a square 1024x1024 canvas, approximately 75% of canvas width and height, with at least 10% perfectly clear transparent margins on every side. Almost frontal three-quarter view, no detached ornaments.
Lighting: controlled studio-like painted highlights defining the object's volume.
Constraints: TRUE transparent alpha background everywhere around the object. No floor, no backdrop, no drop shadow on a ground surface, no other objects, no interface, no text labels, no watermark, no small inscriptions, no border around the canvas. Square 1024x1024.
Subject: one complete futuristic hexagonal kinetic shield upgrade for a robot, upright and almost front-facing. A clearly readable large hexagon with a thick ivory ceramic outer rim, jade-green metal corner brackets, charcoal graphite bevel, pale blue energy membrane across the center. Three simple internal geometric ribs form a sturdy mechanical center. The bright pale-blue energy is contained completely inside the shield's hexagonal boundary, with a subtle central core highlight and no outside aura. Chunky elegant proportions, bold simple sci-fi silhouette, no handle projecting outside, no blades, no letters, no badge text.
```

#### quantum-reactor.png

Transparência solicitada: sim. Destino final: `dist/assets/quantum-reactor.png`.

```text
Use case: stylized-concept.
Asset type: an individual transparent PNG inventory icon for LifeBots, original premium 2D mobile robot RPG.
Style: polished hand-painted/cartoon science-fiction game icon, thick readable silhouette, sharp intentional edges, softly painted metal highlights, chunky attractive proportions. Friendly adventurous visual language matching ivory, jade and graphite illustrated robots. Readable at 32px.
Composition: just ONE object centered on a square 1024x1024 canvas, approximately 75% of canvas width and height, with at least 10% perfectly clear transparent margins on every side. Almost frontal three-quarter view, no detached ornaments.
Lighting: controlled studio-like painted highlights defining the object's volume.
Constraints: TRUE transparent alpha background everywhere around the object. No floor, no backdrop, no drop shadow on a ground surface, no other objects, no interface, no text labels, no watermark, no small inscriptions, no border around the canvas. Square 1024x1024.
Subject: one rare futuristic quantum reactor robot upgrade. A bright violet-cyan spherical energy core suspended inside THREE curved heavy graphite-silver metal supports mounted on one compact ivory base, forming a self-contained circular mechanical component. The sphere is large and immediately readable, with a crisp violet rim and cyan-white inner glow, encircled by one broad lavender metal equatorial ring. Three evenly spaced support arches are visible and structurally connected to the same reactor housing. Premium advanced game equipment, impressive glowing rare item, rich purple, cool cyan, ivory and graphite palette. Restrained highlights only, energy entirely contained within the sphere and housing. No orbiting particles, no background halo, no floor, no separate pedestal or scattered pieces, no cables, no lettering.
```






## Cópias para celular (0.2.0)

Cada uma das 11 artes PNG possui uma cópia `.webp`, nas mesmas dimensões e com transparência preservada. PNGs originais: 21.570.212 bytes; WebP de carregamento: 2.561.872 bytes (redução de 88,1%). As dimensões/grade dos atlas permanecem iguais; não mude o recorte de frames ao alternar formato. Os ícones PNG/SVG do PWA continuam presentes. O código usa `assetUrl` e versiona as URLs de imagens.

## Expansão 0.3.0

22 artes em PNG/WebP: nove atlas (16 frames cada), moedas/peças, mapas/cenários e emblema. PNGs: 45.174.558 bytes; WebP: 5.993.434 bytes (86,7% menores). Os ícones PWA 192/512 foram derivados do novo emblema.

Prompts originais, correções e inspeção: `ASSETS_EMBER_GLACIER_NIMBUS.md`, `ASSETS_ORBIT_NOVA_ONYX.md`, `ASSETS_SECTORS.md` e `ASSETS_BRAND.md`. As gerações usaram imagegen built-in; as cópias WebP/ícones são derivados para carregar no jogo. Rascunhos não estão no pacote.

## Artes 0.4 e 0.5

22 novas artes documentadas em `ASSETS_EQUIPMENT_V4.md`, `ASSETS_BATTLES_V4.md`, `ASSETS_STORY_PROPS_V4.md`, `ASSETS_GUILDS_V5.md` e `ASSETS_SOCIAL_V5.md`. O projeto tem 44 artes PNG originais + 44 WebP, com ícones PWA separados. Peças novas usam arquivos exclusivos; artes anteriores são preservadas. Duas paisagens de guerra e ícones próprios de guilda/trocas ampliam a comunidade.

Três músicas originais em OGG/MP3: music-aurora-v2 (96 BPM/80 s), music-pulse-v2 (112 BPM/68,57 s), music-cosmos-v2 (84 BPM/91,43 s). O código de composição está em `scripts/compose-music.py`; nenhum sample externo foi usado.


## Combate 0.6.0

Nove PNGs novos `*-combat-v6.png` (1254×1254 RGBA) e WebP lossless, com 36 poses por modelo: 324 quadros novos. São 53 artes PNG +53 WebP, além dos ícones PWA. Originais anteriores permanecem. As caixas medidas em `COMBAT_V6_*_FRAMES.json` alimentam `src/combat-frames.js`; a distribuição desenhada não deve ser recortada como grade rígida. Reprodução nativa com pés ancorados e contornos quando necessário; nenhum PNG foi remontado.

Prompts/gerações/correções pelo imagegen built-in e QA: `ASSETS_COMBAT_V6_BASE.md`, `ASSETS_COMBAT_V6_FRONTIERS.md`, `ASSETS_COMBAT_V6_STARS.md`. Os PNGs finais estão em `dist/assets/`; scripts de derivados só alteram formato, não desenham poses.

Seis loops originais novos (OGG/MP3, estéreo48kHz) em `music-{verdant,verdant-duel,frontier,frontier-duel,starlight,starlight-duel}-v6.*`. Composição: `scripts/compose-season-music.py`. As três gravações anteriores continuam presentes. Detalhes em `COMBAT_AUDIO.md`.
