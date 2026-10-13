# LifeBots — elementos da campanha v0.4

Criados em 12/10/2026 para o mapa interativo e as explicações do modo história. São três imagens originais distintas, cada uma gerada em uma chamada separada pelo `image_gen.imagegen` com `transparent_background: true`. Não reutilizam o avatar MOSS, o logo, a peça Plasma Core ou uma moeda como imagem de outro item.

## Arquivos

Todos os arquivos estão em `dist/assets/`, com canvas quadrado de 1254 × 1254 px e transparência real. Os PNG preservam as imagens geradas. Os WebP são os derivados recomendados para a interface.

| Nome | Função visual | PNG original | WebP | Menor margem WebP* |
| --- | --- | ---: | ---: | ---: |
| `map-beacon` | Farol compacto de exploração, torre clara com lâmpada ciano e base hexagonal | 913.378 bytes | 66.348 bytes | 13,9% |
| `reward-chest` | Baú robótico aberto, moedas douradas e azuis sem letras | 1.955.766 bytes | 171.274 bytes | 12,6% |
| `nexa-guide` | Busto exclusivo da assistente NEXA, visor LED amistoso e antenas em aletas | 1.079.612 bytes | 95.356 bytes | 13,3% |

*Margens medidas pela caixa de pixels com alpha ≥ 16. Os originais têm margens mínimas de 7,6%, 6,1% e 6,9%, respectivamente, com todos os elementos inteiros. Para garantir folga acima de 12% no arquivo usado pela UI, a exportação WebP reduz proporcionalmente a arte a 85% e a centraliza em canvas transparente de mesmo tamanho. Nenhum elemento foi recortado ou redesenhado.

PNG originais: 3.948.756 bytes. WebP para uso na UI: 332.978 bytes. Exportação com ImageMagick, qualidade 86 e alpha-quality 100; alpha preservado com extremos 0 e 255.

## Estilo e uso

As referências locais `plasma-core.png`, `game-mark.png` e `robotcoin.png` foram inspecionadas apenas para coerência de materiais: arte 2.5D pintada, metais chanfrados, esmalte turquesa, marfim, dourado e iluminação ciano. Cada novo elemento tem silhueta e função próprias.

- Farol: marcador ou interação de exploração. Pulsação e brilho devem ser adicionados por CSS, sem animação raster embutida.
- Baú: recompensa e pontos interativos do mapa; não representa um novo preço ou uma promessa de rendimento.
- NEXA: retrato da guia nos diálogos e instruções, com imagem própria em lugar de um robô do catálogo.

Use `object-fit: contain` ou imagem de fundo com `contain`; não ampliar com `cover`, que elimina a margem de segurança. Manter movimentos discretos, respeitando `prefers-reduced-motion`.

## Verificação

Inspeção visual dos três resultados completos e dos WebP exportados em miniaturas de 72 × 72 px sobre fundo escuro (#10282b) e claro (#ece6d5). Farol, baú e NEXA permanecem distintos; lâmpada, moedas e visor são reconhecíveis. Não há letras, marcas d'água, chão ou cenário incorporado. Todas as partes estão inteiras e separadas do fundo por alpha. Essa revisão é dos arquivos de arte; posicionamento e interação finais dependem da integração da interface.

## Prompts completos

### map-beacon.png

```text
Use case: stylized-concept. Asset type: one original mobile game map prop for LifeBots. Create ONE compact futuristic signal beacon tower, small metallic cylindrical tower with a broad grounded hexagonal base, cream ivory and brushed charcoal armor, turquoise insets, warm polished gold rings and a luminous cyan glass lamp at the top. Its lamp looks ready to pulse, but this is one still image. Friendly adventurous science-fiction mobile RPG style, richly painted 2.5D illustration with crisp polished bevels, readable simple silhouette at 72 pixels, slight three-quarter isometric view, soft hand-painted shading, controlled sharp highlights. All parts are intact and fully visible, centered in a square canvas, at least 12 percent transparent empty padding on every edge, only one tower. No long antenna poles or huge glow streaks. Genuine transparent background and clean alpha edges. No floor, no setting, no pedestal beyond the tower's integrated base, no lettering, no numbers, no text, no watermark, no UI frame. Keep visual hierarchy bold: lamp, short tower body, broad base.
```

### reward-chest.png

```text
Use case: stylized-concept. Asset type: one original reward chest prop for the LifeBots mobile RPG map. Create ONE open robotic treasure chest, chunky rich turquoise enamel body, charcoal metal structural panels, thick polished gold hinges and large gold gear emblem on the front with a glowing cyan circular center. The open rounded lid and full chest are wholly visible. A full generous pile of gold mechanical coins and blue silver mechanical coins shines from inside, with just three coins lifted slightly above the opening, all contained within the chest's compact silhouette. Coins use gear and glowing core symbols, absolutely no letters or numbers. Premium adventurous sci-fi mobile RPG artwork, polished hand-painted 2.5D render, expressive beveled geometry, slight three-quarter view, strong readable shape at 72px. Gold and cool cyan highlights against brushed charcoal. Centered square composition with at least 12 percent transparent empty margin on all sides. Genuine transparent background and clean alpha edges. No floor, no landscape, no scattered ground items, no text, no captions, no UI frame, no watermark. Keep visual identity distinct from a battery or robot.
```

### nexa-guide.png

```text
Use case: stylized-concept. Asset type: original small companion avatar for NEXA, the friendly holographic assistant in the LifeBots sci-fi mobile RPG. Create ONE unique nonhuman female-coded android guide bust, a compact floating droid with a broad rounded diamond-shaped head, expressive dark LED visor showing two clear cyan glowing crescent eyes and a tiny friendly cyan smile, two short asymmetric wing-shaped antenna fins, sleek pearlescent white and deep turquoise armor, tiny gold accent details, rounded shoulders and a small circular cyan holographic core on the upper chest. Upper torso and head fully visible; no legs. A thin, short segmented holographic ring at the base hints at a projection, restrained cyan translucency near the bottom, fully opaque readable face and armor. Elegant, friendly and clever, not humanoid flesh, no hair, no human skin, no realistic woman, distinctly different from a green combat robot or yellow robot mascot. Original polished hand-painted 2.5D mobile game illustration, strong bold silhouette legible at 72px, soft sculpted bevels and cyan highlights, slight three-quarter turn while looking directly at the viewer. Center the complete bust in a square canvas with at least 12 percent genuinely transparent empty padding on every side. Clean alpha edges. No backdrop, no floor, no outer circle frame, no lettering, no title, no numbers, no watermark, no UI elements, no huge glow rays. Keep face as primary focal point.
```
