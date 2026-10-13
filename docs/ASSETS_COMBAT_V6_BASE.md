# LifeBots — atlas de combate v6 dos robôs base

Novos atlas de combate de BROTTO, LÚMEN e BASTIÃO, gerados e corrigidos com a ferramenta integrada `image_gen`. Os atlas de identidade originais foram inspecionados via `view_image` antes das chamadas e preservados. A nova arte contém seis sequências de seis fases por robô, com poses de ataque, dano, celebração, guarda e especial.

## Arquivos finais

Caminhos relativos à raiz `/workspace/sites/liferobots`.

| Robô | Arquivo | Dimensões reais | Formato | Bytes |
| --- | --- | --- | --- | --- |
| BROTTO (`moss`) | `dist/assets/moss-combat-v6.png` | 1254 × 1254 | PNG RGBA original intacto | 1854775 |
| BROTTO (`moss`) | `dist/assets/moss-combat-v6.webp` | 1254 × 1254 | WebP lossless | 1355078 |
| LÚMEN (`volt`) | `dist/assets/volt-combat-v6.png` | 1254 × 1254 | PNG RGBA original intacto | 1970905 |
| LÚMEN (`volt`) | `dist/assets/volt-combat-v6.webp` | 1254 × 1254 | WebP lossless | 1375336 |
| BASTIÃO (`titan`) | `dist/assets/titan-combat-v6.png` | 1254 × 1254 | PNG RGBA original intacto | 1795173 |
| BASTIÃO (`titan`) | `dist/assets/titan-combat-v6.webp` | 1254 × 1254 | WebP lossless | 1281786 |

As chamadas pediram 2048 × 2048 px; a ferramenta retornou **1254 × 1254 px**. A composição tem **6 colunas × 6 linhas**, com **36 corpos completos** em cada imagem. A célula geométrica nominal seria 209 × 209 px, mas as posições ilustradas têm deslocamentos de linhas/colunas. Para recortar os corpos inteiros, o aplicativo deve consumir os retângulos absolutos do JSON fornecido. Nenhum PNG foi remontado ou redimensionado por código.

## Ordem das linhas

Índices iniciados em zero; dentro de cada linha, as colunas seguem da esquerda para a direita.

| Linha | Estado | Colunas 0 → 5 |
| --- | --- | --- |
| 0 | `idle` | repouso, respiração sobe, inspiração, retorno, compressão/expiração, neutro |
| 1 | `attack` | prepara, avança em apoio, golpe, extensão, recolhe, neutro |
| 2 | `hit` | impacto, recuo, cambaleio, estabiliza, volta, neutro |
| 3 | `victory` | orgulho, punho sobe, celebra inclinando, dois punhos, abre braços, neutro |
| 4 | `defend` | ergue antebraço para guarda, abaixa corpo, segura, firma a guarda, baixa, neutro |
| 5 | `special` | mãos junto ao núcleo, carrega, dispara em posição braced, recolhe após descarga, recupera, neutro |

Os corpos mantêm a identidade e a vista de três quartos à direita: BROTTO marfim/jade com olhos âmbar e antena verde; LÚMEN marfim/lilás com visor e núcleo ciano; BASTIÃO marfim/grafite com visor e núcleo laranja. O jogo desenha projéteis, partículas, escudos de energia, trilhas e anéis. O atlas final traz as poses físicas e apenas as luzes pequenas já contidas em visor, núcleo e manopla.

## Retângulos e âncoras para SVG

Arquivo: `docs/COMBAT_V6_BASE_FRAMES.json`. O objeto principal tem as chaves `moss`, `volt`, `titan`. Cada valor segue exatamente:

```json
{
  "asset": "assets/moss-combat-v6.png",
  "width": 1254,
  "height": 1254,
  "frames": [
    {
      "row": 0,
      "column": 0,
      "x": 71,
      "y": 65,
      "width": 116,
      "height": 162,
      "anchorX": 130.0,
      "anchorY": 225
    }
  ]
}
```

O exemplo acima contém as medidas reais do primeiro frame de BROTTO; as medidas dos 108 frames estão no JSON. O array de cada robô contém 36 objetos, em ordem `row * 6 + column`.

Todas as medidas são **pixels absolutos sobre o PNG original**. `x/y/width/height` delimitam o corpo completo, com **2 px adicionais de margem** em cada lado. Os retângulos foram calculados a partir dos 36 componentes grandes separados da máscara alpha ≥ 16 e ordenados por linha/coluna. A extração foi somente leitura: nenhum pixel, membro, pose ou frame foi desenhado, duplicado ou substituído por código.

