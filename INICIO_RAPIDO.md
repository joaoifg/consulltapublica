# 🚀 Início Rápido - Sistema de Consulta Pública CFO

## ⚡ Iniciar o Sistema (3 passos)

### 1. Verificar Docker
Certifique-se de que o Docker Desktop está rodando.

### 2. Iniciar Sistema

**Windows:**
```bash
start-local.bat
```

**Linux/Mac:**
```bash
chmod +x start-local.sh
./start-local.sh
```

**Ou manualmente:**
```bash
docker-compose up -d
```

### 3. Acessar

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Backend**: http://localhost:8000

## 📋 O que acontece ao iniciar?

1. ✅ PostgreSQL é iniciado (porta 5432)
2. ✅ Backend FastAPI é iniciado (porta 8000)
3. ✅ Frontend Next.js é iniciado (porta 3000)
4. ✅ Migrações do banco são aplicadas automaticamente

## 🔍 Verificar se está funcionando

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f

# Testar API
curl http://localhost:8000/health
```

## 🛑 Parar o sistema

```bash
docker-compose down
```

## ⚙️ Configuração (Opcional)

Se precisar alterar configurações, edite:

- `docker-compose.yml` - Portas, senhas, etc.
- `backend/.env` - Configurações do backend (criar se não existir)
- `frontend/.env.local` - Configurações do frontend (criar se não existir)

## 🐛 Problemas?

### Porta já em uso
Altere as portas no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### Erro de banco de dados
```bash
# Reiniciar banco
docker-compose restart db

# Ver logs
docker-compose logs db
```

### Limpar tudo e recomeçar
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📚 Mais Informações

- `SETUP_LOCAL.md` - Guia completo de setup
- `README.md` - Documentação geral
- `QUICK_START.md` - Guia rápido detalhado

## ✅ Pronto!

O sistema está rodando e pronto para uso! 🎉

