# Guia de Implementação - Envio de Emails com PHPMailer

Este guia explica como implementar o envio de emails em um projeto PHP usando a biblioteca PHPMailer, baseado na implementação do sistema de consultas.

## 📋 Pré-requisitos

1. **PHP 8.0 ou superior**
2. **Composer** instalado
3. **Acesso a um servidor SMTP** (ou configuração de email)

## 🔧 Instalação

### 1. Instalar PHPMailer via Composer

No diretório do seu projeto, execute:

```bash
composer require phpmailer/phpmailer
```

Ou adicione manualmente no arquivo `composer.json`:

```json
{
    "require": {
        "phpmailer/phpmailer": "^6.8"
    }
}
```

Depois execute:

```bash
composer install
```

## 📝 Implementação Básica

### 1. Estrutura Básica do Código

```php
<?php
// Importar as classes necessárias do PHPMailer
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Carregar o autoloader do Composer
require 'vendor/autoload.php';

// Criar uma instância do PHPMailer (true habilita exceções)
$mail = new PHPMailer(true);

try {
    // Configurações do servidor SMTP
    $mail->CharSet    = "UTF-8";  
    $mail->Encoding   = 'base64';      
    $mail->isSMTP();
    $mail->Host       = 'seu-servidor-smtp.com.br';
    $mail->SMTPAuth   = true;                      
    $mail->Username   = 'seu-email@dominio.com.br';
    $mail->Password   = 'sua-senha';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // ou ENCRYPTION_STARTTLS
    $mail->Port       = 465; // 465 para SMTPS, 587 para STARTTLS
    
    // Remetente
    $mail->setFrom('seu-email@dominio.com.br', 'Nome do Remetente');
    
    // Destinatário
    $mail->addAddress('destinatario@email.com', 'Nome do Destinatário');
    
    // Opcional: Adicionar mais destinatários
    // $mail->addAddress('outro@email.com');
    // $mail->addReplyTo('resposta@email.com', 'Nome');
    // $mail->addCC('cc@email.com');
    // $mail->addBCC('bcc@email.com');
    
    // Anexos (opcional)
    // $mail->addAttachment('/caminho/para/arquivo.pdf');
    
    // Conteúdo do email
    $mail->isHTML(true);
    $mail->Subject = 'Assunto do Email';
    $mail->Body    = '<h1>Corpo do email em HTML</h1><p>Este é um email de teste.</p>';
    $mail->AltBody = 'Corpo do email em texto simples para clientes que não suportam HTML';
    
    // Enviar o email
    $mail->send();
    echo 'Email enviado com sucesso!';
    
} catch (Exception $e) {
    echo "Erro ao enviar email: {$mail->ErrorInfo}";
}
?>
```

## 🔐 Configurações de Servidor SMTP Comuns

### Gmail

```php
$mail->Host       = 'smtp.gmail.com';
$mail->SMTPAuth   = true;
$mail->Username   = 'seu-email@gmail.com';
$mail->Password   = 'sua-senha-de-app'; // Use senha de app, não a senha normal
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port       = 587;
```

**Nota:** Para Gmail, você precisa gerar uma "Senha de App" nas configurações de segurança da sua conta Google.

### Outlook/Hotmail

```php
$mail->Host       = 'smtp-mail.outlook.com';
$mail->SMTPAuth   = true;
$mail->Username   = 'seu-email@outlook.com';
$mail->Password   = 'sua-senha';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port       = 587;
```

### Servidor Personalizado (exemplo do projeto)

```php
$mail->Host       = 'email-ssl.com.br';
$mail->SMTPAuth   = true;
$mail->Username   = 'sistema-consultas@cfo.org.br';
$mail->Password   = 'sua-senha';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
$mail->Port       = 465;
```

## 📧 Exemplo Completo: Recuperação de Senha

Aqui está um exemplo completo baseado na implementação do sistema:

