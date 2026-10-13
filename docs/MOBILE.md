# LifeBots no Android e iPhone

A entrega é um jogo web com preparo de PWA. A publicação HTTPS permite usar no navegador e adicionar à tela inicial. Não foram compilados APK, AAB ou IPA nesta etapa. O jogo utiliza a conta Supabase e a integração Pix MercosulPay; operações financeiras dependem da política de pagamentos habilitada e da confirmação do gateway.

## Instalar a PWA

Publique o build em HTTPS com manifest, ícones e service worker acessíveis. Na página publicada:

- Android/Chrome: abra o menu do navegador e procure **Adicionar à tela inicial / Instalar**. O texto varia conforme navegador e elegibilidade da PWA.
- iPhone/Safari: abra **Compartilhar → Adicionar à Tela de Início → Adicionar**. Nas versões que exibem a opção, mantenha **Abrir como app da web** habilitada.

Adicionar a PWA à tela inicial não exige publicar na loja. A URL continua sendo necessária na primeira instalação e para atualizações. Login, compra, conversão, produção validada, PvP e pagamentos reais dependem de conexão quando o backend estiver concluído. Cache offline pode guardar imagens e a demonstração local, mas nunca confirmar pagamentos, modificar carteiras de servidor ou inventar uma vitória online.

Não cacheie respostas do Auth, funções financeiras ou tokens em service worker. Mostre estado desconectado e restaure o snapshot autenticado ao voltar à rede. Ao atualizar assets, altere a versão do cache e elimine caches antigos; não apague o estado do usuário sem uma migração da demonstração.

## Aplicativo nativo com Capacitor

Para a etapa de distribuição nativa, use o build web em `dist`, com `webDir: 'dist'` na configuração Capacitor. A base não instala SDKs nem gera pastas nativas automaticamente.

Requisitos da documentação estável Capacitor v8 consultada: Node 22+, Android Studio e SDK Android para Android; macOS, Xcode e ferramentas de linha de comando para iOS. Verifique a matriz de suporte da versão escolhida antes de iniciar. Mantenha core, CLI, Android e iOS na mesma versão principal e fixe versões no lockfile.

Se ainda não existir configuração Capacitor:

```bash
npm install @capacitor/core@8 @capacitor/android@8 @capacitor/ios@8
npm install -D @capacitor/cli@8
npx cap init LifeBots com.lifebots.app --web-dir dist
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Confirme o identificador definitivo do aplicativo antes de assinar/distribuir. `com.lifebots.app` é um exemplo, não um domínio comprado. Se a configuração já existir, revise o `appId`/`webDir` em vez de executar init novamente.

Depois de alterações web:

```bash
npm run build
npx cap sync android
npx cap open android
```

No Mac:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Android Studio/Xcode compilam e assinam os binários. Instalação de teste/distribuição nativa segue os mecanismos e certificados da plataforma; um build web não gera um aplicativo iOS instalável por conta própria. A PWA é o caminho disponível para testar pelo navegador e tela inicial.

## Integração de login e experiência

Configure redirects do Supabase Auth para o domínio HTTPS e, na etapa nativa, Universal/App Links conforme a documentação. Aceite apenas callbacks/hosts registrados; não deixe uma URL de teste aberta como redirect em produção. Na função, `ALLOWED_ORIGINS` pode incluir `capacitor://localhost` e `http://localhost` quando essas forem as origens efetivamente escolhidas no container. Senha nunca entra no armazenamento do jogo.

Revise safe areas, barra inferior, teclado nos formulários, orientação, zoom, toque, botão voltar Android e retorno de background. Pause animações fora da tela e respeite redução de movimento. Relógio do celular e animação de batalha não decidem saldo, duração contratual ou resultado: o servidor permanece a fonte desses valores.

Antes de liberar, teste instalação/atualização, login/cadastro/confirmação e recuperação de senha em Safari iPhone, Chrome Android e PWA instalada; compare extrato após retentativas, troca de aparelho e suspensão da tela. Reserve testes de pagamento para sandbox validado da gateway.

## Fontes oficiais

- [Apple: adicionar site à tela inicial](https://support.apple.com/guide/iphone/bookmark-a-website-iph42ab2f3a7/ios)
- [Chrome Android: instalar apps da web](https://support.google.com/chrome/answer/9658361?hl=pt-BR&co=GENIE.Platform%3DAndroid)
- [Capacitor: instalação](https://capacitorjs.com/docs/getting-started)
- [Capacitor: requisitos do ambiente](https://capacitorjs.com/docs/getting-started/environment-setup)
- [Capacitor: ciclo de build/sync](https://capacitorjs.com/docs/basics/workflow)
- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Capacitor iOS](https://capacitorjs.com/docs/ios)
- [Capacitor: links de retorno para o app](https://capacitorjs.com/docs/guides/deep-links)
