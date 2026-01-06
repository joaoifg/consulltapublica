"""
Schemas Pydantic para Protocolo
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .contribuicao import ContribuicaoResponse


class ProtocoloResponse(BaseModel):
    """Schema para resposta de Protocolo"""

    numero_protocolo: str
    documento: str
    total_contribuicoes: int
    criado_em: datetime
    email_enviado: Optional[datetime]

    class Config:
        from_attributes = True


class ProtocoloCompletoResponse(BaseModel):
    """Schema para resposta completa de Protocolo (com contribuições)"""

    numero_protocolo: str
    documento: str
    total_contribuicoes: int
    criado_em: datetime
    participante: dict  # Nome público, UF
    contribuicoes: List[ContribuicaoResponse]

    class Config:
        from_attributes = True
