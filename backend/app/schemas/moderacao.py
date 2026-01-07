"""
Schemas Pydantic para Moderação
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from ..models.historico_moderacao import AcaoModeracao
from ..models.contribuicao import StatusModeracao


class ModeracaoAprovar(BaseModel):
    """Schema para aprovar contribuição"""
    # Sem campos adicionais, apenas a ação
    pass


class ModeracaoRejeitar(BaseModel):
    """Schema para rejeitar contribuição"""
    motivo: str = Field(..., min_length=10, max_length=1000, description="Motivo da rejeição")

    @validator('motivo')
    def validar_motivo(cls, v):
        v = v.strip()
        if len(v) < 10:
            raise ValueError('Motivo deve ter pelo menos 10 caracteres')
        return v


class ModeracaoEmLote(BaseModel):
    """Schema para moderação em lote"""
    contribuicao_ids: List[int] = Field(..., min_items=1, max_items=100)

    @validator('contribuicao_ids')
    def validar_ids(cls, v):
        if not v:
            raise ValueError('Deve selecionar pelo menos uma contribuição')
        if len(v) > 100:
            raise ValueError('Máximo de 100 contribuições por vez')
        # Remove duplicatas
        return list(set(v))


class ModeracaoRejeitarEmLote(BaseModel):
    """Schema para rejeitar em lote"""
    contribuicao_ids: List[int] = Field(..., min_items=1, max_items=100)
    motivo: str = Field(..., min_length=10, max_length=1000)

    @validator('contribuicao_ids')
    def validar_ids(cls, v):
        if not v:
            raise ValueError('Deve selecionar pelo menos uma contribuição')
        if len(v) > 100:
            raise ValueError('Máximo de 100 contribuições por vez')
        return list(set(v))

    @validator('motivo')
    def validar_motivo(cls, v):
        v = v.strip()
        if len(v) < 10:
            raise ValueError('Motivo deve ter pelo menos 10 caracteres')
        return v


class HistoricoModeracaoResponse(BaseModel):
    """Schema de resposta de histórico de moderação"""
    id: int
    contribuicao_id: int
    admin_id: int
    acao: AcaoModeracao
    motivo: Optional[str] = None
    criado_em: datetime

    class Config:
        from_attributes = True


class HistoricoModeracaoComAdminResponse(HistoricoModeracaoResponse):
    """Schema de resposta com dados do admin"""
    from .admin import AdminResponse
    admin: Optional[AdminResponse] = None

    class Config:
        from_attributes = True


class FiltrosModeracaoPendentes(BaseModel):
    """Schema para filtros de listagem de pendentes"""
    documento: Optional[str] = None  # "CEO" ou "CPEO"
    tipo: Optional[str] = None  # "ALTERACAO", "INCLUSAO", etc.
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class EstatisticasModeracaoResponse(BaseModel):
    """Schema de resposta de estatísticas de moderação"""
    total_pendentes: int
    total_aprovadas: int
    total_rejeitadas: int
    total_hoje: int
    total_ultima_semana: int
    taxa_aprovacao: float  # Percentual
