# Jardim de robôs — LifeBots 0.7

Artes criadas em 12/10/2026 com `imagegen` built-in, uma geração inédita por robô, com transparência solicitada. Restauradas em 13/10/2026 a partir dos PNG gerados e do helper original preservados em scratch, sem nova geração. O atlas `dist/assets/moss-combat-v6.png` foi visto como referência de acabamento ilustrado 2D/2.5D; nenhum robô existente foi copiado, redesenhado ou substituído. As artes não possuem textos, nomes, marca ou interface incorporados.

| Modelo | PNG original | WebP lossless | Dimensões | Quadros | PNG (bytes) | WebP (bytes) |
|---|---|---|---|---:|---:|---:|
| MICÉLIO | `dist/assets/mycel-combat-v7.png` | `dist/assets/mycel-combat-v7.webp` | 1254 × 1254 RGBA | 36 | 2582769 | 1796516 |
| AURÉLIA | `dist/assets/aurelia-combat-v7.png` | `dist/assets/aurelia-combat-v7.webp` | 1254 × 1254 RGBA | 36 | 2927402 | 1942940 |

Os PNG selecionados foram copiados intactos dos resultados, sem corte, remonte, redesenho, repetição de quadros ou alteração de pixels por código. As WebP são somente derivadas de formato: Pillow `lossless=True`, `exact=True`, `method=6`, sem redimensionamento. Comparação de todos os pixels RGBA confirmou identidade integral, incluindo alpha, entre cada PNG e sua WebP, novamente verificada no restauro. Total PNG: 5.510.171 bytes; total WebP: 3.739.456 bytes, aproximadamente 32,1% menor.

## Identidades

- **MICÉLIO (`mycel`):** explorador biomecânico com capacete de cogumelo marfim/musgo, parte inferior violeta, olhos e núcleo violeta, articulações de bronze, braços de cabos/raízes e duas pernas com pés de raízes. O chapéu e a anatomia de raízes formam uma silhueta própria.
- **AURÉLIA (`aurelia`):** atacante inspirada em mariposa, vidro/cristal rosa e dourado, antenas curtas, olhos âmbar, núcleo rosa, placas facetadas e quatro lobos compactos de asas presos ao corpo. As asas articulam junto com torso e braços durante movimentos.

## Manifest e estados

`docs/COMBAT_V7_GARDEN_FRAMES.json` segue a estrutura por modelo de `COMBAT_V6_BASE_FRAMES.json`: `asset`, `width`, `height`, `frames` com `row`, `column`, `x`, `y`, `width`, `height`, `anchorX` e `anchorY`. Acrescenta `states` por modelo e `state` em cada frame para explicitar a semântica. Todos os retângulos e âncoras são **coordenadas absolutas sobre o PNG**; `asset` aponta para `assets/*-combat-v7.png`. A WebP tem geometria idêntica.

| Linha (`row`) | `state` | Seis fases temporais |
|---|---|---|
| 0 | `idle` | neutralidade, servos/ombros, peso/cabeça, relaxa, retorna, neutro |
| 1 | `attack` | prepara, avança, golpe, extensão, recolhe, neutro |
| 2 | `hurt` | impacto, recuo, cambaleio, estabiliza, volta, neutro |
| 3 | `down` | enfraquece, ajoelha, abaixa, apoia a mão, desaba, permanece caído |
| 4 | `shield` | ergue guarda, abaixa, cruza/bloqueia, firma, baixa, neutro |
| 5 | `special` | mãos ao núcleo, prepara corpo, aponta, descarga corporal, recupera, neutro |

As duas artes possuem 36 corpos completos em seis linhas visuais com seis poses cada. Os frames devem ser reproduzidos pelo manifest real, pois a distribuição visual não é uma grade pixel a pixel perfeitamente uniforme. Os bboxes foram derivados do componente conectado do corpo no alpha acima de 32, com 2 px de margem quando dentro do canvas. Âncoras usam centro/base dos pés ou do contato inferior do corpo nas poses caídas.

