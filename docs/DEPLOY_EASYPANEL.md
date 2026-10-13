# Deploy do LifeBots no EasyPanel

O frontend é estático: o Dockerfile recompila fontes e os serve pelo Nginx. Auth, banco, mídia enviada pelo admin, Realtime e Edge Functions continuam no Supabase `edzgczsnxlkhkpovtspg`. Criar o serviço EasyPanel não aplica migrations nem publica funções Supabase.

## Configuração do serviço

Depois do push, crie um projeto no EasyPanel e um serviço **App**. Em Source, selecione **GitHub**. Em Build, selecione **Dockerfile**. A fonte inline chamada Dockerfile é outro recurso; para este pacote, a fonte deve ser o repositório.

| Campo | Valor |
| --- | --- |
| Repositório | `daflones/lifebotsproject22k` |
| Branch | `main` |
| Build Path | `/` |
| Builder | Dockerfile |
| Caminho do Dockerfile | `Dockerfile` |
| Protocolo interno do domínio | HTTP |
| Porta de destino/porta interna | `80` |
| Caminho público | `/` |
| HTTPS público | Ativado no domínio |
| Comando de início/override | Deixe vazio; a imagem inicia Nginx |
| Health check, se o painel mostrar o campo | `GET /healthz`, porta 80 |
| Auto Deploy | Opcional; ative para novos pushes em `main` |

Não defina `PORT=3000` nesse serviço Docker/Nginx. A porta 3000 é do servidor local para desenvolvimento. Use a configuração Domains do EasyPanel para o site; não é necessário publicar diretamente uma porta do servidor.

Este frontend não exige variáveis privadas nem volume persistente no EasyPanel. Copie as duas variáveis públicas de `.env.example` para Environment no EasyPanel: `SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY`. O entrypoint do Nginx gera `/config.js` ao iniciar o container; sem variáveis, usa o projeto Supabase existente. O HTML carrega esse arquivo fora dos módulos com hash, com cache `no-store`. Não coloque service role, senha de banco, token CLI ou chave MercosulPay nesse serviço. As chaves privadas do gateway e o segredo do job pertencem a **Supabase → Edge Functions → Secrets**.

Domínio de produção: **https://lifebots.com.br**. Use esse hostname em Domains, destino HTTP/80 e HTTPS público. O frontend publicado exige conta Supabase e não permite ativar demonstração por preferência antiga do navegador.

## Domínio e HTTPS

1. Escolha o hostname do jogo, por exemplo `jogo.seudominio.com.br`. O domínio/IP do servidor não foi definido nesta entrega.
2. Se usar domínio próprio, aponte o DNS para o servidor EasyPanel. Adicione o hostname em Domains, destino HTTP/80, caminho `/`, e ative HTTPS/certificado. Também pode começar pelo domínio automático oferecido pelo EasyPanel.
3. Defina um domínio principal. Abra o endereço HTTPS e confira o certificado e `/healthz`.
4. No Supabase, registre o **mesmo endereço realmente usado pelo navegador**, inclusive quando começar com domínio automático.

O app foi preparado para a raiz do domínio; não publique em uma subpasta como `/lifebots/` sem adaptar os caminhos e a PWA.

## Supabase Auth e CORS

Em **Authentication → URL Configuration**:

| Campo | Exemplo a substituir |
| --- | --- |
| Site URL | `https://SEU_DOMINIO` |
| Redirect de cadastro | `https://SEU_DOMINIO/#login` |
| Redirect de recuperação | `https://SEU_DOMINIO/#recover` |
| URL raiz permitida | `https://SEU_DOMINIO/` |

Preserve os redirects locais/de outros domínios que você ainda utiliza. Revise os templates de e-mail se você os personalizou para usar uma URL fixa. A configuração remota atual confirma e-mails automaticamente; alterar confirmação é uma decisão no painel Auth e deve ser testada com cadastro/recuperação reais.

Em **Edge Functions → Secrets**, acrescente o domínio a `ALLOWED_ORIGINS`, preservando origens existentes:

```text
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://SEU_DOMINIO
```

Use origens exatas, sem barra final, caminho ou `#login`. Se usar `www` e sem `www`, inclua ambos ou redirecione para o domínio canônico. O trecho é exemplo; substitua pelo domínio real e mantenha a origem do Site anterior se ainda for usada. Atualizar Secrets já afeta as funções publicadas; configurar essa variável apenas no EasyPanel não altera o backend.

## Conferir banco e administrador

As migrations 001–015 foram instaladas na implementação anterior. Esta revisão verificou as quatro funções remotamente sem alterar contas/banco, mas não repetiu a inspeção autenticada de migrations, cron e Vault. Rode `supabase migration list` ou consulte `supabase/tests/preflight-production.sql` no SQL Editor do projeto correto.

