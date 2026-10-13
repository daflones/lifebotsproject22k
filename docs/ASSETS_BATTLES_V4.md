# Novos cenários de batalha e fundo — LifeBots 0.4

Criados em 12/10/2026 com a ferramenta `imagegen` built-in, uma chamada por imagem. As artes existentes `dist/assets/hangar.png` e `dist/assets/story-map.png` foram vistas antes da geração para manter o acabamento ilustrado de RPG móvel, o metal trabalhado, a iluminação e a profundidade de planos. As novas artes não substituem arquivos anteriores.

| Cenário | Original | Derivada | Dimensões | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|
| Aurora | `dist/assets/battle-aurora.png` | `dist/assets/battle-aurora.webp` | 1536 × 1024 RGB | 3067460 | 257744 |
| Raízes | `dist/assets/battle-roots.png` | `dist/assets/battle-roots.webp` | 1536 × 1024 RGB | 3316167 | 324884 |
| Arena | `dist/assets/battle-arena.png` | `dist/assets/battle-arena.webp` | 1536 × 1024 RGB | 3069102 | 271258 |
| Fundo geral | `dist/assets/game-backdrop.png` | `dist/assets/game-backdrop.webp` | 1024 × 1536 RGB | 2304635 | 104916 |
| Forja | `dist/assets/battle-forge.png` | `dist/assets/battle-forge.webp` | 1536 × 1024 RGB | 2786219 | 199204 |
| Cristais | `dist/assets/battle-crystal.png` | `dist/assets/battle-crystal.webp` | 1536 × 1024 RGB | 2793704 | 187012 |
| Nébula | `dist/assets/battle-nebula.png` | `dist/assets/battle-nebula.webp` | 1536 × 1024 RGB | 3021261 | 195882 |
| Obsidiana | `dist/assets/battle-obsidian.png` | `dist/assets/battle-obsidian.webp` | 1536 × 1024 RGB | 2445221 | 153366 |

PNG original preservado. WebP gerado com ImageMagick `convert`, qualidade 85, sem redimensionar. Foram confirmadas dimensões iguais entre original e derivada e ausência de transparência. Os quatro PNG somam 11.757.364 bytes; as quatro WebP somam 958.802 bytes, cerca de 91,8% menores.

A inspeção visual dos oito originais confirmou ausência de textos, logos, personagens e interface. Os sete cenários de combate possuem piso livre na metade inferior, com maquinaria, vegetação e arquibancadas restritas às bordas e ao fundo. A vista permite sobrepor sprites de jogadores e efeitos em camadas, sem personagens pré-gravados. Cada cenário tem identidade própria: aurora sobre ruínas urbanas, floresta/cachoeira de circuitos, estádio circular tecnológico. O fundo geral foi mantido escuro e com contraste baixo, mas possui estruturas mecânicas e textura material visíveis para evitar o aspecto de cor sólida.

Na expansão seguinte, quatro cenas independentes foram acrescentadas para reduzir repetições entre capítulos: forja interior com lava nas bordas, reator subterrâneo de cristais sob o gelo, plataforma cósmica com portal em uma nébula e cidadela de obsidiana/dourado sob aurora. Os quatro adicionais foram inspecionados e apresentam piso seguro, inteiro e desobstruído para sobrepor personagens, sem textos nem interface. Os oito PNG somam 22.803.769 bytes; as oito WebP somam 1.694.266 bytes, cerca de 92,6% menores.

São imagens estáticas. Animação ambiental, parallax, luzes, partículas, recortes responsivos e controles da batalha devem ser implementados pela interface. A tarefa de assets não incluiu navegação ou inspeção de geometria no navegador.

## Integração sugerida

