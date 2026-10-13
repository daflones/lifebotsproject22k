@echo off
setlocal
cd /d "%~dp0"
call "%~dp0ATUALIZAR-SUPABASE.bat" --encadeado
if errorlevel 1 goto falha
call "%~dp0PUBLICAR-GIT.bat" --encadeado
if errorlevel 1 goto falha
echo Atualizacao do backend e publicacao no GitHub concluidas.
pause
exit /b 0
:falha
echo Fluxo interrompido ou cancelado. As proximas etapas nao foram executadas.
pause
exit /b 1
