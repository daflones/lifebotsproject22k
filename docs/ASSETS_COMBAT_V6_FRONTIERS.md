# Animações de combate v6 — Fronteiras

Novas animações criadas com o modo built-in de `imagegen`, a partir dos atlas originais inspecionados via `view_image`. Cada referência foi editada em novo arquivo; `ember-sprites.png`, `glacier-sprites.png` e `nimbus-sprites.png` ficaram intactos. Nenhum PNG foi desenhado, remontado ou teve poses repetidas por código.

| Robô / modelo | PNG final | WebP lossless | Dimensões | Poses | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|---:|
| KIRA / ember | `dist/assets/ember-combat-v6.png` | `dist/assets/ember-combat-v6.webp` | 1254 × 1254 RGBA | 36 | 2017133 | 1620370 |
| NIVAL / glacier | `dist/assets/glacier-combat-v6.png` | `dist/assets/glacier-combat-v6.webp` | 1254 × 1254 RGBA | 36 | 2169862 | 1646008 |
| ZÉFIRO / nimbus | `dist/assets/nimbus-combat-v6.png` | `dist/assets/nimbus-combat-v6.webp` | 1254 × 1254 RGBA | 36 | 2276539 | 1696970 |

Cada atlas contém seis colunas por seis linhas, com seis corpos completos por linha. Os espaços e efeitos gerados não seguem margens idênticas em todos os quadros; o consumidor deve usar os retângulos de frames abaixo para enquadrar cada corpo. Os arquivos PNG finais mantêm todos os pixels fornecidos pelo imagegen, sem remonte ou redimensionamento.

| Linha / estado | Sequência de seis poses |
|---:|---|
| 0 / idle | Respiração, ombros e pequenas variações de repouso |
| 1 / ataque | Preparação, avanço, golpe, conclusão, recolhe, guarda |
| 2 / dano | Impacto, recuo, cambaleio, estabiliza, volta, neutro |
| 3 / vitória | Seis fases de celebração |
| 4 / defesa | Ergue escudo, abaixa, segura, pulso, baixa, guarda |
| 5 / especial | Carga do núcleo, energia, disparo compacto, descarga, recuperação, neutro |

## Retângulos e âncoras

Arquivo: `docs/COMBAT_V6_FRONTIERS_FRAMES.json`, objeto com as chaves `ember`, `glacier`, `nimbus`. Cada modelo tem `{asset,width,height,frames}`; `asset` aponta para a cópia WebP lossless. O PNG homônimo pode substituir WebP mantendo os mesmos retângulos.

Cada frame tem `{row,column,x,y,width,height,anchorX,anchorY}`. Linha e coluna usam índice zero. `x`, `y`, `anchorX` e `anchorY` são **coordenadas absolutas no atlas original**. Para a âncora relativa dentro do retângulo, subtrair `x` e `y` respectivamente.

Retângulos foram calculados por análise do alpha, isolando a maior componente conectada opaca de cada pose e adicionando dois pixels de margem. Incluem o corpo denso completo e parte dos efeitos ligados a ele; efeitos translúcidos periféricos podem ficar fora do retângulo. Algumas energias se aproximam ou atravessam a margem lógica entre células. `anchorY` é a base da componente corporal; `anchorX` é o centro da extensão dos pixels dos pés junto à base. Em poses de recuo com um pé elevado, a âncora representa o pé que toca a base e é aproximada.

Os frames de `ember` em `row: 2, column: 1` e `row: 2, column: 2` também têm `clipPath` opcional: contorno SVG fechado em coordenadas absolutas do atlas, composto apenas de comandos `M`, `L`, `Z` e números. O contorno isola a própria componente corporal e inclui cerca de dois pixels de margem, impedindo que fragmentos de corpos vizinhos presentes dentro do retângulo sejam exibidos. A proteção preserva todos os pixels opacos da própria componente e exclui os das componentes vizinhas na verificação por alpha; PNG/WebP, retângulos e âncoras não foram alterados.

## Verificação