- `battle-aurora.webp`: encontros nas ruínas urbanas e no despertar da campanha.
- `battle-roots.webp`: capítulos de floresta, raízes e regeneração.
- `battle-arena.webp`: tela de PvP/combate no estádio; as arquibancadas são pontos luminosos abstratos e não pessoas.
- `game-backdrop.webp`: fundo global sob painéis translúcidos, com `cover` e foco central. Manter legibilidade de textos com camada de sombreamento, evitando apagar completamente os detalhes.
- `battle-forge.webp`: capítulo 8, interior monumental da forja.
- `battle-crystal.webp`: capítulo 10, reator glacial subterrâneo.
- `battle-nebula.webp`: capítulos 15–16, caminhos cósmicos e portal da nébula.
- `battle-obsidian.webp`: capítulo 17, cidadela de obsidiana.
- Continuar usando os cenários EMBER, FROST, SKY e SPACE existentes para seus capítulos próprios.

## Prompts finais

### Aurora — battle-aurora

```text
Use case: stylized-concept.
Asset type: original 2.5D premium mobile RPG combat environment background, landscape 1536 x 1024 pixels, opaque.
Primary request: an immersive abandoned robot city lit by a teal and gold aurora, a new battlefield for LifeBots.
Scene/backdrop: an expansive forgotten sci-fi city with weathered steel towers, curved ancient mechanical gateways, broken bridges, distant glowing conduits and amber beacons beneath rolling turquoise aurora bands in a navy dusk sky. Metal walls and large worn pipes frame the extreme side edges. Vegetation is sparse and confined to far ruins. Atmospheric distance separates several planes of architecture.
Style/medium: polished painterly 2D/2.5D mobile adventure RPG illustration, crisp designed steel panels and restrained outlines, coherent with a warm illustrated futuristic robot hangar and island ruins, cinematic depth, no photorealistic camera look.
Composition/framing: viewpoint about chest height, slightly elevated looking across a broad horizontal plaza. Low-middle horizon at about 42 percent of frame height. The center and entire lower half must be a wide empty metal battle floor where two large character sprites will be overlaid around x=28% and x=72%. Clear central character silhouette areas; no props or obstructions there. Worn plates, tiny surface seams and subtle reflected teal light make the floor tactile but uncluttered. Surrounding ruined scenery rises behind and toward side edges. Prefer readable large masses to tiny noise. Camera facing into scene, not top-down, no orthographic grid.
Lighting/mood: adventurous mysterious twilight, deep petrol blue, desaturated graphite, teal aurora reflections and restrained warm gold lights; bright enough for combat sprites.
Constraints: background environment only. Absolutely no robots, people, creatures, cars, ships, weapons, battle effects, treasure, coins, text, letters, numbers, symbols, logos, watermarks, UI, bars, frames or borders. No transparent background. Landscape 1536x1024.
```

### Raízes — battle-roots

```text
Use case: stylized-concept.
Asset type: original 2.5D premium mobile RPG combat environment background, landscape 1536 x 1024 pixels, opaque.
Primary request: LifeBots circuit forest battlefield: ancient mechanical ruins overgrown with roots, lush canopy and a waterfall.
Scene/backdrop: a magical technological rainforest in which thick organic roots embrace weathered ivory-and-dark-steel archways, small teal circuit veins trace the buried machinery and a beautiful waterfall tumbles between distant ruined towers into a clear pool. Tall trees and dangling foliage frame the extreme left and right edges and the upper corners. Sun shafts filter through a jade canopy, tiny firefly glows only in the distant greenery.
Style/medium: premium painterly 2D/2.5D mobile adventure RPG scenery, elegant detailed but readable surfaces, polished cinematic light and atmospheric layering coherent with futuristic island ruins and a robot hangar. Rich natural texture, lightly outlined illustrative science fiction, not photo-real.
Composition/framing: fixed slightly elevated chest-height view across a wide EMPTY horizontal combat clearing. The middle-low horizon is at about 42% height. Center and entire lower half are a broad smooth weathered stone-and-steel platform, flecked subtly with moss at the extreme borders, suitable for overlaying two large robots around x=28% and x=72%. Keep waterfall, roots, trees, rocks and equipment entirely behind the fighting plane or at the extreme sides. No tree trunk or root across either central silhouette area. A few floor plate seams and soft leaf-light patterns, not a busy path. Both background and foreground should read in vertical central crop on phones.
Lighting/mood: jade, moss green, cyan circuit glows, warm sun gold, navy shadows; inviting mysterious forest exploration, plenty of depth.
Constraints: background only. Absolutely no robots, people, creatures, vehicles, weapons, battle effects, coins, treasure, text, letters, numbers, symbols, logos, watermark, UI, health bars, borders or frames. No transparency. Landscape 1536x1024.
```

