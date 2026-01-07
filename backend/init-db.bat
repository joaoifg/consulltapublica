@echo off
REM Script para inicializar banco de dados no Windows

echo Inicializando banco de dados...

REM Criar primeira migração
echo Criando migracao inicial...
alembic revision --autogenerate -m "Initial migration - Create tables"

REM Aplicar migrações
echo Aplicando migracoes...
alembic upgrade head

echo Banco de dados inicializado com sucesso!
pause




