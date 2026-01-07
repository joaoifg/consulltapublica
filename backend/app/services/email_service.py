"""
Serviço de Envio de Emails
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
from jinja2 import Template

from ..core.config import settings
from ..utils.security import descriptografar_dados

logger = logging.getLogger(__name__)


class EmailService:
    """Serviço para envio de emails via SMTP"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_from = settings.SMTP_FROM

    async def enviar_email(
        self,
        destinatario: str,
        assunto: str,
        corpo_html: str,
        corpo_texto: Optional[str] = None
    ) -> bool:
        """
        Envia email via SMTP

        Args:
            destinatario: Email do destinatário
            assunto: Assunto do email
            corpo_html: Corpo do email em HTML
            corpo_texto: Corpo do email em texto simples (opcional)

        Returns:
            True se enviado com sucesso, False caso contrário
        """
        try:
            # Cria mensagem
            mensagem = MIMEMultipart("alternative")
            mensagem["Subject"] = Header(assunto, "utf-8")
            mensagem["From"] = self.smtp_from
            mensagem["To"] = destinatario
            mensagem["X-Mailer"] = f"{settings.APP_NAME} v{settings.APP_VERSION}"

            # Adiciona corpo em texto simples (fallback)
            if corpo_texto:
                parte_texto = MIMEText(corpo_texto, "plain", "utf-8")
                mensagem.attach(parte_texto)
            else:
                # Gera texto simples a partir do HTML
                import re
                texto_simples = re.sub(r'<[^>]+>', '', corpo_html)
                texto_simples = texto_simples.replace('&nbsp;', ' ')
                parte_texto = MIMEText(texto_simples, "plain", "utf-8")
                mensagem.attach(parte_texto)

            # Adiciona corpo HTML
            parte_html = MIMEText(corpo_html, "html", "utf-8")
            mensagem.attach(parte_html)

            # Determina se usa TLS ou SSL
            use_tls = self.smtp_port == 587
            use_ssl = self.smtp_port == 465

            # Conecta e envia email
            smtp = aiosmtplib.SMTP(
                hostname=self.smtp_host,
                port=self.smtp_port,
                use_tls=use_ssl
            )
            
            await smtp.connect()
            
            if use_tls and not use_ssl:
                await smtp.starttls()
            
            if self.smtp_user and self.smtp_password:
                await smtp.login(self.smtp_user, self.smtp_password)
            
            await smtp.send_message(mensagem)
            await smtp.quit()

            logger.info(f"Email enviado com sucesso para {destinatario}")
            return True

        except Exception as e:
            logger.error(f"Erro ao enviar email para {destinatario}: {str(e)}")
            return False

    async def enviar_email_protocolo(
        self,
        email_criptografado: str,
        numero_protocolo: str,
        documento: str,
        nome_participante: str,
        total_contribuicoes: int,
        data_submissao: datetime,
        contribuicoes: List[Dict[str, Any]],
        public_url: Optional[str] = None
    ) -> bool:
        """
        Envia email de confirmação de protocolo

        Args:
            email_criptografado: Email criptografado do participante
            numero_protocolo: Número do protocolo (ex: CP-CEO-2026-000154)
            documento: Documento (CEO ou CPEO)
            nome_participante: Nome público do participante
            total_contribuicoes: Total de contribuições
            data_submissao: Data/hora da submissão
            contribuicoes: Lista de contribuições
            public_url: URL pública do sistema (opcional)

        Returns:
            True se enviado com sucesso, False caso contrário
        """
        try:
            # Descriptografa email
            email_destinatario = descriptografar_dados(email_criptografado)

            # Nome do documento
            nome_documento = "Código de Ética Odontológica (CEO)" if documento == "CEO" else "Código de Processo Ético Odontológico (CPEO)"

            # Formata data
            data_formatada = data_submissao.strftime("%d/%m/%Y às %H:%M")

            # URL para consulta do protocolo
            url_protocolo = f"{public_url or settings.PUBLIC_URL}/protocolos/{numero_protocolo}"

            # Gera HTML do email
            corpo_html = self._gerar_template_email_protocolo(
                numero_protocolo=numero_protocolo,
                nome_documento=nome_documento,
                nome_participante=nome_participante,
                total_contribuicoes=total_contribuicoes,
                data_submissao=data_formatada,
                contribuicoes=contribuicoes,
                url_protocolo=url_protocolo
            )

            # Gera texto simples
            corpo_texto = self._gerar_texto_simples_protocolo(
                numero_protocolo=numero_protocolo,
                nome_documento=nome_documento,
                nome_participante=nome_participante,
                total_contribuicoes=total_contribuicoes,
                data_submissao=data_formatada,
                url_protocolo=url_protocolo
            )

            # Assunto
            assunto = f"Confirmação de Protocolo - {numero_protocolo} - Consulta Pública CFO"

            # Envia email
            return await self.enviar_email(
                destinatario=email_destinatario,
                assunto=assunto,
                corpo_html=corpo_html,
                corpo_texto=corpo_texto
            )

        except Exception as e:
            logger.error(f"Erro ao enviar email de protocolo: {str(e)}")
            return False

    def _gerar_template_email_protocolo(
        self,
        numero_protocolo: str,
        nome_documento: str,
        nome_participante: str,
        total_contribuicoes: int,
        data_submissao: str,
        contribuicoes: List[Dict[str, Any]],
        url_protocolo: str
    ) -> str:
        """Gera template HTML do email de protocolo"""
        template_html = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Protocolo - CFO</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #8D0F12 0%, #A61E22 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                                Conselho Federal de Odontologia
                            </h1>
                            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">
                                Consulta Pública
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Conteúdo Principal -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #8D0F12; margin: 0 0 20px 0; font-size: 20px;">
                                ✅ Protocolo Gerado com Sucesso!
                            </h2>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Prezado(a) <strong>{{ nome_participante }}</strong>,
                            </p>
                            
                            <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                                Sua contribuição para a <strong>{{ nome_documento }}</strong> foi recebida e registrada com sucesso!
                            </p>
                            
                            <!-- Box de Protocolo -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-left: 4px solid #8D0F12; border-radius: 4px; padding: 20px; margin: 20px 0;">
                                <tr>
                                    <td>
                                        <p style="color: #666666; font-size: 12px; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 1px;">
                                            Número do Protocolo
                                        </p>
                                        <p style="color: #8D0F12; font-size: 28px; font-weight: bold; margin: 0; font-family: 'Courier New', monospace;">
                                            {{ numero_protocolo }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Informações -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333;">Documento:</strong>
                                        <span style="color: #666666; margin-left: 10px;">{{ nome_documento }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;">
                                        <strong style="color: #333333;">Total de Contribuições:</strong>
                                        <span style="color: #666666; margin-left: 10px;">{{ total_contribuicoes }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <strong style="color: #333333;">Data e Hora:</strong>
                                        <span style="color: #666666; margin-left: 10px;">{{ data_submissao }}</span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Botão de Consulta -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ url_protocolo }}" style="display: inline-block; background-color: #8D0F12; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; font-size: 16px;">
                                            Consultar Protocolo
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Aviso LGPD -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0;">
                                <tr>
                                    <td>
                                        <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                                            <strong>🔒 Proteção de Dados (LGPD):</strong><br>
                                            Seus dados pessoais estão protegidos. Este protocolo pode ser consultado publicamente, mas informações sensíveis como CPF, CNPJ e e-mail não serão divulgadas.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                <strong>Importante:</strong> Guarde este número de protocolo para acompanhar sua contribuição. Você pode consultar o protocolo a qualquer momento através do link acima.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666666; font-size: 12px; margin: 0 0 10px 0;">
                                Conselho Federal de Odontologia
                            </p>
                            <p style="color: #999999; font-size: 11px; margin: 0;">
                                Este é um email automático, por favor não responda.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        """
        
        template = Template(template_html)
        return template.render(
            numero_protocolo=numero_protocolo,
            nome_documento=nome_documento,
            nome_participante=nome_participante,
            total_contribuicoes=total_contribuicoes,
            data_submissao=data_submissao,
            url_protocolo=url_protocolo
        )

    def _gerar_texto_simples_protocolo(
        self,
        numero_protocolo: str,
        nome_documento: str,
        nome_participante: str,
        total_contribuicoes: int,
        data_submissao: str,
        url_protocolo: str
    ) -> str:
        """Gera versão em texto simples do email"""
        return f"""
CONSELHO FEDERAL DE ODONTOLOGIA
Consulta Pública

PROTOCOLO GERADO COM SUCESSO!

Prezado(a) {nome_participante},

Sua contribuição para a {nome_documento} foi recebida e registrada com sucesso!

NÚMERO DO PROTOCOLO: {numero_protocolo}

INFORMAÇÕES:
- Documento: {nome_documento}
- Total de Contribuições: {total_contribuicoes}
- Data e Hora: {data_submissao}

CONSULTAR PROTOCOLO:
{url_protocolo}

IMPORTANTE:
- Guarde este número de protocolo para acompanhar sua contribuição
- Você pode consultar o protocolo a qualquer momento através do link acima

PROTEÇÃO DE DADOS (LGPD):
Seus dados pessoais estão protegidos. Este protocolo pode ser consultado publicamente, mas informações sensíveis como CPF, CNPJ e e-mail não serão divulgadas.

---
Conselho Federal de Odontologia
Este é um email automático, por favor não responda.
        """.strip()


# Instância global do serviço
email_service = EmailService()

