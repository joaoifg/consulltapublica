"""
Service para moderação de contribuições
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, or_
from typing import List, Optional, Tuple
from datetime import datetime, timedelta

from ..models.contribuicao import Contribuicao, StatusModeracao, DocumentoConsulta, TipoContribuicao
from ..models.historico_moderacao import HistoricoModeracao, AcaoModeracao
from ..models.participante import Participante
from ..utils.security import descriptografar_dados


async def aprovar_contribuicao(
    db: AsyncSession,
    contribuicao_id: int,
    admin_id: int
) -> Optional[Contribuicao]:
    """
    Aprova uma contribuição

    Args:
        db: Sessão do banco
        contribuicao_id: ID da contribuição
        admin_id: ID do admin que está aprovando

    Returns:
        Contribuicao aprovada ou None se não encontrada/já moderada
    """
    contribuicao = await db.get(Contribuicao, contribuicao_id)

    if not contribuicao:
        return None

    # Só pode aprovar se estiver PENDENTE
    if contribuicao.status_moderacao != StatusModeracao.PENDENTE:
        return None

    # Atualiza status
    contribuicao.status_moderacao = StatusModeracao.APROVADA
    contribuicao.moderado_por_id = admin_id
    contribuicao.moderado_em = datetime.utcnow()
    contribuicao.motivo_rejeicao = None

    # Cria registro de histórico
    historico = HistoricoModeracao(
        contribuicao_id=contribuicao_id,
        admin_id=admin_id,
        acao=AcaoModeracao.APROVAR
    )
    db.add(historico)

    await db.flush()
    await db.refresh(contribuicao)

    return contribuicao


async def rejeitar_contribuicao(
    db: AsyncSession,
    contribuicao_id: int,
    admin_id: int,
    motivo: str
) -> Optional[Contribuicao]:
    """
    Rejeita uma contribuição

    Args:
        db: Sessão do banco
        contribuicao_id: ID da contribuição
        admin_id: ID do admin que está rejeitando
        motivo: Motivo da rejeição (obrigatório)

    Returns:
        Contribuicao rejeitada ou None se não encontrada/já moderada
    """
    contribuicao = await db.get(Contribuicao, contribuicao_id)

    if not contribuicao:
        return None

    # Só pode rejeitar se estiver PENDENTE
    if contribuicao.status_moderacao != StatusModeracao.PENDENTE:
        return None

    # Atualiza status
    contribuicao.status_moderacao = StatusModeracao.REJEITADA
    contribuicao.moderado_por_id = admin_id
    contribuicao.moderado_em = datetime.utcnow()
    contribuicao.motivo_rejeicao = motivo

    # Cria registro de histórico
    historico = HistoricoModeracao(
        contribuicao_id=contribuicao_id,
        admin_id=admin_id,
        acao=AcaoModeracao.REJEITAR,
        motivo=motivo
    )
    db.add(historico)

    await db.flush()
    await db.refresh(contribuicao)

    return contribuicao


async def aprovar_em_lote(
    db: AsyncSession,
    contribuicao_ids: List[int],
    admin_id: int
) -> int:
    """
    Aprova múltiplas contribuições

    Args:
        db: Sessão do banco
        contribuicao_ids: Lista de IDs
        admin_id: ID do admin

    Returns:
        Quantidade de contribuições aprovadas
    """
    count = 0
    for contrib_id in contribuicao_ids:
        result = await aprovar_contribuicao(db, contrib_id, admin_id)
        if result:
            count += 1

    return count


async def rejeitar_em_lote(
    db: AsyncSession,
    contribuicao_ids: List[int],
    admin_id: int,
    motivo: str
) -> int:
    """
    Rejeita múltiplas contribuições

    Args:
        db: Sessão do banco
        contribuicao_ids: Lista de IDs
        admin_id: ID do admin
        motivo: Motivo da rejeição

    Returns:
        Quantidade de contribuições rejeitadas
    """
    count = 0
    for contrib_id in contribuicao_ids:
        result = await rejeitar_contribuicao(db, contrib_id, admin_id, motivo)
        if result:
            count += 1

    return count


async def listar_contribuicoes_pendentes(
    db: AsyncSession,
    documento: Optional[DocumentoConsulta] = None,
    tipo: Optional[TipoContribuicao] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 20
) -> Tuple[List[Contribuicao], int]:
    """
    Lista contribuições pendentes de moderação com filtros

    Args:
        db: Sessão do banco
        documento: Filtrar por documento (CEO/CPEO)
        tipo: Filtrar por tipo de contribuição
        data_inicio: Filtrar por data de criação (início)
        data_fim: Filtrar por data de criação (fim)
        page: Página (1-indexed)
        per_page: Itens por página

    Returns:
        Tupla (lista de contribuições, total de registros)
    """
    # Query base
    query = select(Contribuicao).where(
        Contribuicao.status_moderacao == StatusModeracao.PENDENTE
    )

    # Aplicar filtros
    if documento:
        query = query.where(Contribuicao.documento == documento)

    if tipo:
        query = query.where(Contribuicao.tipo == tipo)

    if data_inicio:
        query = query.where(Contribuicao.criado_em >= data_inicio)

    if data_fim:
        query = query.where(Contribuicao.criado_em <= data_fim)

    # Conta total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Aplica paginação
    offset = (page - 1) * per_page
    query = query.order_by(Contribuicao.criado_em.asc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    contribuicoes = list(result.scalars().all())

    return contribuicoes, total


async def listar_contribuicoes_com_filtros(
    db: AsyncSession,
    status: Optional[StatusModeracao] = None,
    documento: Optional[DocumentoConsulta] = None,
    tipo: Optional[TipoContribuicao] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 20
) -> Tuple[List[Contribuicao], int]:
    """
    Lista todas as contribuições com filtros (não só pendentes)

    Args:
        db: Sessão do banco
        status: Filtrar por status de moderação
        documento: Filtrar por documento
        tipo: Filtrar por tipo
        data_inicio: Filtrar por data
        data_fim: Filtrar por data
        page: Página
        per_page: Itens por página

    Returns:
        Tupla (lista de contribuições, total)
    """
    query = select(Contribuicao)

    # Aplicar filtros
    if status:
        query = query.where(Contribuicao.status_moderacao == status)

    if documento:
        query = query.where(Contribuicao.documento == documento)

    if tipo:
        query = query.where(Contribuicao.tipo == tipo)

    if data_inicio:
        query = query.where(Contribuicao.criado_em >= data_inicio)

    if data_fim:
        query = query.where(Contribuicao.criado_em <= data_fim)

    # Conta total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Aplica paginação
    offset = (page - 1) * per_page
    query = query.order_by(Contribuicao.criado_em.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    contribuicoes = list(result.scalars().all())

    return contribuicoes, total


async def obter_historico_moderacao(
    db: AsyncSession,
    contribuicao_id: int
) -> List[HistoricoModeracao]:
    """
    Obtém histórico de moderação de uma contribuição

    Args:
        db: Sessão do banco
        contribuicao_id: ID da contribuição

    Returns:
        Lista de registros de histórico
    """
    result = await db.execute(
        select(HistoricoModeracao)
        .where(HistoricoModeracao.contribuicao_id == contribuicao_id)
        .order_by(HistoricoModeracao.criado_em.desc())
    )
    return list(result.scalars().all())


async def obter_estatisticas_moderacao(db: AsyncSession) -> dict:
    """
    Retorna estatísticas de moderação

    Returns:
        Dict com estatísticas
    """
    # Total por status
    result_pendentes = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.status_moderacao == StatusModeracao.PENDENTE
        )
    )
    total_pendentes = result_pendentes.scalar() or 0

    result_aprovadas = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.status_moderacao == StatusModeracao.APROVADA
        )
    )
    total_aprovadas = result_aprovadas.scalar() or 0

    result_rejeitadas = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.status_moderacao == StatusModeracao.REJEITADA
        )
    )
    total_rejeitadas = result_rejeitadas.scalar() or 0

    # Contribuições moderadas hoje
    hoje_inicio = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result_hoje = await db.execute(
        select(func.count(Contribuicao.id)).where(
            and_(
                Contribuicao.moderado_em >= hoje_inicio,
                Contribuicao.status_moderacao != StatusModeracao.PENDENTE
            )
        )
    )
    total_hoje = result_hoje.scalar() or 0

    # Contribuições moderadas na última semana
    semana_atras = datetime.utcnow() - timedelta(days=7)
    result_semana = await db.execute(
        select(func.count(Contribuicao.id)).where(
            and_(
                Contribuicao.moderado_em >= semana_atras,
                Contribuicao.status_moderacao != StatusModeracao.PENDENTE
            )
        )
    )
    total_ultima_semana = result_semana.scalar() or 0

    # Taxa de aprovação
    total_moderadas = total_aprovadas + total_rejeitadas
    taxa_aprovacao = (total_aprovadas / total_moderadas * 100) if total_moderadas > 0 else 0

    return {
        "total_pendentes": total_pendentes,
        "total_aprovadas": total_aprovadas,
        "total_rejeitadas": total_rejeitadas,
        "total_hoje": total_hoje,
        "total_ultima_semana": total_ultima_semana,
        "taxa_aprovacao": round(taxa_aprovacao, 2)
    }