```php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

function enviarEmailRecuperacaoSenha($emailDestinatario, $tokenRecuperacao) {
    $mail = new PHPMailer(true);
    
    try {
        // Configurações do servidor
        $mail->CharSet    = "UTF-8";  
        $mail->Encoding   = 'base64';      
        $mail->isSMTP();
        $mail->Host       = 'email-ssl.com.br';
        $mail->SMTPAuth   = true;                      
        $mail->Username   = 'sistema-consultas@cfo.org.br';
        $mail->Password   = 'sua-senha-aqui';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;  
        
        // Remetente e destinatário
        $mail->setFrom('sistema-consultas@cfo.org.br', 'Sistema Consultas');
        $mail->addAddress($emailDestinatario);
        
        // Conteúdo
        $mail->isHTML(true);
        $mail->Subject = 'Recuperar senha - Sistema';
        
        $linkRecuperacao = "https://seusite.com.br/recuperar-senha?email=" . 
                          urlencode($emailDestinatario) . "&token=" . $tokenRecuperacao;
        
        $mail->Body = '
            <h2>Recuperação de Senha</h2>
            <p>Foi realizada uma solicitação de alteração de senha para o e-mail: <strong>' . 
            htmlspecialchars($emailDestinatario) . '</strong></p>
            <p>Seu token de recuperação: <strong>' . $tokenRecuperacao . '</strong></p>
            <p>Clique no link abaixo para completar a alteração da senha:</p>
            <p><a href="' . $linkRecuperacao . '">' . $linkRecuperacao . '</a></p>
            <p>Caso você não tenha solicitado a alteração da senha, apenas ignore este e-mail.</p>
        ';
        
        $mail->AltBody = "Recuperação de Senha\n\n" .
                        "Token: " . $tokenRecuperacao . "\n" .
                        "Link: " . $linkRecuperacao;
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Erro ao enviar email: {$mail->ErrorInfo}");
        return false;
    }
}

// Uso da função
$email = "usuario@exemplo.com";
$token = "ABC123XYZ";

if (enviarEmailRecuperacaoSenha($email, $token)) {
    echo "Email enviado com sucesso!";
} else {
    echo "Erro ao enviar email.";
}
?>
```

## 🛠️ Funcionalidades Avançadas

### 1. Adicionar Anexos

```php
// Anexo simples
$mail->addAttachment('/caminho/para/arquivo.pdf');

// Anexo com nome personalizado
$mail->addAttachment('/caminho/para/imagem.jpg', 'foto.jpg');

// Anexo inline (para usar no corpo do email)
$mail->addEmbeddedImage('/caminho/para/logo.png', 'logo', 'logo.png');
// No corpo HTML: <img src="cid:logo">
```

### 2. Múltiplos Destinatários

```php
// Para (destinatários principais)
$mail->addAddress('destinatario1@email.com', 'Nome 1');
$mail->addAddress('destinatario2@email.com', 'Nome 2');

// Cópia (CC)
$mail->addCC('cc@email.com');

// Cópia oculta (BCC)
$mail->addBCC('bcc@email.com');

// Responder para
$mail->addReplyTo('resposta@email.com', 'Nome para Resposta');
```

### 3. Debug e Tratamento de Erros

```php
// Habilitar debug detalhado (desabilitar em produção)
$mail->SMTPDebug = SMTP::DEBUG_SERVER; // Mostra todas as mensagens
// $mail->SMTPDebug = SMTP::DEBUG_CLIENT; // Mostra apenas mensagens do cliente
// $mail->SMTPDebug = SMTP::DEBUG_CONNECTION; // Mostra apenas mensagens de conexão
// $mail->SMTPDebug = 0; // Desabilitar debug

try {
    $mail->send();
    echo "Email enviado com sucesso!";
} catch (Exception $e) {
    // Log do erro
    error_log("Erro PHPMailer: {$mail->ErrorInfo}");
    
    // Mensagem amigável para o usuário
    echo "Não foi possível enviar o email. Tente novamente mais tarde.";
}
```

### 4. Usar Variáveis de Ambiente

Para maior segurança, armazene credenciais em variáveis de ambiente:

```php
// Usando phpdotenv (já incluído no projeto)
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

$mail->Username = $_ENV['SMTP_USERNAME'];
$mail->Password = $_ENV['SMTP_PASSWORD'];
$mail->Host     = $_ENV['SMTP_HOST'];
$mail->Port     = $_ENV['SMTP_PORT'];
```

Crie um arquivo `.env` na raiz do projeto:

```env
SMTP_HOST=email-ssl.com.br
SMTP_USERNAME=seu-email@dominio.com.br
SMTP_PASSWORD=sua-senha
SMTP_PORT=465
```

