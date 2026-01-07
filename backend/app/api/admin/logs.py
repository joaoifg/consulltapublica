"""
Router de logs e auditoria
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from ...core.database import get_db
from ...services import auditoria_service
from ...utils.permissions import obter_admin_atual, require_analista
from ...models.admin import Admin

router = APIRouter(prefix="/admin/logs", tags=["Admin - Logs e Auditoria"])


@router.get("")
async def listar_logs(
    admin_id: Optional[int] = None,
    acao: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 50,
    admin: Admin = Depends(require_analista()),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista logs administrativos com filtros

    Requer: ANALISTA, MODERADOR ou SUPER_ADMIN
    """
    logs, total = await auditoria_service.listar_logs(
        db,
        admin_id=admin_id,
        acao=acao,
        data_inicio=data_inicio,
        data_fim=data_fim,
        page=page,
        per_page=per_page
    )

    return {
        "logs": logs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


@router.get("/acoes")
async def obter_acoes_disponiveis(
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna lista de ações únicas (para filtros)
    """
    acoes = await auditoria_service.obter_acoes_disponiveis(db)
    return {"acoes": acoes}


@router.get("/{log_id}")
async def obter_log(
    log_id: int,
    admin: Admin = Depends(require_analista()),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca log por ID
    """
    log = await auditoria_service.obter_log_por_id(db, log_id)

    if not log:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log não encontrado"
        )

    return log
