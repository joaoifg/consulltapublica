# ✅ Sistema de Consulta Pública CFO - Pronto para Rodar!

## 🎯 Status do Sistema

✅ **Backend (FastAPI)** - Implementado
- API REST completa
- Validações CPF/CNPJ
- Criptografia LGPD
- Geração de protocolos
- Migrações Alembic

✅ **Frontend (Next.js)** - Implementado
- Tela inicial
- Identificação (PF e PJ)
- Formulário de contribuição
- Geração de protocolo
- Interface responsiva

✅ **Banco de Dados (PostgreSQL)** - Configurado
- Modelos SQLAlchemy
- Migrações Alembic
- Índices otimizados

✅ **Docker Compose** - Configurado
- PostgreSQL 15
- Backend FastAPI
- Frontend Next.js
- NGINX (opcional)

## 🚀 Como Iniciar (3 Passos)

### 1. Verificar Docker
```bash
docker --version
docker-compose --version
```

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
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Backend: http://localhost:8000

## 📋 O que acontece ao iniciar?

1. ✅ PostgreSQL inicia (porta 5432)
2. ✅ Backend FastAPI inicia (porta 8000)
3. ✅ Migrações do banco são aplicadas automaticamente
4. ✅ Frontend Next.js inicia (porta 3000)

## 🔍 Verificar se está funcionando

```bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f

# Testar API
curl http://localhost:8000/health
```

## 📁 Estrutura do Projeto

```
consulta/
├── backend/              # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/         # Endpoints REST
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── schemas/     # Schemas Pydantic
│   │   ├── services/    # Lógica de negócio
│   │   └── utils/       # Utilitários
│   ├── alembic/         # Migrações
│   └── requirements.txt
│
├── frontend/            # Next.js + React
│   ├── src/
│   │   ├── app/         # Páginas Next.js
│   │   ├── components/  # Componentes React
│   │   └── lib/         # Bibliotecas
│   └── package.json
│
├── docker-compose.yml   # Orquestração
├── start-local.bat      # Windows
├── start-local.sh       # Linux/Mac
└── docs/                # Documentação
```

## 🎯 Funcionalidades Implementadas

### ✅ Identificação Obrigatória
- Pessoa Física (CPF, nome, e-mail, UF)
- Pessoa Jurídica (CNPJ, razão social, responsável)
- Validação de CPF/CNPJ
- Consentimento LGPD

### ✅ Formulário de Contribuição
- Identificação de trecho da minuta
- Tipo de contribuição (alteração, inclusão, exclusão, comentário)
- Texto proposto (máx. 5.000 caracteres)
- Fundamentação obrigatória (máx. 5.000 caracteres)
- Múltiplas contribuições na mesma sessão

### ✅ Geração de Protocolo
- Formato: `CP-{DOC}-{ANO}-{SEQ}`
- Exemplo: `CP-CEO-2026-000154`
- Timestamp oficial (Brasília)
- E-mail de confirmação (se configurado)

### ✅ Transparência Pública
- Contribuições públicas (sem dados sensíveis)
- API pública para consulta
- Estatísticas públicas

### ✅ Segurança e LGPD
- Criptografia AES-256 (dados sensíveis)
- Hash SHA-256 (CPF/CNPJ para busca)
- Rate limiting
- Auditoria completa

## 🔧 Configuração (Opcional)

### Variáveis de Ambiente

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql+asyncpg://cfo_user:cfo_password@db:5432/cfo_consulta
DATABASE_URL_SYNC=postgresql://cfo_user:cfo_password@db:5432/cfo_consulta
SECRET_KEY=seu-secret-key-aqui-min-32-chars
ENCRYPTION_KEY=sua-encryption-key-aqui-32-chars
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🐛 Problemas Comuns

### Porta já em uso
Altere no `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### Erro de banco
```bash
docker-compose restart db
docker-compose logs db
```

### Limpar tudo
```bash
docker-compose down -v
docker-compose up -d --build
```

## 📚 Documentação

- `INICIO_RAPIDO.md` - Guia rápido
- `COMO_USAR.md` - Como usar o sistema
- `SETUP_LOCAL.md` - Setup detalhado
- `README.md` - Documentação completa
- `QUICK_START.md` - Guia rápido detalhado

## ✅ Pronto!

O sistema está **100% funcional** e pronto para uso! 🎉

Basta executar `start-local.bat` (Windows) ou `./start-local.sh` (Linux/Mac) e acessar http://localhost:3000