MICÉLIO possui `clipPath` em cinco frames — ataque colunas 0, 1 e 2; queda colunas 4 e 5 — em que bboxes próximos incluíam pequenas pontas de outro corpo. São paths SVG absolutos, somente `M/L/Z`, para `clipPathUnits="userSpaceOnUse"`. Os contornos expandem aproximadamente 2 px para antialias, removem as regiões dos componentes vizinhos e preservam o componente principal. Nenhum PNG foi alterado ou remontado para resolver isso. AURÉLIA não precisou de clipPath adicional. O manifest ocupa 48.968 bytes.

## QA visual e dados

- Os originais foram vistos e também compostos temporariamente sobre azul petróleo para inspeção do alpha durante a criação. Os PNG de produção permanecem intactos; as composições de QA ficam fora do projeto. A composição confirmou bordas legíveis, transparência real e ausência de fundo colorido. O colorido visto ao exibir RGB sob transparência não aparece quando o alpha é aplicado.
- Alpha mínimo 0 e máximo 255 nos dois PNG, novamente verificado no restauro. Foram identificados 36 componentes grandes de corpo por atlas, total de 72 poses. Não há corpos unidos a outro frame.
- Cabeça/capacete, antenas/cogumelo, asas, braços, pernas e pés estão presentes. As poses de queda preservam a anatomia inteira, com redução de altura pela postura de ajoelhar/desabar. O último quadro inferior permanece dentro do canvas.
- As identidades são novas e distintas dos modelos anteriores. Não foram adicionados personagens humanos, textos, logos, rótulos, guias ou interface às artes.
- Ataque, dano, queda, guarda e especial mostram mudanças de corpo. Efeitos externos, como projéteis, esporos, trilhas, escudos ou partículas, devem ser desenhados pela interface, deixando os corpos legíveis.
- Bboxes, âncoras e pares `(row,column)` foram verificados nos limites da imagem. Cada par de 0 a 5 aparece uma única vez por robô. Os clipPaths opcionais preservam todos os pixels do componente principal e excluem os componentes vizinhos.
- O restauro somente copiou os PNG originais, derivou WebP e reconstruiu metadados com `garden-v7-deliver.py`. Não houve regeneração ou alteração dos pixels das artes.
- Esta entrega de assets não inclui execução no navegador nem alteração de código, banco, Git ou publicação.

## Prompts finais

### MICÉLIO — mycel

