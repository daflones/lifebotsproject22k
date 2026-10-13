# Conexão e operação Supabase

Projeto desta entrega: `edzgczsnxlkhkpovtspg` — https://edzgczsnxlkhkpovtspg.supabase.co

O modo padrão em `src/config.js` é `server`; URL e chave publicável podem ficar no cliente. Tokens CLI, secret/service role, senha do banco e chave MercosulPay ficam fora do projeto. A versão publicada não permite escolher uma prévia local nem importar saldos locais para a conta.

## Login e administrador

Senha tem pelo menos 10 caracteres. O projeto remoto estava com confirmação automática de e-mail em 13/10/2026; o `config.toml` local exige confirmação quando o stack local é iniciado. O arquivo local não comprova nem altera sozinho a política Auth da nuvem. Se a confirmação obrigatória for ativada no painel, o cadastro só poderá entrar após confirmar. Código de indicação é opcional, validado no cadastro e imutável. O piloto escolhe se compartilha WhatsApp com sua rede. Recuperação abre `#recover` pela URL registrada no Auth.

Para conceder admin, use o e-mail **da sua conta já cadastrada e confirmada** no SQL Editor do projeto correto:

```sql
insert into public.lr_admin_roles(user_id, role)
select id, 'admin' from auth.users
where email = 'SEU_EMAIL_CONFIRMADO' and email_confirmed_at is not null
on conflict (user_id) do update set role = excluded.role;
```

A consulta deve afetar exatamente uma conta pretendida. Saia/entre ou atualize o snapshot depois. Esta entrega não promove automaticamente o primeiro usuário nem confia em metadata `role=admin`. Nenhum admin permanente foi criado sem identificar sua conta.

## CLI e deploy

```bash
supabase login
supabase link --project-ref edzgczsnxlkhkpovtspg
supabase migration list
supabase db push --dry-run
supabase db push
supabase functions deploy game-api --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
supabase functions deploy daily-settlement --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
supabase functions deploy payment-webhook --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
supabase functions deploy mercosulpay-webhook --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
```

No Windows use `ATUALIZAR-SUPABASE.bat`, com o CLI instalado por método oficial. Ele exige o project-ref correto, publica cada função separadamente somente após migrations e interrompe em falha. Para novas alterações, crie outra migration com timestamp novo.

Segredos podem ser enviados por arquivo privado com `supabase secrets set --env-file CAMINHO_PRIVADO --project-ref edzgczsnxlkhkpovtspg`. Não use um arquivo de chaves dentro do checkout e não digite valores reais em exemplos ou commits.

| Nome | Finalidade |
| --- | --- |
| `MERCOSULPAY_API_KEY` | Autenticação exclusiva do backend no gateway |
| `MERCOSULPAY_WEBHOOK_SECRET` | Verificação HMAC do corpo bruto |
| `DAILY_JOB_SECRET` | Autoriza o job, com pelo menos 32 caracteres aleatórios |
| `ALLOWED_ORIGINS` | Origens exatas do app, separadas por vírgula |

URL, anon e service role são variáveis padrão do Supabase nas funções. As quatro funções estão publicadas. Webhook registrado: `https://edzgczsnxlkhkpovtspg.supabase.co/functions/v1/mercosulpay-webhook`. Confirme o vínculo no painel do fornecedor durante homologação; a função rejeita eventos sem assinatura válida.

## Cron em outro projeto

No projeto desta entrega o cron e o Vault já estão configurados. Não crie um job duplicado. Para instalar em outro projeto, configure no Vault um segredo chamado `lifebots_job_secret` com o mesmo valor privado de `DAILY_JOB_SECRET`, revise a URL dentro de `lr_schedule_tick()` para o novo project-ref e registre uma vez:

```sql
select cron.schedule('lifebots-daily-and-payments', '*/5 * * * *',
  'select public.lr_schedule_tick();');
```

Acompanhe `lr_job_runs` e `cron.job_run_details`. Consulte apenas status/datas/contagens; headers de requisição e segredos não são dados de diagnóstico público.

## Domínios

Para EasyPanel, registre o domínio HTTPS como Site URL/redirects no Supabase Auth e inclua sua origem em `ALLOWED_ORIGINS`. Cadastre callbacks específicos de login e recuperação; não use wildcard amplo. Para localhost, mantenha `http://localhost:3000` e `http://127.0.0.1:3000`. Capacitor pode usar `capacitor://localhost` no iOS e `https://localhost` no Android; valide a origem escolhida no build nativo.

O domínio do serviço EasyPanel ainda precisa ser informado/configurado. O Dockerfile do repositório entrega a porta 80; ele não cria automaticamente um projeto EasyPanel.
