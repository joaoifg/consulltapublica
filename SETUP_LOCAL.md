# Setup Local - Sistema de Consulta Pública CFO

## Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose instalado
- Portas disponíveis: 3000, 8000, 5432

## Início Rápido

### Windows
```bash
start-local.bat
```

### Linux/Mac
```bash
chmod +x start-local.sh
./start-local.sh
```

### Manual
```bash
docker-compose up -d
```

## Configuração

### 1. Variáveis de Ambiente

Crie os arquivos `.env` baseados nos exemplos:

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql+asyncpg://cfo_user:cfo_password@db:5432/cfo_consulta
DATABASE_URL_SYNC=postgresql://cfo_user:cfo_password@db:5432/cfo_consulta
SECRET_KEY=seu-secret-key-aqui-min-32-chars
ENCRYPTION_KEY=sua-encryption-key-aqui-32-chars
DEBUG=True
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000,http://localhost
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 2. Migrações do Banco de Dados

As migrações serão executadas automaticamente ao iniciar o backend.

Para executar manualmente:
```bash
docker-compose exec backend alembic upgrade head
```

Para criar nova migração:
```bash
docker-compose exec backend alembic revision --autogenerate -m "descricao"
```

## Acessos

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API (Swagger)**: http://localhost:8000/docs
- **Documentação API (ReDoc)**: http://localhost:8000/redoc
- **PostgreSQL**: localhost:5432
  - Database: `cfo_consulta`
  - User: `cfo_user`
  - Password: `cfo_password` (alterar em produção!)

## Comandos Úteis

### Ver logs
```bash
docker-compose logs -f
```

### Ver logs de um serviço específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Parar sistema
```bash
docker-compose down
```

### Parar e remover volumes (limpar banco)
```bash
docker-compose down -v
```

### Reconstruir containers
```bash
docker-compose up -d --build
```

### Entrar no container
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec db psql -U cfo_user cfo_consulta
```

## Desenvolvimento

### Backend (Python/FastAPI)

```bash
# Entrar no container
docker-compose exec backend bash

# Instalar nova dependência
pip install nome-pacote
pip freeze > requirements.txt

# Executar testes
pytest

# Formatar código
black .
```

### Frontend (Next.js/React)

```bash
# Entrar no container
docker-compose exec frontend sh

# Instalar nova dependência
npm install nome-pacote

# Executar testes
npm test

# Build de produção
npm run build
```

## Troubleshooting

### Porta já em uso

Se as portas 3000, 8000 ou 5432 estiverem em uso, altere no `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
  - "5433:5432"  # PostgreSQL
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps db

# Ver logs do banco
docker-compose logs db

# Reiniciar banco
docker-compose restart db
```

### Erro de migrações

```bash
# Verificar status das migrações
docker-compose exec backend alembic current

# Aplicar migrações manualmente
docker-compose exec backend alembic upgrade head

# Reverter última migração
docker-compose exec backend alembic downgrade -1
```

### Limpar tudo e recomeçar

```bash
# Parar tudo
docker-compose down -v

# Remover imagens
docker-compose down --rmi all

# Reconstruir do zero
docker-compose up -d --build
```

## Estrutura do Projeto

```
consulta/
├── backend/          # FastAPI
│   ├── app/
│   ├── alembic/
│   └── requirements.txt
├── frontend/         # Next.js
│   ├── src/
│   └── package.json
├── nginx/            # Proxy reverso
├── docker-compose.yml
├── start-local.bat   # Windows
└── start-local.sh    # Linux/Mac
```

## Próximos Passos

1. ✅ Sistema rodando localmente
2. ⏳ Configurar e-mail SMTP (opcional)
3. ⏳ Adicionar captcha (opcional)
4. ⏳ Configurar SSL/TLS para produção
5. ⏳ Deploy em produção

## Suporte

Para problemas ou dúvidas, consulte:
- `README.md` - Documentação geral
- `QUICK_START.md` - Guia rápido
- `docs/` - Documentação detalhada




