# LifeBots — entrega para Git e EasyPanel

Versão 0.8.0, revisada em 13/10/2026. Este pacote contém o projeto recuperado completo: fontes, build, artes e áudio, backend Supabase, testes e documentação. A publicação Git preserva o histórico de `main`. O frontend está configurado para https://lifebots.com.br; copie as variáveis públicas de `.env.example` para o serviço EasyPanel.

## O que já está no pacote

| Item | Estado |
| --- | --- |
| Jogo, arena, campanha, chat, guildas, mercado e admin | Implementados; 159 testes locais aprovados |
| Conteúdo | 15 robôs, seis temporadas, 54 capítulos, 540 poses e 15 temas de áudio |
| Artes e áudio | 157 arquivos originais/otimizados em `dist/assets/` |
| Supabase | 16 migrations e quatro Edge Functions; as quatro URLs publicadas responderam às verificações públicas |
| Build e deploy | Dockerfile, Nginx, health check `/healthz`, `.dockerignore` e verificador de distribuição |
| Git | Arquivos completos para enviar o jogo; o ZIP não contém `.git` nem credenciais privadas |

## O que ainda falta para lançar

1. Fazer o commit/push para `daflones/lifebotsproject22k` e criar o serviço App no EasyPanel.
2. Definir o domínio HTTPS e cadastrá-lo tanto no Auth quanto em `ALLOWED_ORIGINS` do Supabase. Uma variável no EasyPanel não altera CORS nas funções Supabase.
3. Conceder o papel de administrador à sua conta cadastrada, caso ainda não tenha feito isso. O comando está em `docs/CONEXAO_SUPABASE.md`.
4. Validar login/recuperação, arena e chats com duas contas no domínio publicado, além de toque, áudio e atualização da PWA no celular.
5. Homologar MercosulPay antes de liberar depósitos e saques: confirmar o contrato real do fornecedor, testar cobrança, confirmação, saque e conciliação. A existência de uma chave/API ou resposta 401 no webhook não comprova pagamento funcionando.

O jogo pode ser publicado para validação com os pagamentos pausados. Para uma operação com dinheiro real, a quinta etapa é obrigatória. APK/IPA não é necessário para jogar pelo navegador/PWA; os binários nativos são uma etapa separada.

## Ordem para você executar

1. Extraia o ZIP. Abra a pasta `lifebotsproject22k`, onde estão `package.json` e `Dockerfile`.
2. Execute `VALIDAR-PROJETO.bat` com Node.js 22.18 ou superior. Esse arquivo valida e gera o build sem fazer commit/push.
3. Siga `docs/GIT_MANUAL.md`. A branch `main` já tem um commit inicial de documentação (`ba0b620`); clone o repositório ou use seu clone existente, e copie o conteúdo para a raiz preservando `.git`. Não crie outro histórico independente.
4. Configure o EasyPanel conforme `docs/DEPLOY_EASYPANEL.md`.
5. Após o deploy, na pasta do projeto execute:

```bash
npm run verify:deploy -- --url https://SEU_DOMINIO
```

Substitua `SEU_DOMINIO` pelo endereço real do jogo. O verificador é público e não cria contas, partidas, depósitos ou saques. Teste os fluxos com duas contas seguindo o guia de deploy.

## Arquivos para consultar

| Arquivo | Uso |
| --- | --- |
| `docs/GIT_MANUAL.md` | Primeiro commit/push e cópia sobre clone existente |
| `docs/DEPLOY_EASYPANEL.md` | Campos do EasyPanel, domínio, Auth/CORS e teste final |
| `docs/VERIFICACAO.md` | Evidências da revisão e limites de validação |
| `supabase/tests/preflight-production.sql` | Consulta de migrations, RLS, cron e política bancária, sem alterar o banco |
| `docs/CONEXAO_SUPABASE.md` | Admin, segredos, CLI e atualização do backend |

Não remova `dist/assets`: o Docker usa essa pasta para construir a versão publicada. Não envie o arquivo ZIP para dentro do GitHub; envie o conteúdo extraído. O backend continua no Supabase e não é instalado automaticamente pelo deploy do frontend no EasyPanel.
