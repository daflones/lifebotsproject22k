# Commit e push manual — LifeBots

Destino: https://github.com/daflones/lifebotsproject22k — branch `main`.

Na leitura de 13/10/2026, a branch `main` continha o commit inicial `ba0b6204fa67ba205e5564c1faa08851cbe0309d` de documentação. O jogo completo estava no commit local posterior, cujo push parou na autenticação. Esta revisão não fez commit/push. Preserve o histórico existente; não inicialize outro repositório independente para depois forçar o envio.

## Se você ainda não tiver um clone

Instale Git e Node.js 22.18+. Em uma pasta diferente da pasta extraída do ZIP, clone o destino:

```bash
git clone https://github.com/daflones/lifebotsproject22k.git
cd lifebotsproject22k
```

Copie **o conteúdo** da pasta `lifebotsproject22k` extraída do ZIP para a raiz desse clone, onde deve ficar `package.json` ao lado da pasta `.git`. Copie também `.gitignore`, `.gitattributes` e `.dockerignore`, e preserve `.git`. Então execute:

```bash
npm run check
npm test
npm run test:edge
npm run build
npm run verify:package
git branch --show-current
git remote -v
git status --short
git add .
git diff --cached --stat
git commit -m "Entrega LifeBots 0.8 para EasyPanel"
git push -u origin main
```

Confirme `main` e o remote indicado antes do commit. Se o Git pedir nome/e-mail para o commit, configure seu próprio nome e o e-mail da sua conta GitHub com `git config user.name` e `git config user.email`. A autenticação HTTPS do Git for Windows normalmente abre o navegador via Git Credential Manager. Use sua conta; não coloque credenciais na URL do remote nem nos arquivos do jogo.

## Se você já tiver um clone

1. No seu clone, confira `git status`. Preserve ou faça commit de alterações pessoais antes de sobrepor arquivos.
2. Atualize a branch `main` a partir do GitHub. Para uma branch com histórico, use `git pull --ff-only`; se houver divergência, resolva-a antes de continuar.
3. Copie **o conteúdo** da pasta extraída `lifebotsproject22k` para a raiz do clone. Preserve a pasta `.git`; não coloque uma pasta `lifebotsproject22k` dentro de outra. Copie também `.gitignore`, `.gitattributes` e `.dockerignore`.
4. Execute os cinco comandos npm da seção anterior. Em seguida:

```bash
git remote -v
git status --short
git add .
git diff --cached --stat
git commit -m "Entrega LifeBots 0.8 para EasyPanel"
git push -u origin main
```

Se seu clone conserva o commit local completo criado na tentativa anterior, os novos arquivos podem entrar como um commit posterior. Confira `git log -3 --oneline` e o status; não apague o histórico para contornar a autenticação.

## Conteúdo do primeiro commit

Inclua `src/`, `scripts/`, `dist/` **com `dist/assets/`**, `supabase/`, `tests/`, `deploy/`, `docs/`, Dockerfile, package.json e os scripts Windows. O build recompila JS/CSS mas preserva as imagens e o áudio em `dist/assets`.

O maior arquivo do pacote tem aproximadamente 3,31 MiB. Você não precisa de Git LFS para os arquivos desta entrega. Não adicione o ZIP ou os arquivos privados `.env`, token CLI, credenciais do gateway, senha do banco ou service role. A configuração pública do Supabase pode permanecer em `src/config.js`.

## Falhas comuns

| Mensagem/sintoma | Correção |
| --- | --- |
| `not a git repository` | Abra a pasta do clone e copie o conteúdo do ZIP para ela |
| `remote origin already exists` | Confira `git remote -v`; se for este projeto, use o origin existente |
| `Authentication failed` | Entre no GitHub pelo gerenciador de credenciais do Git; senha da conta não substitui a autenticação Git |
| `src refspec main does not match any` | Confira se criou o commit e se sua branch é `main` |
| `non-fast-forward` | Há histórico remoto novo; atualize e resolva conflitos. Não use force push |
| `nothing to commit` | O conteúdo já está registrado; confira o status e faça apenas o push pendente |
| Imagens ausentes no EasyPanel | Confira se `dist/assets/` foi incluída e se o build usa a raiz correta |

`PUBLICAR-GIT.bat` continua disponível se você preferir executar o assistente local depois de preparar o clone. Ele pede confirmação no seu PC e não é executado por esta entrega.
