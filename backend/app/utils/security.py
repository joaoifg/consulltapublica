"""
Utilitários de segurança: criptografia, hashing, tokens
"""
import hashlib
import base64
from cryptography.fernet import Fernet
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional, Dict, Any
import secrets
from passlib.context import CryptContext
from ..core.config import settings


class Encryption:
    """Classe para criptografia de dados sensíveis (LGPD)"""

    def __init__(self):
        # Usa a chave de criptografia do settings (FIXA)
        # IMPORTANTE: Em produção, ENCRYPTION_KEY deve ser uma chave Fernet válida e fixa
        # Para gerar: from cryptography.fernet import Fernet; print(Fernet.generate_key())
        key = settings.ENCRYPTION_KEY.encode()
        # Garante que a chave tenha o formato correto (URL-safe base64)
        key_hash = hashlib.sha256(key).digest()
        key_fernet = base64.urlsafe_b64encode(key_hash)
        self.cipher = Fernet(key_fernet)

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

# Context para hash bcrypt (senhas de admin)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def gerar_hash_sha256(data: str) -> str:
    """
    Gera hash SHA-256 de qualquer dado
    Usado para email de admin (busca única) e CPF/CNPJ
    """
    if not data:
        return ""
    salt = "CFO_CONSULTA_PUBLICA_2026"
    full_data = f"{salt}{data}".encode()
    return hashlib.sha256(full_data).hexdigest()


def criptografar_dados(data: str) -> str:
    """Wrapper para criptografar dados (LGPD)"""
    return crypto.encrypt(data)


def descriptografar_dados(encrypted_data: str) -> str:
    """Wrapper para descriptografar dados"""
    return crypto.decrypt(encrypted_data)


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
    """Hash de senha SHA-256 (DEPRECATED - usar hash_senha para admins)"""
    return hashlib.sha256(password.encode()).hexdigest()


# ===== FUNÇÕES PARA SISTEMA ADMINISTRATIVO =====

def hash_senha(senha: str) -> str:
    """
    Hash bcrypt para senhas de administradores
    Muito mais seguro que SHA-256 simples

    Args:
        senha: Senha em texto plano

    Returns:
        Hash bcrypt da senha
    """
    return pwd_context.hash(senha)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
    """
    Verifica senha contra hash bcrypt

    Args:
        senha_plana: Senha em texto plano
        senha_hash: Hash bcrypt armazenado

    Returns:
        True se a senha está correta
    """
    try:
        return pwd_context.verify(senha_plana, senha_hash)
    except Exception:
        # Fallback para bcrypt direto se passlib falhar
        import bcrypt
        try:
            return bcrypt.checkpw(senha_plana.encode('utf-8'), senha_hash.encode('utf-8'))
        except Exception:
            return False


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


def gerar_token_admin(admin_id: int, role: str, exp_days: int = 7) -> str:
    """
    Gera token JWT para administradores
    Diferente dos tokens de participante (tem campo "type": "admin")

    Args:
        admin_id: ID do administrador
        role: Role do admin (SUPER_ADMIN, MODERADOR, ANALISTA)
        exp_days: Dias até expirar (padrão 7 dias)

    Returns:
        Token JWT
    """
    expires = datetime.utcnow() + timedelta(days=exp_days)

    payload = {
        "admin_id": admin_id,
        "role": role,
        "type": "admin",  # IMPORTANTE: diferencia de tokens de participante
        "exp": expires,
        "iat": datetime.utcnow(),
        "jti": secrets.token_urlsafe(16)
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def verificar_token_admin(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica e decodifica token JWT de administrador
    Valida que o token tem type="admin"

    Args:
        token: Token JWT

    Returns:
        Payload do token ou None se inválido/não-admin
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Verifica se é token de admin
        if payload.get("type") != "admin":
            return None

        return payload
    except JWTError:
        return None


def gerar_refresh_token(admin_id: int, exp_days: int = 30) -> str:
    """
    Gera refresh token para renovar access token
    Usado para manter admin logado por mais tempo

    Args:
        admin_id: ID do administrador
        exp_days: Dias até expirar (padrão 30 dias)

    Returns:
        Refresh token JWT
    """
    expires = datetime.utcnow() + timedelta(days=exp_days)

    payload = {
        "admin_id": admin_id,
        "type": "refresh",
        "exp": expires,
        "iat": datetime.utcnow()
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def verificar_refresh_token(token: str) -> Optional[int]:
    """
    Verifica refresh token e retorna admin_id

    Args:
        token: Refresh token JWT

    Returns:
        admin_id ou None se inválido
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        # Verifica se é refresh token
        if payload.get("type") != "refresh":
            return None

        return payload.get("admin_id")
    except JWTError:
        return None
