"""
Modelo de Administrador do Sistema
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class AdminRole(str, enum.Enum):
    """Roles de administradores"""
    SUPER_ADMIN = "SUPER_ADMIN"
    MODERADOR = "MODERADOR"
    ANALISTA = "ANALISTA"


class Admin(Base):
    """
    Tabela de administradores do sistema

    Gerencia acesso ao painel administrativo com:
    - Autenticação via email + senha (bcrypt)
    - Sistema de roles (SUPER_ADMIN, MODERADOR, ANALISTA)
    - Proteção LGPD (email criptografado)
    - Suporte para 2FA (TOTP) opcional
    """
    __tablename__ = "admins"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Autenticação
    email_hash = Column(String(64), unique=True, nullable=False, index=True)  # SHA-256 para busca única
    email_criptografado = Column(Text, nullable=False)  # Email criptografado (Fernet)
    senha_hash = Column(String(255), nullable=False)  # Hash bcrypt da senha

    # Informações pessoais
    nome = Column(String(255), nullable=False)

    # Controle de acesso
    role = Column(Enum(AdminRole), nullable=False, index=True)
    ativo = Column(Boolean, default=True, nullable=False, index=True)

    # 2FA opcional (para implementação futura)
    totp_secret = Column(String(32), nullable=True)  # Secret para TOTP (Google Authenticator)

    # Auditoria
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    contribuicoes_moderadas = relationship("Contribuicao", back_populates="moderado_por", foreign_keys="Contribuicao.moderado_por_id")
    consultas_criadas = relationship("ConsultaPublica", back_populates="criado_por")
    moderacoes = relationship("HistoricoModeracao", back_populates="admin")
    logs = relationship("AdminLog", back_populates="admin")

    # Índices compostos
    __table_args__ = (
        Index('idx_admin_role_ativo', 'role', 'ativo'),
    )

    def __repr__(self):
        return f"<Admin {self.id}: {self.nome} ({self.role.value})>"

    @property
    def is_super_admin(self) -> bool:
        """Verifica se é super admin"""
        return self.role == AdminRole.SUPER_ADMIN

    @property
    def is_moderador(self) -> bool:
        """Verifica se é moderador ou superior"""
        return self.role in [AdminRole.SUPER_ADMIN, AdminRole.MODERADOR]

    @property
    def is_analista(self) -> bool:
        """Verifica se é analista ou superior"""
        return self.role in [AdminRole.SUPER_ADMIN, AdminRole.MODERADOR, AdminRole.ANALISTA]
