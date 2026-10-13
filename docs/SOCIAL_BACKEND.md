# Comunidade no backend conectado

Chat, trading, guildas e eventos estão implementados no runtime Supabase. `lr_game_world` guarda o mundo sob revisão e `lr_game_accounts` guarda cada piloto; a RPC de commit valida revisões e grava carteira, ledger e períodos de propriedade numa transação. Não existe aceite de troca decidido apenas pelo navegador.

## Chats

Canais `global`, `market` e `guild:UUID`. O servidor valida associação à guilda, disponibilidade, tamanho, cooldown e suspensão. Mensagens são escapadas na interface. `lr_live_chat` oferece leitura Realtime com RLS: quem está fora de uma guilda não lê suas mensagens. O cliente atualiza o chat sem fechar a batalha ou trocar a página. Moderação administrativa registra auditoria.

## Mercado

Venda reserva o robô até cancelamento, vencimento ou aquisição. Troca reserva os dois ativos e depende do aceite da contraparte. A taxa fica congelada na oferta; o commit transfere titularidade, preserva prazo/nível/usos/devolução e impede duplicação. Peças voltam ao inventário do vendedor. Produção anterior fica com quem possuía o robô; o novo proprietário começa um novo período.

Uma oferta expirada ou já encerrada não é aceita novamente. O mesmo identificador de operação não debita duas vezes. Contrato e períodos antigos são preservados para produção, comissão e devolução.

## Guildas e guerras

Papéis: líder, oficial e membro. Promoção, remoção, saída e sucessão verificam hierarquia. Convites elegíveis podem remunerar até três níveis conforme admin; o padrão concede bônus na primeira entrada elegível do piloto. Níveis usam XP e marcos com resgates únicos por participante elegível.

Eventos configuram abertura/encerramento, mapa, cotas de duelos, prêmio individual, pool, participação e requisitos. Duelo usa fila entre guildas adversárias, prazo e combate autoritativo; sem par há adversário controlado pelo jogo. Pontuação e recompensas são calculadas pelo servidor. Resgate verifica conclusão, participação e recibo único. O admin pode editar eventos e moderar os registros; atalhos de encerramento de teste aparecem somente na prévia.

## Privacidade e operação

Informações públicas de equipe/negociação não incluem saldos, e-mail ou Pix. A rede de indicação mostra WhatsApp apenas quando o piloto autoriza. O papel admin vem de `lr_admin_roles`, nunca do metadata de cadastro.

O mundo compartilhado usa bloqueio/revisão global para consistência. Em crescimento significativo, particione mundos por partida/guilda e consulte listagens no banco com paginação, preservando idempotência e ledger. A interface administrativa atual pagina a leitura do snapshot; esta entrega não é um teste de carga de milhares de usuários simultâneos.
