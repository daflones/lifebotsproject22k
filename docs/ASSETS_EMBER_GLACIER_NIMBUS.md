# LifeBots — EMBER, GLACIER e NIMBUS

Três robôs originais em arte pintada 2D, gerados com a ferramenta integrada `image_gen`, com PNG e WebP transparentes para animação. MOSS e VOLT foram inspecionados para manter o estilo de cerâmica clara, juntas de grafite e visores expressivos. EMBER e GLACIER receberam correções de composição para manter o desenho dentro de cada frame. Os rascunhos anteriores foram retirados do diretório do projeto. Só estes assets e este documento foram alterados.

## Arquivos finais

Caminhos relativos à raiz `/workspace/sites/liferobots`.

| Modelo | Classe | Arquivo | Dimensões reais | Formato | Bytes |
| --- | --- | --- | --- | --- | --- |
| EMBER-04 | striker | `dist/assets/ember-sprites.png` | 1254 × 1254 | PNG RGBA | 989002 |
| EMBER-04 | striker | `dist/assets/ember-sprites.webp` | 1254 × 1254 | WebP RGBA, qualidade 90 | 247398 |
| GLACIER-05 | guardian | `dist/assets/glacier-sprites.png` | 1254 × 1254 | PNG RGBA | 1133207 |
| GLACIER-05 | guardian | `dist/assets/glacier-sprites.webp` | 1254 × 1254 | WebP RGBA, qualidade 90 | 259522 |
| NIMBUS-06 | explorer | `dist/assets/nimbus-sprites.png` | 1254 × 1254 | PNG RGBA | 1890880 |
| NIMBUS-06 | explorer | `dist/assets/nimbus-sprites.webp` | 1254 × 1254 | WebP RGBA, qualidade 90 | 410882 |

A ferramenta retornou **1254 × 1254 px** para todos os atlas, apesar da solicitação inicial de 1024 × 1024. Cada arquivo tem **4 colunas × 4 linhas**, com 16 quadros quadrados e células nominais de **313,5 × 313,5 px**. Usar coordenadas normalizadas ou fracionárias, sem arredondar o tamanho nominal de cada célula isoladamente.

## Estados e integração

| Linha, índice iniciado em zero | Estado | Quatro colunas, da esquerda para a direita |
| --- | --- | --- |
| 0 | `idle` | repouso, respiração/compressão leve, repouso, elevação leve |
| 1 | `attack` | preparação, carga no punho, golpe à direita, recuperação |
| 2 | `hit` | susto, compressão, recuo, recuperação |
| 3 | `victory` | orgulho, um punho levantado, dois punhos levantados, repouso orgulhoso |

Os personagens ficam em vista de três quartos para a direita. O emissor de energia permanece contido na manopla; EMBER mantém as orelhas e cauda mecânica, GLACIER mantém os cristais ligados à armadura, NIMBUS mantém as aletas compactas.

Para CSS: `background-size: 400% 400%`, posições de cada eixo `0%`, `33.333333%`, `66.666667%`, `100%`. Índice linear: `linha * 4 + coluna`. Para Canvas: `sx = coluna * largura / 4`, `sy = linha * altura / 4`, `sw = largura / 4`, `sh = altura / 4`. Espelhar o elemento permite exibir o oponente à esquerda.

EMBER e GLACIER possuem padding maior após a correção; a área transparente do quadro não representa o tamanho físico do robô. Se o catálogo exigir a mesma altura aparente dos personagens, considerar o tamanho do corpo ao escolher a escala do elemento. Não modificar a grade de recorte para obter esta escala.

## Inspeção e resultados de QA

Todos os resultados selecionados foram carregados via `view_image` e inspecionados. As quatro linhas de estado e as quatro colunas permanecem presentes, os personagens inteiros, sem texto, rótulo ou borda desenhada. A correção removeu os cortes de pés de EMBER e a invasão das manoplas de ataque de EMBER/GLACIER.

| Modelo | Margem mínima em todos os lados dos 16 frames, alpha ≥ 16 | Resultado |
| --- | --- | --- |
| EMBER-04 | 31 px, cerca de 9,9% da célula | corpo, pés, orelhas, cauda e manopla dentro do frame |
| GLACIER-05 | 46 px, cerca de 14,7% da célula | corpo, cristais e manopla dentro do frame |
| NIMBUS-06 | 4 px | todas as poses principais dentro do frame original |

EMBER e GLACIER superam a margem solicitada de 8% para os pixels visíveis avaliados. O processamento de transparência da ferramenta deixa alguns pixels residuais de alpha **1–15** fora dessas margens; o canal foi preservado integralmente. Esses pixels fracos não correspondem a partes cortadas do corpo nas imagens inspecionadas. O PNG original de NIMBUS já cabia nos quadros e foi preservado.

