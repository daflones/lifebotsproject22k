# LifeBots — 0.8.0

Jogo 2D responsivo com backend Supabase publicado, autenticação, produção de robôs, arena entre jogadores, aventura, guildas, trading e chat. O acesso padrão é pela conta Supabase. Na tela de login, **Voltar à prévia do jogo** abre uma demonstração independente com moedas de teste.

## Conteúdo

- 15 modelos com identidade, descrição e arte própria; 540 poses de combate, equipamentos por espaço e evolução.
- Seis temporadas, 42 capítulos principais e 12 missões opcionais. Exploração, múltiplos inimigos, recompensas únicas e replay pago configurável.
- Trilhas originais por temporada, variação de combate, efeitos por robô e sons de aquisição, coleta e notificações. Imagens e áudios próprios podem ser enviados pelo admin.
- Hangar com equipe ao fundo; Meus robôs e Rede no rodapé; chat flutuante com fechar, minimizar, maximizar e arrastar.
- Arena com fila real, turnos verificados no servidor, prioridade para outro piloto e adversário controlado pelo jogo após o tempo configurado.
- Carteira LC/RC, conversão, contrato de aquisição, produção proporcional, comissões diárias em três níveis e devolução LC ao expirar.
- Guildas com hierarquia, convites, níveis, guerras, eventos com datas e recompensas; mercado com venda e troca mediante aceite.
- Painel administrativo com usuários, perfis, saldos, robôs, rede, depósitos/saques, auditoria, avisos, economia e editores de conteúdo.

## Executar

Node.js 22 ou superior. O frontend não exige instalação de dependências:

```bash
npm run check
npm test
npm run build
npm start
```

No Windows, abra `ABRIR-LIFEROBOTS.bat`. O endereço local é `http://localhost:3000`. Confirme o e-mail após o cadastro Supabase. O tutorial libera o bônus inicial configurado pelo administrador uma única vez.

## Backend e pagamentos

O projeto Supabase é `edzgczsnxlkhkpovtspg`. As 15 migrations foram aplicadas e as quatro Edge Functions estão publicadas: `game-api`, `daily-settlement`, `payment-webhook` e `mercosulpay-webhook`. Um job a cada cinco minutos processa lotes de produção/comissões do dia concluído, expirações e a fila de pagamentos.

O adapter MercosulPay implementa criação Pix, cotação congelada, assinatura HMAC, reconciliação, reserva de saque, revisão administrativa/automática e proteção contra repetição. **Pagamentos bancários permanecem pausados no painel até a homologação com o gateway.** A verificação desta entrega não criou cobrança nem realizou saque real. O administrador pode controlar a ativação em Admin → Economia; configurar uma chave não confirma um pagamento.

Somente URL e chave publicável estão em `src/config.js`. Chaves privadas ficam nos segredos das Edge Functions. Admin é um papel concedido no banco, não uma opção no cadastro: consulte `docs/CONEXAO_SUPABASE.md`.

## Atualizar e publicar

Repositório: https://github.com/daflones/lifebotsproject22k

- `PUBLICAR-GIT.bat`: valida, gera build, cria commit e faz push para o repositório autorizado.
- `ATUALIZAR-SUPABASE.bat`: confere o projeto, aplica migrations pendentes e publica as quatro funções.
- `ATUALIZAR-TUDO.bat`: executa backend e Git em sequência, interrompendo em caso de falha.
- EasyPanel: Dockerfile na raiz, porta interna 80 e HTTPS. Acrescente seu domínio aos redirects Auth e a `ALLOWED_ORIGINS` antes de usar contas nesse domínio.

O app está preparado como PWA e tem configuração Capacitor. APK/AAB/IPA e publicação nas lojas não foram gerados. Consulte `docs/MOBILE.md` para compilação e testes em aparelhos.

## Estrutura

| Caminho | Uso |
| --- | --- |
| `src/` | Interface e regras compartilhadas; altere os fontes aqui |
| `dist/assets/` | Artes originais PNG, WebP, atlas e trilhas OGG/MP3 |
| `dist/releases/` | Build com hash para atualização consistente |
| `supabase/migrations/` | Schema, RLS, ledger, runtime, conteúdo e agendamento |
| `supabase/functions/` | API autoritativa, pagamentos e job diário |
| `tests/` | Verificação de regras, interface, combate, build e pagamentos |
| `docs/` | Operação, configuração, assets, validação e manutenção |

O estado local da prévia não é importado como saldo de uma conta real. No modo conectado, servidor e ledger determinam saldos, contratos, horários e resultados. Consulte `docs/VERIFICACAO.md` para o alcance dos testes desta versão e `docs/PROMPT_DEVIN_WINDSURF.md` para manutenção do backend já implementado.
