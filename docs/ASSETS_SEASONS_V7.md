# LifeBots — cenários das temporadas v0.7

Três cenários originais criados em 12/10/2026 com uma chamada individual do `image_gen.imagegen` para cada imagem, usando `transparent_background: false`. Após a restauração do checkout, os mesmos PNG originais foram recuperados em 13/10/2026. Não houve nova geração nem edição dos cenários.

## Arquivos recuperados

Diretório: `/workspace/sites/liferobots/dist/assets/`. Cada arquivo-base abaixo possui as extensões `.png` e `.webp`. Todos os arquivos têm **1536 × 1024 px**, proporção **3:2**, formato RGB e fundo opaco.

| Arquivo-base | Mundo e identidade visual | PNG original | WebP sem perdas |
| --- | --- | ---: | ---: |
| `coral-reef-v7` | Ruínas tecnológicas submersas, jardins de coral e água turquesa com raios, bolhas e caustics | 3.127.487 bytes | 2.343.100 bytes |
| `clock-city-v7` | Cidade steampunk de torres-relógio, engrenagens e pontes sob céu âmbar | 3.145.658 bytes | 2.354.040 bytes |
| `memory-garden-v7` | Jardim noturno de cogumelos, cristais luminosos e raízes mecânicas em azul, violeta e ciano | 3.252.380 bytes | 2.385.932 bytes |

Os PNG foram copiados sem alterações. Os WebP atuais são **integrais e sem perdas**, sem corte, redimensionamento ou padding. Exportação com ImageMagick: `webp:lossless=true`, `webp:exact=true`, `webp:method=6` e qualidade 100.

Total dos PNG: 9.525.525 bytes. Total dos WebP sem perdas: 7.083.072 bytes. A exportação atual substitui a anterior com perdas de qualidade 86.

## Fontes preservadas

Os originais foram recuperados de `/workspace/scratch/21d12283ab44/generated_images/`:

| Cenário | Arquivo original de geração |
| --- | --- |
| `coral-reef-v7` | `exec-a91a54f1-9688-46a6-aa9c-3cc34b106de4.png` |
| `clock-city-v7` | `exec-85f28829-11ef-4e4f-a338-d67625214e91.png` |
| `memory-garden-v7` | `exec-2fe22429-9036-4cc1-b018-bfd0f65bdd35.png` |

## Composição e referências

Na criação, foram inspecionados `sector-frost.png`, `sector-ember.png` e `sector-sky.png` como referências de continuidade: ilustração de RPG mobile, arquitetura tecnológica, detalhes pintados, materiais luminosos e plano de combate amplo. Cada novo mundo tem ambiente, paleta e elementos próprios.

Todos apresentam três camadas: silhuetas e atmosfera ao fundo, arquitetura ou jardins no plano intermediário, e uma área livre no primeiro plano. O terço inferior é plano e sem obstáculos para os robôs. O chão possui textura e iluminação. Relógios usam ponteiros e marcadores geométricos, sem numerais.

As imagens não contêm personagens, UI, textos, logotipos, bordas ou marcas d'água. Bolhas, vapor e outros movimentos devem ser adicionados pela interface; os arquivos são cenários estáticos.

## QA da recuperação

- Os seis arquivos foram abertos e suas dimensões verificadas: 1536 × 1024 px.
- As cópias PNG são idênticas aos originais, confirmado por SHA-256.
- Os WebP decodificados foram comparados com os PNG em todos os pixels RGB: **igualdade exata nos três cenários**.
- Não houve corte, redimensionamento, mudança de cor, geração nova ou edição dos originais.
- Durante a criação, os cenários completos e seus derivados foram inspecionados em 390 × 260 px: mundos distintos, profundidade e terço inferior livre. A recuperação sem perdas mantém exatamente os pixels originais.

A revisão cobre as artes e os arquivos. Posição dos robôs, barras, efeitos e recorte final devem ser conferidos na integração da interface. Animações devem respeitar `prefers-reduced-motion`.

## Prompts completos usados na criação original

### coral-reef-v7.png