`anchorX` estima o centro dos pés: centro horizontal dos pixels sólidos do componente na faixa inferior de 20% do corpo, com alpha ≥ 128. `anchorY` é a base exclusiva do último pixel sólido dos pés nessa faixa. Nenhum frame precisou usar o fallback de centro/base do bbox. A coordenada da âncora **dentro do recorte** é `anchorX - x` e `anchorY - y`. Usar essas âncoras para apoiar o personagem na mesma posição de chão entre poses; manter uma escala comum por robô ao renderizar os recortes.

Os retângulos e as âncoras também se aplicam ao WebP: ele tem exatamente as mesmas dimensões e pixels RGBA. O renderer pode trocar apenas a extensão da URL de PNG para WebP.

## QA visual e estrutural

Os três PNGs selecionados foram inspecionados via `view_image`. Foram confirmados seis corpos completos em cada uma das seis linhas, identidade coerente, corpo inteiro em todas as fases e novas posturas de guarda e carga/disparo. Os efeitos externos dos primeiros ensaios foram removidos por uma correção imagegen; esses ensaios permanecem no scratch e não entram como assets finais.

- **36 componentes de corpo por PNG**, com 36 retângulos e seis frames por estado.
- Nenhum corpo realmente incompleto ou membro cortado; o deslocamento da grade é resolvido pelos recortes individuais.
- Fundo realmente transparente, alpha de **0 a 255**.
- WebP **lossless**, dimensão igual e **todos os canais RGBA exatamente iguais pixel a pixel** ao PNG após decodificação.
- PNGs originais `moss-sprites.png`, `volt-sprites.png` e `titan-sprites.png` preservados.
- Nenhuma mudança no código do jogo, Git ou publicação.

Os três PNGs somam **5.620.853 bytes**; os três WebP somam **4.012.200 bytes**.

## Conversão lossless

Foi usada somente conversão de formato via Pillow, autorizada para o derivativo. Nenhum desenho ou reposicionamento por Python:

```python
image.save(output_webp, format="WEBP", lossless=True, quality=100, method=6, exact=True)
```

A confirmação de igualdade foi feita com arrays RGBA completos, incluindo RGB sob alpha zero, e uma comparação separada do canal alpha.

## Prompts integrais de criação

Cada robô foi chamado separadamente com `referenced_image_paths` apontando para seu atlas de identidade inspecionado, e `transparent_background: true`.

### BROTTO — novas poses de combate

Referência: `dist/assets/moss-sprites.png`.