Os três PNGs possuem alpha real de **0 a 255**. Os derivativos WebP têm dimensões idênticas e canal alpha **exatamente igual pixel a pixel** ao seu PNG final. Os três WebP somam **917.802 bytes**, comparados com **4.013.089 bytes** de PNG.

| Modelo | Pixels totalmente transparentes no PNG final |
| --- | --- |
| EMBER-04 | 76.62% |
| GLACIER-05 | 73.15% |
| NIMBUS-06 | 54.88% |

## Conversão WebP

Conversão com ImageMagick, preservando dimensão, grade e alpha, sem resize ou corte:

```bash
convert dist/assets/ember-sprites.png -define webp:alpha-quality=100 -quality 90 dist/assets/ember-sprites.webp
convert dist/assets/glacier-sprites.png -define webp:alpha-quality=100 -quality 90 dist/assets/glacier-sprites.webp
convert dist/assets/nimbus-sprites.png -define webp:alpha-quality=100 -quality 90 dist/assets/nimbus-sprites.webp
```

O canal RGB usa compressão com perdas de qualidade 90. O alpha foi comparado com Pillow apenas em leitura e permaneceu exatamente igual. Nenhum script Python foi usado para alterar a arte.

## Prompts originais

As gerações iniciais foram chamadas separadamente, uma por robô. Transparência solicitada em todas: `true`. Os textos abaixo preservam os prompts integrais.

### EMBER-04 — geração original

```text
Use case: stylized-concept.
Asset type: finished original character animation sprite atlas for LifeBots, premium hand-painted 2D mobile robot RPG.
Primary request: exactly SIXTEEN full-body drawings of ONE identical robot, arranged in exactly FOUR equal columns and FOUR equal rows on a square 1024x1024 transparent PNG. Each of the sixteen invisible grid cells is 256x256 pixels. Do not draw cell lines.
Style: polished cartoon science-fiction game concept art, sharp clean painted outline, softly brushed ceramic and metal highlights, dark graphite mechanical joints, a friendly expressive visor, lightly worn armor, large readable hands and boots. Cohesive with a small ivory-and-jade expedition android and sleek ivory-and-lilac android. Three-quarter view toward the RIGHT. Camera, robot identity, scale and armor details remain identical in all frames.
Composition: center the whole robot in each invisible cell. Keep feet on a consistent baseline at 87% of each cell's height. The resting robot should occupy ONLY about 65% of the cell's height and no more than 60% of its width. All action poses, limbs, ears, fins, crystals and tail must remain inside the central 80% of their OWN cell, with substantial clear transparent padding separating adjacent sprites. The entire character is visible head to toe in each cell. Do not crop any character. No pose may overlap another cell.
Frames, left to right:
ROW 1 (idle): neutral stance; slight breathing compression; neutral stance; slight gentle rise. Very small differences.
ROW 2 (attack): ready the right gauntlet; bring gauntlet forward and glow its central inset; short controlled punch toward the RIGHT with light contained inside the gauntlet; recover stance. No long projectile, beam or loose particles.
ROW 3 (damage): flinch from a hit arriving from the LEFT; crouch briefly; lean back slightly; recover to stance. No stars, no separate hit graphic.
ROW 4 (victory): proud pose; one fist lifted next to the helmet; both fists lifted beside the helmet; relaxed confident pose. Fists stay below the top of the head so they fit fully in the cell.
Lighting: painted game-character shading with a consistent warm upper-left highlight and clear softly shaded armor volume.
Constraints: exact four-by-four equal grid, sixteen complete sprites only, actual transparent alpha around every character. NO background, NO ground, NO shadows on a floor, NO labels, NO names, NO text, NO numbers, NO logos, NO grid lines, NO border, NO detached effects, NO extra character, NO characters crossing cell boundaries. Square 1024x1024.
Robot design: EMBER-04, an agile FOX-INSPIRED humanoid striker android with a playful fox-shaped helmet, two compact triangular fox ears, a small pointed mechanical muzzle plate, warm amber eye shapes in a dark visor. Rich burnt-orange and coral armor with ivory inset plates and graphite articulated joints. A bright amber-orange FIRE CORE glows inside a circular chest window, completely enclosed in metal; absolutely no exterior flames. Slender athletic proportions and stout large gauntlets/boots. One short chunky mechanical fox tail curls close behind its left hip, completely contained within each cell. Every frame preserves the same two ears and curled tail. The gauntlet light in the attack row is warm orange and contained. Entirely mechanical, no biological fur, no human, no animal companion.
```

### GLACIER-05 — geração original

