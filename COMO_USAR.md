# 📖 Como Usar o Sistema de Consulta Pública CFO

## 🚀 Iniciar o Sistema

### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
start-local.bat
```

**Linux/Mac:**
```bash
chmod +x start-local.sh
./start-local.sh
```

### Opção 2: Docker Compose Manual

```bash
docker-compose up -d
```

## 🌐 Acessar o Sistema

Após iniciar, acesse:

- **Frontend (Interface do Usuário)**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação da API (Swagger)**: http://localhost:8000/docs
- **Documentação da API (ReDoc)**: http://localhost:8000/redoc

## 📝 Fluxo de Uso

### 1. Tela Inicial
- Escolha o documento: **CEO** ou **CPEO**
- Clique em **"Iniciar Contribuição"**

### 2. Identificação (Obrigatória)
Escolha o tipo de participante:

**Pessoa Física:**
- Nome completo
- CPF (com validação)
- E-mail
- UF
- Categoria (opcional)
- Consentimento LGPD (obrigatório)

**Pessoa Jurídica:**
- Razão social
- CNPJ (com validação)
- Natureza da entidade
- Nome do responsável legal
- CPF do responsável legal
- E-mail do responsável legal
- UF da sede
- Consentimento LGPD (obrigatório)

### 3. Formulário de Contribuição
Para cada contribuição:

- **Identificação do trecho:**
  - Título/Capítulo
  - Seção (se houver)
  - Artigo
  - Parágrafo/Inciso/Alínea

- **Tipo de contribuição:**
  - Alteração de redação
  - Inclusão de dispositivo
  - Exclusão de dispositivo
  - Comentário/sugestão geral

- **Texto proposto** (máx. 5.000 caracteres)
- **Fundamentação** (obrigatória, máx. 5.000 caracteres)

**Ações:**
- **"Salvar contribuição e adicionar outra"** - Adiciona mais uma contribuição
- **"Finalizar envio"** - Gera protocolo e finaliza

### 4. Finalização
- Sistema gera protocolo único: `CP-{DOC}-{ANO}-{SEQ}`
- Exemplo: `CP-CEO-2026-000154`
- Protocolo é enviado por e-mail (se configurado)
- Contribuições ficam públicas (sem dados sensíveis)

## 🔍 Verificar Status

```bash
# Ver containers rodando
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## 🛑 Parar o Sistema

```bash
docker-compose down
```

## 🔧 Comandos Úteis

### Reiniciar um serviço
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Entrar no container
```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# Banco de dados
docker-compose exec db psql -U cfo_user cfo_consulta
```

### Executar migrações manualmente
```bash
docker-compose exec backend alembic upgrade head
```

### Criar nova migração
```bash
docker-compose exec backend alembic revision --autogenerate -m "descrição"
```

## 🐛 Solução de Problemas

### Porta já em uso
Edite `docker-compose.yml` e altere as portas:
```yaml
ports:
  - "3001:3000"  # Frontend
  - "8001:8000"  # Backend
```

### Erro de conexão com banco
```bash
# Verificar se banco está rodando
docker-compose ps db

# Ver logs
docker-compose logs db

# Reiniciar banco
docker-compose restart db
```

### Limpar tudo e recomeçar
```bash
# Parar e remover volumes
docker-compose down -v

# Reconstruir
docker-compose up -d --build
```

### Erro de migrações
```bash
# Verificar status
docker-compose exec backend alembic current

# Aplicar migrações
docker-compose exec backend alembic upgrade head

# Reverter última migração
docker-compose exec backend alembic downgrade -1
```

## 📊 Consultar Contribuições Públicas

Acesse: http://localhost:3000/contribuicoes-publicas

Ou via API:
```bash
curl http://localhost:8000/api/v1/publico/contribuicoes
```

## 🔐 Segurança e LGPD

- ✅ Dados sensíveis (CPF, CNPJ, e-mail) são criptografados
- ✅ CPF/CNPJ são hasheados para busca sem exposição
- ✅ Contribuições públicas não expõem dados sensíveis
- ✅ Consentimento LGPD obrigatório
- ✅ Auditoria completa de todas as ações

## 📚 Mais Informações

- `INICIO_RAPIDO.md` - Guia rápido de início
- `SETUP_LOCAL.md` - Setup detalhado
- `README.md` - Documentação completa
- `QUICK_START.md` - Guia rápido detalhado

## ✅ Pronto para Usar!

O sistema está configurado e pronto para receber contribuições! 🎉