```text
Use case: precise-object-edit.
Asset type: NEW production 2D robot combat animation atlas for LifeBots.
Input image: the attached previous robot sheet is an IDENTITY AND STYLE REFERENCE. Preserve that exact robot's helmet, face visor, armor design, body proportions, colors and painterly material rendering. Replace the old sheet layout with a new 6-by-6 sheet and draw the additional body poses.
Required output: SQUARE 2048x2048 transparent PNG, EXACTLY SIX COLUMNS and SIX ROWS, thirty-six uniform square cells, one whole-body robot in EACH cell. All rows contain SIX frames and all columns line up exactly. NO drawn cell lines or labels.
Camera: the same original hand-painted 2D mobile RPG robot, in a consistent three-quarter view facing RIGHT. Maintain the same character scale in all 36 frames. Each cell has a stable center anchor and a foot-ground baseline at 85% of that cell height. Feet remain on that baseline; the knees, hips, torso, shoulders and arms change pose. Full helmet, antenna, arms, hands, knees and boots visible in every cell.
Spacing: robots are SMALL inside their own cells, about 55% of each cell's height. Leave obvious clear transparent padding on all sides of every character, at least 12% of cell width/height. Entire character, shield and special energy effect must remain inside the central 76% of their OWN cell. No part or effect may touch or cross another cell. Do not crop or merge frames.
Animation instruction: Draw actual NEW BODY POSES for normal attack, defense and special actions, including changes in knees, hip rotation, torso lean, shoulder rotation and arm extension. These are real sequential illustration frames, not the same standing pose with different glowing effects. Do NOT fill the sheet by duplicating a single robot pose.
FRAME ORDER, left to right, six frames per row:
ROW 1 / IDLE: relaxed neutral; chest gently rises and shoulders lift; slight inhale lean; relaxed return; gentle exhale knee compression; neutral.
ROW 2 / NORMAL ATTACK: knees bend with gauntlet pulled back; planted forward lunge and torso twist; gauntlet strikes toward RIGHT; full controlled extension with torso leaning forward; elbow retracts as weight shifts back; neutral. Clearly six phases of one physical strike, feet anchored.
ROW 3 / DAMAGE: incoming impact from LEFT makes upper body flinch; shoulders recoil; torso staggers back with knees bent; low stabilizing stance; shoulders and arms return; neutral.
ROW 4 / VICTORY: chest proudly lifts; one fist rises beside helmet; head and torso lean happily into raised fist; both fists rise beside helmet; arms spread slightly in celebration; relaxed proud neutral. Keep fists wholly inside cell margins.
ROW 5 / DEFENSE: left forearm raises a compact translucent energy shield; knees lower into a defensive crouch; torso tilts forward while both arms hold the guard; shield pulses with a contained rim glow while body braces; body rises and shield lowers; neutral. Shield belongs to a temporary forearm energy projection, no permanent character redesign.
ROW 6 / SPECIAL: low stance with both hands near the chest core; torso twists as gauntlet gathers energy; deep braced stance firing a SHORT contained energy pulse toward RIGHT; residual discharge with shoulder recoil and short elbow bend; cooling recovery with knees rising; neutral.
Lighting/style: retain the reference's painted ivory ceramic, colored armor, dark graphite joints and softly brushed metal highlights, crisp readable silhouette. No floor shadow. Small effects contained inside each cell; no beams spanning a row, no detached stars or floating particles.
Constraints: EXACT 6x6 grid, EXACT 36 whole robots, transparent alpha background, uniform framing, stable baseline. No text, no numbers, no names, no grid lines, no border, no extra characters, no scenery, no watermarks. Preserve identity from the input image.
Identity to preserve from the attached image: small friendly ivory-and-jade expedition android, broad rounded helmet, two warm amber eye shapes in a dark visor, tiny jade antenna, large rounded boots and hands, jade shoulder/chest armor, graphite joints. Its normal gauntlet light, temporary defense shield and special core/pulse are jade GREEN with warm yellow highlights. Make attack/guard/special poses athletic but compact, suitable for its stocky chibi proportions.
```

### LÚMEN — novas poses de combate

Referência: `dist/assets/volt-sprites.png`.

```text
Use case: precise-object-edit.
Asset type: NEW production 2D robot combat animation atlas for LifeBots.
Input image: the attached previous robot sheet is an IDENTITY AND STYLE REFERENCE. Preserve that exact robot's helmet, face visor, armor design, body proportions, colors and painterly material rendering. Replace the old sheet layout with a new 6-by-6 sheet and draw the additional body poses.
Required output: SQUARE 2048x2048 transparent PNG, EXACTLY SIX COLUMNS and SIX ROWS, thirty-six uniform square cells, one whole-body robot in EACH cell. All rows contain SIX frames and all columns line up exactly. NO drawn cell lines or labels.
Camera: the same original hand-painted 2D mobile RPG robot, in a consistent three-quarter view facing RIGHT. Maintain the same character scale in all 36 frames. Each cell has a stable center anchor and a foot-ground baseline at 85% of that cell height. Feet remain on that baseline; the knees, hips, torso, shoulders and arms change pose. Full helmet, antenna, arms, hands, knees and boots visible in every cell.
Spacing: robots are SMALL inside their own cells, about 55% of each cell's height. Leave obvious clear transparent padding on all sides of every character, at least 12% of cell width/height. Entire character, shield and special energy effect must remain inside the central 76% of their OWN cell. No part or effect may touch or cross another cell. Do not crop or merge frames.
Animation instruction: Draw actual NEW BODY POSES for normal attack, defense and special actions, including changes in knees, hip rotation, torso lean, shoulder rotation and arm extension. These are real sequential illustration frames, not the same standing pose with different glowing effects. Do NOT fill the sheet by duplicating a single robot pose.
FRAME ORDER, left to right, six frames per row:
ROW 1 / IDLE: relaxed neutral; chest gently rises and shoulders lift; slight inhale lean; relaxed return; gentle exhale knee compression; neutral.
ROW 2 / NORMAL ATTACK: knees bend with gauntlet pulled back; planted forward lunge and torso twist; gauntlet strikes toward RIGHT; full controlled extension with torso leaning forward; elbow retracts as weight shifts back; neutral. Clearly six phases of one physical strike, feet anchored.
ROW 3 / DAMAGE: incoming impact from LEFT makes upper body flinch; shoulders recoil; torso staggers back with knees bent; low stabilizing stance; shoulders and arms return; neutral.
ROW 4 / VICTORY: chest proudly lifts; one fist rises beside helmet; head and torso lean happily into raised fist; both fists rise beside helmet; arms spread slightly in celebration; relaxed proud neutral. Keep fists wholly inside cell margins.
ROW 5 / DEFENSE: left forearm raises a compact translucent energy shield; knees lower into a defensive crouch; torso tilts forward while both arms hold the guard; shield pulses with a contained rim glow while body braces; body rises and shield lowers; neutral. Shield belongs to a temporary forearm energy projection, no permanent character redesign.
ROW 6 / SPECIAL: low stance with both hands near the chest core; torso twists as gauntlet gathers energy; deep braced stance firing a SHORT contained energy pulse toward RIGHT; residual discharge with shoulder recoil and short elbow bend; cooling recovery with knees rising; neutral.
Lighting/style: retain the reference's painted ivory ceramic, colored armor, dark graphite joints and softly brushed metal highlights, crisp readable silhouette. No floor shadow. Small effects contained inside each cell; no beams spanning a row, no detached stars or floating particles.
Constraints: EXACT 6x6 grid, EXACT 36 whole robots, transparent alpha background, uniform framing, stable baseline. No text, no numbers, no names, no grid lines, no border, no extra characters, no scenery, no watermarks. Preserve identity from the input image.
Identity to preserve from the attached image: slender athletic ivory-and-lilac/lavender android, sleek helmet with angular ear fins, bright cyan horizontal visor and cyan circular chest core, graphite articulated joints, broad boots and compact forearm energy gauntlet. Normal attack, temporary defense shield and special use CYAN/BLUE energy. Physical attack is a fast planted lunge, defense a low bent-knee guard, special a deep braced gauntlet discharge. Keep the same slim mechanical armor silhouette and visible face visor.
```

