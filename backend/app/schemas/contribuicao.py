"""
Schemas Pydantic para Contribuição
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from ..models.contribuicao import TipoContribuicao, DocumentoConsulta, StatusModeracao
from ..core.config import settings


class ContribuicaoCreate(BaseModel):
    """Schema para criação de Contribuição"""

    # Documento e localização
    documento: DocumentoConsulta
    titulo_capitulo: str = Field(..., min_length=3, max_length=500)
    secao: Optional[str] = Field(None, max_length=500)
    artigo: str = Field(..., min_length=1, max_length=100)
    paragrafo_inciso_alinea: Optional[str] = Field(None, max_length=200)

    # Tipo e conteúdo
    tipo: TipoContribuicao
    texto_proposto: str = Field(..., min_length=10, max_length=settings.MAX_CHARS_TEXTO_PROPOSTO)
    fundamentacao: str = Field(..., min_length=10, max_length=settings.MAX_CHARS_FUNDAMENTACAO)

    @validator('titulo_capitulo', 'secao', 'artigo', 'paragrafo_inciso_alinea', 'texto_proposto', 'fundamentacao')
    def strip_whitespace(cls, v):
        if v:
            return v.strip()
        return v

    @validator('texto_proposto')
    def validar_texto_proposto(cls, v, values):
        if not v or len(v.strip()) < 10:
            raise ValueError('Texto proposto deve ter pelo menos 10 caracteres')
        return v

    @validator('fundamentacao')
    def validar_fundamentacao(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Fundamentação deve ter pelo menos 10 caracteres')
        return v


class ContribuicaoResponse(BaseModel):
    """Schema para resposta de Contribuição (completa, para o participante)"""

    id: int
    documento: str
    titulo_capitulo: str
    secao: Optional[str]
    artigo: str
    paragrafo_inciso_alinea: Optional[str]
    tipo: str
    texto_proposto: str
    fundamentacao: str
    status_moderacao: StatusModeracao  # NOVO: status de moderação
    criado_em: datetime

    class Config:
        from_attributes = True


class ContribuicaoPublicaResponse(BaseModel):
    """Schema para exibição pública de Contribuição (apenas APROVADAS)"""

    id: int
    documento: str
    localizacao: str  # Localização completa na minuta
    tipo: str
    texto_proposto: str
    fundamentacao: str
    nome_participante: str  # Nome público (sem CPF/CNPJ)
    uf: str
    criado_em: datetime

    class Config:
        from_attributes = True


class ParticipanteDescriptografadoResponse(BaseModel):
    """Schema de participante com dados descriptografados (apenas para admins)"""
    id: int
    tipo: str
    nome_completo: Optional[str] = None
    razao_social: Optional[str] = None
    cpf: Optional[str] = None  # Descriptografado
    cnpj: Optional[str] = None  # Descriptografado
    email: str  # Descriptografado
    uf: str
    criado_em: datetime

    class Config:
        from_attributes = True


class ContribuicaoAdminResponse(BaseModel):
    """Schema de contribuição para administradores (inclui dados completos)"""
    id: int
    participante_id: int
    documento: str
    titulo_capitulo: str
    secao: Optional[str]
    artigo: str
    paragrafo_inciso_alinea: Optional[str]
    tipo: str
    texto_proposto: str
    fundamentacao: str
    status_moderacao: StatusModeracao
    moderado_por_id: Optional[int] = None
    moderado_em: Optional[datetime] = None
    motivo_rejeicao: Optional[str] = None
    criado_em: datetime
    ip_origem: Optional[str] = None
    user_agent: Optional[str] = None

    # Dados do participante (descriptografados)
    participante: Optional[ParticipanteDescriptografadoResponse] = None

    class Config:
        from_attributes = True


class ContribuicaoComModeracaoResponse(ContribuicaoAdminResponse):
    """Schema de contribuição com informações do moderador"""
    from .admin import AdminResponse
    moderado_por: Optional[AdminResponse] = None

    class Config:
        from_attributes = True
