"""
Modelo de Protocolo
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Index, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Protocolo(Base):
    """
    Tabela de protocolos

    Cada protocolo representa uma submissão completa de contribuições.
    Um participante pode enviar múltiplas contribuições em uma única sessão,
    e todas serão vinculadas a um único protocolo.

    Formato: CP-{DOCUMENTO}-{ANO}-{SEQUENCIAL}
    Exemplo: CP-CEO-2026-000154
    """
    __tablename__ = "protocolos"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    numero_protocolo = Column(String(30), unique=True, nullable=False, index=True)

    # Vínculo com participante
    participante_id = Column(Integer, ForeignKey("participantes.id"), nullable=False, index=True)

    # Informações da submissão
    documento = Column(String(10), nullable=False, index=True)  # CEO ou CPEO
    total_contribuicoes = Column(Integer, default=0, nullable=False)

    # IDs das contribuições vinculadas (JSON array)
    contribuicoes_ids = Column(JSON, nullable=True)

    # Timestamps (horário de Brasília)
    criado_em_brasilia = Column(DateTime, nullable=False, index=True)
    criado_em_utc = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Auditoria
    ip_origem = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)

    # Email de confirmação
    email_enviado = Column(DateTime, nullable=True)
    email_confirmado = Column(DateTime, nullable=True)

    # Relacionamentos
    participante = relationship("Participante", back_populates="protocolos")

    # Índices
    __table_args__ = (
        Index('idx_protocolo_documento_criado', 'documento', 'criado_em_brasilia'),
        Index('idx_protocolo_participante_criado', 'participante_id', 'criado_em_brasilia'),
    )

    def __repr__(self):
        return f"<Protocolo {self.numero_protocolo}: {self.total_contribuicoes} contribuições>"