### Arena — battle-arena

```text
Use case: stylized-concept.
Asset type: original 2.5D premium mobile RPG arena combat environment background, landscape 1536 x 1024 pixels, opaque.
Primary request: an immersive futuristic robot battle stadium, a new LifeBots PvP arena environment.
Scene/backdrop: a spectacular sophisticated sci-fi stadium with tiered seating made of small abstract luminous panels, not characters; glowing technological arches and strong architectural ribs curve around the stadium; large muted holographic energy sheets and suspended lamps hover high in the background, without graphics, text or labels. Electric cyan strip lights and restrained amber rings outline the upper stadium tiers. A wide engineered metal fighting ring is the central foreground.
Style/medium: premium painterly 2D/2.5D mobile science-fiction RPG illustration, designed polished graphite steel and silver plate panels, cinematic lighting, crisp readable shapes, consistent with illustrated robot hangar and island ruins; not a photographic or realistic rendering.
Composition/framing: chest-height slightly elevated view looking across a broad horizontal fighting platform toward the stadium. Low-middle horizon at about 43% frame height. Center and entire lower half must be a broad EMPTY ring floor. Wide unobstructed places for robot sprites around x=28% and x=72%. Center floor subtle concentric metal joints and reflections, with no drawn target icons or other symbols. Any railings, light towers, cables and props go to far sides or far background. No railing crosses the fighting plane. Rich upper architecture but clean sprite silhouettes. Vertical crop centered remains usable for mobile combat.
Lighting/mood: graphite, midnight petrol blue, electric turquoise, cool silver, restrained gold edge lights, heroic tournament anticipation. Luminous atmosphere without blowing out highlights.
Constraints: background environment only. Absolutely no robots, people, animals, silhouettes of audience members, vehicles, weapons, shields, battle effects, text, letters, numbers, insignias, symbols, logos, watermark, UI, bars, borders, frames or transparency. Landscape 1536x1024.
```

### Fundo geral — game-backdrop

```text
Use case: stylized-concept.
Asset type: original atmospheric background art and material texture for mobile game screens, portrait 1024 x 1536 pixels, opaque.
Primary request: an immersive subtle LifeBots background showing distant robot-city infrastructure, a hangar and mechanical towers in midnight petrol blue.
Scene/backdrop: layered science-fiction city silhouettes and a huge open industrial hangar wall with brushed steel plates, cables, conduits, structural ribs and weathered metal materials, softly visible through blue atmospheric haze. Very distant small warm beacons and a few thin teal illuminated lines show the city is alive. A suggestion of tower lights and curved futuristic architecture is visible high in the frame and at the extreme sides. Smooth overlapping metal panels and faint mist in the middle maintain visual quiet.
Style/medium: premium painterly 2D/2.5D mobile RPG environment, coherent with beautifully illustrated futuristic robot hangar and sci-fi ruins, designed crisp large mechanical surfaces softened by haze. A real illustrated environment and tactile metal texture, not a flat solid color or abstract noisy gradient.
Composition/framing: portrait 1024x1536, broad quiet central 65 percent usable beneath foreground interface panels, larger scenery details towards margins. Non-directional steel shadows, subtle dimensional seams and gentle fog separate depth planes. No isolated hero subject. No strongly contrasting object in the center. Maintain useful texture and depth even when darkened further by translucent panels. Compatible with both mobile cover crop and widescreen crop.
Lighting/mood: VERY dark midnight petroleum blue and graphite, low contrast throughout, dim teal and muted warm-gold accents, atmospheric quiet. Keep all lights restrained and soft, not pure white; surface details should remain barely but clearly visible.
Constraints: absolutely no robots, people, creatures, vehicles, weapons, coins, treasure, text, letters, numbers, logos, symbols, watermarks, UI, button shapes, borders or frames. Image is environment/material background only, no transparency. Portrait 1024x1536.
```


