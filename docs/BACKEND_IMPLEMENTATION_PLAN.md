# Estado da implementação — 0.8.0

Implementado e publicado no projeto Supabase do LifeBots:

- Auth, indicação opcional e papéis admin no banco.
- Estado autoritativo, revisões/transação, ledger, reservas e idempotência.
- Aquisição/equipamento/evolução, produção proporcional, expiração e devolução LC.
- Comissões em três níveis sobre produção real do jogo, após conclusão do dia.
- Arena entre jogadores, turnos, cancelamento, fallback e liquidação de ambos.
- Sessões de aventura persistentes, ondas, replay cobrado e prêmio único.
- Chats Global/Mercado/Guilda com Realtime, RLS e moderação.
- Guildas/hierarquia/convites, guerras/eventos/marcos e recompensas.
- Vendas/trocas com reserva, aceite e continuidade de contrato/propriedade.
- Administração de usuários, saldos, robôs, configurações, conteúdo, mídia e avisos.
- Adapter Pix MercosulPay, webhook HMAC, outbox/reconciliação e revisão/automação de saques.
- Migrations 001–015 e cron protegido por Vault/segredo.

Pendências de distribuição/homologação: validar uma transação bancária autorizada no gateway, identificar a conta permanente de admin, configurar domínio/serviço EasyPanel, testar gráficos/áudio e ciclos de app em iOS/Android, compilar/assinar os binários. Não restam stubs 501 para o Devin concluir o motor do jogo.

Evolução de escala: testes de carga, paginação no banco para administração e particionamento do mundo por guilda/partida, mantendo as garantias econômicas. Leia `BACKEND.md`, `VERIFICACAO.md` e o prompt de manutenção antes de alterar o runtime.
