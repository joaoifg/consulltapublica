"""
Configurações do Sistema de Consulta Pública CFO
"""
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List
import secrets


class Settings(BaseSettings):
    """Configurações da aplicação"""

    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DATABASE_URL_SYNC: str = Field(..., env="DATABASE_URL_SYNC")

    # Security
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    SESSION_EXPIRATION_HOURS: int = 24
    ENCRYPTION_KEY: str = Field(..., env="ENCRYPTION_KEY")

    # Application
    APP_NAME: str = "Sistema de Consulta Pública CFO"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "Consulta Pública CFO <noreply@cfo.org.br>"

    # Timezone
    TIMEZONE: str = "America/Sao_Paulo"

    # Public URL
    PUBLIC_URL: str = "http://localhost:3000"

    # Captcha
    RECAPTCHA_SITE_KEY: str = ""
    RECAPTCHA_SECRET_KEY: str = ""

    # Documentos disponíveis
    DOCUMENTOS_DISPONIVEIS: List[str] = ["CEO", "CPEO"]

    # Tipos de contribuição
    TIPOS_CONTRIBUICAO: List[str] = [
        "ALTERACAO",
        "INCLUSAO",
        "EXCLUSAO",
        "COMENTARIO"
    ]

    # Categorias de participante PF
    CATEGORIAS_PF: List[str] = [
        "CIRURGIAO_DENTISTA",
        "AUXILIAR_TECNICO",
        "ESTUDANTE",
        "PESQUISADOR",
        "CIDADAO",
        "OUTRO"
    ]

    # Naturezas de entidade PJ
    NATUREZAS_PJ: List[str] = [
        "CONSELHO_REGIONAL",
        "ASSOCIACAO_CLASSE",
        "SINDICATO",
        "INSTITUICAO_ENSINO",
        "CENTRO_PESQUISA",
        "EMPRESA_PRIVADA",
        "ORGAO_PUBLICO",
        "ONG",
        "OUTRO"
    ]

    # UFs do Brasil
    UFS_BRASIL: List[str] = [
        "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
        "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
        "RS", "RO", "RR", "SC", "SP", "SE", "TO"
    ]

    # Limites de caracteres
    MAX_CHARS_TEXTO_PROPOSTO: int = 5000
    MAX_CHARS_FUNDAMENTACAO: int = 5000

    class Config:
        env_file = ".env"
        case_sensitive = True


# Instância global
settings = Settings()
