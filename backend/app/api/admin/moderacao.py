"""
Router de moderação de contribuições
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime

from ...core.database import get_db
from ...schemas.moderacao import (
    ModeracaoAprovar,
    ModeracaoRejeitar,
    ModeracaoEmLote,
    ModeracaoRejeitarEmLote,
    FiltrosModeracaoPendentes,
    EstatisticasModeracaoResponse
)
from ...schemas.contribuicao import ContribuicaoAdminResponse
from ...services import moderacao_service, auditoria_service
from ...services.auditoria_service import AcoesLog
from ...utils.permissions import obter_admin_atual, require_moderador
from ...models.admin import Admin
from ...models.contribuicao import DocumentoConsulta, TipoContribuicao

router = APIRouter(prefix="/admin/moderacao", tags=["Admin - Moderação"])


@router.get("/pendentes")
async def listar_pendentes(
    documento: Optional[DocumentoConsulta] = None,
    tipo: Optional[TipoContribuicao] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 20,
    admin: Admin = Depends(require_moderador()),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista contribuições pendentes de moderação

    Requer: MODERADOR ou SUPER_ADMIN
    """
    contribuicoes, total = await moderacao_service.listar_contribuicoes_pendentes(
        db,
        documento=documento,
        tipo=tipo,
        data_inicio=data_inicio,
        data_fim=data_fim,
        page=page,
        per_page=per_page
    )

    # TODO: Transformar em ContribuicaoAdminResponse (descriptografar participante)
    return {
        "contribuicoes": contribuicoes,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


@router.post("/{contribuicao_id}/aprovar")
async def aprovar_contribuicao(
    contribuicao_id: int,
    request: Request,
    admin: Admin = Depends(require_moderador()),
    db: AsyncSession = Depends(get_db)
):
    """
    Aprova uma contribuição

    Requer: MODERADOR ou SUPER_ADMIN
    """
    contribuicao = await moderacao_service.aprovar_contribuicao(
        db,
        contribuicao_id,
        admin.id
    )

    if not contribuicao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuição não encontrada ou já moderada"
        )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.APROVAR_CONTRIBUICAO,
        recurso=f"Contribuição #{contribuicao_id}",
        request=request
    )
    await db.commit()

    return {
        "message": "Contribuição aprovada com sucesso",
        "contribuicao_id": contribuicao_id
    }


@router.post("/{contribuicao_id}/rejeitar")
async def rejeitar_contribuicao(
    contribuicao_id: int,
    data: ModeracaoRejeitar,
    request: Request,
    admin: Admin = Depends(require_moderador()),
    db: AsyncSession = Depends(get_db)
):
    """
    Rejeita uma contribuição

    Requer: MODERADOR ou SUPER_ADMIN
    """
    contribuicao = await moderacao_service.rejeitar_contribuicao(
        db,
        contribuicao_id,
        admin.id,
        data.motivo
    )

    if not contribuicao:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contribuição não encontrada ou já moderada"
        )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.REJEITAR_CONTRIBUICAO,
        recurso=f"Contribuição #{contribuicao_id}",
        detalhes={"motivo": data.motivo},
        request=request
    )
    await db.commit()

    return {
        "message": "Contribuição rejeitada com sucesso",
        "contribuicao_id": contribuicao_id
    }


@router.post("/aprovar-lote")
async def aprovar_em_lote(
    data: ModeracaoEmLote,
    request: Request,
    admin: Admin = Depends(require_moderador()),
    db: AsyncSession = Depends(get_db)
):
    """
    Aprova múltiplas contribuições

    Requer: MODERADOR ou SUPER_ADMIN
    """
    count = await moderacao_service.aprovar_em_lote(
        db,
        data.contribuicao_ids,
        admin.id
    )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.APROVAR_EM_LOTE,
        detalhes={"quantidade": count, "ids": data.contribuicao_ids},
        request=request
    )
    await db.commit()

    return {
        "message": f"{count} contribuições aprovadas com sucesso",
        "total_aprovadas": count
    }


@router.post("/rejeitar-lote")
async def rejeitar_em_lote(
    data: ModeracaoRejeitarEmLote,
    request: Request,
    admin: Admin = Depends(require_moderador()),
    db: AsyncSession = Depends(get_db)
):
    """
    Rejeita múltiplas contribuições

    Requer: MODERADOR ou SUPER_ADMIN
    """
    count = await moderacao_service.rejeitar_em_lote(
        db,
        data.contribuicao_ids,
        admin.id,
        data.motivo
    )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.REJEITAR_EM_LOTE,
        detalhes={"quantidade": count, "ids": data.contribuicao_ids, "motivo": data.motivo},
        request=request
    )
    await db.commit()

    return {
        "message": f"{count} contribuições rejeitadas com sucesso",
        "total_rejeitadas": count
    }


@router.get("/estatisticas", response_model=EstatisticasModeracaoResponse)
async def obter_estatisticas(
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna estatísticas de moderação
    """
    stats = await moderacao_service.obter_estatisticas_moderacao(db)
    return stats


@router.get("/historico/{contribuicao_id}")
async def obter_historico(
    contribuicao_id: int,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna histórico de moderação de uma contribuição
    """
    historico = await moderacao_service.obter_historico_moderacao(db, contribuicao_id)

    return {
        "contribuicao_id": contribuicao_id,
        "historico": historico
    }