Inspeção visual confirmou 36 corpos por atlas, identidade preservada e novas sequências de defesa/especial. KIRA recebeu correção de um disparo que ocupava a célula seguinte; NIVAL recebeu correção de uma linha de ataque com apenas cinco corpos. A primeira versão de ZÉFIRO cortava os pés na borda inferior; a versão final reduziu/reespaçou poses e mantém os seis corpos completos na última linha. Nenhum corpo do PNG final está cortado pela borda do canvas. Versões descartadas ficaram fora dos caminhos consumidos pelo jogo.

Pillow foi usado apenas para codificar WebP lossless; dimensões e canal alpha foram comparados com o PNG, assim como RGB de todos os pixels com alpha maior que zero, e são iguais. Os canais alpha contêm valores 0–255, com transparência real. Não foi feita verificação de animação em navegador por esta tarefa de assets.

## KIRA

Raposa robótica laranja/creme com núcleo âmbar.

Prompt de criação das novas poses:

```text
Use case: identity-preserve.
Asset type: NEW production combat animation atlas for a 2D robot RPG, square transparent image, EXACTLY SIX COLUMNS by SIX ROWS, thirty-six (36) uniform square cells.
Input image 1: identity reference and edit target, the existing 4x4 KIRA robot atlas. Use its character identity ONLY; completely redraw the requested NEW 6x6 animation sheet. Do NOT simply copy, tile, repeat, rescale, or crop its old poses. Do NOT preserve its four-by-four layout.
Primary request: upgrade KIRA into a NEW full 36-pose combat atlas. Preserve the exact cute mechanical FOX identity: large pointed orange fox ears, fox-shaped helmet and muzzle, orange-and-cream plated armor, black face screen with amber expressive eyes, amber circular core on chest, dark mechanical joints, compact bushy orange-white robotic tail. Same chibi proportions and polished painted 3D/cel-shaded mobile RPG style.
CRITICAL GRID: square canvas divided into EXACTLY 6 equal columns AND EXACTLY 6 equal rows. Six different sequential full-body robot poses on EACH row, 36 total. No missing row, no extra row. Each cell identical dimensions. Transparent gutters within each cell. Reserve 12% padding on all sides, full character no more than 76% cell height; keep ears, raised arms, tail, shields and all effects entirely inside own cell. Feet anchored on a consistent baseline at 88% cell height; same character scale throughout. Camera fixed 3/4 facing RIGHT. Never mirror or rotate camera. No character cut off or overlapping another cell.
EXACT six row animation plan, top to bottom, frames left to right:
ROW 0 IDLE: neutral stance; gentle inhale shoulders up; arms relax a little; tail sways to near side; gentle exhale shoulders down; return neutral. Six subtly different breathing poses.
ROW 1 NORMAL ATTACK: crouched preparation fist pulled back; lean and step forward while feet stay within cell; rightward fist strike; full arm extension with a small contained amber impact glow; arm retracts; return neutral. Six clearly distinct combat silhouettes.
ROW 2 DAMAGE: head/shoulder impact with small orange sparks; recoil backward with hands open; stagger and knee bend; stabilize with arms bracing; straighten and return guard; neutral. Six distinct phases, no copied idle frames.
ROW 3 VICTORY: eyes brighten and chest proud; right fist begins rising; right fist fully raised; both fists raised with smiling visor; arms descend and celebratory tail swing; happy resting pose. Six phases, no duplicate poses.
ROW 4 DEFENSE: lift left forearm as a small translucent orange energy shield forms; lower stance and expand forearm shield; hold the compact shield facing right; shield pulses at impact and body braces; lower shield and recover; neutral guard. Six distinct defense phases.
ROW 5 SPECIAL: both arms draw in and amber chest core charges; energy grows in the core and fists; unleash a small intense rightward flame pulse from forearm; pulse disperses into contained orange sparks; recover with arms retracting and core cooling; neutral stance. Six distinct special phases, different from the normal punch.
Scene/background: TRUE TRANSPARENT ALPHA, fully transparent spaces between all characters and around limbs, no backdrop or checkerboard texture, no shadows outside the own cell. No floor or environment.
Text: absolutely NONE, no labels, letters, numbers, rows labels, grid lines, borders or watermarks.
Invariants: preserve KIRA identity, color palette and robot design from the reference; change only animation poses and sheet grid to 6x6. Draw genuine new sequential poses, not six identical duplicates per row. Output one square full-color transparent 36-frame atlas.
```