**Importante:** Adicione `.env` ao `.gitignore` para não versionar credenciais!

## 📋 Checklist de Implementação

- [ ] Instalar PHPMailer via Composer
- [ ] Configurar credenciais SMTP
- [ ] Testar conexão com servidor SMTP
- [ ] Implementar tratamento de erros
- [ ] Configurar charset UTF-8 para suporte a acentuação
- [ ] Criar templates HTML para os emails
- [ ] Implementar variáveis de ambiente para credenciais
- [ ] Testar envio em ambiente de desenvolvimento
- [ ] Desabilitar debug em produção
- [ ] Implementar logs de envio

## 🔍 Troubleshooting

### Erro: "SMTP connect() failed"

**Possíveis causas:**
- Credenciais incorretas
- Porta ou protocolo de segurança incorretos
- Firewall bloqueando conexão
- Servidor SMTP indisponível

**Solução:**
- Verifique as credenciais
- Teste com diferentes portas (465, 587)
- Teste com ENCRYPTION_STARTTLS e ENCRYPTION_SMTPS
- Habilite o debug para ver mensagens detalhadas

### Erro: "Could not authenticate"

**Possíveis causas:**
- Username ou senha incorretos
- Necessário usar "Senha de App" (Gmail)
- Autenticação de dois fatores ativada

**Solução:**
- Verifique credenciais
- Para Gmail, gere uma senha de app
- Desative temporariamente 2FA para testes

### Emails indo para Spam

**Soluções:**
- Configure SPF, DKIM e DMARC no DNS
- Use um endereço de email válido como remetente
- Evite palavras suspeitas no assunto
- Inclua texto alternativo (AltBody)
- Use um servidor SMTP confiável

## 📚 Recursos Adicionais

- [Documentação oficial do PHPMailer](https://github.com/PHPMailer/PHPMailer)
- [Exemplos do PHPMailer](https://github.com/PHPMailer/PHPMailer/tree/master/examples)
- [Configuração SMTP do Gmail](https://support.google.com/a/answer/176600)

## ⚠️ Boas Práticas

1. **Nunca hardcode credenciais** - Use variáveis de ambiente
2. **Trate exceções** - Sempre use try/catch
3. **Valide emails** - Verifique formato antes de enviar
4. **Use templates** - Separe HTML do código PHP
5. **Implemente logs** - Registre tentativas de envio
6. **Teste em desenvolvimento** - Use servidor SMTP de teste
7. **Configure rate limiting** - Evite spam
8. **Use filas** - Para envios em massa, considere filas (Redis, RabbitMQ)

## 📝 Exemplo de Classe Helper

Para facilitar o reuso, crie uma classe helper:

```php
<?php
namespace App\Helpers;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailHelper {
    private $mail;
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->configurarSMTP();
    }
    
    private function configurarSMTP() {
        $this->mail->CharSet = "UTF-8";
        $this->mail->Encoding = 'base64';
        $this->mail->isSMTP();
        $this->mail->Host = $_ENV['SMTP_HOST'];
        $this->mail->SMTPAuth = true;
        $this->mail->Username = $_ENV['SMTP_USERNAME'];
        $this->mail->Password = $_ENV['SMTP_PASSWORD'];
        $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $this->mail->Port = $_ENV['SMTP_PORT'];
        $this->mail->setFrom($_ENV['SMTP_FROM_EMAIL'], $_ENV['SMTP_FROM_NAME']);
    }
    
    public function enviar($destinatario, $assunto, $corpoHTML, $corpoTexto = null) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($destinatario);
            $this->mail->isHTML(true);
            $this->mail->Subject = $assunto;
            $this->mail->Body = $corpoHTML;
            $this->mail->AltBody = $corpoTexto ?? strip_tags($corpoHTML);
            
            return $this->mail->send();
        } catch (Exception $e) {
            error_log("Erro ao enviar email: {$this->mail->ErrorInfo}");
            return false;
        }
    }
}
```

**Uso:**

```php
$emailHelper = new EmailHelper();
$emailHelper->enviar(
    'usuario@email.com',
    'Assunto do Email',
    '<h1>Corpo HTML</h1>',
    'Corpo em texto simples'
);
```

---

**Última atualização:** Baseado na implementação do sistema-consultas

