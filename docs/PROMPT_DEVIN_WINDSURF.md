# Prompt de manutenção — LifeBots 0.8.0

Você está recebendo o repositório https://github.com/daflones/lifebotsproject22k. LifeBots é um jogo 2D web/PWA em JavaScript, com build estático, assets originais e backend Supabase. Preserve as cenas, sprites, áudio, responsividade, contratos e identidade visual existentes.

## Estado atual

O projeto Supabase desta entrega é `edzgczsnxlkhkpovtspg`. Há 15 migrations e quatro Edge Functions: `game-api`, `daily-settlement`, `payment-webhook` e `mercosulpay-webhook`. Auth, snapshots, arena entre jogadores, campanha, chats, guildas, trading, administração, mídia, produção, ledger e liquidação foram implementados. As ações do jogo não são mais os stubs 501 das versões históricas.

O modo padrão é `server`. A tela de login permite abrir uma prévia local independente, com moedas de teste. Não importe saldo, papéis, tickets ou resultados dessa prévia para uma conta conectada.

A ativação bancária está pausada até homologação do gateway. O adapter Pix, assinatura HMAC, outbox, reconciliação e reserva/revisão de saque existem; implementação não comprova transação bancária. Não credite por redirect, QR gerado, aprovação administrativa ou resposta incompleta.

## Antes de alterar

Leia `README.md`, `BACKEND.md`, `CONEXAO_SUPABASE.md`, `ARENA.md`, `SOCIAL_BACKEND.md`, `VERIFICACAO.md` e `MOBILE.md` em `docs/`. Inspecione o código real, principalmente `src/api.js`, `src/core.js`, `supabase/functions/_shared/runtime/` e as migrations.

Execute:

```bash
npm run check
npm test
npm run test:edge
npm run build
```

Os testes Node exercitam regras e fronteiras HTTP/assinatura; não substituem integração Supabase, concorrência, PvP humano, gateway, navegador e aparelhos. Registre evidências separadas para cada camada.

## Preservar as garantias do servidor

- Derive o ator da sessão verificada por Auth; admin vem de `lr_admin_roles`.
- Use revisões, idempotência, transação e ledger. Nunca aceite saldo, preço final, resultado, prêmio, comissão, horário ou papel calculado pelo cliente.
- O runtime conectado usa `lr_game_accounts` e `lr_game_world`; carteiras/ledger e períodos de propriedade são gravados pelas RPCs privadas. As tabelas legadas não são o hangar conectado.
- Preserve contratos congelados, produção proporcional, mudança de taxa sem retroatividade, expiração/devolução única e comissões sobre produção efetivamente ganha.
- Trading liquida produção anterior, preserva contrato/prazo e transfere titularidade somente com aceite válido. Não duplique ativos nem atribua histórico do vendedor ao comprador.
- Arena, campanha e guerras têm turnos, quotas, prazos, reservas e conclusão autoritativa. Apresentação/animação não liquida recompensa outra vez.
- RLS e snapshots restringem chats de guilda, contatos, saldos e dados de pagamento. WhatsApp exige consentimento; não confie em metadata de cadastro para admin.
- Timeout financeiro exige reconciliação. Assinatura, delivery, referência e valores precisam corresponder à operação; reembolso fica em revisão.

## Preservar a experiência

Mantenha os 15 modelos, seis temporadas/54 capítulos, 540 poses de combate, montagem por espaço, trilhas e efeitos, equipe no hangar, Meus robôs/Rede e chat flutuante. Fechar, minimizar, maximizar e arrastar o chat não devem recriar a batalha nem perder rascunho. Mute, volumes, gesto de áudio e overrides administrativos são independentes da economia.

Mantenha os editores de robôs, peças, temporadas, capítulos, inimigos, textos, sons, aparência, mídia e avisos. Imagens/áudios novos podem ser enviados pelo admin; não substitua sprites animados por um retrato estático.

## Entrega de mudanças

Acrescente migrations aditivas com timestamps novos; preserve versões aplicadas. Não use `db reset` em produção. Nunca versione tokens CLI, service role, segredos HMAC/cron, CPF/Pix ou chaves do gateway. Logs não devem expor Authorization nem corpos sensíveis.

Valide os fluxos afetados com casos de repetição, conflito, falta de saldo, autorização e retomada. Teste navegador/mobile quando alterar interface, áudio ou ciclo de app. Atualize documentação e relate o que foi realmente executado.

Use os scripts de atualização somente para os destinos verificados desta entrega. Para outro projeto, revise explicitamente configuração/cron/origens e a instalação. Código vai ao GitHub, frontend ao EasyPanel e backend ao Supabase.

Pendências de distribuição: conta permanente de admin, domínio/serviço EasyPanel, homologação bancária autorizada, QA em iOS/Android e binários nativos assinados. Confirme o estado real antes de executar uma dessas etapas.