Correção específica:

```text
Use case: precise-object-edit.
Input image 1: edit target, transparent KIRA 6 by 6 animation atlas.
Fix the ONE production defect: the giant fire burst in bottom row is spreading across multiple cells and replaces one character. Correct this so the entire sheet has EXACTLY 36 complete fox robots, ONE complete robot in EVERY one of the 6x6 equal square cells.
Preserve the established identity, orange/cream armor, amber visor eyes, tail, lighting, 3/4 RIGHT-facing camera, six-by-six grid, transparent alpha, scale and good poses. Keep top five animation rows with their idle, normal attack, hit, victory, defense identities.
Redraw ONLY the last SPECIAL row as SIX full-body robot poses on the same foot baseline and scale as the rest:
cell1 both arms close and chest core charges;
cell2 arms open slightly with bright core and tiny contained flames above wrists;
cell3 left hand braces and right arm shoots a SMALL compact flame at fingertip, flame length maximum 10% of one cell width;
cell4 FULL-BODY FOX ROBOT MUST BE VISIBLE, both arms move back as small amber energy glow fades close around wrists;
cell5 robot arm retracts and core cools;
cell6 return full-body calm stance.
Keep all orange energy, glow and particles STRICTLY INSIDE EACH CELL. NO long fire stream, NO distant projectile, NO effects joining cells, NO effect-only cell. Each full-body character max 75% of cell height, 12% clear transparent margins all four sides. All 36 characters entirely inside uniform cells, ears and tail included. Preserve real alpha transparency, no solid background. No labels, text, grid lines, borders, watermark. Output one corrected SQUARE 6x6 transparent atlas.
```

Prompt final de ajuste de margem/escala:

```text
Use case: precise-object-edit.
Input image 1: edit target, the KIRA 36-pose combat sprite atlas. orange and cream fox robot, pointed ears, bushy tail, amber eyes/core.
Correct ONLY the production atlas layout/margins. Preserve all 36 existing distinct poses and their exact order (six animation rows: idle, attack, damage, victory, defense, special). Preserve character identity, color palette, true alpha transparency, art style and 3/4 RIGHT-facing camera. No duplicate/copy poses, no new character, no deleted frame.
The input characters are too close to cell edges and some feet nearly touch the canvas bottom. INDIVIDUALLY SHRINK EACH ONE of the 36 characters by around 20%, including all effects, then place each WHOLE ROBOT at the exact center of its own equal cell. Do NOT shrink the whole sheet as one picture.
Grid MUST stay precisely SIX COLUMNS × SIX ROWS on one square canvas. ONE complete robot with visible head, torso, arms, legs, feet in EVERY cell, including all six robots in the bottom row.
For a 1254 × 1254 canvas, each cell is 209 × 209. The six X centers are 104.5, 313.5, 522.5, 731.5, 940.5, 1149.5. The six foot baselines should be near y=178, 387, 596, 805, 1014, 1223 respectively. The characters must fit each own 209px cell; max height about 150px. If output size differs, keep those SAME exact proportional locations.
Full clear transparent padding around each character and effect, about 14% on every side of each cell. All silhouettes and all visual effects must be fully contained inside cell, no touching any neighboring cell. Keep ALL feet fully visible, especially the bottom row, with at least 25 pixels empty transparency below feet at bottom of sheet. Ears/fins/horns/raised fists cannot be cropped.
Make all effects compact, NO long beam or projectile. Keep 36 full robot bodies and the same order of the 36 individual poses.
No text, labels, grids, lines, borders, solid background or watermark. Output a square transparent corrected 6x6 animation atlas.
```

