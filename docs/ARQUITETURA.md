# Arquitetura do Sistema - Consulta Pública CFO

## Visão Geral

Sistema institucional de consulta pública desenvolvido para o Conselho Federal de Odontologia (CFO), seguindo princípios de transparência pública, segurança de dados (LGPD) e auditabilidade.

## Stack Tecnológica

### Backend
- **Python 3.12**: Linguagem base
- **FastAPI**: Framework web moderno e assíncrono
- **SQLAlchemy 2.0**: ORM com suporte assíncrono
- **Alembic**: Sistema de migrações de banco de dados
- **Pydantic v2**: Validação de dados e serialização
- **PostgreSQL 15**: Banco de dados relacional
- **JWT (Jose)**: Autenticação de sessões
- **Cryptography**: Criptografia AES-256 para dados sensíveis

### Frontend
- **Next.js 14**: Framework React com App Router
- **React 18**: Biblioteca UI
- **TypeScript**: Tipagem estática
- **TailwindCSS**: Framework CSS utilitário
- **Radix UI**: Componentes acessíveis
- **Axios**: Cliente HTTP

### Infraestrutura
- **Docker & Docker Compose**: Containerização
- **NGINX**: Proxy reverso e balanceador de carga
- **Let's Encrypt**: Certificados SSL/TLS gratuitos

## Arquitetura de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIO                            │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   NGINX (Proxy Reverso)                 │
│  - Rate Limiting (10 req/s API, 30 req/s geral)        │
│  - SSL/TLS Termination                                  │
│  - Balanceamento de carga                               │
└───────────┬─────────────────────┬───────────────────────┘
            │                     │
            │ Port 3000           │ Port 8000
            ▼                     ▼
┌───────────────────┐   ┌─────────────────────────────────┐
│  Next.js Frontend │   │     FastAPI Backend             │
│                   │   │  ┌───────────────────────────┐  │
│  - SSR/CSR        │   │  │  API Endpoints            │  │
│  - Validação UX   │   │  │  - /identificacao         │  │
│  - Formulários    │   │  │  - /contribuicoes         │  │
│  - Responsivo     │   │  │  - /protocolos            │  │
│                   │   │  │  - /publico               │  │
│                   │   │  └───────────┬───────────────┘  │
│                   │   │              │                  │
│                   │   │  ┌───────────▼───────────────┐  │
│                   │   │  │  Services Layer           │  │
│                   │   │  │  - ParticipanteService    │  │
│                   │   │  │  - ContribuicaoService    │  │
│                   │   │  │  - ProtocoloService       │  │
│                   │   │  └───────────┬───────────────┘  │
│                   │   │              │                  │
│                   │   │  ┌───────────▼───────────────┐  │
│                   │   │  │  Security & Utils         │  │
│                   │   │  │  - Criptografia AES-256   │  │
│                   │   │  │  - Hash SHA-256           │  │
│                   │   │  │  - Validadores CPF/CNPJ   │  │
│                   │   │  │  - Geração Protocolos     │  │
│                   │   │  └───────────┬───────────────┘  │
│                   │   │              │                  │
│                   │   │  ┌───────────▼───────────────┐  │
│                   │   │  │  SQLAlchemy ORM           │  │
│                   │   │  │  - Modelos Assíncronos    │  │
│                   │   │  └───────────┬───────────────┘  │
└───────────────────┘   └──────────────┼───────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────┐
                    │      PostgreSQL 15               │
                    │  ┌────────────────────────────┐  │
                    │  │  Tabelas:                  │  │
                    │  │  - participantes           │  │
                    │  │  - contribuicoes           │  │
                    │  │  - protocolos              │  │
                    │  └────────────────────────────┘  │
                    │                                  │
                    │  Auditoria e Logs Imutáveis      │
                    └──────────────────────────────────┘
```

## Modelo de Dados

### Tabela: `participantes`

Armazena dados de identificação de participantes (PF ou PJ).

**Colunas principais:**
- `id`: Primary key
- `tipo`: PESSOA_FISICA | PESSOA_JURIDICA
- `nome_completo`: Nome (PF)
- `razao_social`: Razão social (PJ)
- `cpf_hash`: Hash SHA-256 do CPF (busca sem exposição)
- `cpf_criptografado`: CPF criptografado AES-256
- `cnpj_hash`: Hash SHA-256 do CNPJ
- `cnpj_criptografado`: CNPJ criptografado AES-256
- `email_criptografado`: E-mail criptografado
- `uf`: UF do participante
- `consentimento_lgpd`: Timestamp do consentimento
- `ip_origem`: IP da submissão (auditoria)

**LGPD**:
- Dados sensíveis criptografados em repouso
- Hash para busca sem exposição de dados
- Consentimento explícito registrado

### Tabela: `contribuicoes`

Armazena contribuições estruturadas.

**Colunas principais:**
- `id`: Primary key
- `participante_id`: FK para participantes
- `documento`: CEO | CPEO
- `titulo_capitulo`: Localização na minuta
- `artigo`: Artigo referenciado
- `tipo`: ALTERACAO | INCLUSAO | EXCLUSAO | COMENTARIO
- `texto_proposto`: Texto da contribuição (máx. 5000 chars)
- `fundamentacao`: Justificativa (máx. 5000 chars)
- `publicada`: Boolean (transparência)
- `criado_em`: Timestamp

**Regras**:
- Fundamentação obrigatória
- Vinculação obrigatória a trecho específico
- Publicação automática (transparência)

### Tabela: `protocolos`

Registra protocolos de submissão.

**Colunas principais:**
- `id`: Primary key
- `numero_protocolo`: String única (CP-{DOC}-{ANO}-{SEQ})
- `participante_id`: FK para participantes
- `documento`: CEO | CPEO
- `total_contribuicoes`: Contador
- `contribuicoes_ids`: JSON array de IDs
- `criado_em_brasilia`: Timestamp horário Brasília
- `criado_em_utc`: Timestamp UTC

**Formato do Protocolo**: `CP-CEO-2026-000154`

## Fluxo de Dados

### 1. Identificação do Participante

```
Usuário -> Frontend -> POST /identificacao/pessoa-fisica
                    -> POST /identificacao/pessoa-juridica
                                |
                                v
                    Backend valida CPF/CNPJ
                                |
                                v
                    Criptografa dados sensíveis
                    Gera hash para busca
                                |
                                v
                    Salva em `participantes`
                                |
                                v
                    Gera token JWT (24h)
                                |
                                v
                    Retorna token + participante_id
