@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale Node.js 22.18 ou superior: https://nodejs.org
  pause
  exit /b 1
)
node -e "const [major,minor]=process.versions.node.split('.').map(Number);process.exit(major>22||major===22&&minor>=18?0:1)"
if errorlevel 1 (
  echo Atualize o Node.js para a versao 22.18 ou superior.
  pause
  exit /b 1
)
call npm run build
if errorlevel 1 goto falha
start "LifeBots - servidor" cmd /k "npm start"
timeout /t 2 /nobreak >nul
start "LifeBots" "http://localhost:3000"
exit /b %errorlevel%
:falha
echo Nao foi possivel preparar o aplicativo.
pause
exit /b 1
