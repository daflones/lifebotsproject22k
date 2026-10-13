# Animações de combate astral — LifeBots 0.6

Criadas em 12/10/2026 com `imagegen` built-in em modo de edição. As referências originais `dist/assets/orbit-sprites.png`, `nova-sprites.png` e `onyx-sprites.png` foram inspecionadas antes da geração. Foram desenhadas novas fases de movimento, preservando identidade, cores, armadura, direção 3/4 à direita e acabamento ilustrado 2.5D. Os três atlases antigos permanecem intactos.

| Modelo | Original novo | Derivada lossless | Dimensões | Quadros | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|---:|
| KEPLER | `dist/assets/orbit-combat-v6.png` | `dist/assets/orbit-combat-v6.webp` | 1254 × 1254 RGBA | 36 | 2594316 | 1941990 |
| PRISMA | `dist/assets/nova-combat-v6.png` | `dist/assets/nova-combat-v6.webp` | 1254 × 1254 RGBA | 36 | 1778967 | 1330068 |
| ÉREBO | `dist/assets/onyx-combat-v6.png` | `dist/assets/onyx-combat-v6.webp` | 1254 × 1254 RGBA | 36 | 1789112 | 1323666 |

Os PNG foram copiados dos resultados selecionados sem remonte, desenho, repetição de quadros ou corte por código. As WebP foram codificadas com Pillow `lossless=True`, `exact=True`, `method=6`, sem redimensionamento. A comparação RGBA de todos os pixels por `numpy.array_equal` confirmou igualdade integral de original e derivada, incluindo alpha. Total PNG: 6.162.395 bytes; total WebP: 4.595.724 bytes.

## Reprodução e coordenadas

O manifest `docs/COMBAT_V6_STARS_FRAMES.json` contém, por modelo, `asset`, `width`, `height` e 36 registros `frames`. As coordenadas `x`, `y`, `width`, `height` são retângulos absolutos no PNG. `anchorX` e `anchorY` também são **coordenadas absolutas**, correspondentes ao centro/base dos pés do corpo. `asset` aponta para o PNG em `assets/`; a WebP preserva exatamente a mesma geometria. Quatro quadros de KEPLER possuem ainda `clipPath`, um path SVG com coordenadas absolutas e somente comandos `M`, `L` e `Z`, para usar com `clipPathUnits="userSpaceOnUse"`.

| Linha semântica (`row`) | Movimento | Seis fases |
|---|---|---|
| 0 | Idle | respiração/servos e variações de peso/ombros/cabeça |
| 1 | Ataque normal | prepara, avança, golpe, extensão, recolhe, neutro |
| 2 | Dano | impacto, recuo, cambaleio, estabiliza, volta, neutro |
| 3 | Vitória | gesto ao peito, um braço, dois braços, celebração, baixa, neutro |
| 4 | Defesa | ergue guarda, abaixa, bloqueia, firma postura, baixa, neutro |
| 5 | Especial | carrega núcleo, prepara corpo, aponta braços, descarrega, recupera, neutro |

O gerador produziu 36 poses por modelo em seis agrupamentos visuais, mas espaçamento e baselines não são matematicamente uniformes. Portanto, a interface deve usar os retângulos do manifest e âncoras dos pés, em vez de dividir cegamente o PNG em células de 209 px.

No KEPLER, a ordem física das duas últimas linhas é **especial e defesa**. O manifest já as converteu para a ordem semântica uniforme: `row=4` defesa nova da faixa inferior e `row=5` especial da faixa anterior. A defesa foi gerada em escala física menor para caber na faixa disponível; a reprodução prevista usa ampliação de 1,28×, com âncora dos pés, sem tocar os pixels. A ampliação é uma escolha de metadado/código de reprodução do projeto.

## Inspeção e limites

- Os três resultados finais foram vistos. Ataques, recuos, celebrações e guardas possuem alterações de braços, torso, joelhos e postura; a mudança não depende somente de partículas sobre um desenho parado.
- 36 componentes conectados grandes de corpo foram identificados em cada alpha, total de 108 corpos completos. Cada par `(row,column)` de 0 a 5 aparece uma vez por modelo. Bboxes e âncoras foram verificados dentro dos limites dos PNG.
- Capacetes/chifres/antenas, braços, pernas e os dois pés estão presentes nas poses finais. A última linha de KEPLER termina antes da borda inferior; há 2 px de margem após o corpo.
- Os efeitos externos de primeiras tentativas foram retirados. Os resultados selecionados usam corpos e apenas brilho localizado em olhos, núcleo ou mãos. Feixes, projéteis, trilhas, impactos, escudos e partículas pertencem à animação do jogo.
- Houve resultados preliminares com sobreposição de efeitos e uma tentativa de KEPLER com 30 corpos. Foram descartados e não foram copiados para os nomes finais. A versão final recebeu seis poses novas de defesa via `imagegen`.
- Em quatro regiões próximas de KEPLER, os retângulos de um corpo envolviam pequenas pontas de um vizinho, mesmo com corpos separados. Esses quadros receberam `clipPath` como contorno do componente do próprio corpo: dano colunas 1 e 2, defesa coluna 0 e especial coluna 0. O contorno considera alpha acima de 32, expande aproximadamente 2 px para antialias/brilho pequeno, remove a região dos corpos vizinhos e preserva todos os pixels do componente principal. A geometria contém somente `M/L/Z`, contornos fechados e coordenadas absolutas. Foi verificado que a máscara preserva o corpo principal e não inclui os outros componentes. O manifest completo ocupa 44.270 bytes. Nenhum PNG foi alterado, recortado ou remontado; o recorte ocorre na reprodução SVG.
- Não houve execução de browser nem QA de geometria da tela. A implementação da reprodução e dos efeitos fica sob responsabilidade da integração do projeto.

