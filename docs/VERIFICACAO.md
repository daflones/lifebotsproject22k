# Verificação LifeBots 0.8.0 — entrega ZIP, 13/10/2026

## Correção administrativa e inicialização Auth — 13/10/2026

- Reproduzido HTTP 400 / SQLSTATE 21000 em `lr_admin_set_payments`: UPDATE da revisão do mundo sem WHERE era recusado pela proteção do banco.
- Migration 016 aplicada e registrada: filtros explícitos nas funções de política bancária, salvar conteúdo e excluir conteúdo. Política bancária atualiza somente o mundo real; catálogo compartilhado invalida os dois namespaces existentes. Proteções, permissões e checagens de admin mantidas.
- A mesma RPC voltou HTTP 204, mantendo a política de pagamentos inalterada. `supabase/tests/admin-safe-updates.sql` aprovou as três operações, escopo de revisão, recusa de ator não autorizado e ACLs, com ROLLBACK e sem excluir conteúdo existente.
- Frontend usa uma única promessa de inicialização Supabase para chamadas concorrentes; falha de inicialização permite nova tentativa. Acrescentada a meta tag `mobile-web-app-capable`, preservando suporte Apple.
- `beforeinstallprompt.preventDefault()` permanece intencional: o botão Instalar chama `prompt()` após interação do usuário; o aviso de banner não é falha da API.
- Sintaxe, 145 testes do projeto, 14 testes Edge, build `08c703679a657cf6` e verificação de pacote com 16 migrations aprovados. Nenhuma cobrança ou saque real criado nesta correção.

## Revisão de preparação para produção — 13/10/2026

- `npm run check`, 141 testes do projeto e 14 testes Edge aprovados; build `7b827a756c80010c` e verificação do pacote aprovados.
- Modo publicado exclusivamente conectado, sem seletor de demonstração nem simulação de saldo por preferência antiga; marca LifeBots padronizada.
- `.env.example` contém apenas URL Supabase e chave publicável. O container aplica essas variáveis ao iniciar e serve `/config.js` sem cache persistente.
- Correções MercosulPay: idempotência estável no formulário, recusas definitivas distintas de falhas incertas, retentativa limitada para erros transitórios documentados e normalização de chaves Pix. Conciliação usa `total_debit`, não `net_amount`.
- Quatro Edge Functions atualizadas pelo CLI via Management API, preservando banco, cron e autenticação das funções.
- Site URL/redirects e CORS ajustados para https://lifebots.com.br; dez verificações públicas do Supabase aprovadas. Credenciais MercosulPay existentes conferidas por digest e consulta de saldo autorizada (HTTP 200), sem expor dados financeiros.
- Consulta remota confirmou 15 migrations, cron ativo e pagamentos desativados. Execuções recentes em `lr_job_runs` registraram processamento sem falhas. Após o cadastro, a conta indicada pelo proprietário foi encontrada confirmada e ativa e recebeu papel de admin; ativação financeira e validação de pagamentos reais permanecem pendentes.
- Menu e atalho administrativo condicionados ao papel de admin; acesso direto à tela bloqueado para contas comuns. Nome do gateway retirado da carteira e dos formulários Pix/saque, mantendo a integração no backend.
- O domínio retornou `ENOTFOUND` nesta máquina. DNS, deploy EasyPanel e validação de cobrança/saque reais continuam pendentes; nenhuma operação bancária foi criada.
- Docker Desktop instalado, mas daemon indisponível. Script de configuração runtime e frontend HTTP local verificados; imagem completa ainda não executada neste ambiente.

## Resultado da revisão anterior

O pacote contém a versão 0.8.0 recuperada, com fontes, build, artes/áudio e backend. Foram corrigidos pontos de distribuição, sem reimplementar o jogo. Esta revisão não fez commit, push, deploy no EasyPanel, alterações Auth/Secrets, concessão de admin, criação de conta ou transação bancária.

| Verificação executada | Resultado |
| --- | --- |
| `npm test` | 130 testes aprovados, zero falhas |
| `npm run test:edge` | 14 testes aprovados, zero falhas |
| `npm run check` | Sintaxe de fontes/scripts, manifest, configuração pública e assets OK |
| `npm run build` | Build 0.8.0, release `46b806054c5646e0` |
| `npm run verify:package` | Imports, shell offline, 157 assets, 15 migrations e quatro funções presentes; revisão de credenciais OK |
| Verificação pública do Supabase | Dez verificações aprovadas; API respondeu com 15 robôs |
| Nginx `-t` + verificação HTTP | Configuração aprovada e nove verificações do frontend aprovadas, junto às dez do backend |
| Tags de imagens Docker | `node:22-alpine` e `nginx:stable-alpine` constavam do catálogo oficial |
| Estado remoto GitHub | `main` em `ba0b6204fa67ba205e5564c1faa08851cbe0309d`; árvore com apenas README |

Os testes de regras/interface foram executados em Node.js 24.19. Os fontes de gameplay desta entrega são os mesmos que passaram nesses 144 testes. O Nginx de QA foi 1.24.0 no Linux, obtido do pacote oficial Ubuntu e executado somente em pasta temporária. O teste usou o arquivo do pacote com ajuste de porta/raiz para o ambiente de QA. Não houve execução da imagem Docker/Alpine completa nem teste em navegador real.

