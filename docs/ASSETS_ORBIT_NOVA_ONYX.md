# Assets: ORBIT-07, NOVA-08 e ONYX-09

Criados em 12/10/2026 com o modo built-in de `imagegen`. Os atlas de MOSS e TITAN existentes foram inspecionados como referência de acabamento e proporções; as imagens novas foram geradas com prompts próprios, sem reutilizar ou recolorir personagens existentes.

| Robô | Classe | Original | Derivada WebP | Dimensões | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---|---:|---:|
| ORBIT-07 | Explorer | `dist/assets/orbit-sprites.png` | `dist/assets/orbit-sprites.webp` | 1254 × 1254 RGBA | 2586059 | 595678 |
| NOVA-08 | Striker | `dist/assets/nova-sprites.png` | `dist/assets/nova-sprites.webp` | 1254 × 1254 RGBA | 2329523 | 542410 |
| ONYX-09 | Guardian | `dist/assets/onyx-sprites.png` | `dist/assets/onyx-sprites.webp` | 1254 × 1254 RGBA | 2244252 | 453908 |

Os PNGs originais foram preservados. As cópias WebP foram codificadas com ImageMagick `convert`, qualidade 90 e `webp:alpha-quality=100`, sem redimensionar. Foi verificado que dimensões e bytes do canal alpha são iguais entre cada original e sua derivada. O alpha contém valores de 0 a 255, incluindo transparência real.

Cada atlas tem quatro colunas e quatro linhas, totalizando 16 poses. Recortar a largura/altura em quartos; o canvas de 1254 px resulta em uma célula lógica de 313,5 px, igual ao formato de atlas existente do projeto. A visualização CSS percentual pode manter esse recorte; uma exportação para motores que exigem células inteiras deve normalizar o atlas em etapa própria.

| Linha (índice 0) | Animação |
|---:|---|
| 0 | Idle, quatro poses de repouso |
| 1 | Ataque, quatro poses |
| 2 | Reação a dano e recuperação, quatro poses |
| 3 | Vitória, quatro poses |

A inspeção visual confirmou identidade coerente, personagens inteiros, orientação predominante para a direita e poses de ataque/dano/vitória. Como nos atlas originais, alguns brilhos e trilhas de ataque ficam próximos dos limites das células; a interface deve recortar por quadro. São animações de quatro quadros geradas por imagem, sem rig esquelético. Não houve verificação em navegador nesta tarefa de assets.

## ORBIT-07

Explorador astronauta branco e teal, com visor de olho azul único, detalhes dourados e anel orbital.

Prompt final:

```text
Use case: stylized-concept.
Asset type: production-ready 2D game robot animation sprite atlas, one square transparent PNG, exactly 4 columns by 4 rows = 16 cells, no outlines or grid.
Primary request: create the ORBIT-07 explorer robot for LifeBots. This is a NEW character, not a collage of existing robots.
Style/medium: premium stylized mobile RPG art, chibi robotic proportions, beautifully painted 3D-like cel shaded volume, polished ceramic armor, clean highly readable silhouette, rounded head and compact body, 3/4 camera facing RIGHT. Match the classic cute robot battler look: huge expressive head, short sturdy mechanical legs, richly shaded joints and reflective armor.
Subject: astronaut explorer robot with white ceramic armor, dark teal joints and chest panels, restrained brushed gold trims, ONE large round glowing azure eye inside a dark circular glass helmet visor, miniature jetpack, elegant thin orbital ring floating behind the head. Friendly heroic look, distinctly robotic, no human anatomy.
Animation layout, exact row order:
Row 1 (top): 4 sequential idle poses, subtle breathing and ring tilt, facing right.
Row 2: 4 sequential attack poses: arm scanner raised, charge cyan pulse, small visible cyan energy shot, return stance.
Row 3: 4 sequential damage reaction poses: flinch, recoil, brace, recover. Tiny contained cyan spark effects.
Row 4 (bottom): 4 sequential victory poses: confident hands at hips, one arm raised, two fists raised, heroic resting smile/bright eye.
Composition/framing: all 16 robots full-body, identical identity, same size and orientation across every cell. Every cell exactly a quarter of canvas width and height, no outer grid margins. Feet on a consistent baseline near 90% of each cell height. Reserve 10% transparent cell padding on every side so all heads, rings, feet, arms, and energy particles are fully inside their own cell. Character approximately 78% of cell height; all frames horizontally centered. No pose may overlap another cell or be cropped.
Lighting: warm rim lighting and cool teal accents, readable against dark game backgrounds.
Scene/backdrop: actual transparent alpha background throughout the entire sheet, including gaps between limbs. No floor plane, shadows outside character, colored background or checkerboard texture.
Text: none. No letter or number, no labels, no borders, no watermark.
Output: one square canvas, exactly 16 distinct sequential animation poses in a uniform 4 × 4 grid.
```

## NOVA-08

Combatente ágil violeta/fúcsia com núcleo energético no peito e emissores de lâminas plasma.

Prompt final:

