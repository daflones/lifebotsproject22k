# LifeBots — artes sociais v0.5

Criadas em 12/10/2026 para as áreas de guildas e trocas. As duas imagens são originais, produzidas individualmente pelo `image_gen.imagegen` em duas chamadas, sempre com `transparent_background: true`. Mantêm os metais chanfrados, esmalte teal, dourado e energia ciano da identidade do jogo.

## Arquivos

PNG originais preservados e WebP para a interface em `dist/assets/`. Todos são RGBA, 1254 × 1254 px e possuem alpha real, com extremos 0 e 255.

| Arquivo-base | Função | PNG original | WebP para UI | Menor margem WebP* |
| --- | --- | ---: | ---: | ---: |
| `guild-crest` | Brasão de guilda: escudo teal/dourado, duas engrenagens, asas metálicas e farol central | 1.144.906 bytes | 537.070 bytes | 15,6% |
| `trade-terminal` | Terminal de troca: console/crate com dois robôs holográficos abstratos e setas de energia | 1.296.726 bytes | 643.598 bytes | 19,7% |

*Caixa de pixels com alpha ≥ 16. As margens mínimas dos PNG gerados são 7,0% e 12,0%, respectivamente. A exportação WebP reduz a arte proporcionalmente a 80% e a centraliza em canvas transparente do mesmo tamanho, garantindo folga acima de 15% sem recortar nenhuma parte. Os PNG permanecem intactos.

Total dos originais: 2.441.632 bytes. Total dos WebP finais: 1.180.668 bytes. Exportação com ImageMagick, `webp:lossless=true`, `webp:exact=true`, qualidade 100 e `webp:alpha-quality=100`, com redução e extensão transparentes apenas para enquadramento.

## Verificação

Os resultados completos foram inspecionados visualmente. O brasão mostra dois mecanismos laterais e um farol central; as asas e o escudo estão inteiros. O terminal apresenta um holograma de cabeça redonda e outro de cabeça quadrada, com setas circulares em direções opostas. Não é um atlas e não reutiliza robôs do catálogo. Não há letras, números, marcas d'água, piso ou cenário incorporado.

Os WebP foram inspecionados em miniaturas de 72 × 72 px sobre fundo escuro (#10282b) e claro (#ece6d5). As silhuetas permanecem distintas e reconhecíveis. A revisão cobre os arquivos; tamanho, contraste e posicionamento final dependem da integração da UI.

A revisão final encontrou faixas horizontais de valores RGB em pixels com alpha 0 na exportação WebP anterior, com perdas. Os PNG originais estavam limpos. Ambos os WebP foram reexportados sem perdas a partir desses PNG, preservando os mesmos elementos, paleta, alpha e enquadramento. Os arquivos finais foram inspecionados diretamente em tamanho completo: sem faixas à direita. A comparação dos bytes RGBA decodificados com cada PNG de referência após o enquadramento confirmou igualdade exata. Os PNG originais não precisaram ser redesenhados ou substituídos.

Preferir os WebP, com `object-fit: contain` ou `background-size: contain`. Não usar `cover`, que remove a margem de segurança. Caso haja pulso de luz ou flutuação na UI, aplicar por CSS e respeitar `prefers-reduced-motion`.

## Prompts completos

### guild-crest.png

```text
Use case: stylized-concept. Asset type: ONE original transparent guild emblem icon for LifeBots, a science-fiction mobile RPG. Create a compact teal and gold mechanical shield with chunky polished gold border, deep turquoise enamel center and brushed charcoal metal bevels. Exactly two bold interlocking small golden gears flank a short central cyan signal beacon; two symmetric stylized metallic wing fins spread gently outward from the shield sides, clean readable silhouette, harmonious compact shield proportions. The beacon is a small glowing crystal lamp on a short metal column integrated into the shield. Premium hand-painted 2.5D mobile game artwork, sculpted bevels, clean specular highlights, richly colored but not over-detailed, front three-quarter angle, recognizable at 72 pixels. Square canvas 1254 by 1254. Keep the emblem centered and SMALL ENOUGH to leave at least FIFTEEN percent genuinely transparent empty padding on every side; total emblem footprint maximum seventy percent of canvas width and height. All wings and metal parts fully visible. Actual transparent alpha background, not a checkered painted backdrop. No text, no letters, no numbers, no watermark, no people, no floor, no UI border, no large beams outside the shield.
```

### trade-terminal.png

```text
Use case: stylized-concept. Asset type: ONE original robotic trade terminal icon for LifeBots, a science-fiction mobile RPG. Create a compact futuristic trading console formed like a squat octagonal teal cargo crate with charcoal metal beveled frame and polished gold corners. Exactly two short holographic projector pads sit side by side on top. Each projector emits one SIMPLE cyan abstract robot miniature, head, body and tiny limbs, fully visible: the left holographic robot has a rounded head, the right holographic robot has a square head. These are symbolic holograms only, not an existing game robot, not a sprite atlas. Two luminous cyan curved arrows circle between the two miniatures in opposite directions to suggest an exchange, clean restrained arrow shapes, readable small. Teal glass panels, warm gold accents, cool blue energy. Premium hand-painted 2.5D mobile game prop, three-quarter isometric view, strong chunky readable silhouette, consistent with a polished mechanical reward chest and gold-turquoise guild shield. Crisp bevels, rich brush shading, clear holograms, no tiny interface details. Square canvas 1254 by 1254, complete object centered, footprint no more than seventy percent of canvas width and height, at least FIFTEEN percent genuinely transparent empty padding on every side. All robot holograms and arrows stay inside that padded area. Actual clean transparent alpha backdrop. No text, no labels, no letters, no numbers, no watermark, no floor, no human hands, no surrounding scene, no outer UI frame, no enormous light rays.
```
