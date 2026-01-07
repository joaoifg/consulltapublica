"""
Schemas Pydantic para Consulta Pública
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from ..models.consulta import StatusConsulta
from ..models.contribuicao import DocumentoConsulta
from .admin import AdminResponse


class ConsultaCreate(BaseModel):
    """Schema para criação de consulta pública"""
    titulo: str = Field(..., min_length=5, max_length=500)
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
    status: StatusConsulta = StatusConsulta.RASCUNHO
    documentos_disponiveis: List[DocumentoConsulta] = Field(..., min_items=1)

    @validator('data_fim')
    def validar_datas(cls, v, values):
        """Valida que data_fim é maior que data_inicio"""
        if 'data_inicio' in values and v <= values['data_inicio']:
            raise ValueError('Data de fim deve ser posterior à data de início')
        return v

    @validator('titulo')
    def validar_titulo(cls, v):
        v = v.strip()
        if len(v) < 5:
            raise ValueError('Título deve ter pelo menos 5 caracteres')
        return v

    @validator('documentos_disponiveis')
    def validar_documentos(cls, v):
        if not v:
            raise ValueError('Deve selecionar pelo menos um documento')
        # Remove duplicatas
        return list(set(v))


class ConsultaUpdate(BaseModel):
    """Schema para atualização de consulta pública"""
    titulo: Optional[str] = Field(None, min_length=5, max_length=500)
    descricao: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    status: Optional[StatusConsulta] = None
    documentos_disponiveis: Optional[List[DocumentoConsulta]] = None

    @validator('data_fim')
    def validar_datas(cls, v, values):
        """Valida que data_fim é maior que data_inicio"""
        if v and 'data_inicio' in values and values['data_inicio']:
            if v <= values['data_inicio']:
                raise ValueError('Data de fim deve ser posterior à data de início')
        return v

    @validator('titulo')
    def validar_titulo(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 5:
                raise ValueError('Título deve ter pelo menos 5 caracteres')
        return v

    @validator('documentos_disponiveis')
    def validar_documentos(cls, v):
        if v is not None:
            if not v:
                raise ValueError('Deve selecionar pelo menos um documento')
            return list(set(v))
        return v


class ConsultaResponse(BaseModel):
    """Schema de resposta de consulta pública"""
    id: int
    titulo: str
    descricao: Optional[str] = None
    data_inicio: datetime
    data_fim: datetime
    status: StatusConsulta
    documentos_disponiveis: List[DocumentoConsulta]
    criado_por_admin_id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True


class ConsultaComAdminResponse(ConsultaResponse):
    """Schema de resposta de consulta com dados do admin criador"""
    criado_por: Optional[AdminResponse] = None

    class Config:
        from_attributes = True
