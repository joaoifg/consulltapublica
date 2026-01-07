#!/bin/bash
# Script para iniciar o sistema localmente no Linux/Mac

echo "========================================"
echo "Sistema de Consulta Pública - CFO"
echo "========================================"
echo ""

# Verificar se Docker está rodando
if ! docker ps > /dev/null 2>&1; then
    echo "[ERRO] Docker não está rodando!"
    echo "Por favor, inicie o Docker e tente novamente."
    exit 1
fi

echo "[1/4] Verificando containers..."
docker-compose ps

echo ""
echo "[2/4] Iniciando banco de dados..."
docker-compose up -d db

echo ""
echo "[3/4] Aguardando banco de dados estar pronto..."
sleep 5

echo ""
echo "[4/4] Iniciando backend e frontend..."
docker-compose up -d backend frontend

echo ""
echo "========================================"
echo "Sistema iniciado com sucesso!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "Documentação API: http://localhost:8000/docs"
echo ""
echo "Para ver os logs:"
echo "  docker-compose logs -f"
echo ""
echo "Para parar o sistema:"
echo "  docker-compose down"
echo ""




