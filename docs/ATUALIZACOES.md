# Atualizações do LifeBots 0.8.0

## Obter o projeto

O repositório desta entrega é https://github.com/daflones/lifebotsproject22k, branch `main`.

```bash
git clone https://github.com/daflones/lifebotsproject22k.git
cd lifebotsproject22k
npm run check
npm test
npm run test:edge
npm run build
npm start
```

Use Git e Node.js 22.18 ou superior. O frontend não exige instalação de dependências. `ABRIR-LIFEBOTS.bat` prepara o build e abre http://localhost:3000 no Windows. URL e chave publicável do Supabase já estão em `src/config.js`; o login publicado usa exclusivamente a conta Supabase.

## Publicar alterações no GitHub

`PUBLICAR-GIT.bat` (ou `PUBLICAR-GIT.cmd`) verifica o checkout, o destino `daflones/lifebotsproject22k`, a branch, conflitos e arquivos sensíveis. Executa sintaxe/assets, testes do jogo, testes de fronteira Edge e build; mostra as alterações e solicita a confirmação local antes de commit/push.

O publicador não utiliza force push, reset ou descarte de mudanças. Um push recusado interrompe o fluxo. Atualize a branch e resolva conflitos antes de repetir. O argumento `--check` de `scripts/publish-git.mjs` verifica o destino sem criar commit nem enviar arquivos.

Não copie tokens, senhas ou arquivos privados de outro produto para o checkout. Somente `.env.example` com placeholders pode ser versionado. Preserve o histórico Git e acrescente migrations com timestamps novos quando alterar o backend.

## Supabase

Projeto da entrega: `edzgczsnxlkhkpovtspg`. As migrations 001–015 e as quatro Edge Functions foram publicadas na etapa anterior; uma atualização comum aplica somente versões ainda pendentes.

Instale o CLI conforme a documentação oficial: https://supabase.com/docs/guides/local-development/cli/getting-started

```bash
supabase login
supabase link --project-ref edzgczsnxlkhkpovtspg
supabase migration list
supabase db push --dry-run
```

`ATUALIZAR-SUPABASE.bat` exige esse project-ref, mostra o dry run e solicita a confirmação local. Depois de aplicar migrations, publica `game-api`, `daily-settlement`, `payment-webhook` e `mercosulpay-webhook`, uma por comando, pela API de deploy, sem exigir Docker. Uma falha interrompe a sequência.

A verificação de sessão, assinatura e segredo do job é feita no código das funções, conforme `supabase/config.toml`. O deploy não altera a política de pagamentos. Segredos ficam no Supabase, fora do Git. Consulte `CONEXAO_SUPABASE.md` para Auth, admin, Vault, cron e origens permitidas.

Não reaplique migrations já registradas nem execute `db reset` em produção. Na instalação em outro projeto, revise primeiro os identificadores/configuração e siga `BACKEND.md`; o BAT desta entrega protege o projeto específico do LifeBots.

## Atualizar tudo no Windows

`ATUALIZAR-TUDO.bat` executa `ATUALIZAR-SUPABASE.bat` e `PUBLICAR-GIT.bat` em sequência. Uma falha ou cancelamento interrompe as etapas seguintes. Cada etapa mostra o destino e pede a confirmação local antes de modificar o serviço.

## EasyPanel

1. Crie um serviço App conectado a `daflones/lifebotsproject22k`, branch `main`.
2. Use o `Dockerfile` da raiz e porta interna `80`.
3. Configure domínio e HTTPS; acrescente a origem a `ALLOWED_ORIGINS` e os redirects ao Supabase Auth.
4. Ative Auto Deploy para construir a versão enviada após cada push.

O Dockerfile recompila o frontend e serve o build no Nginx; banco, Auth, Realtime e Edge Functions ficam no Supabase. Não configure chaves privadas no JavaScript ou no build. PWA exige HTTPS ou localhost. O service worker evita cachear endpoints Supabase e operações financeiras.

Enviar o código não cria serviço EasyPanel nem configura domínio. Para o pacote revisado, siga `GIT_MANUAL.md` e `DEPLOY_EASYPANEL.md`. Homologação do gateway e compilação/assinatura nativa continuam descritas em `VERIFICACAO.md` e `MOBILE.md`.

## Referências oficiais

- Migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Edge Functions: https://supabase.com/docs/guides/functions/deploy
