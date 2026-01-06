"""
Schemas Pydantic para Contribuição
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from ..models.contribuicao import TipoContribuicao, DocumentoConsulta
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
    criado_em: datetime

    class Config:
        from_attributes = True


class ContribuicaoPublicaResponse(BaseModel):
    """Schema para exibição pública de Contribuição"""

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