```text
Use case: stylized-concept.
Asset type: ORIGINAL production-ready transparent robot combat animation atlas for a premium2D/2.5DmobileRPG, for LifeBots.
Layout: SQUARE transparentcanvas with EXACTLY SIX COLUMNS and EXACTLY SIX ROWS =36full-bodycharacters. Six small full-body posecutouts perrow, sixrows total. Regular equallyspaced invisiblegrid; characters are SMALL, occupying only about60%of eachcellheight and at most70%cellwidth, leaving widecleartransparentgaps on ALL sides. No visiblegridlines orlabels. Prefer1536x1536 square ifavailable. This is an atlas of36individualdrawings, not a singlecharacter sheet or a collage. Even thebottomrow musthave sixcomplete bodies.
Artstyle: polished illustrated2.5D chibi science-fiction mobile adventureRPG cutout, sculpted expressive proportions, carefully shaded designedmechanicalsurfaces, subtle cleanedgeoutlines, collectible premiumgamecharacterart. Same identity, materials, colors, proportions, camera and character scale in all36frames. Face three-quarterRIGHT. Fullbody includinghead/antennae/wings/cap andBOTHfeet in EVERYframe. Feet/body groundcontact anchored to a stable baseline inside eachcell, with roomy bottompadding. No crop anywhere. Allphysicalappendages attached andcontained in their owncell; nothing touches neighborcells.
Animation: clear ARTICULATED BODY changes in every action, not one static figure with differentglows. Knees, hips, torso, elbows, wrists, shoulders and head mustmove. Sixchronologicaltemporalposes lefttoright perrow:
Row0 IDLE: neutral; shouldersslightlyrise; subtle weightshift/headtilt; shoulderssettle; reverseweightshift; neutral. Body breath and servo motion, notjusteyes.
Row1 ATTACK: windupwitharmback/kneesbent; step/leanforward; rightarmstrike; maximum compactarmextension; elbowretracts/torso recovers; neutral.
Row2 HURT: bodycompressesonimpact; recoilsbackwardleft; staggerwithkneesbuckled/headtilted; bracesstance; straightens; neutral.
Row3 DOWN/DEFEAT: staggersweakly; sinksontoone knee; crouchesdeeply; bracing handtouchesground; slumpsontoonehip; stays curled/fallenmotionless. This row is NOTvictory. Fullhead andalllimbs remain visible within thecell even in downposes. No lyingfigure extending intoadjacentcells.
Row4 SHIELD/GUARD: raisesprotectiveforearm; lowerscenterofgravity; crossesarms inbodyguard; pushesguardslightlyforward; lowersarms; neutral. Physicalarmguard only, noenergyshield graphic.
Row5 SPECIAL: handsnearcoreandbracedlegs; deeperchargebodycrouch; armsaim/extendforward; fullbodyfollowthrough; retractarms andstandup; neutral. Signatureaction reads frombodyart, not projectedvisualeffects.
Effects: only glowcontainedINSIDE eyes/core/physicalpalms permitted. Absolutely NO externalenergy effects, no projectile, beam, blade/trail, aura, particles, spores, lightning, floating shapes, shieldbubble, stars, circles, speedlines orgroundshadow. The game code willrender sucheffects separately.
Constraints: real transparentalpha background, neverblack/white/checkerboard. No backdrop, groundplane, scene, weapons separatefrombody, text, letters, numbers, symbols, logos, watermarks, UI, icons, frameborders, captions or guides.36complete small robotposes, SIXbysIX.
Characterdesign: MICÉLIO/MYCEL, a completely new charming biomechanical explorerrobot with an unmistakable broad MUSHROOM CAP serving as its helmet. The cap is sculpted mossgreen and ivory ceramic with a soft desaturated violet underside, irregular natural mushroomlobes but clear engineeredseams. Friendly large violet luminous mechanicaleyes under thecap brim, an ivory brushedmetal stem-like torso with small bronzejoints, moss textured shoulderplates, a compact violet chestcore, articulated root-like cablearms and TWO sturdy biomechanicalROOTLEGS ending in small rootedfeet. Mechanical hinges and metalvines make it clearly a robot rather than a livingmushroom. Chibi largecap/compactbody proportions; rootlegs are visiblydistinct, not another astronaut or bulkyarmoredhumanoid. Palette: mossgreen, warmivory, mutedviolet, small antique-bronzedetails. Keep thecap silhouette and attached roots fullyinsideeachcell.
Normalattack is a compact rootfist thrust with forwardhiprotation. Guard draws rootforearms across thechest. Special shows palms aimedforward with tinyviolet glow only insidepalms, cap lifts subtly with torsocharge; no flying spores or vine beyond thebody. Cap/arms/roots must articulate betweenstates while identity staysconstant.
```

### AURÉLIA — aurelia

