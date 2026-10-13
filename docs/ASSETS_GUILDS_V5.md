# Cenários de guerras de guildas — LifeBots 0.5

Criados em 12/10/2026 com a ferramenta `imagegen` built-in, uma chamada por imagem. As referências visuais do hangar, ruínas e campos de batalha do próprio projeto foram utilizadas como base de acabamento: ilustração 2D/2.5D de RPG móvel, materiais detalhados, perspectiva frontal levemente elevada e camadas de profundidade. Não foram substituídos assets anteriores.

| Cenário | PNG original | WebP otimizado | Dimensões | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|
| Cânion | `dist/assets/guild-canyon.png` | `dist/assets/guild-canyon.webp` | 1536 × 1024 RGB | 3018019 | 248050 |
| Boreal | `dist/assets/guild-boreal.png` | `dist/assets/guild-boreal.webp` | 1536 × 1024 RGB | 3211691 | 262950 |

PNG original preservado. WebP derivado com ImageMagick `convert`, qualidade 85, sem redimensionamento. As dimensões entre originais e derivados foram verificadas. Total PNG: 6.229.710 bytes; total WebP: 511.000 bytes, aproximadamente 91,8% menor. Os arquivos são opacos, sem transparência.

## Inspeção visual

- **Cânion:** fortaleza robótica de dourado/cobre com infraestrutura teal, ponte e farol ao fundo, bandeiras de tecido sem letras ou símbolos e três áreas adjacentes de piso delimitadas por juntas metálicas. As três plataformas têm a mesma altura, sem buracos ou obstáculos entre elas. O primeiro plano fica livre para equipes e duelos. A iluminação quente distingue este mapa dos campos noturnos e glaciais.
- **Boreal:** bastião noturno de gelo e aço, torres de cristal, aurora, braseiros de energia ciano nas bordas e ponte de combate larga. O piso central fica livre, com geada e reflexos suaves. Obstáculos e trilhos permanecem nas margens, permitindo sobreposição de sprites e efeitos.
- Os dois originais foram vistos e não possuem personagens, robôs, criaturas, textos, logos ou interface. A inspeção dos assets não incluiu navegador nem verificação de recortes em telas reais.

São fundos estáticos para composição pela interface. Os mapas, objetivos, zonas de domínio, bandeiras de guildas, equipes, personagens, efeitos, movimento ambiental e informações devem ser sobrepostos no código. Para recortes verticais, usar foco central e manter o piso suficientemente visível; estes campos também podem ser mostrados em cards panorâmicos de seleção.

## Prompts finais

### Fortaleza do Cânion — guild-canyon

```text
Use case: stylized-concept.
Asset type: original 2.5D premium mobile RPG guild-war battlefield environment, opaque landscape 1536x1024 pixels.
Primary request: LifeBots guild fortress in a vast golden canyon with teal technology and three spacious combat platforms.
Scene/backdrop: a magnificent robotic fortress built into towering honey-gold canyon walls, weathered copper and graphite steel bastions, arched bridges connecting distant terraces, a teal energy lighthouse as a small architectural beacon in the rear, slender unmarked fabric banners along the distant fortress wall. Banners must be plain cloth without letters, icons or markings. Canyon layers and a softly luminous desert sky create strong atmospheric distance. Teal conduits wind along the side walls.
Style/medium: polished painterly 2D/2.5D mobile science-fiction RPG illustration, carefully designed worn metal and rock surfaces, subtle outlines, cinematic lighting and atmospheric layering coherent with futuristic robot hangar and ancient ruins. Rich environment art, not a photograph.
Composition/framing: fixed slightly elevated chest-height camera looking toward the distant fortress over a broad horizontal foreground terrace. Low-middle horizon around40%height. Entire lower55%is EMPTY safe solid combat ground, divided subtly into three large adjoining steel-and-stone platform areas by inset seams, arranged left center and right, all on the SAME level with no gaps, holes, rails or steps through the fighting area. No drawn objective targets or UI indicators. These adjoining platforms must provide wide unobstructed silhouette space for multiple character sprites that will be added later. Keep rock props, machines, banners and towers far behind or at extreme sides; no foreground obstruction. Centered phone crop remains usable.
Lighting/mood: adventure and coordinated conquest, honey gold canyon, bronze, dark graphite, restrained teal technology, warm late-afternoon sky and cool canyon shadows; broad shapes readable beneath sprite overlays.
Constraints: background environment only. Absolutely no robots, people, creatures, vehicles, weapons, chests, coins, flags with symbols, text, letters, numbers, icons, logos, watermark, interface, bars, frames, borders or transparency. Landscape1536x1024.
```

### Bastião Boreal — guild-boreal

```text
Use case: stylized-concept.
Asset type: original 2.5D premium mobile RPG guild-war battlefield environment, opaque landscape 1536x1024 pixels.
Primary request: LifeBots nighttime glacial bastion reached by a very broad battle bridge, crystal towers and cyan energy braziers.
Scene/backdrop: a majestic frozen robotic fortress beneath a dark indigo polar sky with soft distant boreal aurora, tall ice-and-crystal watchtowers integrated with frost-covered sci-fi steel, a commanding gate behind the bridge, snowy cliffs descending into a mist-filled chasm far beyond the side edges. Small contained cyan energy flames rise from stone-and-steel braziers along the extreme far sides, no smoke or flame obstructs the foreground. Ice glows softly around tower bases; distant bridges and frozen walls separate layers of depth.
Style/medium: premium painterly 2D/2.5D mobile science-fiction adventure RPG illustration, restrained outlines and designed geometry, elegant icy materials, dramatic but readable cinematic atmosphere coherent with illustrated futuristic robot hangar and frozen ruins, not photographic.
Composition/framing: fixed slightly elevated chest-height camera looking along a VERY BROAD solid horizontal battle bridge towards the distant fortress. Low-middle horizon around40%height. Entire lower55%and center form a spacious EMPTY frost-sheened steel bridge deck suitable for guild teams or duels, with quiet plate seams and gentle reflections. Bridge must read as a wide plaza, not a narrow walkway. Any side rails, tower structures, crystals, braziers and snowdrifts stay at extreme image edges or behind the fighting plane, never crossing central character silhouettes. No spikes, props, holes or steps in the combat area. Wide free sprite positions across foreground; centered mobile crop preserves usable floor and fortress.
Lighting/mood: cobalt, navy indigo, blue ice and cool cyan, a few warm muted gold architectural lights, heroic guild defense in the polar night, rich depth and readable foreground rather than featureless darkness.
Constraints: background environment only. Absolutely no robots, people, creatures, silhouettes, vehicles, weapons, chests, coins, text, letters, numbers, symbols, icons, logos, watermark, UI, bars, frames, borders or transparency. Landscape1536x1024.
```
