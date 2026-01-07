# Configuração de Email - Sistema de Consulta Pública CFO

## 📧 Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# Configurações SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app
SMTP_FROM=Consulta Pública CFO <noreply@cfo.org.br>

# URL Pública (para links no email)
PUBLIC_URL=https://consulta.cfo.org.br
```

## 🔧 Configurações por Provedor

### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-de-app  # Use "Senha de App", não a senha normal
```

**Importante para Gmail:**
1. Ative a verificação em duas etapas na sua conta Google
2. Gere uma "Senha de App" em: https://myaccount.google.com/apppasswords
3. Use essa senha de app no `SMTP_PASSWORD`

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASSWORD=sua-senha
```

### Servidor Personalizado (exemplo: email-ssl.com.br)

```env
SMTP_HOST=email-ssl.com.br
SMTP_PORT=465
SMTP_USER=sistema-consultas@cfo.org.br
SMTP_PASSWORD=sua-senha
SMTP_FROM=Consulta Pública CFO <sistema-consultas@cfo.org.br>
```

## 📝 Portas e Protocolos

- **Porta 587**: Usa STARTTLS (recomendado)
- **Porta 465**: Usa SSL/TLS direto
- **Porta 25**: Não recomendado (geralmente bloqueado)

## ✅ Teste de Configuração

Para testar se a configuração está correta, você pode criar um script de teste:

```python
import asyncio
from app.services.email_service import email_service

async def test_email():
    sucesso = await email_service.enviar_email(
        destinatario="seu-email@teste.com",
        assunto="Teste de Email",
        corpo_html="<h1>Teste</h1><p>Este é um email de teste.</p>"
    )
    print("Email enviado!" if sucesso else "Falha ao enviar email")

asyncio.run(test_email())
```

## 🔒 Segurança

1. **Nunca commite o arquivo `.env`** no Git
2. Use variáveis de ambiente em produção
3. Para Gmail, sempre use "Senha de App"
4. Mantenha as credenciais em segredo

## 📋 Checklist

- [ ] Variáveis de ambiente configuradas
- [ ] Teste de envio realizado
- [ ] Email de confirmação funcionando
- [ ] Logs de erro configurados
- [ ] Credenciais seguras (não no código)

## 🐛 Troubleshooting

### Erro: "SMTP connect() failed"

**Possíveis causas:**
- Credenciais incorretas
- Porta ou protocolo incorretos
- Firewall bloqueando conexão

**Solução:**
- Verifique as credenciais
- Teste com diferentes portas (587, 465)
- Verifique firewall/antivírus

### Erro: "Could not authenticate"

**Solução:**
- Para Gmail: Use senha de app
- Verifique username e password
- Desative temporariamente 2FA para testes

### Emails indo para Spam

**Soluções:**
- Configure SPF, DKIM e DMARC no DNS
- Use endereço de email válido como remetente
- Evite palavras suspeitas no assunto
- Use servidor SMTP confiável

## 📚 Recursos

- [Documentação aiosmtplib](https://aiosmtplib.readthedocs.io/)
- [Configuração SMTP Gmail](https://support.google.com/a/answer/176600)
- [Guia de implementação PHPMailer](../guia%20de%20implemenntaçao%20de%20envio%20de%20email.md) (referência)

