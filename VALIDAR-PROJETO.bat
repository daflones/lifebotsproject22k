@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto requisitos
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>22||major===22&&minor>=18?0:1)"
if errorlevel 1 goto requisitos
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
echo Projeto validado. Consulte LEIA-PRIMEIRO.md para Git e EasyPanel.
if /i not "%~1"=="--encadeado" pause
exit /b 0
:requisitos
echo Instale Node.js 22.18 ou superior.
if /i not "%~1"=="--encadeado" pause
exit /b 1
:falha
echo Validacao interrompida. Nenhum commit ou push foi executado.
if /i not "%~1"=="--encadeado" pause
exit /b 1