O arquivo preflight faz somente consultas. Confira 15 versões, catálogo ativo, RLS, funções privadas, job único/ativo e pagamentos pausados até homologação. Ele não imprime o segredo do Vault, e-mails ou dados Pix. Não execute `db reset` para validar uma instalação já publicada.

Cadastre sua conta pelo jogo e conceda admin como explicado em `CONEXAO_SUPABASE.md`. O primeiro usuário não vira administrador automaticamente. Confirme que uma conta comum não recebe acesso administrativo.

## Verificar o endereço publicado

Na raiz do projeto, com Node.js 22.18+:

```bash
npm run verify:deploy -- --url https://SEU_DOMINIO
```

O comando verifica saúde, HTML, build exato, módulos, imagem, cabeçalhos/cache, 404 de arquivos ausentes, SDK, Auth, CORS e proteções públicas da API/jobs/webhooks. Ele não comprova login, callbacks de e-mail, autorização de duas contas, cron rodando ou pagamento liquidado.

Para testar apenas a autorização de uma origem antes do deploy:

```bash
npm run verify:deploy -- --origin https://SEU_DOMINIO
```

O segundo comando não verifica o frontend EasyPanel. O comando sem argumentos usa localhost para as verificações do backend.

## Teste funcional antes de abrir ao público

| Fluxo | Resultado esperado |
| --- | --- |
| Cadastro, saída/login e recuperar senha | Conta correta, URLs no domínio do jogo e sessão retomada |
| Tutorial | Bônus pago uma vez; atualizar a página não repete |
| Duas contas em navegadores separados | Inventários/saldos próprios; uma não altera a outra |
| Arena | Parear dois pilotos aptos, alternar turnos, concluir e liquidar uma vez; repetir após recarregar |
| Chat | Global/Mercado sincronizam entre contas; canal de guilda restrito aos membros |
| Guilda e mercado | Convite/hierarquia e venda/troca respeitam titularidade, confirmação e reservas |
| Campanha | Retoma uma missão após atualizar; recompensa única ao terminar todas as ondas |
| Admin | Mudança de conteúdo chega à conta comum; tentativa por usuário comum é recusada |
| Job | `lr_job_runs` registra execução recente, sem falhas inesperadas ou jobs duplicados |
| Celular/PWA | Botões, teclado, arraste, áudio ativado por gesto, instalação e atualização |

Use contas identificadas e operações expressamente autorizadas para validar os fluxos conectados. A versão publicada não oferece acesso à demonstração. Na validação conectada, não credite valores nem realize pagamentos sem uma operação de teste expressamente pretendida.

## Pagamentos

O adapter MercosulPay está implementado, mas a homologação financeira continua pendente. Seu contrato precisa corresponder ao fornecedor: endpoints, cabeçalhos de assinatura, IDs de referência, centavos, código/QR Pix, webhook, status e custo total do saque.

1. Confirme a documentação do fornecedor e as chaves nos Secrets; mantenha o webhook `https://edzgczsnxlkhkpovtspg.supabase.co/functions/v1/mercosulpay-webhook`.
2. Homologue em ambiente apropriado ou com uma operação de teste autorizada: cobrança → pagamento → webhook → crédito único; saque → reserva → envio → confirmação/captura.
3. Valide timeout, repetição do webhook, falha definitiva e conciliação de operação incerta. Não reenvie um saque sem saber o estado do anterior.
4. Só depois ative a política em Admin → Economia para os usuários. Aprovar conteúdo ou configurar uma chave não confirma liquidação bancária.

## Diagnóstico rápido

| Falha | Onde corrigir |
| --- | --- |
| 502 no domínio | Destino HTTP/80, serviço em execução e logs do EasyPanel |
| Build não acha Dockerfile/assets | Build Path `/`, fonte GitHub, arquivos presentes no commit |
| Login/API com CORS ou `ORIGIN_NOT_ALLOWED` | `ALLOWED_ORIGINS` nos Secrets do Supabase |
| Link de e-mail abre localhost ou outro site | Site URL, Redirect URLs e template Auth |
| API 503 `BACKEND_NOT_READY` | Migrations/funções/variáveis do projeto Supabase |
| Conta não mostra admin | Papel no banco; saia e entre após concessão |
| Depósito/saque diz pausado | Homologação e política de pagamentos no admin |
| Build remoto diferente | Commit/branch do EasyPanel, novo deploy e resultado de `/version.json` |
| Áudio silencioso | Ative som por gesto e confira volume/permissão no dispositivo |

## Referências oficiais

- EasyPanel App, GitHub, builder e Domains: https://easypanel.io/docs/services/app
- Supabase redirects: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase Secrets: https://supabase.com/docs/guides/functions/secrets

Os exemplos do projeto foram ajustados ao código desta entrega; os links descrevem os serviços. O domínio final ainda depende de você defini-lo no painel.
