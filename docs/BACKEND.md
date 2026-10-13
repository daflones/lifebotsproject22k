# Backend LifeBots 0.8.0

## Runtime publicado

O backend opera no Supabase `edzgczsnxlkhkpovtspg`, separado de outros produtos. PostgreSQL, Auth, Storage, Realtime e Edge Functions são usados pela aplicação. Não há ações de jogo deixadas como stub 501 nesta versão.

`game-api` recebe POST autenticado com `action`, parâmetros e uma `idempotency_key` estável por operação. A função verifica o token com Auth e deriva o ator da sessão. O namespace padrão é `real`; o frontend publicado usa exclusivamente esse namespace e não oferece acesso à prévia. As funções têm `verify_jwt=false` para compatibilidade com os tokens atuais do projeto; a autorização é implementada explicitamente, incluindo papel administrativo consultado no banco.

`_shared/runtime/engine.js` aplica as regras compartilhadas com a interface no servidor. `service.ts` carrega participantes, verifica revisões e grava as alterações numa transação através de RPCs privadas. Conflitos têm retentativas limitadas; o mesmo identificador com outro payload é recusado. Uma resposta repetida contém o resultado original e o snapshot atualizado.

## Fontes de verdade

| Tabela | Responsabilidade |
| --- | --- |
| `lr_profiles`, `lr_admin_roles` | Identidade, indicação imutável, consentimento de contato e autorização |
| `lr_wallets`, `lr_ledger` | Saldo disponível/reservado e lançamentos imutáveis em unidades inteiras |
| `lr_game_accounts` | Estado de cada piloto, inventário, contratos e progresso |
| `lr_game_world` | Revisão do mundo, guildas, ofertas, eventos, fila e partidas |
| `lr_engine_ownership` | Períodos de propriedade dos robôs e contrato de aquisição |
| `lr_game_requests` | Payload hash e resultado de operações idempotentes |
| `lr_cash_operations`, `lr_cash_deliveries` | Cotações, reservas, outbox e eventos do gateway |
| `lr_live_chat`, `lr_game_signals` | Leitura por Realtime com RLS e avisos de atualização |
| `lr_media`, bucket `lr-media` | Metadados e arquivos enviados pelo administrador |
| `lr_settings`, catálogos e capítulos | Configuração editável do jogo |
| `lr_admin_audit`, `lr_job_runs`, `lr_job_checkpoint` | Auditoria e acompanhamento de lotes |

As tabelas normalizadas das primeiras migrations continuam presentes para histórico e compatibilidade. O runtime conectado usa `lr_game_accounts` + `lr_game_world` e registra os lançamentos nas carteiras/ledger; não altere as antigas tabelas de propriedade esperando modificar o hangar conectado. `100` unidades menores correspondem a `1 LC`, `1 RC` ou `R$1`. Frações de produção ficam em carry até formar uma unidade menor.

Clientes não executam RPCs econômicas nem escrevem em carteiras, partidas ou ledger. RLS restringe leitura de mensagens privadas e sinais. Snapshot público não entrega saldos/e-mails/telefones de outros pilotos; a rede recebe WhatsApp somente com consentimento. Dados Pix integrais não entram no snapshot público nem nos logs.

## Produção, contratos e rede

Aquisição congela custo, moeda, conversão, prazo, slots e devolução LC. A expiração liquida produção proporcional e devolve o principal uma única vez ao proprietário daquele período. Trading preserva o contrato e cria novo período de propriedade; peças permanecem com o vendedor. Devolução não gera comissão.

Produção usa tempo do servidor e o período de taxa efetiva. Alterações de catálogo ou melhorias preservam o acumulado anterior e passam a valer no período seguinte. Comissões de até três níveis são calculadas sobre produção efetivamente ganha, usando vínculo de indicação do banco, e pagas somente após o encerramento do dia de Brasília. Coletar repetidamente não duplica produção ou comissão.

