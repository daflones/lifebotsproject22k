# LifeBots — artes individuais de equipamentos

Criadas em 12/10/2026 para a expansão 0.4. A ferramenta integrada `image_gen` foi usada em sete gerações individuais e oito correções de enquadramento. Nenhuma imagem foi criada como sheet, desenhada por código ou obtida de terceiros. Os PNGs originais das novas artes foram copiados para o projeto; os assets anteriores continuam preservados.

## Arquivos finais

Todos os arquivos estão em `dist/assets/`. Cada nome na tabela corresponde a um PNG original e um WebP derivado, ambos **1254 × 1254 px**. PNG em RGBA, faixa de alpha 0–255. O WebP é lossless, qualidade de esforço 90, método 6, mantendo o alpha exatamente igual ao original.

| Nome base | Identidade | Menor margem visível | Bytes PNG | Bytes WebP |
| --- | --- | --- | --- | --- |
| `magnetic-arm-v2` | Braço magnético: prata, bobinas de cobre e punho articulado | 16,91% | 717.833 | 447.154 |
| `kinetic-shield-v2` | Escudo cinético: disco de energia ciano e placa metálica central | 17,15% | 927.828 | 624.710 |
| `quantum-reactor-v2` | Reator quântico: cubo violeta em anéis giroscópicos | 15,15% | 802.114 | 520.470 |
| `ignition-core` | Núcleo de ignição: coração de fornalha laranja em casca de cobre | 16,83% | 1.094.383 | 741.824 |
| `glacial-barrier` | Barreira glacial: escudo triangular com cristais de gelo | 20,57% | 663.284 | 444.856 |
| `pulsar-blade` | Lâmina pulsar: lâmina magenta com encaixe de antebraço | 18,58% | 457.920 | 274.968 |
| `orbital-reactor` | Reator orbital: anéis dourados com painéis solares azuis | 22,41% | 430.328 | 296.106 |

Total dos sete PNGs: **5.093.690 bytes**. Total dos sete WebPs lossless: **3.350.088 bytes** (34,23% menores). Derivação com Pillow: `image.save(webp, 'WEBP', lossless=True, quality=90, method=6, exact=True)`. A derivação não alterou enquadramento, desenho, dimensões ou cores da imagem original.

## Conferência final

As imagens retornadas pela ferramenta foram inspecionadas visualmente uma a uma. São peças completas, sem corpo de robô, cenário, chão, texto ou marca-d'água. Materiais pintados, contornos fortes e brilho contido seguem a direção de arte de `plasma-core.png` e dos robôs já existentes. O escudo cinético é circular; a barreira glacial é triangular; o reator quântico usa um cubo; o orbital tem painéis solares. A diferença de silhueta evita que esses itens pareçam versões recoloridas da mesma peça.

A conferência automatizada confirmou tamanho quadrado maior que 1024 px, modo RGBA, alpha 0–255 e igualdade pixel a pixel entre o alpha do PNG e do WebP. As margens na tabela foram medidas pelo bounding box de pixels com alpha acima de 16/255, que representa o objeto visível. A geração também contém alguns pixels de baixíssima opacidade fora desse limite; foram preservados para manter o alpha original. Nenhuma parte visível toca os limites do canvas. As primeiras tentativas foram corrigidas pelo próprio imagegen para caber com folga; o reator orbital recebeu duas correções porque suas asas deixaram a primeira versão muito larga.

Somente estas artes e este documento foram adicionados nesta tarefa. A integração de imagens no catálogo, nos formulários e nas listas é feita pelo código do projeto; esta tarefa não mudou JS, CSS, SQL, commit ou publicação.

## Prompts de geração

Transparência solicitada: `transparent_background: true` em todas as chamadas. Os prompts foram enviados em inglês por consistência com a direção de arte anterior. Os assets existentes foram inspecionados como referência visual; não foram alvos dessas gerações.

### magnetic-arm-v2.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 70% of the image, leaving at least 15% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one detachable articulated robot magnetic arm with a broad silver shoulder mount, copper electromagnetic coil around the wrist, graphite elbow joints and a heavy clenched silver gauntlet. The arm bends diagonally into a compact boomerang-like silhouette, all sections structurally connected. Small cyan magnetic strips on the copper wrist ring. Silver and burnished copper dominate, distinctly industrial rather than green ceramic.
```

### kinetic-shield-v2.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 60% of the image, leaving at least 20% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one complete circular kinetic energy shield, almost front-facing with a slight three-quarter tilt. A bright cyan translucent circular energy membrane sits inside a thick segmented stainless-steel rim with small bronze fasteners. A compact chunky central metal plate projects visibly forward, with a triangular cyan power lens. Restrained radial circuit ribs within the membrane. A bold DISC silhouette with no hexagonal outline, no blade, no separate base.
```

### quantum-reactor-v2.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 60% of the image, leaving at least 20% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one quantum robot reactor built from a small luminous VIOLET CUBE suspended inside three interlocking silver gyroscopic rings with restrained brass joints. The cube floats at the center and has bright lavender beveled edges and dark violet faces. The nested rings are tilted at different angles, structurally mounted to a compact graphite triangular socket integrated at the bottom. Unmistakable cube-and-rings silhouette, not a cylindrical canister and not a spherical plasma orb.
```

### ignition-core.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 60% of the image, leaving at least 20% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one compact ignition core for a furnace robot, a thick angular graphite and copper engine housing surrounding a glowing molten-orange crystalline HEART-shaped center behind a small shielded furnace window. Four broad copper cooling fins and two integrated dark exhaust vents form a rugged hexagonal outline. Orange magma-like grooves remain contained inside the central core. All parts belong to a single solid component, no flames outside the equipment.
```

