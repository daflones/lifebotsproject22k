# LifeBots — emblema do jogo

Emblema original gerado com a ferramenta integrada `image_gen`, com rosto de robô chibi e moldura de engrenagem. O rosto marfim/jade e os olhos dourados com reflexos ciano formam o elemento principal; o pequeno núcleo ciano no pescoço é secundário. A arte não contém nome, frase, letras ou números. A tipografia LifeBots deve ser aplicada pelo aplicativo.

## Arquivos finais

| Caminho relativo à raiz do projeto | Dimensões reais | Formato | Bytes |
| --- | --- | --- | --- |
| `dist/assets/game-mark.png` | 1254 × 1254 | PNG RGBA transparente | 1597241 |
| `dist/assets/game-mark.webp` | 1254 × 1254 | WebP RGBA transparente, qualidade 90 | 164000 |

A ferramenta retornou 1254 × 1254 px apesar dos 1024 × 1024 px pedidos no primeiro prompt. O PNG original e sua versão WebP têm as mesmas dimensões. A arte inicial recebeu apenas uma correção de escala e posicionamento para obter o padding adequado, sem redesign.

## QA visual e transparência

O PNG final foi carregado via `view_image`. Foram criados previews de QA de **50 × 50 px** e **120 × 120 px** apenas no scratch e também inspecionados. Em 50 px, a moldura de engrenagem e os dois olhos continuam reconhecíveis; em 120 px, as placas cerâmicas e o núcleo têm leitura mais clara. A expressão permanece simpática nos dois tamanhos.

Todo o emblema, inclusive dentes da engrenagem e antena, fica dentro do canvas, sem cortes. A arte usa metal dourado, jade/teal, marfim e grafite, coerente com os robôs e as moedas do jogo.

Margens medidas com pixels de alpha ≥ 16:

| Borda | Margem | Percentual do canvas |
| --- | --- | --- |
| Esquerda | 92 px | 7.34% |
| Superior | 121 px | 9.65% |
| Direita | 90 px | 7.18% |
| Inferior | 100 px | 7.97% |

Essas margens atendem ao intervalo solicitado de 6 a 10%. O PNG possui alpha de 0 a 255. O processamento da ferramenta pode deixar pixels muito fracos de alpha 1–15 fora da margem visível; o canal foi preservado integralmente. A comparação PNG/WebP confirmou alpha **exatamente igual pixel a pixel**, sem resize ou corte do arquivo publicado. O RGB usa compressão com perdas na qualidade 90.

## Conversão e uso

```bash
convert dist/assets/game-mark.png -define webp:alpha-quality=100 -quality 90 dist/assets/game-mark.webp
```

Este arquivo é um emblema individual, sem grade de sprites. Usar `object-fit: contain` e proporção 1:1. O arquivo final não possui fundo e pode ser colocado sobre a barra superior, login ou navegação. Os previews menores servem só para inspeção e não substituem o PNG/WebP final.

## Prompt de geração original

Transparência solicitada: `true`. Ferramenta integrada, sem CLI/API externo. Uma arte por chamada.

```text
Use case: logo-brand.
Asset type: original standalone game emblem for LifeBots, premium mobile robot RPG, transparent PNG.
Primary request: a polished memorable emblem centered on one friendly CHIBI ROBOT FACE inside a chunky metallic gear frame. Only the emblem, NO WORDS and NO LETTERS.
Subject: an ivory ceramic robot helmet with compact jade-teal side plates and a dark graphite/navy face visor. Two large expressive friendly eyes glow warm golden amber, each with a restrained cyan inner reflection. Small rounded ear modules and a tiny short antenna, large softly rounded head proportions. The face is the dominant recognizable shape. A very small glowing energy core at the lower helmet/neck coupling contains an abstract angular lightning-like cutout, secondary and subtle, not a written letter.
Frame: a bold circular mechanical gear with eight thick rounded teeth, deep gold metal beveled edges and teal enamel inset segments. The robot head overlaps the ring slightly for a strong game badge silhouette. The ring should look like a real piece of painted mechanical equipment rather than a flat decorative wreath.
Style: original hand-painted 2D/cartoon science-fiction RPG game art, crisp silhouette and broad confident contour, polished ceramic highlights, warm gold and jade teal accents, graphite mechanical recesses. Cohesive with friendly ivory-and-jade expedition robots. Rich but simple enough to stay recognizable at 50px. Friendly capable expression, not aggressive.
Composition: square 1024x1024 canvas, almost perfectly front-facing symmetrical badge with subtle painted depth. Complete emblem visible and centered. Fill about 84% of the canvas; keep a SMALL but clean transparent margin of 6 to 10% on all four sides, including all gear teeth and antenna. No part clipped.
Lighting: controlled warm metallic highlights and small cyan/gold eye glow contained inside the visor. No exterior glow clouds or particles.
Constraints: REAL transparent alpha everywhere outside the badge. No background, no backdrop, no floor, no shadows cast onto a ground plane, no floating extra ornaments, no scenery, no watermark, no interface, no typography, no written text, no labels, no digits, no border around the canvas. One complete emblem only. Avoid generic standalone lightning logo; robot face and metallic gear are the main motifs.
```

## Prompt da correção de padding

Alvo: o PNG da geração original, inspecionado e passado em `referenced_image_paths`. Transparência solicitada: `true`.

```text
Use case: precise-object-edit. Edit the attached transparent game emblem.
Change ONLY the size of the complete emblem within the canvas: scale the entire emblem uniformly to 90% of its present size, keeping it exactly centered on the same square canvas. This adds a clean transparent margin of approximately 7% around all four sides.
Preserve the robot face, friendly glowing gold-cyan eyes, ivory ceramic armor, jade teal plates, gold-and-teal gear frame, antenna, small cyan core, every existing shape, all material painting and colors exactly. No redesign or changed proportions. No new detail. No new text or letter.
The output must contain the same complete emblem, now slightly smaller within an unchanged square canvas, with TRUE transparent alpha around it. Keep all gear teeth and antenna fully visible. No background, no floor, no shadow, no glow cloud, no border, no typography.
```
