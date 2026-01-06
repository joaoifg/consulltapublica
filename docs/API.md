# Documentação da API - Sistema de Consulta Pública CFO

## Base URL

- **Desenvolvimento**: `http://localhost:8000/api/v1`
- **Produção**: `https://consultapublica.cfo.org.br/api/v1`

## Autenticação

A maioria dos endpoints requer autenticação via **Bearer Token JWT**.

### Obter Token

O token é obtido após identificação bem-sucedida:

```
POST /identificacao/pessoa-fisica
POST /identificacao/pessoa-juridica
```

### Usar Token

```http
Authorization: Bearer <seu-token-jwt>
```

Validade: **24 horas**

## Endpoints

### 1. Identificação

#### 1.1 Identificar Pessoa Física

**POST** `/identificacao/pessoa-fisica`

Identifica participante Pessoa Física e retorna token de sessão.

**Request Body**:
```json
{
  "nome_completo": "João da Silva",
  "cpf": "12345678900",
  "email": "joao@example.com",
  "uf": "SP",
  "categoria": "CIRURGIAO_DENTISTA",
  "consentimento_lgpd": true
}
```

**Response** (201 Created):
```json
{
  "message": "Identificação realizada com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "participante_id": 1,
  "nome": "João da Silva"
}
```

**Validações**:
- Nome completo: mínimo 3 caracteres, nome e sobrenome
- CPF: válido conforme algoritmo de verificação
- E-mail: formato RFC 5322
- UF: válida (AC, AL, ..., TO)
- Consentimento LGPD: obrigatório (true)

---

#### 1.2 Identificar Pessoa Jurídica

**POST** `/identificacao/pessoa-juridica`

Identifica participante Pessoa Jurídica.

**Request Body**:
```json
{
  "razao_social": "Associação Odontológica XYZ",
  "cnpj": "12345678000190",
  "natureza_entidade": "ASSOCIACAO_CLASSE",
  "nome_responsavel_legal": "Maria Santos",
  "cpf_responsavel": "98765432100",
  "email": "contato@associacao.org.br",
  "uf": "RJ",
  "consentimento_lgpd": true
}
```

**Response** (201 Created):
```json
{
  "message": "Identificação realizada com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "participante_id": 2,
  "razao_social": "Associação Odontológica XYZ"
}
```

---

### 2. Contribuições

#### 2.1 Criar Contribuição

**POST** `/contribuicoes`

