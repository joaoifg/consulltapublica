@echo off
REM Script para iniciar o sistema localmente no Windows
echo ========================================
echo Sistema de Consulta Publica - CFO
echo ========================================
echo.

REM Verificar se Docker está rodando
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker nao esta rodando!
    echo Por favor, inicie o Docker Desktop e tente novamente.
    pause
    exit /b 1
)

echo [1/4] Verificando containers...
docker-compose ps

echo.
echo [2/4] Iniciando banco de dados...
docker-compose up -d db

echo.
echo [3/4] Aguardando banco de dados estar pronto...
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Iniciando backend e frontend...
docker-compose up -d backend frontend

echo.
echo ========================================
echo Sistema iniciado com sucesso!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo Documentacao API: http://localhost:8000/docs
echo.
echo Para ver os logs:
echo   docker-compose logs -f
echo.
echo Para parar o sistema:
echo   docker-compose down
echo.
pause

