"""
Modelo de Histórico de Moderação
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class AcaoModeracao(str, enum.Enum):
    """Ações de moderação"""
    APROVAR = "APROVAR"
    REJEITAR = "REJEITAR"


class HistoricoModeracao(Base):
    """
    Tabela de histórico de moderação

    Registra todas as ações de moderação com:
    - Quem moderou (admin)
    - Qual contribuição
    - Ação tomada (aprovar/rejeitar)
    - Motivo (obrigatório para rejeição)
    - Timestamp da ação
    """
    __tablename__ = "historico_moderacao"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Vínculos
    contribuicao_id = Column(Integer, ForeignKey("contribuicoes.id"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False, index=True)

    # Ação
    acao = Column(Enum(AcaoModeracao), nullable=False)
    motivo = Column(Text, nullable=True)  # Obrigatório quando acao=REJEITAR

    # Auditoria
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relacionamentos
    contribuicao = relationship("Contribuicao", back_populates="historico_moderacao")
    admin = relationship("Admin", back_populates="moderacoes")

    # Índices compostos
    __table_args__ = (
        Index('idx_moderacao_contribuicao_criado', 'contribuicao_id', 'criado_em'),
        Index('idx_moderacao_admin_criado', 'admin_id', 'criado_em'),
        Index('idx_moderacao_acao', 'acao'),
    )

    def __repr__(self):
        return f"<HistoricoModeracao {self.id}: {self.acao.value} - Contrib {self.contribuicao_id}>"
