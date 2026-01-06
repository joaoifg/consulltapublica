"""
Modelo de Participante (Pessoa Física ou Jurídica)
"""
from sqlalchemy import Column, Integer, String, Enum, DateTime, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..core.database import Base


class TipoParticipante(str, enum.Enum):
    """Tipo de participante"""
    PESSOA_FISICA = "PESSOA_FISICA"
    PESSOA_JURIDICA = "PESSOA_JURIDICA"


class CategoriaParticipantePF(str, enum.Enum):
    """Categoria de participante Pessoa Física"""
    CIRURGIAO_DENTISTA = "CIRURGIAO_DENTISTA"
    AUXILIAR_TECNICO = "AUXILIAR_TECNICO"
    ESTUDANTE = "ESTUDANTE"
    PESQUISADOR = "PESQUISADOR"
    CIDADAO = "CIDADAO"
    OUTRO = "OUTRO"


class NaturezaEntidadePJ(str, enum.Enum):
    """Natureza da entidade Pessoa Jurídica"""
    CONSELHO_REGIONAL = "CONSELHO_REGIONAL"
    ASSOCIACAO_CLASSE = "ASSOCIACAO_CLASSE"
    SINDICATO = "SINDICATO"
    INSTITUICAO_ENSINO = "INSTITUICAO_ENSINO"
    CENTRO_PESQUISA = "CENTRO_PESQUISA"
    EMPRESA_PRIVADA = "EMPRESA_PRIVADA"
    ORGAO_PUBLICO = "ORGAO_PUBLICO"
    ONG = "ONG"
    OUTRO = "OUTRO"


class Participante(Base):
    """
    Tabela de participantes da consulta pública

    Armazena dados de identificação (PF ou PJ) com proteção LGPD:
    - Dados sensíveis criptografados (email, CPF, CNPJ)
    - Hash de CPF/CNPJ para busca sem exposição
    - Auditoria completa (IP, User-Agent, timestamps)
    """
    __tablename__ = "participantes"

    # Identificação
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo = Column(Enum(TipoParticipante), nullable=False, index=True)

    # Pessoa Física
    nome_completo = Column(String(255), nullable=True)  # PF
    cpf_hash = Column(String(64), nullable=True, index=True)  # Hash SHA-256 para busca
    cpf_criptografado = Column(Text, nullable=True)  # CPF criptografado (AES-256)
    categoria_pf = Column(Enum(CategoriaParticipantePF), nullable=True)

    # Pessoa Jurídica
    razao_social = Column(String(255), nullable=True)  # PJ
    cnpj_hash = Column(String(64), nullable=True, index=True)  # Hash SHA-256
    cnpj_criptografado = Column(Text, nullable=True)  # CNPJ criptografado
    natureza_entidade = Column(Enum(NaturezaEntidadePJ), nullable=True)
    nome_responsavel_legal = Column(String(255), nullable=True)
    cpf_responsavel_hash = Column(String(64), nullable=True)
    cpf_responsavel_criptografado = Column(Text, nullable=True)

    # Contato (comum)
    email_criptografado = Column(Text, nullable=False)  # E-mail criptografado
    uf = Column(String(2), nullable=False, index=True)

    # LGPD
    consentimento_lgpd = Column(DateTime, nullable=False)  # Timestamp do consentimento
    ip_origem = Column(String(45), nullable=True)  # IPv4 ou IPv6
    user_agent = Column(Text, nullable=True)

    # Auditoria
    criado_em = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    contribuicoes = relationship("Contribuicao", back_populates="participante")
    protocolos = relationship("Protocolo", back_populates="participante")

    # Índices compostos para performance
    __table_args__ = (
        Index('idx_participante_tipo_criado', 'tipo', 'criado_em'),
        Index('idx_participante_uf_tipo', 'uf', 'tipo'),
    )

    def __repr__(self):
        if self.tipo == TipoParticipante.PESSOA_FISICA:
            return f"<Participante PF: {self.nome_completo}>"
        else:
            return f"<Participante PJ: {self.razao_social}>"

    @property
    def nome_publico(self) -> str:
        """Nome para exibição pública (sem dados sensíveis)"""
        if self.tipo == TipoParticipante.PESSOA_FISICA:
            return self.nome_completo or "Participante"
        else:
            return self.razao_social or "Entidade"