## Verificações remotas desta revisão

As chamadas foram públicas e não escreveram no banco:

- SDK Supabase 2.117.3 acessível, com tipo JavaScript.
- Auth acessível, cadastro por e-mail disponível e confirmação automática ativa.
- OPTIONS/CORS de localhost aceito pela `game-api`, e origem desconhecida recusada.
- `public_config` respondeu HTTP 200 com catálogo de 15 robôs.
- Snapshot sem sessão recusado com HTTP 401 / `AUTH_REQUIRED`.
- `daily-settlement` sem segredo recusado com HTTP 401.
- `payment-webhook` e `mercosulpay-webhook` sem assinatura recusados com HTTP 401.
- Consulta pública de carteira não revelou registros.

A proteção pública de uma URL não comprova que a função completa operações autenticadas. Não foram criados pilotos artificiais para ensaiar arena ou pagamentos nesta revisão. A configuração do domínio EasyPanel ainda não foi testada porque o domínio final não foi escolhido/configurado.

## Validação do frontend servido por Nginx

As nove verificações HTTP cobriram `/healthz`, HTML LifeBots, build com o release esperado, JavaScript, imagem, herança de headers, cache sem armazenamento para shell/manifest/version e três casos de arquivos ausentes. O comando completo `verify:deploy` aprovou 19 verificações no ensaio Nginx + backend público.

Depois do deploy real, execute novamente apontando ao domínio:

```bash
npm run verify:deploy -- --url https://SEU_DOMINIO
```

Não há validação visual de layout, toque, teclado, autoplay, áudio percebido, atualização entre abas ou desempenho em aparelhos. O DOM simulado verifica ações e conteúdo da interface, sem substituir navegador.

## Correções desta entrega

- `.dockerignore` limita o contexto aos arquivos usados no build, incluindo os assets, sem carregar histórico/estado local.
- Nginx atualiza HTML, service worker, manifest e versão; módulos com hash têm cache imutável. Headers continuam presentes nos assets.
- Arquivos JS/CSS/imagens ausentes retornam 404, sem receber o HTML do app.
- Health check `/healthz` e tag estável do Nginx no Dockerfile.
- Scripts públicos `verify:package`, `verify:deploy` e `VALIDAR-PROJETO.bat`.
- Atualizador Supabase publica as quatro funções em comandos separados, interrompendo em falha. Documentação CLI acompanha essa sequência.
- Requisito Node 22.18+ consistente no script de abrir o projeto e nos validadores.
- Documentação admin corrigida: o backend implementado não continua como os stubs 501 das versões anteriores.
- Documentação de confirmação de e-mail reflete a configuração remota observada e distingue `config.toml` local de Auth da nuvem.
- Guia Git preserva o commit inicial remoto e orienta copiar os arquivos sobre um clone.
- MP3/OGG/WAV declarados binários; ZIPs não entram no Git por padrão.

BATs foram revisados e normalizados para CRLF, mas não executados em Windows. O ZIP não contém a pasta `.git`, credenciais privadas, arquivos `.env` reais, cache CLI, logs ou dependências instaladas. O scan de credenciais não analisa o histórico de clones existentes.

## Backend da implementação anterior

Os registros da implementação anterior informam migrations 001–015 e quatro funções publicadas, instalação em banco novo/schema isolado e testes sintéticos de ledger/reserva em transação revertida. A revisão atual confirmou as URLs públicas, mas não repetiu essas verificações autenticadas.

Para conferir o projeto publicado sem alterar dados, use `supabase migration list` e `supabase/tests/preflight-production.sql`. Confira migrations, RLS, permissões das RPCs, job único/ativo, resultados recentes do job e política bancária. O SQL não revela valores do Vault nem dados pessoais.

## Pendências para produção

| Pendência | Motivo / critério de conclusão |
| --- | --- |
| Push do código completo e serviço EasyPanel | O remoto tinha só README; publicar o conteúdo do ZIP preservando o histórico |
| Domínio HTTPS + redirects/CORS | Cadastro, recuperação e API precisam aceitar a origem final |
| Conta permanente admin | Papel concedido a uma conta identificada; usuário comum continua sem privilégios |
| Duas contas no domínio final | Validar arena/turnos/retomada, chats/Realtime, guildas/mercado e separação de estados |
| Banco, cron e configuração corrente | Conferir pelo preflight e acompanhar execuções, sem duplicar jobs |
| Celular/PWA | Verificar visual, interação, som e atualização em iOS/Android |
| MercosulPay | Homologar contrato real, cobrança/QR/webhook/crédito, saque/captura e conciliação |

A documentação pública do gateway não ficou acessível nesta revisão. Os endpoints e o formato HMAC do adapter não foram comprovados por um pagamento real. A assinatura obrigatória, reservas e testes do contrato são proteções de código; não equivalem a homologação do fornecedor. A operação bancária deve permanecer pausada até essa validação.

APK/AAB/IPA e publicação em lojas são opcionais para distribuição nativa. A versão de navegador/PWA usa o deploy HTTPS do frontend. Preparação do código, instalação do serviço e homologação financeira são etapas diferentes.