```text
Use case: stylized-concept.
Asset type: production-ready 2D robot game animation sprite atlas, ONE square transparent PNG, EXACTLY 4 COLUMNS AND 4 ROWS, 16 uniform square cells.
Primary request: create the NOVA-08 striker robot for LifeBots, a beautiful ORIGINAL purple/fuchsia agile combat robot.
Style/medium: premium stylized mobile RPG character art, chibi robot with a large head, compact athletic body and short mechanical legs, polished painted 3D-like cel shading, crisp rich armor highlights, clean readable silhouette. Fixed 3/4 camera, robot facing RIGHT.
Subject: agile robot with faceted deep-violet armor, bright magenta shoulder and knee plating, fine silver trims, angular helmet and expressive narrow cyan visor eyes, glowing violet energy core in chest. Two short plasma blade emitters attached to forearms; blades retract in idle and deploy magenta energy blades in attack. Looks nimble and heroic with compact angular proportions, distinctly mechanical, no human skin.
CRITICAL GRID: Divide the square canvas into 16 identical 25% × 25% cells. Place every whole robot STRICTLY INSIDE its own cell. Reserve at least 12% transparent padding on every side of EVERY cell. Every robot from head to feet should be no more than 76% of one cell's height. Character scale, identity and camera must remain the same across all 16 frames. Feet consistent baseline at 88% cell height. Keep arms and blade trails INSIDE own cell. Absolutely no cropped heads/feet/blades and no element crossing a cell boundary.
Animation exact rows from top:
Row 1: four sequential idle poses, subtle flexing and energy-core glow, blades retracted.
Row 2: four sequential attack poses, charge forearm blades, one diagonal blade slash, complete the slash with short contained magenta trail, recover with blades retracting.
Row 3: four sequential hit/recoil poses: impact flinch, lean back, defensive brace, recover; small contained purple sparks.
Row 4: four sequential victory poses: arms on hips, fist up, both fists up, proud resting pose with pleased visor eyes.
Scene/backdrop: genuinely TRANSPARENT alpha background, including around and between limbs. No colored backing, no checkerboard, no floor or scene.
Lighting/mood: luminous cyan and magenta accents, studio rim highlights, cheerful premium robot game.
Text: NONE. No labels, titles, letters, numbers, watermark, borders, cell outlines or grid lines.
Output: a square atlas containing exactly 16 full-body poses of the SAME NOVA robot in a perfectly uniform 4 by 4 grid.
```

## ONYX-09

Guardião rinoceronte mecânico de armadura grafite/ônix e detalhes dourados, com chifre e núcleo âmbar.

Prompt final:

```text
Use case: stylized-concept.
Asset type: production-ready mobile robot game animation atlas, ONE square transparent PNG with EXACTLY 16 full-body characters in 4 columns × 4 rows.
Primary request: design ONYX-09, an ORIGINAL RHINOCEROS GUARDIAN ROBOT for LifeBots.
Style/medium: beautifully painted stylized 3D-like chibi robot game art, large animal-shaped robotic head and compact powerful biped body, crisp readable armored silhouette, rich metallic cel shading and soft studio highlights. Camera fixed 3/4 perspective facing RIGHT.
Subject: a highly distinctive rhinoceros robot. Broad graphite/onyx black armor plates, muted bronze-gold shoulder armor edges and knee trims, stout biped legs, oversized protective forearms, gold energy core on chest. Rhino-shaped angular mechanical head with ONE clearly visible short brushed-gold horn projecting from snout, two small rhino ears, warm narrow amber illuminated eyes. Heavy strong tank guardian, adorable heroic chibi proportions. The rhino horn and muzzle MUST make this character unmistakably different from a generic humanoid tank robot. Mechanical joints; no organic skin or fur.
CRITICAL COMPOSITION: a perfectly uniform square 4 × 4 grid. Each cell exactly 25% of the canvas width and height. Draw each character full-body wholly inside its own cell, same identity, proportions, costume, orientation and scale. At least 12% empty transparent padding on all four sides of EVERY cell; character at most 76% of cell height. Feet baseline consistent near 88% cell height. Keep horn, arms and particles strictly in their own cell, none touching sheet edge or neighbor. No crops.
Animation row order:
Top row: 4 sequential idle guard poses with slight breathing, weight shift and gold core glow.
Second row: 4 sequential attack poses, defensive arm forward and fist windup, strong rightward armored punch with small contained amber impact glow, punch follow through, return stance. Keep the RHINO head visible in all frames.
Third row: 4 sequential damage reactions, armor flinch with tiny gold spark, recoil, defensive brace, recover.
Bottom row: 4 sequential victory poses: proud arms down, one fist raised, two fists raised, confident calm resting pose.
Lighting/mood: warm bronze highlights over dark onyx armor, amber accents, premium cheerful robot battle game.
Scene/backdrop: real transparent ALPHA background everywhere around each silhouette and between limbs. No floor, no environment, no backdrop, no checkerboard pattern.
Text: NONE, no word, letters, numbers, labels, watermarks, borders, grid lines, cell outlines.
Output: exactly sixteen poses of the SAME onyx rhinoceros robot in one square 4 by 4 animation atlas.
```