### BASTIÃO — novas poses de combate

Referência: `dist/assets/titan-sprites.png`.

```text
Use case: precise-object-edit.
Asset type: NEW production 2D robot combat animation atlas for LifeBots.
Input image: the attached previous robot sheet is an IDENTITY AND STYLE REFERENCE. Preserve that exact robot's helmet, face visor, armor design, body proportions, colors and painterly material rendering. Replace the old sheet layout with a new 6-by-6 sheet and draw the additional body poses.
Required output: SQUARE 2048x2048 transparent PNG, EXACTLY SIX COLUMNS and SIX ROWS, thirty-six uniform square cells, one whole-body robot in EACH cell. All rows contain SIX frames and all columns line up exactly. NO drawn cell lines or labels.
Camera: the same original hand-painted 2D mobile RPG robot, in a consistent three-quarter view facing RIGHT. Maintain the same character scale in all 36 frames. Each cell has a stable center anchor and a foot-ground baseline at 85% of that cell height. Feet remain on that baseline; the knees, hips, torso, shoulders and arms change pose. Full helmet, antenna, arms, hands, knees and boots visible in every cell.
Spacing: robots are SMALL inside their own cells, about 55% of each cell's height. Leave obvious clear transparent padding on all sides of every character, at least 12% of cell width/height. Entire character, shield and special energy effect must remain inside the central 76% of their OWN cell. No part or effect may touch or cross another cell. Do not crop or merge frames.
Animation instruction: Draw actual NEW BODY POSES for normal attack, defense and special actions, including changes in knees, hip rotation, torso lean, shoulder rotation and arm extension. These are real sequential illustration frames, not the same standing pose with different glowing effects. Do NOT fill the sheet by duplicating a single robot pose.
FRAME ORDER, left to right, six frames per row:
ROW 1 / IDLE: relaxed neutral; chest gently rises and shoulders lift; slight inhale lean; relaxed return; gentle exhale knee compression; neutral.
ROW 2 / NORMAL ATTACK: knees bend with gauntlet pulled back; planted forward lunge and torso twist; gauntlet strikes toward RIGHT; full controlled extension with torso leaning forward; elbow retracts as weight shifts back; neutral. Clearly six phases of one physical strike, feet anchored.
ROW 3 / DAMAGE: incoming impact from LEFT makes upper body flinch; shoulders recoil; torso staggers back with knees bent; low stabilizing stance; shoulders and arms return; neutral.
ROW 4 / VICTORY: chest proudly lifts; one fist rises beside helmet; head and torso lean happily into raised fist; both fists rise beside helmet; arms spread slightly in celebration; relaxed proud neutral. Keep fists wholly inside cell margins.
ROW 5 / DEFENSE: left forearm raises a compact translucent energy shield; knees lower into a defensive crouch; torso tilts forward while both arms hold the guard; shield pulses with a contained rim glow while body braces; body rises and shield lowers; neutral. Shield belongs to a temporary forearm energy projection, no permanent character redesign.
ROW 6 / SPECIAL: low stance with both hands near the chest core; torso twists as gauntlet gathers energy; deep braced stance firing a SHORT contained energy pulse toward RIGHT; residual discharge with shoulder recoil and short elbow bend; cooling recovery with knees rising; neutral.
Lighting/style: retain the reference's painted ivory ceramic, colored armor, dark graphite joints and softly brushed metal highlights, crisp readable silhouette. No floor shadow. Small effects contained inside each cell; no beams spanning a row, no detached stars or floating particles.
Constraints: EXACT 6x6 grid, EXACT 36 whole robots, transparent alpha background, uniform framing, stable baseline. No text, no numbers, no names, no grid lines, no border, no extra characters, no scenery, no watermarks. Preserve identity from the input image.
Identity to preserve from the attached image: broad heavy tank android with thick ivory ceramic armor, huge rounded shoulder plates, graphite waist/joints, compact helmet and warm orange horizontal visor, bright orange circular chest core, large stout boots and huge gauntlets. Normal attack, temporary defense shield and special use AMBER/ORANGE energy. Physical attack is a strong planted body twist, defense a deep compact heavy guard with a short amber shield, special a braced shoulder-cannon/gauntlet discharge supported by both knees. No new weapon separate from its existing gauntlet. Keep its bulky proportions and armor layout consistent.
```