```text
Use case: stylized-concept.
Asset type: finished original character animation sprite atlas for LifeBots, premium hand-painted 2D mobile robot RPG.
Primary request: exactly SIXTEEN full-body drawings of ONE identical robot, arranged in exactly FOUR equal columns and FOUR equal rows on a square 1024x1024 transparent PNG. Each of the sixteen invisible grid cells is 256x256 pixels. Do not draw cell lines.
Style: polished cartoon science-fiction game concept art, sharp clean painted outline, softly brushed ceramic and metal highlights, dark graphite mechanical joints, a friendly expressive visor, lightly worn armor, large readable hands and boots. Cohesive with a small ivory-and-jade expedition android and sleek ivory-and-lilac android. Three-quarter view toward the RIGHT. Camera, robot identity, scale and armor details remain identical in all frames.
Composition: center the whole robot in each invisible cell. Keep feet on a consistent baseline at 87% of each cell's height. The resting robot should occupy ONLY about 65% of the cell's height and no more than 60% of its width. All action poses, limbs, ears, fins, crystals and tail must remain inside the central 80% of their OWN cell, with substantial clear transparent padding separating adjacent sprites. The entire character is visible head to toe in each cell. Do not crop any character. No pose may overlap another cell.
Frames, left to right:
ROW 1 (idle): neutral stance; slight breathing compression; neutral stance; slight gentle rise. Very small differences.
ROW 2 (attack): ready the right gauntlet; bring gauntlet forward and glow its central inset; short controlled punch toward the RIGHT with light contained inside the gauntlet; recover stance. No long projectile, beam or loose particles.
ROW 3 (damage): flinch from a hit arriving from the LEFT; crouch briefly; lean back slightly; recover to stance. No stars, no separate hit graphic.
ROW 4 (victory): proud pose; one fist lifted next to the helmet; both fists lifted beside the helmet; relaxed confident pose. Fists stay below the top of the head so they fit fully in the cell.
Lighting: painted game-character shading with a consistent warm upper-left highlight and clear softly shaded armor volume.
Constraints: exact four-by-four equal grid, sixteen complete sprites only, actual transparent alpha around every character. NO background, NO ground, NO shadows on a floor, NO labels, NO names, NO text, NO numbers, NO logos, NO grid lines, NO border, NO detached effects, NO extra character, NO characters crossing cell boundaries. Square 1024x1024.
Robot design: GLACIER-05, a broad heavy guardian android in ICE-BLUE and cold ivory-white ceramic armor, dark graphite joints and softly luminous pale-cyan eye visor. Rounded sturdy helmet, wide torso with a shield-like chest plate and a bright icy cyan core. Broad gauntlets and heavy boot soles. A few compact solid translucent ice-blue protective CRYSTALS are integrated into each shoulder plate and forearm armor, forming short beveled angular accents rather than sharp protruding spikes. Crystals remain attached to the armor in every frame, with no floating shards. Friendly formidable defender silhouette. Compact guard punch in attack row with pale-blue light contained inside the gauntlet. Keep the broad silhouette fully within each individual grid cell and never enlarge it between frames.
```

### NIMBUS-06 — geração original

```text
Use case: stylized-concept.
Asset type: finished original character animation sprite atlas for LifeBots, premium hand-painted 2D mobile robot RPG.
Primary request: exactly SIXTEEN full-body drawings of ONE identical robot, arranged in exactly FOUR equal columns and FOUR equal rows on a square 1024x1024 transparent PNG. Each of the sixteen invisible grid cells is 256x256 pixels. Do not draw cell lines.
Style: polished cartoon science-fiction game concept art, sharp clean painted outline, softly brushed ceramic and metal highlights, dark graphite mechanical joints, a friendly expressive visor, lightly worn armor, large readable hands and boots. Cohesive with a small ivory-and-jade expedition android and sleek ivory-and-lilac android. Three-quarter view toward the RIGHT. Camera, robot identity, scale and armor details remain identical in all frames.
Composition: center the whole robot in each invisible cell. Keep feet on a consistent baseline at 87% of each cell's height. The resting robot should occupy ONLY about 65% of the cell's height and no more than 60% of its width. All action poses, limbs, ears, fins, crystals and tail must remain inside the central 80% of their OWN cell, with substantial clear transparent padding separating adjacent sprites. The entire character is visible head to toe in each cell. Do not crop any character. No pose may overlap another cell.
Frames, left to right:
ROW 1 (idle): neutral stance; slight breathing compression; neutral stance; slight gentle rise. Very small differences.
ROW 2 (attack): ready the right gauntlet; bring gauntlet forward and glow its central inset; short controlled punch toward the RIGHT with light contained inside the gauntlet; recover stance. No long projectile, beam or loose particles.
ROW 3 (damage): flinch from a hit arriving from the LEFT; crouch briefly; lean back slightly; recover to stance. No stars, no separate hit graphic.
ROW 4 (victory): proud pose; one fist lifted next to the helmet; both fists lifted beside the helmet; relaxed confident pose. Fists stay below the top of the head so they fit fully in the cell.
Lighting: painted game-character shading with a consistent warm upper-left highlight and clear softly shaded armor volume.
Constraints: exact four-by-four equal grid, sixteen complete sprites only, actual transparent alpha around every character. NO background, NO ground, NO shadows on a floor, NO labels, NO names, NO text, NO numbers, NO logos, NO grid lines, NO border, NO detached effects, NO extra character, NO characters crossing cell boundaries. Square 1024x1024.
Robot design: NIMBUS-06, a small charming expedition android with SKY-BLUE and warm CREAM armor, dark graphite joints and friendly bright cyan eyes in a dark rounded visor. Rounded youthful helmet and tiny compact antenna. A pair of short streamlined WIND FINS on the sides of the helmet and small folded aerodynamic fins on the shoulder plates, all firmly attached and well within the robot's silhouette. Large rounded cream boots with blue toes, small sturdy hands, a pale-cyan compact chest core. A calm cheerful explorer personality with softly rounded shapes. No wings extended, no jets, no smoke or wind trails; folded fins remain compact in every frame. The attack gauntlet has a pale-blue light contained inside it.
```

