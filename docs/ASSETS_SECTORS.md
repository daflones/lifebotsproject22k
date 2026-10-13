# Cenários de campanha do LifeBots

Criados em 12/10/2026 com `imagegen` built-in, uma chamada por cenário. O asset existente `dist/assets/hangar.png` foi inspecionado para manter o acabamento ilustrado 2D/2.5D, perspectivas e áreas de piso coerentes. Os quatro cenários são novos, gerados com prompts próprios, sem personagens, textos ou elementos de interface.

| Cenário | Original | Derivada otimizada | Dimensões | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|
| EMBER | `dist/assets/sector-ember.png` | `dist/assets/sector-ember.webp` | 1536 × 1024 RGB | 2746744 | 212890 |
| FROST | `dist/assets/sector-frost.png` | `dist/assets/sector-frost.webp` | 1536 × 1024 RGB | 2988218 | 232076 |
| SKY | `dist/assets/sector-sky.png` | `dist/assets/sector-sky.webp` | 1536 × 1024 RGB | 2496709 | 159284 |
| SPACE | `dist/assets/sector-space.png` | `dist/assets/sector-space.webp` | 1536 × 1024 RGB | 2602511 | 153514 |

PNG original preservado. WebP codificado com ImageMagick `convert`, qualidade 90, sem redimensionar. As dimensões de original e derivada foram verificadas. Todos os arquivos são opacos (sem alpha transparente), conforme a solicitação.

A inspeção visual dos quatro resultados confirmou paletas distintas, estilo consistente com o hangar, ausência de personagens e textos, piso amplo no centro e na metade inferior para sobrepor sprites. A cena SPACE contém arcos/estruturas da estação ao fundo, sem naves. Para recortes verticais no celular, manter o foco central para preservar a área livre do piso. Estes são cenários estáticos; efeitos ambientais e movimento ficam a cargo da interface. A tarefa de assets não incluiu execução no navegador.

## EMBER

Deserto de cobre e forja industrial sob um céu âmbar.

Prompt final:

```text
Use case: stylized-concept.
Asset type: original 2D/2.5D sci-fi mobile RPG campaign battlefield background, landscape 1536 × 1024 pixels, ratio 3:2, opaque image.
Primary request: LifeBots campaign sector EMBER, a copper desert forge.
Scene/backdrop: a vast warm copper desert with distant canyon mesas and ochre dunes beneath a luminous amber sunset sky. A futuristic robot forge yard built of aged dark graphite steel and burnished copper frames the left and right edges, with compact furnaces, pipes, foundry towers, amber vents, and a few unmarked metal crates. Distant industrial bridges and small furnace chimneys belong to the scenery, not characters.
Style/medium: premium illustrated 2D/2.5D RPG game environment, painterly cel-shaded science fiction, clean detailed surfaces, atmospheric depth, rich restrained outlines, polished cinematic art coherent with a futuristic robot hangar. Beautiful warm metal reflections, no photorealistic camera look.
Composition/framing: fixed slightly elevated 3/4 camera looking across a large empty horizontal battle plaza. Horizon and distant scenery in the upper third. The center and entire lower two thirds must be a spacious EMPTY copper-and-dark-steel paved arena, broad smooth readable floor with subtle seams and reflected amber light, suitable for overlaying two large animated robot sprites. Keep all crates, machinery, pipes, terrain rocks and foliage near the extreme side edges or far background, no obstacle in the center. No foreground obstruction.
Lighting/mood: copper, ochre, graphite, molten-gold amber, late-afternoon sunset, adventurous heroic atmosphere. Small teal indicator lights can contrast with the warm palette.
Text: NONE. No words, letters, numbers, signs, logos, symbols, watermarks, UI, icons, borders, HUD.
Constraints: absolutely NO characters, robots, people, animals, weapons, coins, treasure chests or sprites. Background only. No transparency. Landscape 1536x1024.
```

## FROST

Câmara e cidade glacial azul, com cristais e neve nas bordas.

Prompt final:

```text
Use case: stylized-concept.
Asset type: original 2D/2.5D sci-fi mobile RPG campaign battlefield background, landscape 1536 × 1024 pixels, ratio 3:2, opaque image.
Primary request: LifeBots campaign sector FROST, a blue glacial chamber and frozen futuristic city.
Scene/backdrop: a luminous icy futuristic robot city, seen from a spacious frost-covered steel battle platform inside a vast open ice chamber. Towering blue crystalline ice columns and frost-coated curved sci-fi steel supports frame the extreme left and right sides. Across the distant middle background, rounded science-fiction buildings and slender crystalline spires sparkle among snowy mountains and frozen waterfalls. A pale blue winter sky and diffuse aurora hint above the distant city. No people or vehicles.
Style/medium: premium illustrated 2D/2.5D RPG game environment, painterly cel-shaded science fiction with elegant clean details, rich atmosphere and polished cinematic lighting, coherent with a futuristic robot hangar. Render ice translucent with cyan highlights and navy shadows, sophisticated soft-edged painted surfaces, not photographic.
Composition/framing: fixed slightly elevated 3/4 view across a broad EMPTY horizontal combat plaza. Keep the horizon and city in the upper third. The center and lower two thirds are a spacious uncluttered blue-gray metal-and-ice floor suitable for overlaying two animated robot sprites, with subtle tile seams, a thin smooth frost coating and soft reflections. Put ice pillars, snowdrifts, broken ice and structural features only near the extreme edges or in far background. No object, ice spike or obstacle in the center.
Lighting/mood: glacial blue, cyan, icy white, muted midnight blue, calm crystalline mystery and heroic exploration. Small blue light strips along side edges.
Text: NONE. No words, letters, numbers, signs, logos, symbols, watermarks, UI, icons, borders, HUD.
Constraints: absolutely NO characters, robots, people, animals, weapons, coins, treasure chests or sprites. Background environment only. No transparency. Landscape 1536x1024.
```

