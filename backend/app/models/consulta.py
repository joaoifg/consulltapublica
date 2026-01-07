"""
Modelo de Consulta Pública
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, ForeignKey, JSON, Index, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class StatusConsulta(str, enum.Enum):
    """Status da consulta pública"""
    RASCUNHO = "RASCUNHO"  # Em preparação
    ATIVA = "ATIVA"        # Aberta para contribuições
    ENCERRADA = "ENCERRADA"  # Período encerrado


class ConsultaPublica(Base):
    """
    Tabela de consultas públicas

    Gerencia períodos de consulta com:
    - Definição de período (data início/fim)
    - Status (rascunho, ativa, encerrada)
    - Documentos disponíveis (CEO, CPEO)
    - Controle de quem criou
    """
    __tablename__ = "consultas_publicas"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Informações da consulta
    titulo = Column(String(500), nullable=False)
    descricao = Column(Text, nullable=True)

    # Período
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime, nullable=False)

    # Status e configuração
    status = Column(Enum(StatusConsulta), default=StatusConsulta.RASCUNHO, nullable=False, index=True)
    documentos_disponiveis = Column(JSON, nullable=False)  # Array: ["CEO", "CPEO"]

    # Vínculo com admin criador
    criado_por_admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)

    # Auditoria
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    criado_por = relationship("Admin", back_populates="consultas_criadas")

    # Constraints
    __table_args__ = (
        CheckConstraint('data_fim > data_inicio', name='check_data_fim_maior'),
        Index('idx_consulta_status_periodo', 'status', 'data_inicio', 'data_fim'),
    )

    def __repr__(self):
        return f"<ConsultaPublica {self.id}: {self.titulo} ({self.status.value})>"

    @property
    def is_ativa(self) -> bool:
        """Verifica se consulta está ativa"""
        return self.status == StatusConsulta.ATIVA

    @property
    def is_periodo_valido(self) -> bool:
        """Verifica se está dentro do período"""
        agora = datetime.utcnow()
        return self.data_inicio <= agora <= self.data_fim
