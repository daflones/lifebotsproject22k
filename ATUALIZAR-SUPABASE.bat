@echo off
setlocal
cd /d "%~dp0"
where supabase >nul 2>nul
if errorlevel 1 (
  echo Instale o CLI Supabase conforme docs/ATUALIZACOES.md.
  if /i not "%~1"=="--encadeado" pause
  exit /b 1
)
if not exist supabase\.temp\project-ref (
  echo Vincule o projeto: supabase link --project-ref edzgczsnxlkhkpovtspg
  if /i not "%~1"=="--encadeado" pause
  exit /b 1
)
set "LIFEBOTS_PROJECT_REF="
set /p LIFEBOTS_PROJECT_REF=<supabase\.temp\project-ref
if not "%LIFEBOTS_PROJECT_REF%"=="edzgczsnxlkhkpovtspg" (
  echo Atualizacao interrompida: o checkout nao esta vinculado ao Supabase do LifeBots.
  if /i not "%~1"=="--encadeado" pause
  exit /b 1
)
echo Projeto verificado: edzgczsnxlkhkpovtspg
call supabase db push --dry-run
if errorlevel 1 goto falha
choice /c SN /m "Aplicar as migrations listadas e publicar as quatro funcoes?"
if errorlevel 2 exit /b 2
call supabase db push
if errorlevel 1 goto falha
call supabase functions deploy game-api --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
if errorlevel 1 goto falha
call supabase functions deploy daily-settlement --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
if errorlevel 1 goto falha
call supabase functions deploy payment-webhook --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
if errorlevel 1 goto falha
call supabase functions deploy mercosulpay-webhook --project-ref edzgczsnxlkhkpovtspg --use-api --no-verify-jwt
if errorlevel 1 goto falha
echo Backend atualizado. A politica de pagamentos e preservada.
if /i not "%~1"=="--encadeado" pause
exit /b 0
:falha
echo Atualizacao interrompida. Corrija a falha antes de executar as proximas etapas.
if /i not "%~1"=="--encadeado" pause
exit /b 1