## NIVAL

Guardião branco/azul com cristais de gelo nos ombros e antebraços.

Prompt de criação das novas poses:

```text
Use case: identity-preserve.
Asset type: NEW 2D robot game combat animation atlas. One square transparent image with EXACTLY SIX COLUMNS AND SIX ROWS = 36 cells.
Input image 1: NIVAL's old 4x4 robot atlas, identity reference/edit target. REDRAW as a NEW 6x6 sheet with real NEW sequential poses. Do not tile or duplicate old frames. Replace the 4x4 layout completely.
Preserve the character exactly: cute large white ceramic armored guardian robot, blue joints and feet, big translucent blue ICE CRYSTALS on shoulders and forearms, small round head with black visor and cyan eyes, shining blue polygonal chest core. Same proportions, paint-shaded 3D-like stylized RPG art and 3/4 camera FACING RIGHT.
GRID IS THE TOP PRIORITY: one square canvas, EXACTLY 6 identical columns × 6 identical rows, ONE FULL ROBOT in EVERY cell, 36 visible robots total. Robot size ONLY TWO THIRDS of each cell height, leaving 16% EMPTY TRANSPARENT PADDING on all sides. Uniform character scale. Feet on 84% height baseline of each own cell. All heads, feet, forearms, shield and effects fully inside own cell. All effects SMALL and close to hands/core, NEVER travel across cell boundaries. NO long projectile or beam. NO effect-only cell.
Six animation rows top to bottom, six phases LEFT TO RIGHT:
Row 0 IDLE: calm stance; breathe in shoulders rise; slight forearm relax; little weight shift; breathe out; calm stance with different slight hand position. Subtle six breathing phases.
Row 1 NORMAL ATTACK: crouch and fist pullback; advance torso; strike fist right; fully extend right fist with tiny cyan flash at knuckles; retract; neutral guard. Distinct six silhouettes.
Row 2 HIT/DAMAGE: small shoulder spark and flinch; recoil backwards hands open; stagger and knee bend; brace to stabilize; stand back up; neutral. Full robot visible in all six.
Row 3 VICTORY: proud chest; lift one fist halfway; fist fully up; both fists raised; fists descend and crystal glow settles; happy resting stance.
Row 4 DEFENSE: forearm rises and SMALL translucent icy shield appears; crouch behind shield; hold compact crystal shield facing right; small blue pulse on shield while body braces; lower shield; neutral guard.
Row 5 SPECIAL: pull both hands beside chest as core charges; spread palms and core grows brighter; one forearm projects a TINY compact icy pulse maximum 10% cell width; FULL ROBOT with both arms retracting and small crystal particles around wrists; recover and core dims; neutral stance. Six distinct FULL-BODY robot poses, do not draw any large ice stream.
Background: TRUE TRANSPARENT ALPHA, all spaces between characters and limbs transparent. No floor, backdrop, checkerboard texture or shadow plane.
Text: NONE. No labels, letters, numbers, row titles, borders, grid lines or watermark.
Keep identity/color palette/armor design from reference, change only animation poses and atlas layout. No duplicate rows. Output exactly 36 full-body NIVAL poses in one square 6x6 transparent sheet.
```

Correção específica:

