"""
Router de gerenciamento de consultas públicas
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from ...core.database import get_db
from ...schemas.consulta import ConsultaCreate, ConsultaUpdate, ConsultaResponse
from ...services import consulta_service, auditoria_service
from ...services.auditoria_service import AcoesLog
from ...utils.permissions import obter_admin_atual, require_super_admin
from ...models.admin import Admin
from ...models.consulta import StatusConsulta

router = APIRouter(prefix="/admin/consultas", tags=["Admin - Consultas Públicas"])


@router.post("", response_model=ConsultaResponse, status_code=status.HTTP_201_CREATED)
async def criar_consulta(
    data: ConsultaCreate,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria nova consulta pública

    Requer: SUPER_ADMIN
    """
    consulta = await consulta_service.criar_consulta(db, data, admin.id)
    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.CRIAR_CONSULTA,
        recurso=f"Consulta #{consulta.id}",
        detalhes={"titulo": consulta.titulo},
        request=request
    )
    await db.commit()

    return consulta


@router.get("", response_model=List[ConsultaResponse])
async def listar_consultas(
    status: Optional[StatusConsulta] = None,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas as consultas públicas
    """
    consultas = await consulta_service.listar_consultas(db, status=status)
    return consultas


@router.get("/ativa", response_model=Optional[ConsultaResponse])
async def obter_consulta_ativa(
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna consulta atualmente ativa (se houver)
    """
    consulta = await consulta_service.obter_consulta_ativa(db)
    return consulta


@router.get("/{consulta_id}", response_model=ConsultaResponse)
async def obter_consulta(
    consulta_id: int,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca consulta por ID
    """
    consulta = await consulta_service.obter_consulta_por_id(db, consulta_id)

    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada"
        )

    return consulta


@router.patch("/{consulta_id}", response_model=ConsultaResponse)
async def atualizar_consulta(
    consulta_id: int,
    data: ConsultaUpdate,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza consulta pública

    Requer: SUPER_ADMIN
    """
    consulta = await consulta_service.atualizar_consulta(db, consulta_id, data)

    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada"
        )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.ATUALIZAR_CONSULTA,
        recurso=f"Consulta #{consulta_id}",
        detalhes=data.dict(exclude_unset=True),
        request=request
    )
    await db.commit()

    return consulta


@router.post("/{consulta_id}/encerrar", response_model=ConsultaResponse)
async def encerrar_consulta(
    consulta_id: int,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Encerra consulta pública

    Requer: SUPER_ADMIN
    """
    consulta = await consulta_service.encerrar_consulta(db, consulta_id)

    if not consulta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consulta não encontrada"
        )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.ENCERRAR_CONSULTA,
        recurso=f"Consulta #{consulta_id}",
        request=request
    )
    await db.commit()

    return consulta