### glacial-barrier.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 60% of the image, leaving at least 20% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one complete TRIANGULAR glacial robot shield with a sharp broad triangular silhouette. Three thick translucent ice-crystal facets converge at a pale blue diamond core. Silver-white mechanical corner clamps and a dark graphite backing visibly support the icy surface. Uneven frosted edges and refracted cool cyan light, crystalline rather than smooth energy membrane. Slight three-quarter view. No circular outline, no handle projecting outside the boundary.
```

### pulsar-blade.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 60% of the image, leaving at least 20% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one complete detachable forearm pulsar blade module, long diagonal silhouette rising from bottom-left to top-right. A compact silver and graphite mechanical arm socket supports a single sharp elongated MAGENTA luminous blade with a dark violet spine and bright pink bevel. Angular forward-cut tip and a small recessed cyan power detail in the arm mount. Elegant attack equipment, one cohesive weapon, no human hand, no second blade, no sword handle, glow confined to blade edges.
```

### orbital-reactor.png

```text
Use case: stylized-concept.
Asset type: one individual transparent inventory equipment illustration for LifeBots, an original premium mobile robot RPG.
Style/medium: polished hand-painted 2.5D sci-fi game art, crisp dark contour, broad readable silhouette, subtle brushed metal texture, warm ivory/silver highlights and charcoal mechanical joints, expressive chunky forms matching friendly expedition robots. It must remain recognizable as a tiny shop icon.
Composition/framing: one complete self-contained object centered on a square canvas at least 1024x1024. Three-quarter product view. The entire object including every glow fits inside the central 60% of the image, leaving at least 20% clear transparent padding on EVERY side.
Scene/backdrop: genuinely transparent alpha background, no background color.
Constraints: only ONE equipment object, not a sprite sheet. No robot body, no human, no ground, no pedestal, no scenery, no ground shadow, no floating decorative particles, no text, letters, numerals, logo or watermark. Keep energy effects within the silhouette; preserve clean transparent margins.
Subject: one compact satellite-like orbital robot reactor, a distinct wide GOLDEN engine module with two short rectangular navy-blue solar panel wings on its sides. A warm white-blue energy nucleus sits in a brushed gold housing, crossed by two thick tilted gold orbital rings anchored into the same housing. The wide panel wings form a unique horizontal silhouette; the gold rings are physical mechanical parts, not decorative particles. Small graphite connector at the base is integrated into the module. No purple cube, no cylindrical canister.
```

## Prompts de correção

### Braço magnético — uma correção de margem

Alvo: a geração anterior do braço, já inspecionada. `referenced_image_paths` foi usado para incluir somente essa imagem.

```text
Use case: precise-object-edit.
Asset type: transparent inventory icon for LifeBots.
The attached image is the edit target. Change ONLY framing: make the SAME silver-and-copper magnetic robot arm smaller inside the square canvas. Keep the exact subject, paint style, shape, details, color and angle unchanged. Preserve genuinely transparent alpha background.
The entire visible object must occupy no more than 68% of the square canvas width and height, with a CLEAR transparent margin of at least 16% on all four sides. The top shoulder joint and bottom gauntlet must be well away from every edge. Center the whole arm both horizontally and vertically.
No new parts, no background, no floor, no shadow, no text. Square canvas at least 1024x1024.
```

### Margem geral — seis correções individuais

O mesmo prompt abaixo foi aplicado uma vez, em chamadas separadas, ao escudo cinético, reator quântico, núcleo de ignição, barreira glacial, lâmina pulsar e reator orbital. Em cada chamada, o único alvo foi o PNG anterior da peça correspondente, já inspecionado.

```text
Use case: precise-object-edit.
Asset type: one individual transparent inventory illustration for LifeBots.
The attached image is the edit target. Change ONLY framing: make the exact SAME equipment object smaller inside the square canvas. Preserve its shape, mechanical details, paint style, materials, palette, light, angle and silhouette. Do not add or remove components.
Center the complete object both horizontally and vertically. It must occupy no more than 65% of square canvas width and height. Leave at least 17.5% CLEAR genuinely transparent alpha padding on all four sides; keep the entire shape and every glow well away from the canvas edges.
No background, no color behind the object, no floor, no ground shadow, no letters, no symbols, no watermark. Keep the same square resolution, at least 1024x1024.
```

### Reator orbital — segunda correção de margem

Alvo: somente a primeira versão corrigida do reator orbital, já inspecionada.

```text
Use case: precise-object-edit.
This transparent LifeBots equipment illustration is the edit target. Change framing only. Make the exact same GOLDEN ORBITAL REACTOR, including BOTH of its solar-panel wings, significantly smaller on the square canvas. Preserve its design, panel shapes, metal texture, colors, painting style, light and three-quarter angle.
The ENTIRE combined object from the leftmost solar panel to the rightmost solar panel must fit inside the CENTRAL 55% of total canvas WIDTH. Not only the core: count both wings in this bounding box. Put the object's bounding-box center exactly at the canvas center. At least 22.5% of the square canvas on the LEFT and RIGHT must be completely empty and genuinely transparent, and at least 20% empty transparent margin at top and bottom.
Keep the same square resolution at least 1024x1024. No background, no floor, no ground shadow, no new details, no particles, no text. Remove stray floating specks outside the equipment. Preserve transparent alpha.
```
