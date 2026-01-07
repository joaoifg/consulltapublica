# 🚀 Como Iniciar o Sistema Localmente

## ⚠️ Pré-requisito: Docker Desktop

Antes de iniciar, certifique-se de que o **Docker Desktop está rodando**!

### Verificar se Docker está rodando:

**Windows:**
- Procure por "Docker Desktop" na barra de tarefas
- Se não estiver rodando, abra o aplicativo Docker Desktop
- Aguarde até ver "Docker Desktop is running" na bandeja do sistema

**Verificar via terminal:**
```bash
docker ps
```

Se aparecer um erro, o Docker não está rodando. Inicie o Docker Desktop primeiro.

## 📋 Passo a Passo para Iniciar

### 1. Iniciar Docker Desktop
- Abra o aplicativo Docker Desktop
- Aguarde até que o ícone na bandeja mostre que está rodando (geralmente leva 30-60 segundos)

### 2. Abrir Terminal
- Abra PowerShell ou CMD na pasta do projeto:
  ```
  cd C:\Users\joao.dias\Documents\consulta
  ```

### 3. Iniciar Sistema

**Opção A: Script Automático (Recomendado)**
```bash
start-local.bat
```

**Opção B: Docker Compose Manual**
```bash
docker-compose up -d
```

### 4. Aguardar Inicialização
O sistema levará alguns minutos para:
- ✅ Baixar imagens Docker (primeira vez)
- ✅ Iniciar PostgreSQL
- ✅ Aplicar migrações do banco
- ✅ Iniciar Backend FastAPI
- ✅ Iniciar Frontend Next.js

### 5. Verificar Status
```bash
docker-compose ps
```

Você deve ver 4 containers rodando:
- `cfo_db` (PostgreSQL)
- `cfo_backend` (FastAPI)
- `cfo_frontend` (Next.js)
- `cfo_nginx` (NGINX)

### 6. Acessar Sistema

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Backend**: http://localhost:8000

## 🔍 Verificar Logs

Se algo não funcionar, verifique os logs:

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend

# Apenas banco
docker-compose logs -f db
```

## 🐛 Problemas Comuns

### Erro: "Docker Desktop is not running"
**Solução**: Abra o Docker Desktop e aguarde ele iniciar completamente.

### Erro: "Port already in use"
**Solução**: Altere as portas no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### Erro: "Cannot connect to Docker daemon"
**Solução**: 
1. Reinicie o Docker Desktop
2. Verifique se o WSL 2 está instalado (Windows)
3. Execute: `docker-compose down` e depois `docker-compose up -d`

### Erro de migrações do banco
**Solução**: Execute manualmente:
```bash
docker-compose exec backend alembic upgrade head
```

## ✅ Quando está pronto?

Você saberá que está pronto quando:

1. ✅ `docker-compose ps` mostra 4 containers com status "Up"
2. ✅ http://localhost:3000 abre a tela inicial
3. ✅ http://localhost:8000/docs mostra a documentação da API
4. ✅ Não há erros nos logs

## 🛑 Parar o Sistema

```bash
docker-compose down
```

Para parar e remover volumes (limpar banco):
```bash
docker-compose down -v
```

## 📚 Mais Informação

- `INICIO_RAPIDO.md` - Guia rápido
- `COMO_USAR.md` - Como usar o sistema
- `SETUP_LOCAL.md` - Setup detalhado

---

**Lembre-se**: O Docker Desktop deve estar rodando antes de executar qualquer comando docker-compose!




