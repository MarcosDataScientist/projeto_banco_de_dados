@echo off
title Iniciar Servidores - Sistema de Avaliacao

echo.
echo ========================================
echo   INICIANDO SERVIDORES
echo ========================================
echo.

REM Mudar para o diretório do script
cd /d %~dp0

REM Iniciar Backend em nova janela
echo [1/2] Iniciando Backend (Flask)...
start "BACKEND - Flask Server" cmd /k "cd /d %~dp0backend && conda activate env_projeto_banco_de_dados && python run.py"

REM Aguardar antes de iniciar o frontend
echo [INFO] Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

REM Iniciar Frontend em nova janela
echo [2/2] Iniciando Frontend (React/Vite)...
start "FRONTEND - React Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   SERVidores INICIADOS!
echo ========================================
echo.
echo Backend:  http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Os servidores estao rodando em janelas separadas.
echo Feche esta janela quando desejar.
echo.
pause

