"""
Modelo de Contribuição
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class TipoContribuicao(str, enum.Enum):
    """Tipo de contribuição"""
    ALTERACAO = "ALTERACAO"  # Alterar redação existente
    INCLUSAO = "INCLUSAO"    # Incluir novo dispositivo
    EXCLUSAO = "EXCLUSAO"    # Excluir dispositivo
    COMENTARIO = "COMENTARIO"  # Comentário geral


class DocumentoConsulta(str, enum.Enum):
    """Documento da consulta pública"""
    CEO = "CEO"    # Código de Ética Odontológica
    CPEO = "CPEO"  # Código de Processo Ético Odontológico


class StatusModeracao(str, enum.Enum):
    """Status de moderação da contribuição"""
    PENDENTE = "PENDENTE"    # Aguardando moderação
    APROVADA = "APROVADA"    # Aprovada por admin
    REJEITADA = "REJEITADA"  # Rejeitada por admin


class Contribuicao(Base):
    """
    Tabela de contribuições

    Armazena cada contribuição individual vinculada a:
    - Participante (PF ou PJ)
    - Documento específico (CEO ou CPEO)
    - Trecho da minuta (capítulo, artigo, parágrafo, etc.)
    - Tipo de contribuição
    - Texto proposto
    - Fundamentação
    """
    __tablename__ = "contribuicoes"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Vínculo com participante
    participante_id = Column(Integer, ForeignKey("participantes.id"), nullable=False, index=True)

    # Documento e localização na minuta
    documento = Column(Enum(DocumentoConsulta), nullable=False, index=True)
    titulo_capitulo = Column(String(500), nullable=False)  # Ex: "Capítulo III - Dos Deveres Fundamentais"
    secao = Column(String(500), nullable=True)  # Opcional
    artigo = Column(String(100), nullable=False)  # Ex: "Art. 7º"
    paragrafo_inciso_alinea = Column(String(200), nullable=True)  # Ex: "inciso IV" ou "§ 2º"

    # Tipo e conteúdo da contribuição
    tipo = Column(Enum(TipoContribuicao), nullable=False, index=True)
    texto_proposto = Column(Text, nullable=False)  # Máx 5000 chars (validado em schema)
    fundamentacao = Column(Text, nullable=False)  # Máx 5000 chars (validado em schema)

    # Transparência pública
    publicada = Column(Boolean, default=True, nullable=False, index=True)

    # Moderação (novo sistema)
    status_moderacao = Column(Enum(StatusModeracao), default=StatusModeracao.PENDENTE, nullable=False, index=True)
    moderado_por_id = Column(Integer, ForeignKey("admins.id"), nullable=True, index=True)
    moderado_em = Column(DateTime, nullable=True)
    motivo_rejeicao = Column(Text, nullable=True)  # Obrigatório quando status=REJEITADA

    # Auditoria
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ip_origem = Column(String(45), nullable=True)  # IP de origem
    user_agent = Column(Text, nullable=True)

    # Relacionamentos
    participante = relationship("Participante", back_populates="contribuicoes")
    moderado_por = relationship("Admin", back_populates="contribuicoes_moderadas", foreign_keys=[moderado_por_id])
    historico_moderacao = relationship("HistoricoModeracao", back_populates="contribuicao")

    # Índices compostos
    __table_args__ = (
        Index('idx_contribuicao_doc_artigo', 'documento', 'artigo'),
        Index('idx_contribuicao_tipo_doc', 'tipo', 'documento'),
        Index('idx_contribuicao_publicada_criado', 'publicada', 'criado_em'),
        Index('idx_contribuicao_status_moderacao', 'status_moderacao', 'criado_em'),
        Index('idx_contribuicao_moderado_por', 'moderado_por_id', 'moderado_em'),
    )

    def __repr__(self):
        return f"<Contribuicao {self.id}: {self.documento.value} - {self.artigo}>"

    @property
    def localizacao_completa(self) -> str:
        """Retorna localização completa na minuta"""
        partes = [self.titulo_capitulo]

        if self.secao:
            partes.append(self.secao)

        partes.append(self.artigo)

        if self.paragrafo_inciso_alinea:
            partes.append(self.paragrafo_inciso_alinea)

        return " - ".join(partes)