```text
Use case: precise-object-edit.
Input image 1: edit target, NIVAL transparent 6x6 animation atlas.
Fix the production defect ONLY in the SECOND ROW (normal attack): it currently has only FIVE full robot bodies and a long stretched arm/energy beam using the fourth cell. Redraw that entire second row as SIX COMPLETE ROBOTS, ONE FULL-BODY ROBOT PER CELL. The six columns must be exactly aligned with the six idle robots in the top row.
Preserve robot identity: NIVAL white ceramic and blue armor, icy crystal shoulders/forearms, black visor cyan eyes, blue chest core. Preserve all other rows and their six poses, camera 3/4 facing right, true transparency and square 6x6 layout.
Second row six NEW sequential COMPACT punches from left to right:
1 fist winds back while knees bend;
2 torso leans forward, fists still beside body;
3 forward forearm punch bent at elbow, hand just ahead of torso;
4 COMPLETE ROBOT VISIBLE WITH HEAD, TORSO, LEGS, FEET, retracting a short punch while cyan glow is at hand;
5 forearm retracts and torso straightens;
6 calm full-body guard.
NO projectile and NO beam in this row. Arm may extend only a little, NEVER more than 20% cell width ahead of the body. Draw SIX separate whole bodies evenly spaced across the row. Each body and hand entirely inside own cell, head and feet uncut, robot only TWO THIRDS cell height with 16% clear transparent margin. All six foot baselines aligned and character scale equal. Add SMALL cyan hand glow only, strictly inside same cell.
Entire output MUST contain 36 robots total in six rows of six full-body robot poses. No effect-only cell anywhere. Keep transparent alpha background, no grid lines, labels, text or border.
```

Prompt final de ajuste de margem/escala:

```text
Use case: precise-object-edit.
Input image 1: edit target, the NIVAL 36-pose combat sprite atlas. white/blue ice crystal guardian, cyan eyes, crystal shoulders and forearms.
Correct ONLY the production atlas layout/margins. Preserve all 36 existing distinct poses and their exact order (six animation rows: idle, attack, damage, victory, defense, special). Preserve character identity, color palette, true alpha transparency, art style and 3/4 RIGHT-facing camera. No duplicate/copy poses, no new character, no deleted frame.
The input characters are too close to cell edges and some feet nearly touch the canvas bottom. INDIVIDUALLY SHRINK EACH ONE of the 36 characters by around 20%, including all effects, then place each WHOLE ROBOT at the exact center of its own equal cell. Do NOT shrink the whole sheet as one picture.
Grid MUST stay precisely SIX COLUMNS × SIX ROWS on one square canvas. ONE complete robot with visible head, torso, arms, legs, feet in EVERY cell, including all six robots in the bottom row.
For a 1254 × 1254 canvas, each cell is 209 × 209. The six X centers are 104.5, 313.5, 522.5, 731.5, 940.5, 1149.5. The six foot baselines should be near y=178, 387, 596, 805, 1014, 1223 respectively. The characters must fit each own 209px cell; max height about 150px. If output size differs, keep those SAME exact proportional locations.
Full clear transparent padding around each character and effect, about 14% on every side of each cell. All silhouettes and all visual effects must be fully contained inside cell, no touching any neighboring cell. Keep ALL feet fully visible, especially the bottom row, with at least 25 pixels empty transparency below feet at bottom of sheet. Ears/fins/horns/raised fists cannot be cropped.
Make all effects compact, NO long beam or projectile. Keep 36 full robot bodies and the same order of the 36 individual poses.
No text, labels, grids, lines, borders, solid background or watermark. Output a square transparent corrected 6x6 animation atlas.
```

## ZÉFIRO

Robô branco/turquesa com aletas de voo e núcleo cyan.

Prompt de criação das novas poses:

