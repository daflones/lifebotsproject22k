# Combate e trilhas — 0.6.0

Os nove modelos têm atlas novos: 36 poses em seis estados (repouso, ataque, dano, vitória, defesa e especial), totalizando 324 quadros novos. Os 144 quadros anteriores permanecem no projeto. Os PNGs gerados não são remontados: as caixas de cada corpo são medidas e reproduzidas como janelas SVG no navegador, usando os pixels originais e âncoras nos pés. WebP lossless preserva dimensões e alpha.

`src/combat-frames.js` contém os retângulos; `src/robot-sprite.js` reproduz seis poses por estado e `src/combat-styles.css` controla a sequência. A leitura por retângulos evita cortar pés ou mostrar outro robô quando a grade ilustrada apresenta espaçamentos diferentes. O hangar e as listas podem continuar usando as imagens anteriores; o combate seleciona as novas por padrão. Admin → Robôs permite escolher animação, estilo de efeitos, cor, tom dos sons e escala por estado. A defesa de Kepler recebe uma correção de escala na reprodução, ajustável pelo admin, pois a faixa nova da arte veio menor. A opção “Atlas original” preserva o formato anterior.

`src/combat-animation.js` é apresentação compartilhada pela arena, aventura e guildas. Cada ação percorre preparação, golpe, impacto e recuperação. O motor calcula um turno; somente os valores exibidos de vida são atrasados até o impacto. Não calcular novo dano em um callback de animação. A resposta do adversário repete a sequência, e a defesa permanece visível durante o bloqueio. A derrota tem uma saída visual antes da liquidação. Callbacks verificam a batalha e a geração da animação; sair cancela efeitos pendentes. O tempo usa `ticket.rules.actionMs`, congelado ao iniciar a partida.

Nove assinaturas visuais: raízes, arco elétrico, punho sísmico, fogo, gelo, vento, disparo orbital, plasma e obsidiana. Camadas desenhadas em CSS produzem trilhas, projéteis, carga, anéis, fragmentos, recuo e dissolução. Efeitos ficam dentro da cena, com medidas menores no celular. Movimento desativado e `prefers-reduced-motion` preservam uma pose e os números de dano, sem a movimentação decorativa.

## Música

| Temporada | Exploração | Combate |
| --- | --- | --- |
| Despertar | verdant, 92 BPM, 83,48 s | verdant-duel, 116 BPM, 66,21 s |
| Fronteiras | frontier, 104 BPM, 73,85 s | frontier-duel, 128 BPM, 60 s |
| Estrelas | starlight, 82 BPM, 93,66 s | starlight-duel, 122 BPM, 62,95 s |

Seis composições novas estéreo em OGG/MP3 somam-se a aurora, pulse e cosmos. Não usam samples externos. `scripts/compose-season-music.py` e `scripts/compose-music.py` contêm a composição e síntese, com vozes de flauta, marimba, cordas, metais, vidro e lead. Loops têm 32 compassos e caudas envolvidas na emenda.

O mapa usa a temporada selecionada. Um capítulo iniciado ou retomado usa a temporada que contém seu ID, mesmo se o piloto tiver avançado mais longe ou estiver rejogando outra temporada. Arena/guildas usam o tema geral de combate e não herdam a temporada anterior. Ao sair, o áudio volta ao contexto da página. Mudanças de trilha cruzam volumes por 600 ms; a velocidade usa os BPMs da gravação, não uma base fixa de 96 BPM.

Admin → Campanha e temporadas configura as duas trilhas, dois ritmos e URLs HTTPS opcionais por temporada. Tema vazio herda o geral. Admin → Áudio pode desligar a troca por temporada e escolher qualquer uma das nove músicas como tema geral. URLs personalizadas tocam em velocidade normal, pois não há medição automática dos seus BPMs.

Efeitos Web Audio originais: servo, preparação de escudo, ataque, impacto, bloqueio, carga, especial, nocaute, encontro, passagem liberada, recuperação, vitória e derrota. Osciladores, envelopes e ruído filtrado criam camadas; o tom varia por modelo. Sons de coleta/aquisição/notificação continuam associados ao sucesso da ação. Admin controla grupos de movimentos, golpes/defesa e especiais, além dos seis grupos anteriores. Preferências pessoais e mute têm precedência.

## Verificação necessária no aparelho

Os testes de DOM/Web Audio simulados não comprovam fluidez gráfica, qualidade percebida, políticas de autoplay ou compatibilidade de codecs no aparelho. Conferir Safari iOS e Chrome Android com o som ativado por gesto, troca de temporada, retomada após aba oculta, mute e modo de movimento reduzido. O presente ambiente não disponibiliza o navegador de QA.
