"""
Utilitários de segurança: criptografia, hashing, tokens
"""
import hashlib
from cryptography.fernet import Fernet
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import secrets
from ..core.config import settings


class Encryption:
    """Classe para criptografia de dados sensíveis (LGPD)"""

    def __init__(self):
        # Usa a chave de criptografia do settings
        # Em produção, deve ser uma chave fixa e segura
        key = settings.ENCRYPTION_KEY.encode()
        # Garante que a chave tenha 32 bytes (URL-safe base64)
        key_hash = hashlib.sha256(key).digest()
        self.cipher = Fernet(Fernet.generate_key())  # Substituir por chave fixa em produção

    def encrypt(self, data: str) -> str:
        """Criptografa uma string"""
        if not data:
            return ""
        encrypted = self.cipher.encrypt(data.encode())
        return encrypted.decode()

    def decrypt(self, encrypted_data: str) -> str:
        """Descriptografa uma string"""
        if not encrypted_data:
            return ""
        decrypted = self.cipher.decrypt(encrypted_data.encode())
        return decrypted.decode()


# Instância global de criptografia
crypto = Encryption()


def hash_cpf_cnpj(documento: str) -> str:
    """
    Hash irreversível de CPF/CNPJ para busca
    Usa SHA-256
    """
    if not documento:
        return ""
    # Remove formatação
    documento_limpo = ''.join(filter(str.isdigit, documento))
    # Hash com salt fixo (específico da aplicação)
    salt = "CFO_CONSULTA_PUBLICA_2026"
    data = f"{salt}{documento_limpo}".encode()
    return hashlib.sha256(data).hexdigest()


def hash_password(password: str) -> str:
    """Hash de senha (caso seja necessário no futuro)"""
    return hashlib.sha256(password.encode()).hexdigest()


def gerar_token_sessao(participante_id: int, tipo: str) -> str:
    """
    Gera token JWT para sessão de contribuição

    Args:
        participante_id: ID do participante
        tipo: PESSOA_FISICA ou PESSOA_JURIDICA

    Returns:
        Token JWT
    """
    expires = datetime.utcnow() + timedelta(hours=settings.SESSION_EXPIRATION_HOURS)

    payload = {
        "participante_id": participante_id,
        "tipo": tipo,
        "exp": expires,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16)  # JWT ID único
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def verificar_token_sessao(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica e decodifica token JWT

    Args:
        token: Token JWT

    Returns:
        Payload do token ou None se inválido
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def gerar_codigo_verificacao() -> str:
    """Gera código de verificação de 6 dígitos"""
    return str(secrets.randbelow(1000000)).zfill(6)


def gerar_id_unico() -> str:
    """Gera ID único para rastreamento"""
    return secrets.token_urlsafe(32)