## SKY

Plataformas e cidade flutuante acima de um mar de nuvens.

Prompt final:

```text
Use case: stylized-concept.
Asset type: original 2D/2.5D science-fiction mobile RPG campaign battlefield background, landscape 1536 × 1024 pixels, ratio 3:2, opaque image.
Primary request: LifeBots campaign sector SKY, floating platforms above a sea of clouds.
Scene/backdrop: a breathtaking futuristic floating city high above enormous white and pale lavender clouds. Several distant airborne islands carry sleek white-and-teal sci-fi architecture, green terraces, delicate antenna spires and curved connecting bridges. A few mechanical levitation rings and cyan energy undersides support far-background platforms. The player's battle arena is on a broad stable floating steel platform with low protective rails confined to the left/right edges. The sky is bright turquoise and gentle pale gold sunlight illuminates the clouds.
Style/medium: premium illustrated 2D/2.5D RPG game environment, sophisticated painterly cel-shaded sci-fi art, polished cinematic atmosphere, clean detailed architecture coherent with a futuristic robot hangar, rich atmospheric perspective. Beautiful adventurous sky world, not photorealistic.
Composition/framing: fixed slightly elevated 3/4 camera looking over a large empty horizontal combat deck towards the floating city. Upper third contains turquoise sky, distant islands and clouds. Center and lower two thirds form a broad EMPTY slate-blue and ivory metal floor with subtle seams and a few small cyan inset edge lights, suitable for overlaying two large animated robot sprites. Keep architectural supports, plants, railings and objects along the extreme sides or far background. No obstacle, hole, cloud covering the deck, railing or structure across the central combat area.
Lighting/mood: airy turquoise, ivory, lavender cloud shadows, teal and brushed gold metal accents, hopeful sunny exploration. Gentle readable contrasts for sprite overlays.
Text: NONE. No letters, numbers, words, signs, logos, symbols, watermarks, icons, UI, HUD, borders.
Constraints: absolutely NO characters, robots, people, animals, aircraft, weapons, coins, treasure chests or sprites. Background environment only. No transparency. Landscape 1536x1024.
```

## SPACE

Estação orbital com planeta de anéis, estrelas e nebulosa.

Prompt final:

```text
Use case: stylized-concept.
Asset type: original 2D/2.5D science-fiction mobile RPG campaign battlefield background, landscape 1536 × 1024 pixels, ratio 3:2, opaque image.
Primary request: LifeBots campaign sector SPACE, an orbital station above a luminous alien planet.
Scene/backdrop: an imposing futuristic orbital station observation hangar with a panoramic open viewport in its far wall. Through it: a spectacular blue-and-violet ringed planet, small stars, delicate nebula haze and curved orbital station structures in the distant black-blue void. Dark graphite and brushed silver architectural ribs frame the far left/right edges, with a few small unmarked wall consoles and amber light panels near the sides. The battle platform is inside the safe station, large and empty, not floating debris.
Style/medium: premium illustrated 2D/2.5D RPG environment, painterly cel-shaded science fiction, polished cinematic art coherent with a futuristic robot hangar. Crisp detailed metal surfaces, atmospheric space glow, rich lighting, high-quality videogame concept art, not photorealistic.
Composition/framing: fixed slightly elevated 3/4 camera across a spacious EMPTY horizontal metal combat deck. Planet and stellar backdrop fill the upper third. Center and entire lower two thirds must be a broad readable uncluttered silver-gray and muted navy steel floor, with subtle plate seams, soft reflected planetary light and small cyan edge strips, suitable for overlaying two animated robot sprites. All consoles, rails, cables and structural supports must stay at the extreme side edges or far background; no object or obstruction in the center. Preserve clean central silhouette space.
Lighting/mood: cosmic navy, cobalt, soft lavender, cyan, brushed silver, restrained warm amber accents. Majestic final-chapter exploration with a clear readable battle floor rather than darkness.
Text: NONE. No labels, signs, words, letters, numbers, logos, symbols, watermarks, icons, UI, HUD, borders.
Constraints: absolutely NO characters, robots, people, animals, spacecraft, weapons, coins, treasure chests or sprites. Background only. No transparency. Landscape 1536x1024.
```