## Prompts das correções selecionadas

Alvo: a nova imagem de 36 poses, já inspecionada; transparência preservada. As correções removeram efeitos externos e mantiveram as poses. Os PNGs finais foram copiados intactos da saída da ferramenta.

### BROTTO — remoção de efeitos e espaçamento

```text
Use case: precise-object-edit. Technical repair of the attached SIX-COLUMNS by SIX-ROWS combat animation sheet.
Preserve ALL THIRTY-SIX robot BODY POSES and the existing exact robot design, identity, colors, face, armor, limbs and painted details. Do not replace actions with a repeated standing pose.
ONE layout correction: make ALL 36 complete robots HALF their present size, with wide, clearly empty transparent space around every frame. Place each small robot within its OWN uniform 209x209 pixel cell on the unchanged 1254x1254 canvas. EXACT six equal columns and six equal rows. No row or column omitted.
Grounding: horizontal center anchor of each robot at the middle of its cell, feet planted on a consistent baseline 82% down the cell. The six row foot baselines on the canvas are approximately y=171,380,589,798,1007,1216 pixels. Every frame in that row uses the same foot baseline, including crouch/recoil/celebration. Keep all heads, raised fists, gloves and feet completely inside the central 80% of their own cell with at least 10% safe transparent padding.
REMOVE ALL EXTERNAL EFFECTS ENTIRELY: remove every projectile, beam, discharge cloud, glowing energy ball, shield bubble, shield disk, starburst, smoke, outside aura and loose colored particle. Replace their pixels with true transparency. The game engine will render these effects. Retain ONLY tiny existing lights enclosed inside the face visor, chest core and gauntlet muzzle. No energy shape may protrude outside the character's silhouette.
Keep the body's six action sequences intact: row 1 breathing/idle; row 2 physical normal attack; row 3 impact/recoil/recovery; row 4 victory; row 5 forearm guard/crouch/shield-holding BODY POSES without the visible projected energy shield; row 6 chest charging/bracing/firing/recovery BODY POSES without any energy beam.
All six figures per row must be completely visible head to toe, and SIX small full robots must be separately readable in each of SIX rows. Keep camera at three quarters facing RIGHT, same character scale in every frame. NO text, labels, border, drawn grid lines, background or floor shadow. REAL transparent alpha background. This is only sprite sizing and removal of outward effects, not a redesign or new animation.
Character identity: BROTTO, the stocky ivory/jade robot with amber eyes and tiny green antenna in the attachment.
```

### LÚMEN — remoção de efeitos e espaçamento