## Referências de identidade

- `orbit-sprites.png`: KEPLER: astronauta de cerâmica marfim e dourado, visor escuro com olhos ciano, antena orbital e mochila compacta.
- `nova-sprites.png`: PRISMA: armadura violeta/magenta, aletas angulares no capacete, olhos ciano e núcleo de plasma magenta.
- `onyx-sprites.png`: ÉREBO: colosso rinoceronte de obsidiana e dourado, chifre dourado, placas pesadas, olhos âmbar e núcleo alaranjado.

## Prompt de limpeza/poses compartilhado

Prompt final compartilhado aplicado às variações, usando cada referência como alvo em chamadas separadas:

```text
Edit this transparent robot sprite atlas into a properly spaced clean BODY-ONLY animation atlas. Preserve the character identity, materials, color, direction, all36chronological motion poses and the6animationrows. Major corrections are required:
1. REMOVE ALL external visual effects from ALL36frames: NO beam, projectile, slash trail, blade, lightning, shield, bubble, halo, impact burst, particles, sparks, stars, speed lines, circles or floating shapes anywhere. Leave only the physical FULL-BODY robot; tiny glow confined inside chest core/eyes/hand surface is permitted. Show attack and special actions entirely through arms, torso and knees, not energy effects.
2. DRAMATICALLY SHRINK EVERY robot figure to about HALF its current height and width. Every full robot must occupy only about60%of its squarecell'sheight and60%of itswidth; do not make the source-sized large crowded figures again. Each robot approximately125pixels tall in a209pixelsquarecell. Big wide fully transparent gaps around every character are REQUIRED. Same scale across all36frames. Figure size must not grow betweenrows.
3. REPOSITION into an exact mathematical SIX columns by SIX rows grid on a square1254x1254canvas, each cell209x209pixels. Firstcolumncenterx104, next313,522,731,940,1149. Rowcentersy104,313,522,731,940,1149. Everyrowhas precisely6completebodies. Everycolumn has precisely6bodies. No frame may intersect any cellborder.
Feetbaseline localy164 insideEVERY cell (row0y164,row1y373,row2y582,row3y791,row4y1000,row5y1209). Character top around localy40. Clearpaddingminimum30pixels on all sides of everycell, evenraisedarms/horns/antenna. Full head, arms, hands, knees and BOTHFEET visible in eachframe including thebottomrow. No cropping; restore cut-offfeet. No ground/shadow.
Row0: idle subtle weight shift and servo breath,6phases.
Row1: prepare strike withelbowback,stepforward,deliverarmstrike,fullarmextension,retractelbow,neutral.
Row2: compressonimpact,leanbackward,staggerkneesbent,bracestance,straighten,neutral.
Row3: fisttochest,raiseonearm,raisetwoarms,celebrateheadtilt,loweronearm,neutral.
Row4: raiseguardarm,deepkneebendguard,holdarmblock,bracebodyharder,lowerarms,neutral. No renderedshield.
Row5: handsatcore,lowerstance,aimarmsforward,fullbodyfollowthrough,recoverhands/torso,neutral. No projectile/beam.
Actual articulated body poses remain different and chronological; never paste one pose repeated across a row. Right-facing3/4 camera, identity unchanged, premiumillustrated2.5Dgamecutout.
Genuine alpha TRANSPARENT background. No visiblegridlines,border,labels,text,UI,letter/number,watermark orcoloredbackground. Compose as36SMALLERposecutoutstogether with large even transparentgaps, not a dense collage.
```

## Correção final de KEPLER

O último resultado de cinco linhas foi editado para acrescentar seis novas poses de defesa na faixa livre. As linhas semânticas foram mapeadas no manifest conforme descrito acima.

```text
Edit the attached KEPLER astronaut robot atlas. It currently contains FIVE rows of six complete robots (30figures) with a large empty transparent strip at the bottom. ADD exactly SIX additional full-body KEPLER robots ONLY in that EMPTY BOTTOM STRIP. Do not erase, replace, merge or remove any of the30existing figures. The final image must contain SIX total rows, each with sixfullbodies:36total. Keep the canvas square and genuinely transparent.
The six new figures are a new DEFENSE animation sequence, positioned in sixcolumns across thebottomemptystrip, all fullyvisible with bothfeet and helmetintact. Make these sixsmall enough to fit INSIDE theemptystrip: around120pixels high, starting justbelow theexistingfifthrow and endingabove thebottomcanvasboundary. Keep widecleartransparentgaps. They are the exactsame ivoryceramic/gold astronaut robot with darkcyanface, orbitalantenna, cyanbackpack and chestcore, facingthree-quarterright, no identitychanges.
Bottom row sixposes, left toright:
1. raise protective forearm and tuckelbowclose tohead;
2. bendknees in a deep guard and crossforearms overchest;
3. holdblock with shouldersbraced, helmettilted slightlydown;
4. pushguardforearm outward slightly with hipsbraced;
5. lowerforearms while straighteningknees;
6. relaxednormal neutralstandingpose.
No extraeffects: no shield, bubble, projectile, beam, aura, particles, circles, lines, floating shapes orgroundshadow. Only the physicalrobot and smallglow INSIDE eyes/core. Fullbodycutouts, includingallfeet; nevercropped.
Important final count: existing30figures PLUS6newbottomrowguardfigures =36figures. Allsixcolumns remain aligned. Nothing else in theexistingfive rows changes. No text, labels, logo, watermark, grid, guide, background orinterface. Genuine transparentalpha.
```
