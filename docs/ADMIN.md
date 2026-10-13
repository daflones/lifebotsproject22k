# LifeBots 0.8.0 — configuração como regra do produto

**Todo recurso de conteúdo, economia, apresentação ou gameplay novo deve incluir configuração no painel administrativo.** Não adicione preço, prêmio, fase, inimigo ou mensagem de campanha que somente possa ser alterado no código. No modo conectado, alterações exigem autorização do servidor e auditoria; a demonstração salva apenas neste navegador.

## Controles disponíveis

| Aba | Configuração |
| --- | --- |
| Guildas e eventos | Custo de criação, capacidade, hierarquia, bônus de convite em três níveis, política de primeira entrada, quotas, XP/níveis, timeout, pontos, prêmios, mapas e calendário |
| Trading | Disponibilidade, preço mínimo/máximo, taxas LC/RC, limite/prazo de ofertas, propostas e transferências |
| Chat | Disponibilidade, janela flutuante, largura/altura inicial, início minimizado, tamanho/cooldown/histórico, mensagens paginadas, remover mensagens e suspender/liberar piloto |
| Usuários | Busca/paginação, perfil, redes, saldos disponíveis/reservados, produtos/peças e ajustes auditados |
| Depósitos | Referências, datas, valores, LC cotada/creditada, status, filtros e taxas |
| Saques | Política manual/automática, teto, reserva, revisão com motivo, taxas, status e histórico |
| Avisos globais | Título, mensagem, imagem, botão/link, disponibilidade, destaque e versão |
| Economia | Cotações LC/BRL e RC/LC, mínimo/taxa de saque, tutorial, custo/caps de evolução, cotas/passes, prêmio/perda da arena e comissões 1–3 |
| Robôs | Nome, descrição, classe, raridade, preço/moeda, produção, duração, usos, atributos, imagem, cor e espaços disponíveis de novas aquisições |
| Peças | Preço/moeda, slot, compatibilidade por classe, imagem, nível e bônus |
| Campanha e temporadas | Criar/editar fases em ordem, cenas, história, objetivo, conclusão, transmissões entre ondas, poder, prêmio, 1–8 inimigos com modelo/nome/atributos, disponibilidade; criar/editar temporadas e guia; replay global ou por fase |
| Adversários | Nome próprio, modelo, disponibilidade e multiplicadores de ataque/defesa/vida |
| Combate e progressão | Ataque/especial/defesa, dano mínimo, energia, variação, crescimento de atributos/produção, dificuldade, cura entre ondas e tempos das animações; entrada manual/automática nos encontros |
| Sons | Disponibilidade de música/efeitos, tema, BPM, volumes gerais e por categoria, prévias de notificações/coleta/aquisição/montagem/evolução/chat |
| Textos | Títulos, descrições, botões de navegação, marca/login/cadastro e mapa de substituições de textos simples |
| Visual e mensagens | Nome, guia, cor, composição, cenários do hangar/login, três robôs do login, aviso/imagem/link/botão e regras da carteira |
| Atividade | Extrato de demonstração, exportação do estado e reinício explícito |

Os PNGs originais e WebP estão no pacote. O Studio permite envio de imagens e áudios nos formatos autorizados para o bucket `lr-media`; consulte `STUDIO_V7.md`. Código/CSS arbitrário não é enviado pelo painel. Para ampliar as temporadas, adicione capítulos novos e então atribua um intervalo que não se sobreponha às temporadas existentes.

## Contratos e histórico

IDs de capítulo e sequência de progressão permanecem estáveis. Pausar uma fase impede novas entradas, sem invalidar uma missão já iniciada. Um robô usado no inventário, campanha, guia ou arena não pode ser removido sem resolver suas referências. Arquivar no produto conectado deve preservar contratos/definições de robôs já adquiridos.

Cada missão captura regras, robô, inimigos, recompensa e preço de entrada. Alterar o admin não muda essa missão; a retomada usa o mesmo ticket. Configuração afeta novas entradas. Reprodução de uma vitória nunca repete o prêmio. O backend também preserva contratos de aquisição, períodos de produção e cotações congeladas.

Textos são escapados. Permissões, credenciais, razão financeira, isolamento DEMO/REAL e identificação de adversário controlado pelo jogo são invariantes do sistema. Somente um administrador autenticado pode alterar a política de pagamentos em Economia, após homologação. O painel não transforma um adversário automático em pessoa conectada.

## Integração conectada