```text
Use case: precise-object-edit. Technical repair of the attached SIX-COLUMNS by SIX-ROWS combat animation sheet.
Preserve ALL THIRTY-SIX robot BODY POSES and the existing exact robot design, identity, colors, face, armor, limbs and painted details. Do not replace actions with a repeated standing pose.
ONE layout correction: make ALL 36 complete robots HALF their present size, with wide, clearly empty transparent space around every frame. Place each small robot within its OWN uniform 209x209 pixel cell on the unchanged 1254x1254 canvas. EXACT six equal columns and six equal rows. No row or column omitted.
Grounding: horizontal center anchor of each robot at the middle of its cell, feet planted on a consistent baseline 82% down the cell. The six row foot baselines on the canvas are approximately y=171,380,589,798,1007,1216 pixels. Every frame in that row uses the same foot baseline, including crouch/recoil/celebration. Keep all heads, raised fists, gloves and feet completely inside the central 80% of their own cell with at least 10% safe transparent padding.
REMOVE ALL EXTERNAL EFFECTS ENTIRELY: remove every projectile, beam, discharge cloud, glowing energy ball, shield bubble, shield disk, starburst, smoke, outside aura and loose colored particle. Replace their pixels with true transparency. The game engine will render these effects. Retain ONLY tiny existing lights enclosed inside the face visor, chest core and gauntlet muzzle. No energy shape may protrude outside the character's silhouette.
Keep the body's six action sequences intact: row 1 breathing/idle; row 2 physical normal attack; row 3 impact/recoil/recovery; row 4 victory; row 5 forearm guard/crouch/shield-holding BODY POSES without the visible projected energy shield; row 6 chest charging/bracing/firing/recovery BODY POSES without any energy beam.
All six figures per row must be completely visible head to toe, and SIX small full robots must be separately readable in each of SIX rows. Keep camera at three quarters facing RIGHT, same character scale in every frame. NO text, labels, border, drawn grid lines, background or floor shadow. REAL transparent alpha background. This is only sprite sizing and removal of outward effects, not a redesign or new animation.
Character identity: LÚMEN, the slender ivory/lilac robot with cyan visor and angular helmet fins in the attachment.
```

### BASTIÃO — remoção de efeitos e espaçamento

```text
Use case: precise-object-edit. Technical repair of the attached SIX-COLUMNS by SIX-ROWS combat animation sheet.
Preserve ALL THIRTY-SIX robot BODY POSES and the existing exact robot design, identity, colors, face, armor, limbs and painted details. Do not replace actions with a repeated standing pose.
ONE layout correction: make ALL 36 complete robots HALF their present size, with wide, clearly empty transparent space around every frame. Place each small robot within its OWN uniform 209x209 pixel cell on the unchanged 1254x1254 canvas. EXACT six equal columns and six equal rows. No row or column omitted.
Grounding: horizontal center anchor of each robot at the middle of its cell, feet planted on a consistent baseline 82% down the cell. The six row foot baselines on the canvas are approximately y=171,380,589,798,1007,1216 pixels. Every frame in that row uses the same foot baseline, including crouch/recoil/celebration. Keep all heads, raised fists, gloves and feet completely inside the central 80% of their own cell with at least 10% safe transparent padding.
REMOVE ALL EXTERNAL EFFECTS ENTIRELY: remove every projectile, beam, discharge cloud, glowing energy ball, shield bubble, shield disk, starburst, smoke, outside aura and loose colored particle. Replace their pixels with true transparency. The game engine will render these effects. Retain ONLY tiny existing lights enclosed inside the face visor, chest core and gauntlet muzzle. No energy shape may protrude outside the character's silhouette.
Keep the body's six action sequences intact: row 1 breathing/idle; row 2 physical normal attack; row 3 impact/recoil/recovery; row 4 victory; row 5 forearm guard/crouch/shield-holding BODY POSES without the visible projected energy shield; row 6 chest charging/bracing/firing/recovery BODY POSES without any energy beam.
All six figures per row must be completely visible head to toe, and SIX small full robots must be separately readable in each of SIX rows. Keep camera at three quarters facing RIGHT, same character scale in every frame. NO text, labels, border, drawn grid lines, background or floor shadow. REAL transparent alpha background. This is only sprite sizing and removal of outward effects, not a redesign or new animation.
Character identity: BASTIÃO, the bulky ivory/graphite tank robot with orange visor and massive shoulder plates in the attachment.
```