Envia uma contribuição. **Requer autenticação**.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "documento": "CEO",
  "titulo_capitulo": "Capítulo III - Dos Deveres Fundamentais",
  "secao": "Seção I",
  "artigo": "Art. 7º",
  "paragrafo_inciso_alinea": "inciso IV",
  "tipo": "ALTERACAO",
  "texto_proposto": "Nova redação proposta para o inciso IV, que estabelece...",
  "fundamentacao": "A alteração se justifica porque... estudos demonstram... jurisprudência..."
}
```

**Response** (201 Created):
```json
{
  "id": 123,
  "documento": "CEO",
  "titulo_capitulo": "Capítulo III - Dos Deveres Fundamentais",
  "secao": "Seção I",
  "artigo": "Art. 7º",
  "paragrafo_inciso_alinea": "inciso IV",
  "tipo": "ALTERACAO",
  "texto_proposto": "Nova redação proposta...",
  "fundamentacao": "A alteração se justifica...",
  "criado_em": "2026-01-06T14:30:00Z"
}
```

**Validações**:
- Documento: CEO ou CPEO
- Título/Capítulo: 3-500 caracteres
- Artigo: obrigatório
- Tipo: ALTERACAO | INCLUSAO | EXCLUSAO | COMENTARIO
- Texto proposto: 10-5000 caracteres
- Fundamentação: 10-5000 caracteres

---

#### 2.2 Listar Minhas Contribuições

**GET** `/contribuicoes/minhas?documento=CEO`

Lista contribuições do participante autenticado. **Requer autenticação**.

**Query Parameters**:
- `documento` (opcional): CEO ou CPEO

**Response** (200 OK):
```json
[
  {
    "id": 123,
    "documento": "CEO",
    "titulo_capitulo": "Capítulo III",
    "artigo": "Art. 7º",
    "tipo": "ALTERACAO",
    "texto_proposto": "...",
    "fundamentacao": "...",
    "criado_em": "2026-01-06T14:30:00Z"
  }
]
```

---

### 3. Protocolos

#### 3.1 Finalizar Contribuições

**POST** `/protocolos/finalizar?documento=CEO`

Finaliza contribuições e gera protocolo único. **Requer autenticação**.

**Query Parameters**:
- `documento` (obrigatório): CEO ou CPEO

**Response** (201 Created):
```json
{
  "numero_protocolo": "CP-CEO-2026-000154",
  "documento": "CEO",
  "total_contribuicoes": 3,
  "criado_em": "2026-01-06T14:35:00-03:00",
  "participante": {
    "nome": "João da Silva",
    "uf": "SP"
  },
  "contribuicoes": [
    { "id": 123, "artigo": "Art. 7º", "tipo": "ALTERACAO", ... },
    { "id": 124, "artigo": "Art. 10", "tipo": "INCLUSAO", ... },
    { "id": 125, "artigo": "Art. 15", "tipo": "COMENTARIO", ... }
  ]
}
```

**Regras**:
- Deve haver pelo menos 1 contribuição
- Protocolo é gerado no formato: `CP-{DOCUMENTO}-{ANO}-{SEQUENCIAL}`
- Timestamp é registrado no horário de Brasília
- E-mail de confirmação é enviado automaticamente

---

#### 3.2 Consultar Protocolo

**GET** `/protocolos/{numero_protocolo}`

Consulta protocolo pelo número. **Público, não requer autenticação**.

**Exemplo**: `/protocolos/CP-CEO-2026-000154`

**Response** (200 OK):
```json
{
  "numero_protocolo": "CP-CEO-2026-000154",
  "documento": "CEO",
  "total_contribuicoes": 3,
  "criado_em": "2026-01-06T14:35:00-03:00",
  "participante": {
    "nome": "João da Silva",
    "uf": "SP"
  },
  "contribuicoes": [...]
}
```

**Dados Exibidos (LGPD)**:
- ✅ Nome ou Razão Social
- ✅ UF
- ❌ CPF/CNPJ (não exibido)
- ❌ E-mail (não exibido)

---

### 4. Público

#### 4.1 Listar Contribuições Públicas

**GET** `/publico/contribuicoes`

Lista contribuições públicas com paginação. **Público**.

**Query Parameters**:
- `documento` (opcional): CEO ou CPEO
- `artigo` (opcional): Filtrar por artigo específico
- `page` (opcional): Número da página (padrão: 1)
- `per_page` (opcional): Itens por página (padrão: 50, máx: 100)

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 123,
      "documento": "CEO",
      "localizacao": "Capítulo III - Seção I - Art. 7º - inciso IV",
      "tipo": "ALTERACAO",
      "texto_proposto": "...",
      "fundamentacao": "...",
      "nome_participante": "João da Silva",
      "uf": "SP",
      "criado_em": "2026-01-06T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 327,
    "total_pages": 7
  }
}
```

---

#### 4.2 Listar Documentos

**GET** `/publico/documentos`

Lista documentos disponíveis para consulta. **Público**.

**Response** (200 OK):
```json
[
  {
    "codigo": "CEO",
    "nome": "Código de Ética Odontológica",
    "descricao": "Novo Código de Ética Odontológica"
  },
  {
    "codigo": "CPEO",
    "nome": "Código de Processo Ético Odontológico",
    "descricao": "Novo Código de Processo Ético Odontológico"
  }
]
```

---

#### 4.3 Estatísticas

**GET** `/publico/estatisticas`