## Correções selecionadas para os arquivos finais

As correções usaram o PNG original do robô como `referenced_image_paths`, após inspeção, com `transparent_background: true`. O primeiro ensaio de ajuste de layout não foi selecionado; os prompts abaixo geraram os PNGs finais que passaram na inspeção e no teste de margem. Os ensaios ficam apenas no scratch e não integram o ZIP.

### EMBER-04 — margem e enquadramento finais

Alvo inspecionado: `dist/assets/ember-sprites.png` da geração inicial.

```text
Use case: precise-object-edit. Edit the attached transparent robot animation sheet.
Make ONLY ONE technical change: reduce every one of its sixteen robot drawings to HALF its current size, then place that small robot exactly at the CENTER of its own invisible square cell. Keep the entire original square canvas unchanged. Keep exactly FOUR ROWS and FOUR COLUMNS of sixteen equal square cells.
There must be LARGE, OBVIOUS, EMPTY TRANSPARENT GAPS above, below, left and right of EVERY robot. Keep an empty transparent margin of at least 15% of each cell on all sides. Feet, ears, tail, fists, crystals and all armor must stay inside this margin, even in action poses. Do not enlarge the canvas or shift the rows. All four row centers must be at 12.5%, 37.5%, 62.5%, 87.5% of the canvas height. All four column centers must be at 12.5%, 37.5%, 62.5%, 87.5% of the canvas width.
Preserve exactly the same painted robot identities, color palettes, face expressions and poses in their original frame order: top row idle, second row attack, third row hurt, fourth row victory. No redesign. No new armor or accessories. Remove all stray particles and glow clouds outside the characters; keep only the lights enclosed in the chest and gauntlet.
Transparent alpha background. No ground, no shadows, no text, no labels, no drawn grid lines, no borders. The result should clearly show sixteen SMALL full-body robots separated by wide transparent gaps.
Preserve the original orange and coral fox android, two ears, curled mechanical tail, amber visor/chest core, ivory and graphite components.
```

### GLACIER-05 — margem e enquadramento finais

Alvo inspecionado: `dist/assets/glacier-sprites.png` da geração inicial.

```text
Use case: precise-object-edit. Edit the attached transparent robot animation sheet.
Make ONLY ONE technical change: reduce every one of its sixteen robot drawings to HALF its current size, then place that small robot exactly at the CENTER of its own invisible square cell. Keep the entire original square canvas unchanged. Keep exactly FOUR ROWS and FOUR COLUMNS of sixteen equal square cells.
There must be LARGE, OBVIOUS, EMPTY TRANSPARENT GAPS above, below, left and right of EVERY robot. Keep an empty transparent margin of at least 15% of each cell on all sides. Feet, ears, tail, fists, crystals and all armor must stay inside this margin, even in action poses. Do not enlarge the canvas or shift the rows. All four row centers must be at 12.5%, 37.5%, 62.5%, 87.5% of the canvas height. All four column centers must be at 12.5%, 37.5%, 62.5%, 87.5% of the canvas width.
Preserve exactly the same painted robot identities, color palettes, face expressions and poses in their original frame order: top row idle, second row attack, third row hurt, fourth row victory. No redesign. No new armor or accessories. Remove all stray particles and glow clouds outside the characters; keep only the lights enclosed in the chest and gauntlet.
Transparent alpha background. No ground, no shadows, no text, no labels, no drawn grid lines, no borders. The result should clearly show sixteen SMALL full-body robots separated by wide transparent gaps.
Preserve the original heavy ice-blue and white guardian android, attached shoulder crystals, cyan visor/chest core, ivory and graphite components.
```