### Forja — battle-forge

```text
Use case: stylized-concept.
Asset type: original illustrated 2.5D mobile RPG battle environment, landscape 1536x1024 pixels, opaque.
Primary request: LifeBots monumental interior forge battlefield, entirely different from an outdoor desert.
Scene/backdrop: an enormous ancient robotic industrial furnace chamber, towering aged bronze and black iron columns on both sides, a huge molten orange reactor bowl deep in the background, low protected lava channels at the far sides, distant suspended chains and ventilation pipes, glowing furnace openings and a fine distant ember haze. Architecture implies heavy robot-engineering infrastructure, but contains no robots.
Style/medium: premium painterly 2D/2.5D science-fiction adventure mobile game environment, carefully illustrated machinery with subtly outlined edges, coherent with a detailed futuristic steel hangar and ancient island ruins. No photographic look.
Composition/framing: fixed slightly elevated chest-height camera facing across a wide horizontal fighting plaza inside the forge. The middle-low horizon at about 43% of frame height. The entire center and lower half is a broad EMPTY safe solid dark steel floor with subtle plate seams, warm orange reflections and restrained surface texture. Sprite overlay spaces at x=28% and x=72% must be entirely unobstructed, without lava holes, raised machinery or props. Lava channels stay at extreme sides well away from the fighting plane; the main furnace stays behind. Readable depth and large architectural masses. Centered vertical crop remains usable.
Lighting/mood: heroic dramatic warm orange and brass furnace glow, deep graphite shadows, aged copper highlights, soft smoky layers. Contrasting bright far furnace and readable darker foreground; no featureless blackness.
Constraints: background environment only. Absolutely no robots, people, creatures, vehicles, weapons, coins, chests, text, letters, numbers, icons, insignias, logos, watermark, UI, bars, borders or transparency. Landscape1536x1024.
```

### Cristais — battle-crystal

```text
Use case: stylized-concept.
Asset type: original illustrated 2.5D premium mobile RPG battle environment, landscape1536x1024 pixels, opaque.
Primary request: LifeBots underground crystal reactor chamber beneath a vast glacial ice vault, different from an outdoor winter city.
Scene/backdrop: a magnificent subterranean frozen cathedral of thick sapphire and translucent cyan ice, with giant crystalline growths framing the extreme sides, curved frost-covered steel supports, and a large contained glowing blue crystal reactor nestled far in the rear of the chamber. Layered frozen walls refract soft light; distant rock and ice cavern arches bring depth. Small low rails and frost-covered pipelines only near the extreme sides.
Style/medium: high-quality painterly 2D/2.5D science-fiction mobile adventure RPG scenery, sculpted designed shapes and clean illustrative details consistent with a futuristic robot hangar, polished cinematic atmosphere, subtly outlined surfaces, not photographic.
Composition/framing: fixed slightly elevated chest-height view looking over a broad flat combat platform. Low-middle horizon at43%height. Entire center and lower half must be EMPTY smooth steel plates with a thin frost sheen and subtle reflection, a safe horizontal battle floor suitable for two large overlaid robot sprites aroundx28%and72%. All crystal spikes, ice pillars, reactor machinery, cables and snowdrifts must remain behind the combat plane or on extreme margins. No large crystal, reactor core, obstruction, hole or railing crossing the central area. Preserve both central sprite silhouettes in a centered mobile crop.
Lighting/mood: crystalline blue, indigo, ice-white, restrained violet shadows, luminous cyan reactor glows; majestic chilly exploration with readable foreground.
Constraints: background environment only. No robots, people, creatures, vehicles, weapons, chests, coins, text, letters, numbers, icons, symbols, logos, watermarks, UI, bars, frames, borders or transparency. Landscape1536x1024.
```