```text
Use case: identity-preserve.
Asset type: NEW transparent square 2D robot RPG combat sprite atlas, EXACTLY 6 COLUMNS AND 6 ROWS = THIRTY-SIX full-body robot poses.
Input image 1: ZÉFIRO old 4x4 robot atlas, identity reference and edit target. Use the character design; COMPLETELY REDRAW a NEW 6x6 animation sheet, not tile/crop/duplicate the old sixteen frames.
Preserve identity: cute flying robot with rounded cream-white ceramic large helmet, blue/turquoise side fins and top fin, dark visor with two bright cyan expressive eyes, cyan round chest core, cream/blue armor and dark mechanical joints, broad blue boots and small aerodynamic side/shoulder fins. Same polished painted 3D-like chibi RPG art, camera fixed 3/4 FACING RIGHT.
TOP PRIORITY: EXACT 6x6 uniform square grid. ONE COMPLETE ROBOT in EVERY CELL, six bodies per row, total exactly 36. No empty or effect-only cell. Draw characters small enough: ONLY TWO THIRDS cell height, 16% clear transparent padding on every side. All head fins, arms, feet and effects fully inside own cell. Same scale and anchored foot baseline at 84% cell height. Transparent gutters between all cells.
IMPORTANT: NO beam, NO projectile trail, NO extended cannon barrel, NO long arm spanning cells. Attack is a COMPACT mechanical forearm strike, energy effects only small glows close to body. Never use neighboring cell for any effect.
Six rows top to bottom, six distinct sequential phases per row left to right:
0 IDLE: neutral; inhale shoulders up; fins slightly spread; slight weight shift arms relax; exhale; neutral with a different slight hand angle.
1 NORMAL ATTACK: wind up elbow; lean forward; short COMPACT rightward punch with elbow still bent and hand only slightly ahead of torso; short punch completion with tiny cyan hand glow; retract forearm; neutral guard. SIX FULL ROBOTS visible across this row.
2 HIT: head flinch with tiny spark; recoil torso; stagger knees bent; brace and spread side fins slightly; straighten; neutral.
3 VICTORY: proud stance happy visor; one fist lifts halfway; one fist fully raised; two fists raised; fins open and arms descend; happy resting stance.
4 DEFENSE: lift forearms and small turquoise energy shield appears close to body; crouch behind shield; hold SMALL shield; shield briefly pulses; lower shield; neutral guard.
5 SPECIAL: both hands close to chest charging cyan core; small circular wind rings gather around wrists; push both palms a SHORT distance outward with small bright wind pulse at hands; FULL-BODY ROBOT with wind rings fading around torso and side fins; arms recover and core dims; neutral. Six full bodies and six distinctly different phases, special energy must stay inside cell and never obscure character.
Scene/backdrop: actual TRANSPARENT ALPHA everywhere around characters and between limbs. No floor or environment, no colored background/checkerboard, no shadow plane.
No labels, text, letters, numbers, grid lines, borders or watermark.
Keep character identity/design/palette unchanged, change animation poses and grid only. Output one square 6x6 transparent combat atlas with exactly 36 complete ZÉFIRO robots.
```

Prompt final de ajuste de margem/escala:

```text
Use case: precise-object-edit.
Input image 1: edit target, the ZÉFIRO 36-pose combat sprite atlas. white cream and turquoise flying robot, pointed side/top fins, cyan eyes and round core.
Correct ONLY the production atlas layout/margins. Preserve all 36 existing distinct poses and their exact order (six animation rows: idle, attack, damage, victory, defense, special). Preserve character identity, color palette, true alpha transparency, art style and 3/4 RIGHT-facing camera. No duplicate/copy poses, no new character, no deleted frame.
The input characters are too close to cell edges and some feet nearly touch the canvas bottom. INDIVIDUALLY SHRINK EACH ONE of the 36 characters by around 20%, including all effects, then place each WHOLE ROBOT at the exact center of its own equal cell. Do NOT shrink the whole sheet as one picture.
Grid MUST stay precisely SIX COLUMNS × SIX ROWS on one square canvas. ONE complete robot with visible head, torso, arms, legs, feet in EVERY cell, including all six robots in the bottom row.
For a 1254 × 1254 canvas, each cell is 209 × 209. The six X centers are 104.5, 313.5, 522.5, 731.5, 940.5, 1149.5. The six foot baselines should be near y=178, 387, 596, 805, 1014, 1223 respectively. The characters must fit each own 209px cell; max height about 150px. If output size differs, keep those SAME exact proportional locations.
Full clear transparent padding around each character and effect, about 14% on every side of each cell. All silhouettes and all visual effects must be fully contained inside cell, no touching any neighboring cell. Keep ALL feet fully visible, especially the bottom row, with at least 25 pixels empty transparency below feet at bottom of sheet. Ears/fins/horns/raised fists cannot be cropped.
Make all effects compact, NO long beam or projectile. Keep 36 full robot bodies and the same order of the 36 individual poses.
No text, labels, grids, lines, borders, solid background or watermark. Output a square transparent corrected 6x6 animation atlas.
```