```

### 2. Envio de Contribuições

```
Usuário -> Frontend -> POST /contribuicoes (com Bearer token)
                                |
                                v
                    Backend valida token
                                |
                                v
                    Valida dados da contribuição
                    (limites de caracteres, campos obrigatórios)
                                |
                                v
                    Salva em `contribuicoes`
                    Vincula a participante_id
                                |
                                v
                    Retorna contribuição criada
```

### 3. Finalização e Geração de Protocolo

```
Usuário -> Frontend -> POST /protocolos/finalizar
                                |
                                v
                    Backend valida token
                                |
                                v
                    Busca contribuições do participante
                                |
                                v
                    Gera número sequencial único
                    Formato: CP-{DOC}-{ANO}-{SEQ}
                                |
                                v
                    Salva em `protocolos`
                                |
                                v
                    Envia e-mail de confirmação
                                |
                                v
                    Retorna protocolo completo
```

## Segurança

### Criptografia

**Dados em Repouso (AES-256)**:
- CPF
- CNPJ
- E-mail

**Hash (SHA-256)**:
- CPF (busca sem exposição)
- CNPJ (busca sem exposição)

### Autenticação

- **JWT**: Tokens com validade de 24 horas
- **Payload**: `{ participante_id, tipo, exp, iat, jti }`
- **Algoritmo**: HS256

### Rate Limiting (NGINX)

- **API**: 10 requisições/segundo
- **Geral**: 30 requisições/segundo
- **Burst**: 5 requisições (API), 20 (geral)

### CORS

- **Origens permitidas**: Configurável via `CORS_ORIGINS`
- **Métodos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Authorization, Content-Type, etc.

## Auditoria

Todos os registros incluem:
- `ip_origem`: IP do cliente
- `user_agent`: Navegador/dispositivo
- `criado_em`: Timestamp UTC
- `criado_em_brasilia`: Timestamp local (protocolos)

Logs são imutáveis e mantidos permanentemente.

## Transparência Pública

### Dados Públicos

Contribuições são públicas por padrão, exibindo:
- Nome do participante (PF) ou Razão Social (PJ)
- UF
- Documento, localização e tipo de contribuição
- Texto proposto e fundamentação
- Data/hora da submissão

### Dados Não Públicos (LGPD)

Nunca são exibidos publicamente:
- CPF
- CNPJ
- E-mail
- IP de origem

## Escalabilidade

### Banco de Dados

- **Connection Pool**: 10 conexões base, 20 max overflow
- **Índices**: Otimizados para queries frequentes
- **Particionamento**: Suportado por ano (futura implementação)

### Cache (futuro)

- Redis para cache de contribuições públicas
- TTL: 5 minutos

### Horizontal Scaling

- Backend stateless (JWT)
- Múltiplas instâncias via Docker Swarm/Kubernetes

## Performance

- **Backend**: FastAPI assíncrono (alta concorrência)
- **Frontend**: SSR/CSR híbrido com Next.js
- **Banco**: Queries otimizadas com índices
- **NGINX**: Gzip, cache de assets estáticos

## Conformidade

### LGPD (Lei Geral de Proteção de Dados)

- ✅ Consentimento explícito
- ✅ Minimização de dados
- ✅ Criptografia de dados sensíveis
- ✅ Direito de acesso (via protocolo)
- ✅ Base legal: Interesse público
- ✅ Transparência no tratamento de dados

### Acessibilidade

- Frontend com Radix UI (WCAG 2.1 AA)
- Semântica HTML adequada
- Suporte a leitores de tela

## Manutenção

### Backups

- **Banco de dados**: Diário, retenção 30 dias
- **Arquivos**: Semanal

### Logs

- **Rotação**: Diária
- **Retenção**: 90 dias (requisito legal)

### Atualizações

- **Dependências**: Mensalmente
- **Segurança**: Imediatamente
- **Sistema Operacional**: Quinzenalmente

## Roadmap Futuro

- [ ] Suporte a múltiplas consultas simultâneas
- [ ] Dashboard administrativo
- [ ] Relatórios e estatísticas avançadas
- [ ] API pública para dados abertos
- [ ] Integração com sistema de e-mail institucional
- [ ] Notificações push
- [ ] Busca full-text nas contribuições
- [ ] Exportação de dados (CSV, PDF)

## Contato Técnico

- **Arquiteto do Sistema**: [Nome]
- **E-mail**: arquitetura@cfo.org.br
- **Repositório**: [URL]