### Nébula — battle-nebula

```text
Use case: stylized-concept.
Asset type: original illustrated 2.5D premium mobile RPG battle environment, landscape1536x1024 pixels, opaque.
Primary request: LifeBots cosmic portal platform floating in a violet nebula, entirely distinct from an enclosed orbital station.
Scene/backdrop: an ancient broad stone-and-silver metallic platform at the threshold of a vast cosmic portal, deep purple nebula clouds and delicate stars beyond. Distant colossal geometric prism monoliths suspended in the far background, curved alien structural arches along the extreme sides and a huge open circular portal rim behind the platform emitting restrained violet and teal haze. No legible symbols or carvings. The foreground floor belongs to a stable intact battle deck, not scattered debris.
Style/medium: premium painterly 2D/2.5D science-fiction adventure mobile game art, cinematic atmospheric depth and designed crisp architecture, consistent with illustrated steel robot hangar and ancient island ruins, not photographic.
Composition/framing: fixed slightly elevated chest-height camera facing across a large horizontal combat deck. Low-middle horizon around43%height. The center and entire lower half is a broad EMPTY slate-violet, silver and dark steel floor with smooth large plates, subtle reflected nebula light, a few quiet seams. Two robot sprites will later be overlaid nearx28%and72%; leave those spaces open and silhouette-friendly. Keep prisms, portal frame, supports and railings in far background or extreme sides. No crystals, holes or railing across fighting floor. No top-down view, no obstructions near center. Centered vertical crop remains usable for mobile gameplay.
Lighting/mood: cosmic purple, violet, midnight navy, silver and subtle cyan, luminous but calm, mysterious majestic late-game journey.
Constraints: scene environment only. Absolutely no robots, people, creatures, vehicles, spacecraft, weapons, coins, chests, text, letters, numbers, symbols, logos, watermarks, interface, bars, frames, borders or transparency. Landscape1536x1024.
```

### Obsidiana — battle-obsidian

```text
Use case: stylized-concept.
Asset type: original illustrated 2.5D premium mobile RPG battle environment, landscape1536x1024 pixels, opaque.
Primary request: LifeBots black obsidian citadel battlefield with antique gold architecture beneath a subtle night aurora.
Scene/backdrop: a monumental dark futuristic citadel built from carved black obsidian and graphite steel, stepped fortress towers and ancient angular arches layered across the background, narrow brushed gold insets and warm beacons illuminate their edges. The night sky is midnight indigo with a gentle emerald-gold aurora and a few dim stars. An imposing broad gateway stands far back with soft gold inner light. Large buttresses and black glass columns frame only the extreme sides.
Style/medium: premium painterly 2D/2.5D mobile science-fiction adventure RPG environment, elegant clean designed architecture with lightly illustrated edges, cinematic depth and rich material surfaces coherent with futuristic robot hangar and ancient island ruins, not photographic.
Composition/framing: slightly elevated fixed chest-height view across a broad horizontal obsidian battle terrace. Middle-low horizon about43%height. Entire center and lower half is a spacious EMPTY solid smooth dark glass-and-steel fighting floor, subtle plate seams and soft gold/aurora reflections. Overlay positions for two robot sprites aroundx28%and72% are entirely unobstructed. No pillars, debris, stairs, railings or props in the central fighting plane. Put them at extreme margins or far background. Broad readable architectural masses, useful centered vertical crop for mobile.
Lighting/mood: majestic endgame fortress, midnight black-blue obsidian, muted indigo, brushed antique gold and a restrained green aurora, noble ominous but foreground readable rather than featureless black.
Constraints: background environment only. Absolutely no robots, people, creatures, vehicles, weapons, chests, coins, text, letters, numbers, signs, symbols, insignia, logos, watermark, UI, bars, borders, frames or transparency. Landscape1536x1024.
```