```text
Use case: stylized-concept.
Asset type: ORIGINAL production-ready transparent robot combat animation atlas for a premium2D/2.5DmobileRPG, for LifeBots.
Layout: SQUARE transparentcanvas with EXACTLY SIX COLUMNS and EXACTLY SIX ROWS =36full-bodycharacters. Six small full-body posecutouts perrow, sixrows total. Regular equallyspaced invisiblegrid; characters are SMALL, occupying only about60%of eachcellheight and at most70%cellwidth, leaving widecleartransparentgaps on ALL sides. No visiblegridlines orlabels. Prefer1536x1536 square ifavailable. This is an atlas of36individualdrawings, not a singlecharacter sheet or a collage. Even thebottomrow musthave sixcomplete bodies.
Artstyle: polished illustrated2.5D chibi science-fiction mobile adventureRPG cutout, sculpted expressive proportions, carefully shaded designedmechanicalsurfaces, subtle cleanedgeoutlines, collectible premiumgamecharacterart. Same identity, materials, colors, proportions, camera and character scale in all36frames. Face three-quarterRIGHT. Fullbody includinghead/antennae/wings/cap andBOTHfeet in EVERYframe. Feet/body groundcontact anchored to a stable baseline inside eachcell, with roomy bottompadding. No crop anywhere. Allphysicalappendages attached andcontained in their owncell; nothing touches neighborcells.
Animation: clear ARTICULATED BODY changes in every action, not one static figure with differentglows. Knees, hips, torso, elbows, wrists, shoulders and head mustmove. Sixchronologicaltemporalposes lefttoright perrow:
Row0 IDLE: neutral; shouldersslightlyrise; subtle weightshift/headtilt; shoulderssettle; reverseweightshift; neutral. Body breath and servo motion, notjusteyes.
Row1 ATTACK: windupwitharmback/kneesbent; step/leanforward; rightarmstrike; maximum compactarmextension; elbowretracts/torso recovers; neutral.
Row2 HURT: bodycompressesonimpact; recoilsbackwardleft; staggerwithkneesbuckled/headtilted; bracesstance; straightens; neutral.
Row3 DOWN/DEFEAT: staggersweakly; sinksontoone knee; crouchesdeeply; bracing handtouchesground; slumpsontoonehip; stays curled/fallenmotionless. This row is NOTvictory. Fullhead andalllimbs remain visible within thecell even in downposes. No lyingfigure extending intoadjacentcells.
Row4 SHIELD/GUARD: raisesprotectiveforearm; lowerscenterofgravity; crossesarms inbodyguard; pushesguardslightlyforward; lowersarms; neutral. Physicalarmguard only, noenergyshield graphic.
Row5 SPECIAL: handsnearcoreandbracedlegs; deeperchargebodycrouch; armsaim/extendforward; fullbodyfollowthrough; retractarms andstandup; neutral. Signatureaction reads frombodyart, not projectedvisualeffects.
Effects: only glowcontainedINSIDE eyes/core/physicalpalms permitted. Absolutely NO externalenergy effects, no projectile, beam, blade/trail, aura, particles, spores, lightning, floating shapes, shieldbubble, stars, circles, speedlines orgroundshadow. The game code willrender sucheffects separately.
Constraints: real transparentalpha background, neverblack/white/checkerboard. No backdrop, groundplane, scene, weapons separatefrombody, text, letters, numbers, symbols, logos, watermarks, UI, icons, frameborders, captions or guides.36complete small robotposes, SIXbysIX.
Characterdesign: AURÉLIA/AURELIA, a completely new elegant chibi MOTH-INSPIRED robotattacker made of faceted pale ROSEGLASS, brushed GOLD and pearlcrystal. A small geometriccrystalhelmet with two short golden mothantennae, softwarm ambermechanicaleyes, rose-gold faceplates with nohumanflesh, compact pearlescent chest and a pink facetedcore. FOUR compact FACETED MOTHWINGLOBE structures are attached to its back like mechanicalrosecrystalwings with delicate goldribs; wings stay folded/partlyopen within thecell, always recognizably present but not giantspreadwings. Slender articulated gold-and-pinkarms, small crystalarmoredlegs and BOTH tapered mechanicalfeet. Clear designedmechanicalhinges andhardfacetedgehighlights, graceful but expresslyrobotic, not a humanfairy. Pink, palechampagnegold, ivoryglass, tinyvioletinternalreflections. Distinct silveryrose moth silhouette rather than genericpurpleknight.
Normalattack is a precise compact rightforearmstrike; winglobes tilt to counterbalance thetorso. Hurt folds wings andpullsback shoulders. Down/defeat folds allwings behindtheslumpedfullbody withoutdetachingthem. Guard brings forearms together andwings closer. Special opens wings moderately whilechargingpinkchestcore, aimsbothhands andfollowsforward; wingtipscannotcross cellboundaries and thereis no external projectile or energytrail. Preserve FULLattachedwings and allbodyparts in all36poses.
```
