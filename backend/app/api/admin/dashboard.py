"""
Router de dashboard e estatísticas
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...services import dashboard_service
from ...utils.permissions import obter_admin_atual
from ...models.admin import Admin

router = APIRouter(prefix="/admin/dashboard", tags=["Admin - Dashboard"])


@router.get("/estatisticas")
async def obter_estatisticas(
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna estatísticas gerais do sistema
    """
    stats = await dashboard_service.obter_estatisticas_gerais(db)
    return stats


@router.get("/contribuicoes-por-uf")
async def obter_contribuicoes_por_uf(
    limit: int = 27,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna contribuições agrupadas por UF
    """
    dados = await dashboard_service.obter_contribuicoes_por_uf(db, limit)
    return {"dados": dados}


@router.get("/contribuicoes-por-periodo")
async def obter_contribuicoes_por_periodo(
    dias: int = 30,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna contribuições agrupadas por dia (últimos N dias)
    """
    dados = await dashboard_service.obter_contribuicoes_por_periodo(db, dias)
    return {"dados": dados}


@router.get("/contribuicoes-recentes")
async def obter_contribuicoes_recentes(
    limit: int = 10,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna contribuições mais recentes
    """
    contribuicoes = await dashboard_service.obter_contribuicoes_recentes(db, limit)
    return {"contribuicoes": contribuicoes}


@router.get("/metricas-tempo-real")
async def obter_metricas_tempo_real(
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna métricas em tempo real
    """
    metrics = await dashboard_service.obter_metricas_tempo_real(db)
    return metrics


@router.get("/ranking-participantes")
async def obter_ranking_participantes(
    limit: int = 10,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna ranking de participantes mais ativos
    """
    ranking = await dashboard_service.obter_ranking_participantes(db, limit)
    return {"ranking": ranking}
