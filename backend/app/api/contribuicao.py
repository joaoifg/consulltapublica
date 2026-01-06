"""
Endpoints de Contribuição
"""
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from ..core.database import get_db
from ..schemas.contribuicao import ContribuicaoCreate, ContribuicaoResponse
from ..services import contribuicao_service, participante_service
from ..utils.security import verificar_token_sessao
from ..models.contribuicao import DocumentoConsulta

router = APIRouter(prefix="/contribuicoes", tags=["Contribuições"])


async def obter_participante_da_sessao(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> int:
    """
    Dependency para obter participante do token

    Args:
        authorization: Header Authorization com Bearer token

    Returns:
        ID do participante

    Raises:
        HTTPException 401: Token inválido ou ausente
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    token = authorization.replace("Bearer ", "")
    payload = verificar_token_sessao(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão expirada ou inválida"
        )

    participante_id = payload.get("participante_id")
    if not participante_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    # Verifica se participante existe
    participante = await participante_service.buscar_participante_por_id(db, participante_id)
    if not participante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante não encontrado"
        )

    return participante_id


@router.post("", response_model=ContribuicaoResponse, status_code=status.HTTP_201_CREATED)
async def criar_contribuicao(
    data: ContribuicaoCreate,
    request: Request,
    participante_id: int = Depends(obter_participante_da_sessao),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria uma contribuição

    **Requer autenticação**: Bearer token obtido na identificação

    **Validações**:
    - Todos os campos obrigatórios preenchidos
    - Texto proposto: 10-5000 caracteres
    - Fundamentação: 10-5000 caracteres
    - Documento válido (CEO ou CPEO)
    """
    # Obtém IP e User-Agent
    ip_origem = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    # Cria contribuição
    contribuicao = await contribuicao_service.criar_contribuicao(
        db, participante_id, data, ip_origem, user_agent
    )

    return contribuicao


@router.get("/minhas", response_model=List[ContribuicaoResponse])
async def listar_minhas_contribuicoes(
    documento: Optional[DocumentoConsulta] = None,
    participante_id: int = Depends(obter_participante_da_sessao),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista contribuições do participante autenticado

    **Requer autenticação**: Bearer token

    **Filtros**:
    - documento: CEO ou CPEO (opcional)
    """
    contribuicoes = await contribuicao_service.listar_contribuicoes_participante(
        db, participante_id, documento
    )

    return contribuicoes


@router.delete("/{contribuicao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_contribuicao(
    contribuicao_id: int,
    participante_id: int = Depends(obter_participante_da_sessao),
    db: AsyncSession = Depends(get_db)
):
    """
    Exclui uma contribuição (antes de finalizar)

    **Requer autenticação**: Bearer token

    **Regras**:
    - Só pode excluir contribuições próprias
    - Só pode excluir antes de finalizar (gerar protocolo)
    """
    # TODO: Implementar lógica de exclusão
    # Verificar se contribuição pertence ao participante
    # Verificar se não foi finalizada (não tem protocolo)
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Funcionalidade em desenvolvimento"
    )
