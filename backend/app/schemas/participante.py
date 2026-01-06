"""
Schemas Pydantic para Participante
"""
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional
from datetime import datetime
from ..utils.validators import validar_cpf, validar_cnpj, validar_uf, limpar_cpf, limpar_cnpj
from ..models.participante import CategoriaParticipantePF, NaturezaEntidadePJ


class ParticipantePFCreate(BaseModel):
    """Schema para criação de Participante Pessoa Física"""

    nome_completo: str = Field(..., min_length=3, max_length=255)
    cpf: str = Field(..., min_length=11, max_length=14)
    email: EmailStr
    uf: str = Field(..., min_length=2, max_length=2)
    categoria: Optional[CategoriaParticipantePF] = None
    consentimento_lgpd: bool = Field(..., description="Deve ser True")

    @validator('cpf')
    def validar_cpf_field(cls, v):
        cpf_limpo = limpar_cpf(v)
        if not validar_cpf(cpf_limpo):
            raise ValueError('CPF inválido')
        return cpf_limpo

    @validator('uf')
    def validar_uf_field(cls, v):
        v = v.upper()
        if not validar_uf(v):
            raise ValueError('UF inválida')
        return v

    @validator('consentimento_lgpd')
    def validar_consentimento(cls, v):
        if not v:
            raise ValueError('É necessário consentir com os termos LGPD')
        return v

    @validator('nome_completo')
    def validar_nome(cls, v):
        v = v.strip()
        if len(v.split()) < 2:
            raise ValueError('Nome completo deve ter pelo menos nome e sobrenome')
        return v


class ParticipantePJCreate(BaseModel):
    """Schema para criação de Participante Pessoa Jurídica"""

    razao_social: str = Field(..., min_length=3, max_length=255)
    cnpj: str = Field(..., min_length=14, max_length=18)
    natureza_entidade: NaturezaEntidadePJ
    nome_responsavel_legal: str = Field(..., min_length=3, max_length=255)
    cpf_responsavel: str = Field(..., min_length=11, max_length=14)
    email: EmailStr
    uf: str = Field(..., min_length=2, max_length=2)
    consentimento_lgpd: bool = Field(..., description="Deve ser True")

    @validator('cnpj')
    def validar_cnpj_field(cls, v):
        cnpj_limpo = limpar_cnpj(v)
        if not validar_cnpj(cnpj_limpo):
            raise ValueError('CNPJ inválido')
        return cnpj_limpo

    @validator('cpf_responsavel')
    def validar_cpf_responsavel_field(cls, v):
        cpf_limpo = limpar_cpf(v)
        if not validar_cpf(cpf_limpo):
            raise ValueError('CPF do responsável legal inválido')
        return cpf_limpo

    @validator('uf')
    def validar_uf_field(cls, v):
        v = v.upper()
        if not validar_uf(v):
            raise ValueError('UF inválida')
        return v

    @validator('consentimento_lgpd')
    def validar_consentimento(cls, v):
        if not v:
            raise ValueError('É necessário consentir com os termos LGPD')
        return v


class ParticipanteResponse(BaseModel):
    """Schema para resposta de Participante (sem dados sensíveis)"""

    id: int
    tipo: str
    nome_publico: str
    uf: str
    criado_em: datetime

    class Config:
        from_attributes = True
