#!/bin/bash
# Script para inicializar banco de dados e criar primeira migração

echo "Inicializando banco de dados..."

# Criar primeira migração
echo "Criando migração inicial..."
alembic revision --autogenerate -m "Initial migration - Create tables"

# Aplicar migrações
echo "Aplicando migrações..."
alembic upgrade head

echo "Banco de dados inicializado com sucesso!"




