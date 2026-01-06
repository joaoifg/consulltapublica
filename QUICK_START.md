# Quick Start - Sistema de Consulta Pública CFO

## Início Rápido (5 minutos)

### 1. Pré-requisitos

```bash
# Verificar instalações
docker --version
docker-compose --version
```

### 2. Configurar variáveis de ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Iniciar sistema

```bash
docker-compose up -d
```

### 4. Acessar

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **NGINX**: http://localhost

## Estrutura do Projeto

```
consulta/
├── backend/              # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/         # Endpoints REST
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Lógica de negócio
│   │   └── utils/       # Utilitários
│   ├── alembic/         # Migrações
│   └── requirements.txt
│
├── frontend/            # Next.js + React
│   ├── src/
│   │   ├── app/        # Páginas Next.js
│   │   ├── components/ # Componentes React
│   │   ├── lib/        # Bibliotecas
│   │   └── types/      # TypeScript types
│   └── package.json
│
├── nginx/               # Proxy reverso
│   └── nginx.conf
│
├── docs/                # Documentação
│   ├── INSTALACAO.md
│   ├── ARQUITETURA.md
│   └── API.md
│
├── docker-compose.yml
└── README.md
```

## Funcionalidades Implementadas

### ✅ Backend (FastAPI + PostgreSQL)
- [x] API RESTful completa
- [x] Autenticação JWT
- [x] Validação CPF/CNPJ
- [x] Criptografia AES-256 (dados sensíveis)
- [x] Hash SHA-256 (CPF/CNPJ)
- [x] Geração de protocolos únicos
- [x] Rate limiting
- [x] LGPD compliance
- [x] Auditoria completa
- [x] Migrações Alembic

### ✅ Frontend (Next.js + TailwindCSS)
- [x] Tela inicial (seleção de documento)
- [x] Identificação (PF e PJ)
- [x] Formulário de contribuição
- [x] Geração de protocolo
- [x] Validação de formulários
- [x] Design responsivo
- [x] Interface institucional

### ✅ Infraestrutura
- [x] Docker Compose
- [x] PostgreSQL 15
- [x] NGINX (proxy reverso)
- [x] SSL/TLS ready
- [x] Rate limiting
- [x] Health checks

### ✅ Segurança
- [x] HTTPS ready
- [x] Dados criptografados
- [x] Proteção LGPD
- [x] Auditoria de ações
- [x] CORS configurável
- [x] Rate limiting

## Comandos Úteis

### Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs em tempo real
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Reconstruir containers
docker-compose up -d --build

# Limpar tudo (incluindo volumes)
docker-compose down -v
```

### Backend

```bash
# Entrar no container
docker-compose exec backend bash

# Criar migration
docker-compose exec backend alembic revision --autogenerate -m "descrição"

# Aplicar migrations
docker-compose exec backend alembic upgrade head

# Reverter migration
docker-compose exec backend alembic downgrade -1
```

### Frontend

```bash
# Entrar no container
docker-compose exec frontend sh

# Instalar dependências
docker-compose exec frontend npm install

# Build de produção
docker-compose exec frontend npm run build
```

### Banco de Dados

```bash
# Conectar ao PostgreSQL
docker-compose exec db psql -U cfo_user cfo_consulta

# Backup
docker-compose exec db pg_dump -U cfo_user cfo_consulta > backup.sql

# Restore
docker-compose exec -T db psql -U cfo_user cfo_consulta < backup.sql
```

## Fluxo de Uso

### 1. Usuário acessa o sistema

http://localhost:3000

### 2. Escolhe o documento

- Código de Ética Odontológica (CEO)
- Código de Processo Ético Odontológico (CPEO)

### 3. Se identifica

**Pessoa Física**: Nome, CPF, E-mail, UF
**Pessoa Jurídica**: Razão Social, CNPJ, Responsável Legal

### 4. Envia contribuições

- Localiza trecho da minuta (Capítulo, Artigo)
- Escolhe tipo (Alteração, Inclusão, Exclusão, Comentário)
- Escreve texto proposto
- Fundamenta a contribuição

### 5. Finaliza e recebe protocolo

Formato: `CP-CEO-2026-000154`

## Endpoints Principais

### Públicos
- `GET /api/v1/publico/contribuicoes` - Lista contribuições públicas
- `GET /api/v1/publico/documentos` - Lista documentos
- `GET /api/v1/publico/estatisticas` - Estatísticas
- `GET /api/v1/protocolos/{numero}` - Consulta protocolo

### Autenticados
- `POST /api/v1/identificacao/pessoa-fisica` - Identifica PF
- `POST /api/v1/identificacao/pessoa-juridica` - Identifica PJ
- `POST /api/v1/contribuicoes` - Envia contribuição
- `GET /api/v1/contribuicoes/minhas` - Lista minhas contribuições
- `POST /api/v1/protocolos/finalizar` - Gera protocolo

## Tecnologias Utilizadas

### Backend
- Python 3.12
- FastAPI
- SQLAlchemy 2.0
- PostgreSQL 15
- Alembic
- Pydantic v2
- JWT (Jose)
- Cryptography

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Radix UI
- Axios

### DevOps
- Docker
- Docker Compose
- NGINX
- PostgreSQL

## Segurança LGPD

### Dados Criptografados (AES-256)
- CPF
- CNPJ
- E-mail

### Dados com Hash (SHA-256)
- CPF (para busca)
- CNPJ (para busca)

### Dados Públicos
- Nome (PF) ou Razão Social (PJ)
- UF
- Contribuições
- Protocolo

### Dados NÃO Públicos
- CPF completo
- CNPJ completo
- E-mail
- IP de origem

## Suporte

### Documentação Completa
- `docs/INSTALACAO.md` - Instalação detalhada
- `docs/ARQUITETURA.md` - Arquitetura do sistema
- `docs/API.md` - Documentação da API
- `README.md` - Visão geral

### API Docs Interativa
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Contato
- E-mail: suporte.ti@cfo.org.br
- Website: https://cfo.org.br

## Troubleshooting

### Porta já em uso

```bash
# Alterar portas no docker-compose.yml
ports:
  - "8001:8000"  # Backend
  - "3001:3000"  # Frontend
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps db

# Ver logs do banco
docker-compose logs db
```

### Reset completo

```bash
# Parar tudo e limpar volumes
docker-compose down -v

# Reconstruir
docker-compose up -d --build
```

## Próximos Passos

1. ✅ Sistema básico implementado
2. ⏳ Configurar e-mail SMTP
3. ⏳ Adicionar captcha (opcional)
4. ⏳ Deploy em produção
5. ⏳ Monitoramento e logs
6. ⏳ Backups automáticos

## Licença

© 2026 Conselho Federal de Odontologia - Todos os direitos reservados
