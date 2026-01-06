# Sistema de Consulta Pública - CFO

## Visão Geral

Sistema institucional para recebimento de contribuições públicas estruturadas para normas do Conselho Federal de Odontologia (CFO).

### Documentos suportados:
- Novo Código de Ética Odontológica (CEO)
- Novo Código de Processo Ético Odontológico (CPEO)

## Princípios do Sistema

1. ✅ Identificação obrigatória do participante
2. ✅ Bloqueio total do formulário sem identificação
3. ✅ Contribuições vinculadas a trechos específicos
4. ✅ Fundamentação obrigatória
5. ✅ Transparência pública das contribuições
6. ✅ Proteção de dados pessoais (LGPD)
7. ✅ Geração de protocolo único
8. ✅ Sem upload de arquivos
9. ✅ Interface acessível e responsiva

## Stack Tecnológica

### Backend
- **Python 3.12**
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy 2** - ORM
- **Alembic** - Migrações de banco
- **Pydantic v2** - Validação de dados
- **PostgreSQL 15+** - Banco de dados

### Frontend
- **Next.js 14+** - Framework React
- **TailwindCSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **TypeScript** - Tipagem estática

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **NGINX** - Proxy reverso
- **Let's Encrypt** - SSL/TLS

### Segurança
- **JWT** - Autenticação
- **Rate Limiting** - Proteção contra abuso
- **CAPTCHA** - Proteção contra bots
- **Logs imutáveis** - Auditoria

## Arquitetura

```
┌─────────────────┐
│   Next.js       │
│   Frontend      │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│     NGINX       │
│  Reverse Proxy  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    FastAPI      │
│    Backend      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

## Fluxo Funcional

### 1. Tela Inicial
- Escolha do documento (CEO ou CPEO)
- Botão "Iniciar Contribuição"

### 2. Identificação Obrigatória (Bloqueante)
- **Pessoa Física**: Nome, CPF, E-mail, UF
- **Pessoa Jurídica**: Razão Social, CNPJ, Responsável Legal
- **Consentimento LGPD** obrigatório

### 3. Formulário de Contribuição
- Identificação do trecho da minuta
- Tipo de contribuição (alteração, inclusão, exclusão, comentário)
- Texto proposto
- Fundamentação obrigatória
- Possibilidade de múltiplas contribuições

### 4. Finalização
- Geração de protocolo único: `CP-{DOC}-{ANO}-{SEQ}`
- Registro público da contribuição
- Confirmação por e-mail

## Instalação e Execução

### Pré-requisitos
- Docker 24+
- Docker Compose 2.20+
- Node.js 18+ (para desenvolvimento local)
- Python 3.12+ (para desenvolvimento local)

### Desenvolvimento Local

#### 1. Clone o repositório
```bash
git clone <repo-url>
cd consulta
```

#### 2. Configure as variáveis de ambiente
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

#### 3. Inicie os containers
```bash
docker-compose up -d
```

#### 4. Acesse o sistema
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Documentação API: http://localhost:8000/docs

### Produção

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Estrutura do Projeto

```
consulta/
├── backend/
│   ├── app/
│   │   ├── api/          # Endpoints da API
│   │   ├── core/         # Configurações
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── schemas/      # Schemas Pydantic
│   │   ├── services/     # Lógica de negócio
│   │   └── utils/        # Utilitários
│   ├── alembic/          # Migrações
│   ├── tests/            # Testes
│   └── main.py           # Entry point
├── frontend/
│   ├── src/
│   │   ├── app/          # Páginas Next.js
│   │   ├── components/   # Componentes React
│   │   ├── lib/          # Bibliotecas
│   │   └── types/        # TypeScript types
│   └── public/           # Arquivos estáticos
├── nginx/
│   └── nginx.conf        # Configuração NGINX
├── docs/                 # Documentação
└── docker-compose.yml    # Orquestração
```

## Modelagem de Dados

### Tabelas Principais

#### `participantes`
- Armazena dados de identificação (PF ou PJ)
- Dados sensíveis criptografados
- CPF/CNPJ hasheados

#### `contribuicoes`
- Vincula participante + documento + trecho
- Armazena tipo, texto proposto e fundamentação
- Status de publicação

#### `protocolos`
- Registro único por submissão
- Formato: CP-{DOCUMENTO}-{ANO}-{SEQUENCIAL}
- Timestamp oficial (horário de Brasília)

#### `contribuicoes_publicas`
- View materializada para transparência
- Exibe apenas dados não sensíveis
- Sem CPF, CNPJ ou e-mail

## Segurança e LGPD

### Proteção de Dados
- ✅ Criptografia em repouso (AES-256)
- ✅ Criptografia em trânsito (TLS 1.3)
- ✅ Hash de CPF/CNPJ (SHA-256)
- ✅ Anonimização em views públicas

### Auditoria
- ✅ Logs imutáveis de todas as operações
- ✅ Rastreabilidade completa
- ✅ Registro de IP e User-Agent
- ✅ Timestamp com fuso Brasília (UTC-3)

### Conformidade
- ✅ Consentimento explícito (LGPD Art. 7º)
- ✅ Base legal: interesse público
- ✅ Minimização de dados
- ✅ Direito de acesso via protocolo

## API Endpoints

### Públicos
- `GET /api/v1/documentos` - Lista documentos disponíveis
- `GET /api/v1/contribuicoes-publicas` - Lista contribuições públicas
- `GET /api/v1/protocolo/{numero}` - Consulta protocolo

### Autenticados (requer sessão)
- `POST /api/v1/identificacao` - Identifica participante
- `POST /api/v1/contribuicoes` - Envia contribuição
- `POST /api/v1/contribuicoes/finalizar` - Finaliza e gera protocolo
- `GET /api/v1/sessao` - Verifica sessão ativa

## Validações

### CPF
- Formato: 000.000.000-00
- Validação de dígitos verificadores
- Rejeição de CPFs conhecidos inválidos

### CNPJ
- Formato: 00.000.000/0000-00
- Validação de dígitos verificadores

### E-mail
- RFC 5322 compliant
- Verificação de domínio

### Limites
- Texto proposto: 5.000 caracteres
- Fundamentação: 5.000 caracteres
- Rate limit: 10 requisições/minuto

## Testes

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test

# E2E
npm run test:e2e
```

## Licença

Sistema desenvolvido para o Conselho Federal de Odontologia (CFO).
Todos os direitos reservados.

## Contato

- **Instituição**: Conselho Federal de Odontologia
- **Website**: https://cfo.org.br
- **E-mail**: consulta.publica@cfo.org.br

## Changelog

### v1.0.0 (2026-01-06)
- ✅ Sistema inicial implementado
- ✅ Fluxo completo de identificação e contribuição
- ✅ Geração de protocolos
- ✅ Transparência pública
- ✅ Conformidade LGPD
