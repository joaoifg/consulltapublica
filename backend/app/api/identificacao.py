"""
Endpoints de Identificação
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.database import get_db
from ..schemas.participante import (
    ParticipantePFCreate,
    ParticipantePJCreate,
    ParticipanteResponse
)
from ..services import participante_service
from ..utils.security import gerar_token_sessao
from ..models.participante import TipoParticipante

router = APIRouter(prefix="/identificacao", tags=["Identificação"])


@router.post("/pessoa-fisica", response_model=dict, status_code=status.HTTP_201_CREATED)
async def identificar_pessoa_fisica(
    data: ParticipantePFCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Identifica participante Pessoa Física

    Cria registro de participante e retorna token de sessão

    **LGPD**: Dados sensíveis são criptografados. CPF é hasheado para busca.
    """
    # Obtém IP e User-Agent
    ip_origem = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    # Verifica se CPF já está cadastrado (usando hash)
    participante_existente = await participante_service.buscar_participante_por_cpf(
        db, data.cpf
    )

    if participante_existente:
        # Se já existe, retorna token para o participante existente
        token = gerar_token_sessao(
            participante_existente.id,
            TipoParticipante.PESSOA_FISICA.value
        )

        return {
            "message": "Participante já identificado anteriormente",
            "token": token,
            "participante_id": participante_existente.id,
            "nome": participante_existente.nome_completo
        }

    # Cria novo participante
    participante = await participante_service.criar_participante_pf(
        db, data, ip_origem, user_agent
    )

    # Gera token de sessão
    token = gerar_token_sessao(
        participante.id,
        TipoParticipante.PESSOA_FISICA.value
    )

    return {
        "message": "Identificação realizada com sucesso",
        "token": token,
        "participante_id": participante.id,
        "nome": participante.nome_completo
    }


@router.post("/pessoa-juridica", response_model=dict, status_code=status.HTTP_201_CREATED)
async def identificar_pessoa_juridica(
    data: ParticipantePJCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Identifica participante Pessoa Jurídica

    Cria registro de entidade e retorna token de sessão

    **LGPD**: Dados sensíveis são criptografados. CNPJ é hasheado para busca.
    """
    # Obtém IP e User-Agent
    ip_origem = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    # Verifica se CNPJ já está cadastrado
    participante_existente = await participante_service.buscar_participante_por_cnpj(
        db, data.cnpj
    )

    if participante_existente:
        # Se já existe, retorna token
        token = gerar_token_sessao(
            participante_existente.id,
            TipoParticipante.PESSOA_JURIDICA.value
        )

        return {
            "message": "Entidade já identificada anteriormente",
            "token": token,
            "participante_id": participante_existente.id,
            "razao_social": participante_existente.razao_social
        }

    # Cria novo participante
    participante = await participante_service.criar_participante_pj(
        db, data, ip_origem, user_agent
    )

    # Gera token de sessão
    token = gerar_token_sessao(
        participante.id,
        TipoParticipante.PESSOA_JURIDICA.value
    )

    return {
        "message": "Identificação realizada com sucesso",
        "token": token,
        "participante_id": participante.id,
        "razao_social": participante.razao_social
    }
