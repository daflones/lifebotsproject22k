# Estúdio de conteúdo e mídia

O painel LifeBots 0.8 organiza suas ferramentas em navegação lateral e grupos. O modo conectado salva pelo servidor; a prévia altera somente seu navegador. O papel administrativo vem do banco.

## Robôs e equipamentos

Edite nomes, histórias, modelos/classes, raridade, cor, imagem, espaços compatíveis, atributos, produção, preço/moeda, prazo, usos e limites. Selecione arte original, imagem única ou atlas regular 6×6/4×4. Para atlas recortado original, mantenha seus metadados de poses em `docs/COMBAT_*_FRAMES.json` e execute `node scripts/sync-combat-frames.mjs`.

Em imagem, use **Escolher / Enviar arquivo** para enviar PNG/JPG/WebP do computador. Retrato personalizado funciona nos cards e cenas; animação por frames exige um atlas apropriado. Não trate uma imagem única como 36 poses.

## Temporadas e capítulos

Crie temporadas, capítulos principais e missões opcionais. Edite título, descrição, objetivo, texto de guia, cena/imagem, recompensa, custo/moeda de replay, requisito de desbloqueio e inimigos de cada onda. Use os controles para adicionar/remover/reordenar encontros. Temporada configura tema musical, trilha de exploração e de combate, volume/ritmo e arquivo personalizado.

A história tem 42 capítulos principais e 12 missões opcionais. IDs opcionais começam em 1001, sem alterar o progresso principal antigo. Não remova um robô referido por inimigos, guia ou roster da arena; substitua as referências antes. Itens já adquiridos são mantidos para preservar contratos.

## Biblioteca de arquivos

Imagens: PNG/JPG/WebP, até 10 MB e 8192 pixels por lado. Áudio: MP3/OGG/WAV, até 24 MB. O cliente valida assinatura do arquivo e leitura; Storage exige admin e limita formato/tamanho. Arquivos ficam em `lr-media`, registrados em `lr_media`, com referência pequena `media:UUID` no conteúdo.

O painel lista, permite pré-visualizar e selecionar arquivos. A remoção verifica uso antes de excluir; troque a referência no conteúdo antes. Na prévia, blobs ficam em IndexedDB separado do progresso e da conta conectada.

## Personalização geral

Economia/conversão, bônus de tutorial, arena, taxas/saques, rede, guildas/eventos, mercado/chat, avisos, textos, cores, fundos, logo, música e nove grupos de efeitos têm controles no admin. Alterar regra de novas compras não reescreve contratos já vendidos. Atualizar o catálogo preserva o rendimento acumulado na taxa anterior.

No modo conectado, ajuste de saldo exige motivo, grava ledger e auditoria. Avisos podem incluir imagem e botão. Aprovação de saque usa reserva e confirmação do gateway; a política automática tem teto próprio. A habilitação bancária é uma configuração administrativa separada da aprovação automática.

Arquivos enviados não modificam o JavaScript do jogo. Regras novas que precisem código devem ser implementadas em fonte/backend e publicadas com os scripts de atualização.