Retorna estatísticas da consulta pública. **Público**.

**Response** (200 OK):
```json
{
  "total_geral": 1543,
  "por_documento": {
    "CEO": 987,
    "CPEO": 556
  }
}
```

---

## Códigos de Status HTTP

### Sucesso
- **200 OK**: Requisição bem-sucedida
- **201 Created**: Recurso criado com sucesso
- **204 No Content**: Operação bem-sucedida sem conteúdo

### Erro do Cliente
- **400 Bad Request**: Dados inválidos
- **401 Unauthorized**: Token ausente ou inválido
- **403 Forbidden**: Sem permissão
- **404 Not Found**: Recurso não encontrado
- **422 Unprocessable Entity**: Validação falhou

### Erro do Servidor
- **500 Internal Server Error**: Erro interno
- **503 Service Unavailable**: Serviço temporariamente indisponível

---

## Erros

Formato padrão de erro:

```json
{
  "detail": "Descrição do erro"
}
```

**Exemplos**:

```json
{
  "detail": "CPF inválido"
}
```

```json
{
  "detail": "Sessão expirada ou inválida"
}
```

```json
{
  "detail": [
    {
      "loc": ["body", "cpf"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limiting

- **API**: 10 requisições/segundo
- **Geral**: 30 requisições/segundo

Quando excedido:
- **Status**: 429 Too Many Requests
- **Retry-After**: Tempo em segundos para tentar novamente

---

## CORS

**Origens permitidas**: Configurável no backend

**Métodos**: GET, POST, PUT, DELETE, OPTIONS

**Headers**: Authorization, Content-Type, etc.

---

## Documentação Interativa

### Swagger UI

Acesse `/docs` para documentação interativa:
- **Desenvolvimento**: http://localhost:8000/docs
- **Produção**: https://consultapublica.cfo.org.br/docs

### ReDoc

Acesse `/redoc` para documentação alternativa:
- **Desenvolvimento**: http://localhost:8000/redoc
- **Produção**: https://consultapublica.cfo.org.br/redoc

---

## Exemplos de Uso

### cURL

```bash
# Identificação
curl -X POST http://localhost:8000/api/v1/identificacao/pessoa-fisica \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "João da Silva",
    "cpf": "12345678900",
    "email": "joao@example.com",
    "uf": "SP",
    "consentimento_lgpd": true
  }'

# Criar contribuição
curl -X POST http://localhost:8000/api/v1/contribuicoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "documento": "CEO",
    "titulo_capitulo": "Capítulo III",
    "artigo": "Art. 7º",
    "tipo": "ALTERACAO",
    "texto_proposto": "Nova redação...",
    "fundamentacao": "Justificativa..."
  }'

# Finalizar
curl -X POST "http://localhost:8000/api/v1/protocolos/finalizar?documento=CEO" \
  -H "Authorization: Bearer <token>"
```

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
});

// Identificação
const { data } = await api.post('/identificacao/pessoa-fisica', {
  nome_completo: 'João da Silva',
  cpf: '12345678900',
  email: 'joao@example.com',
  uf: 'SP',
  consentimento_lgpd: true
});

const token = data.token;

// Criar contribuição
await api.post('/contribuicoes', {
  documento: 'CEO',
  titulo_capitulo: 'Capítulo III',
  artigo: 'Art. 7º',
  tipo: 'ALTERACAO',
  texto_proposto: 'Nova redação...',
  fundamentacao: 'Justificativa...'
}, {
  headers: { Authorization: `Bearer ${token}` }
});

// Finalizar
const protocolo = await api.post('/protocolos/finalizar?documento=CEO', null, {
  headers: { Authorization: `Bearer ${token}` }
});

console.log('Protocolo:', protocolo.data.numero_protocolo);
```

---

## Suporte

- **E-mail**: api@cfo.org.br
- **Documentação**: https://docs.cfo.org.br
- **Issues**: https://github.com/cfo/consulta-publica/issues
