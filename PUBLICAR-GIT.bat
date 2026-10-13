@echo off
setlocal
cd /d "%~dp0"
where git >nul 2>nul
if errorlevel 1 goto requisitos
where node >nul 2>nul
if errorlevel 1 goto requisitos
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>22||major===22&&minor>=18?0:1)"
if errorlevel 1 goto requisitos
if not exist .git (
  echo Clone https://github.com/daflones/lifebotsproject22k.git antes de publicar.
  if /i not "%~1"=="--encadeado" pause
  exit /b 1
)
node scripts/publish-git.mjs --check
if errorlevel 1 goto falha
call npm run check
if errorlevel 1 goto falha
call npm test
if errorlevel 1 goto falha
call npm run test:edge
if errorlevel 1 goto falha
call npm run build
if errorlevel 1 goto falha
call npm run verify:package
if errorlevel 1 goto falha
git status --short
choice /c SN /m "Validacoes OK. Criar commit e enviar para daflones/lifebotsproject22k?"
if errorlevel 2 exit /b 2
node scripts/publish-git.mjs
if errorlevel 1 goto falha
echo Commit e push concluidos. O EasyPanel atualiza se o Auto Deploy estiver configurado.
if /i not "%~1"=="--encadeado" pause
exit /b 0
:requisitos
echo Instale Git e Node.js 22.18 ou superior.
if /i not "%~1"=="--encadeado" pause
exit /b 1
:falha
echo Publicacao interrompida. Corrija a falha antes de tentar novamente.
if /i not "%~1"=="--encadeado" pause
exit /b 1
