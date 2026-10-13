# Arena LifeBots

A fila está conectada ao Supabase. `arena_find_match` seleciona um robô elegível, procura outro piloto disponível e retorna `searching` ou `match`. O cliente consulta a fila enquanto aguarda. Apenas após `matchTimeoutSeconds` pode surgir adversário controlado pelo jogo.

O servidor congela atributos, regras, recompensa e perda. Ao iniciar consome um uso diário/vitalício e reserva RC para a possível derrota. Cancelar antes de parear preserva a cota. Cancelar após parear retorna a disputa existente e mantém suas reservas.

`arena_move` recebe `match_id`, `move` e `expected_version`. O servidor verifica ator, turno e versão, aplica ataque/defesa/especial e alterna o turno; o cliente anima o resultado. Prazo padrão de turno: 45 segundos. Limite total de arena: 15 minutos. Desistência ou prazo vencido é liquidado uma vez; uma disputa sem vencedor libera as reservas. Guildas usam a mesma mecânica com prazo/regras do evento.

`arena_poll_match` sincroniza vida, energia, rodada e estado. `arena_finish` pode registrar desistência, mas não aceita vitória escolhida pelo cliente. A manutenção periódica fecha partidas abandonadas. Atualizar a página recupera o combate ativo.

O adversário é apresentado pelo nome e modelo. A regra de substituição por um oponente controlado pelo jogo fica explicada antes da busca. Snapshot de combate entrega atributos visíveis, sem contrato ou rendimentos privados do oponente.

Verificação: duas contas autenticadas parearam, receberam o mesmo estado, alternaram turno e liquidaram ambas as reservas sem duplicar recompensa. Testes adicionais cobrem cancelamento antes/depois do pareamento, fallback, perda e idempotência. Não houve teste de carga ou teste de conexão instável em aparelhos reais.