`daily-settlement` exige `x-liferobots-job-secret` e rejeita dias futuros ou ainda em andamento. O job `lifebots-daily-and-payments` roda a cada cinco minutos, com checkpoint por lote e chave por usuário/dia. `lr_schedule_tick()` obtém o segredo do Vault; seu valor nunca aparece em migration ou comando cron. Manutenção processa expirações, ofertas vencidas e disputas abandonadas.

## Combates e comunidade

Arena reserva a possível perda antes da partida, congela atributos/regras e alterna turnos no servidor. Início consome a cota; cancelar uma fila ainda sem par não consome. Se o cancelamento chega depois do pareamento, a API retorna a partida existente. Há prazo de turno e prazo máximo; conclusão captura/libera reservas de ambos uma vez.

Aventura cria uma sessão persistente, cobra replay conforme configuração, verifica cadência/ações e paga somente após todas as ondas. Primeira recompensa é única; atualizar a página permite retomar. Guildas, hierarquia, guerras/eventos, marcos, bônus de convite, vendas e propostas de troca passam pelo mesmo mecanismo de revisão/transação. Leia `SOCIAL_BACKEND.md` e `ARENA.md`.

## MercosulPay

O adapter usa o contrato recebido para `https://mercosulpay.com/api/public/v1`: Bearer no servidor, POST `/pix/charges`, GET `/pix/charges/:id` e POST `/pix/withdrawals`. Esta entrega não confirma homologação bancária do fornecedor.

Depósito: valor/cotação congelados → cobrança com referência própria → QR/código → webhook assinado e consulta autoritativa → crédito único. Um redirect de sucesso não credita LC.

Saque: cotação/taxa congeladas → reserva LC → revisão ou política automática com teto → outbox/lease → gateway → captura ao confirmar ou liberação em falha definitiva. Timeout vira `uncertain`, conserva a reserva e exige conciliação; não há reenvio cego. O custo total informado pelo fornecedor é registrado. Eventos de reembolso entram em revisão, sem crédito automático adicional.

Headers `x-mercosulpay-timestamp`, `x-mercosulpay-signature`, `x-mercosulpay-event` e `x-mercosulpay-delivery` são verificados antes de interpretar o corpo. Assinatura: HMAC-SHA256 de `timestamp.raw_body`, prefixo `sha256=`, tolerância de 300 segundos. Delivery repetido com corpo diferente é recusado. Valor, referência e identificação precisam corresponder à cotação.

**Estado atual: ativação bancária pausada.** Ledger, reserva, captura e repetição foram testados com operações sintéticas dentro de transação revertida. Não houve charge/payout real. Para homologar, valide formatos do fornecedor e uma cobrança/saque autorizado em ambiente apropriado, depois ative pelo painel. Não marque como pago uma resposta incompleta.

## Instalação e manutenção

Há 15 versões de migration. O checkpoint 010 contém schema consolidado recuperado do catálogo real dos checkpoints 010–013; 011–013 preservam os números de versão. A ordem das funções foi corrigida e a instalação foi ensaiada no PostgreSQL em schema isolado dentro de transação revertida. Em produção, sempre acrescente novas migrations; não reaplique versões já registradas.

Segredos: `MERCOSULPAY_API_KEY`, `MERCOSULPAY_WEBHOOK_SECRET`, `DAILY_JOB_SECRET`, `ALLOWED_ORIGINS`; URL/anon/service role são provisionados nas funções pelo Supabase. Use um arquivo privado fora do checkout ou o dashboard para configurar segredos. `supabase/functions/.env.example` tem somente nomes e valores fictícios.

Use `ATUALIZAR-SUPABASE.bat` ou o fluxo CLI documentado em `CONEXAO_SUPABASE.md`. Não use `db reset` no projeto publicado. Para backend em novo projeto, troque a configuração pública, configure segredos/redirects, aplique migrations, publique funções e configure o job conforme `CONEXAO_SUPABASE.md`.

A política atual não é uma prova de homologação do gateway. Testes de interface em Safari/iOS/Android, compilação nativa e configuração do domínio EasyPanel continuam sendo etapas de distribuição; consulte `VERIFICACAO.md`.