`content.js` contém defaults; `core.js` valida; `content-admin.js` apresenta/grava via adapter. Online, `admin_save` verifica o papel, valida o conteúdo e persiste via RPC com auditoria. O runtime administra contas reais no modo conectado; contas de exemplo e alterações da demonstração continuam locais. Conceda o papel admin conforme `CONEXAO_SUPABASE.md`.

## Gestão 0.4

Usuários: busca por nome/e-mail/WhatsApp/código; paginação (8 por página), perfil, robôs/peças, datas, rendimentos, batalhas/usos, valor de devolução, indicadores e equipe. Ajuste LC/RC exige motivo e mantém auditoria; não usa reservas como saldo disponível. O usuário local e três contas de exemplo permitem testar ações sem banco.

Produção/atributos de um robô individual: informe valores efetivos RC/dia, ataque, defesa e vida. Antes de atualizar, a produção anterior é liquidada e o servidor abre um novo período de taxa. Contrato de aquisição e devolução não é reescrito.

Depósitos/saques: registros com piloto, referência, valor BRL, LC, taxa, data/status, filtros e paginação. Saque pendente tem aprovação/recusa com observação. A política automática vale em pedidos novos e tem limite em R$ (0 = sem teto); excedentes aguardam. Aprovação não debita duas vezes; recusa devolve a reserva uma única vez. Status da demo é uma simulação, nunca prova de pagamento.

Avisos globais: título, mensagem, imagem, botão/link, disponibilidade e popup ao entrar, com versão e histórico. Na demo, a publicação é local; no modo conectado, o backend persiste a publicação e entrega os avisos ativos aos pilotos.

Configurações adicionais: multiplicador de produção (padrão 10), devolução (% padrão 100, novos contratos), fundo/intensidade/movimento/atmosfera, controle inicial de campanha, títulos/nomes/descrições/serial/raridade, áudio nativo, tema de combate e URLs HTTPS opcionais.

## Sistemas sociais 0.5

A administração local inclui 17 abas e seis perfis de exemplo. Guildas/eventos, ofertas/transferências e mensagens têm paginação própria. Configurações sociais são validadas e auditadas; remoção/suspensão de chat registra quem foi moderado e o período. Toda recompensa, taxa, duração e limite dos novos sistemas tem controle no painel. Textos simples podem ser substituídos na aba Textos.

Ofertas capturam preço, taxa e expiração; duelos capturam atributos, regras, quota, deadline e prêmio. Uma edição de evento preserva suas datas/prêmios após a primeira participação; para alterar o contrato, crie nova edição. Ação Encerrar teste só modifica o cenário local de demonstração.

Convites podem usar política de primeira guilda por piloto ou de entrada única por guilda. Mudar a política não apaga recibos anteriores. Marcos de nível congelam membros elegíveis e valor; novos membros não recebem marcos passados. Prêmios finais usam a guilda representada na edição, mesmo depois de sair. Veja `SOCIAL_BACKEND.md` para regras de concorrência, direitos do proprietário e autorização.

O modo conectado persiste configurações, eventos, moderação, hierarquia e resultados com autorização no servidor. As ações do jogo estão implementadas. Homologação bancária e validação com dois pilotos no domínio de produção continuam descritas em `VERIFICACAO.md`.

## Janela de chat e efeitos 0.5.1

Modo/posição/canal da janela são preferências pessoais por conta/aparelho; não integram o estado financeiro. Admin pode configurar tamanho inicial, disponibilidade e início minimizado para novos pilotos. Arraste é pelo título; a área de mensagens continua com rolagem nativa. Minimizar/maximizar/trocar de canal não navega para fora do hangar.

Volumes separados: notificações, coleta/recompensas, aquisições, montagem, evolução e mensagens. Os botões de prévia ativam o áudio por gesto. Efeitos de sucesso só são emitidos após a ação ser aceita; coleta zero permanece sem som de moeda. Mute do piloto e disponibilidade/volume do admin continuam prevalecendo.


## Combate e áudio 0.6.0

- Robôs: atlas de combate (novas poses, original ou outro modelo), assinatura visual e tom de efeito entre 0,5 e 2. Cor segue a identidade configurada.
- Campanha e temporadas: trilha de exploração, trilha de combate, BPM separado e URLs HTTPS opcionais. Tema vazio herda a configuração geral.
- Áudio: 15 temas com versões OGG/MP3; troca por temporada pode ser desligada. Volumes separados de motores/movimentos, golpes/impactos/defesa e carga/especiais, com prévias.
- Combate: duração da sequência usa actionMs. Batalhas em andamento preservam suas regras.
- Chat: X fecha por preferência do piloto; botão Chat no cabeçalho reabre. Não é uma suspensão administrativa nem remoção do canal.
