"""
Modelo de Log Administrativo (Auditoria)
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class AdminLog(Base):
    """
    Tabela de logs administrativos

    Registra todas as ações administrativas para auditoria:
    - Login/logout
    - Criação/edição/desativação de admins
    - Aprovação/rejeição de contribuições
    - Alterações em consultas
    - Exportações de dados
    """
    __tablename__ = "logs_admin"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Vínculo com admin (nullable caso admin seja deletado)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True, index=True)

    # Detalhes da ação
    acao = Column(String(100), nullable=False, index=True)  # Ex: "LOGIN", "APROVAR_CONTRIBUICAO", "CRIAR_ADMIN"
    recurso = Column(String(255), nullable=True)  # Ex: "Contribuição #123", "Admin #45"
    detalhes = Column(JSON, nullable=True)  # Dados adicionais em JSON

    # Rastreamento
    ip_origem = Column(String(45), nullable=True)  # IPv4 ou IPv6
    user_agent = Column(Text, nullable=True)

    # Auditoria
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relacionamentos
    admin = relationship("Admin", back_populates="logs")

    # Índices compostos
    __table_args__ = (
        Index('idx_log_admin_acao', 'admin_id', 'acao'),
        Index('idx_log_acao_criado', 'acao', 'criado_em'),
    )

    def __repr__(self):
        return f"<AdminLog {self.id}: {self.acao} por Admin {self.admin_id}>"
