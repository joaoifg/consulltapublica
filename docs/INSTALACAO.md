# Guia de Instalação - Sistema de Consulta Pública CFO

## Pré-requisitos

### Desenvolvimento Local
- Docker 24+ e Docker Compose 2.20+
- Git
- (Opcional) Python 3.12+ e Node.js 18+ para desenvolvimento sem Docker

### Produção
- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- Docker e Docker Compose
- Domínio configurado (ex: consultapublica.cfo.org.br)
- Certificado SSL (Let's Encrypt recomendado)

## Instalação para Desenvolvimento

### 1. Clone o repositório

```bash
git clone <repository-url>
cd consulta
```

### 2. Configure as variáveis de ambiente

#### Backend
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env` e configure:
- `SECRET_KEY`: Chave secreta única (min. 32 caracteres)
- `ENCRYPTION_KEY`: Chave de criptografia única (32 bytes)
- `SMTP_*`: Configurações de e-mail

#### Frontend
```bash
cd frontend
cp .env.example .env
```

### 3. Inicie os containers

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso irá:
- Criar banco de dados PostgreSQL
- Executar migrações do Alembic
- Iniciar backend FastAPI na porta 8000
- Iniciar frontend Next.js na porta 3000
- Configurar NGINX na porta 80

### 4. Acesse o sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **NGINX**: http://localhost

### 5. Verificar logs

```bash
# Todos os serviços
docker-compose logs -f

# Backend apenas
docker-compose logs -f backend

# Frontend apenas
docker-compose logs -f frontend
```

## Instalação para Produção

### 1. Preparar servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin
```

### 2. Clonar projeto

```bash
cd /opt
sudo git clone <repository-url> consulta-cfo
cd consulta-cfo
```

### 3. Configurar variáveis de ambiente

```bash
# Backend
sudo nano backend/.env
```

**IMPORTANTE**: Configure valores seguros para produção:
```env
SECRET_KEY=<gerar_chave_segura_32+_chars>
ENCRYPTION_KEY=<gerar_chave_criptografia_32_bytes>
DEBUG=False
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://cfo_user:<senha_forte>@db:5432/cfo_consulta
CORS_ORIGINS=https://consultapublica.cfo.org.br
PUBLIC_URL=https://consultapublica.cfo.org.br
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@cfo.org.br
SMTP_PASSWORD=<senha_smtp>
```

### 4. Configurar SSL/TLS

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot certonly --standalone -d consultapublica.cfo.org.br

# Copiar certificados para NGINX
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/consultapublica.cfo.org.br/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/consultapublica.cfo.org.br/privkey.pem nginx/ssl/
```

### 5. Atualizar configuração NGINX

Edite `nginx/nginx.conf` e descomente a seção HTTPS:

```nginx
server {
    listen 443 ssl http2;
    server_name consultapublica.cfo.org.br;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    # ... resto da configuração
}
```

### 6. Criar arquivo docker-compose para produção

```bash
sudo nano docker-compose.prod.yml
```

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_DB: cfo_consulta
      POSTGRES_USER: cfo_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - cfo_network

  backend:
    build: ./backend
    restart: always
    depends_on:
      - db
    env_file:
      - ./backend/.env
    networks:
      - cfo_network

  frontend:
    build: ./frontend
    restart: always
    env_file:
      - ./frontend/.env
    networks:
      - cfo_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - cfo_network

volumes:
  postgres_data:

networks:
  cfo_network:
```

### 7. Iniciar sistema

```bash
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

### 8. Configurar firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. Configurar renovação automática de SSL

```bash
# Adicionar ao crontab
sudo crontab -e

# Adicionar linha:
0 3 * * * certbot renew --quiet && docker-compose -f /opt/consulta-cfo/docker-compose.prod.yml restart nginx
```

## Migrações de Banco de Dados

### Criar nova migration

```bash
docker-compose exec backend alembic revision --autogenerate -m "descrição da mudança"
```

### Aplicar migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Reverter última migration

```bash
docker-compose exec backend alembic downgrade -1
```

## Backup e Restore

### Backup do banco de dados

```bash
docker-compose exec db pg_dump -U cfo_user cfo_consulta > backup_$(date +%Y%m%d).sql
```

### Restore do banco de dados

```bash
docker-compose exec -T db psql -U cfo_user cfo_consulta < backup_20260106.sql
```

## Monitoramento

### Logs em tempo real

```bash
docker-compose logs -f --tail=100
```

### Estatísticas de containers

```bash
docker stats
```

### Health check

```bash
curl http://localhost/api/v1/health
```

## Troubleshooting

### Container não inicia

```bash
docker-compose ps
docker-compose logs <service-name>
```

### Erro de conexão com banco

Verificar se o banco está healthy:
```bash
docker-compose exec db pg_isready -U cfo_user
```

### Limpar e reconstruir

```bash
docker-compose down -v
docker-compose up -d --build
```

## Segurança

### Checklist de Segurança para Produção

- [ ] SECRET_KEY e ENCRYPTION_KEY únicos e seguros
- [ ] DEBUG=False
- [ ] Senhas de banco de dados fortes
- [ ] SSL/TLS configurado (HTTPS)
- [ ] Firewall configurado
- [ ] Rate limiting habilitado no NGINX
- [ ] Backups automáticos configurados
- [ ] Logs de auditoria habilitados
- [ ] Atualizações de segurança regulares

## Contato

Para suporte técnico:
- E-mail: suporte.ti@cfo.org.br
- Documentação: https://docs.cfo.org.br