```text
Use case: stylized-concept. Asset type: original wide landscape battle background for LifeBots, a polished 2D mobile adventure RPG. Create a breathtaking submerged technological ruin with overgrown coral gardens in an ocean of deep turquoise water. Ancient ivory and charcoal robotic architecture with soft cyan power lines, broken futuristic arches, domed ruins and distant spires, pink-orange branching coral, purple sea plants and mineral formations frame the LEFT and RIGHT edges. Bright sunbeams stream diagonally from the water surface high above, tiny bubbles and suspended particles create depth. Three clearly separated layers: atmospheric distant drowned skyline, richly detailed middle-distance ruins and coral, and a low broad foreground combat platform. The whole lower third must be a CLEAN, FLAT, EMPTY submerged stone-and-metal terrace spanning left to right, gentle turquoise caustic patterns only, unobstructed center and both combatant standing positions, no rocks or plants in this playable band. Camera at a slightly raised horizontal RPG side battle angle, horizon in the upper half, strong sweeping perspective. Wide landscape 3:2 composition, full-bleed image, richly detailed hand-painted 2D fantasy-science-fiction illustration, painterly materials, readable shapes, soft atmospheric perspective, luminous mobile game aesthetic. Distinct underwater mood, not an ice landscape. No robots, no people, no creatures or fish, no characters, no UI, no text, no lettering, no numbers, no logo, no watermark, no border. Opaque background.
```

### clock-city-v7.png

```text
Use case: stylized-concept. Asset type: original wide landscape battle background for LifeBots, a polished 2D mobile adventure RPG. Create a magnificent steampunk city of clocks beneath a glowing AMBER SKY at late afternoon. Elaborate copper and aged-brass clock towers, visible giant gears, domed mechanical workshops, bridges, narrow balconies and distant ornate rooftops; warm golden light through light drifting steam. Clock faces have clear simple clock hands and ring markers ONLY, no numerals or lettering. Distinct Victorian-industrial city, not a desert, no canyon. Three layers of depth: hazy distant clock skyline against amber clouds, richly detailed medium-distance towers and bridges, and a broad foreground combat plaza. City architecture frames the left and right sides; one majestic clock tower rises near the upper center distance. The WHOLE LOWER THIRD is a CLEAN, FLAT, EMPTY copper-and-stone battle plaza spanning left to right, elegant shallow metal inlays and smooth cobblestone texture, no boxes, gears, pipes, furniture or obstacles in the playable band; unobstructed center and both combatant standing positions. Camera at a slightly raised horizontal RPG side battle angle, horizon in the upper half, rich but readable shapes and atmospheric perspective. Wide landscape 3:2 composition, full-bleed image, highly detailed hand-painted 2D fantasy-science-fiction illustration, painterly textures and luminous mobile game polish, brass-gold and warm amber palette with small cyan power accents. No robots, no people, no animals, no characters, no UI, no text, no letters, no numbers, no logos, no watermark, no border. Opaque background.
```

### memory-garden-v7.png

```text
Use case: stylized-concept. Asset type: original wide landscape battle background for LifeBots, a polished 2D mobile adventure RPG. Create the MEMORY GARDEN, an enchanting luminous garden at NIGHT where nature and ancient robotic roots intertwine. Towering dark tree trunks with elegant subtle mechanical cables and segmented metal roots, glowing turquoise and violet mushroom clusters, crystalline mineral blossoms, small pink-lavender luminous flowers, weathered ivory technological shrines hidden among foliage. A soft star-filled navy sky and distant moonlight shine through the canopy. Three layered planes: dim distant forest and faint technological ruins, richly detailed luminous mushroom gardens and ancient tree roots in middle distance, and a broad flat foreground battle clearing. Trees, crystals, and luminous mushrooms frame only the LEFT and RIGHT sides and the rear; the WHOLE LOWER THIRD must be a CLEAN, FLAT, EMPTY clearing of smooth dark moss-covered stone and a few shallow blue geometric inlays, spanning left to right, no plants, crystals, mushrooms, rocks or roots obstructing the playable band. Unobstructed center and both combatant standing positions. Soft cyan light paints the floor edges; gentle violet atmosphere, emerald foliage, no harsh white bloom across the empty ground. Camera at a slightly raised horizontal RPG side battle angle, layered depth and atmospheric perspective. Wide landscape 3:2 composition, full-bleed, highly detailed hand-painted 2D fantasy-science-fiction illustration, painterly textures and inviting polished mobile game aesthetic. Unique magical botanical nighttime world, not a city, not an underwater scene. No robots, no people, no creatures, no characters, no UI, no text, no words, no lettering, no numbers, no logo, no watermark, no border. Opaque background.
```
