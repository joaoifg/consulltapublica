"""
Service para dashboard administrativo e estatísticas
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import List, Dict, Any
from datetime import datetime, timedelta
from collections import defaultdict

from ..models.contribuicao import Contribuicao, StatusModeracao, TipoContribuicao, DocumentoConsulta
from ..models.participante import Participante, TipoParticipante
from ..models.protocolo import Protocolo


async def obter_estatisticas_gerais(db: AsyncSession) -> Dict[str, Any]:
    """
    Retorna estatísticas gerais do sistema

    Args:
        db: Sessão do banco

    Returns:
        Dict com estatísticas completas
    """
    stats = {}

    # === CONTRIBUIÇÕES ===

    # Total de contribuições
    result_total = await db.execute(
        select(func.count(Contribuicao.id))
    )
    stats["total_contribuicoes"] = result_total.scalar() or 0

    # Por status de moderação
    for status in StatusModeracao:
        result = await db.execute(
            select(func.count(Contribuicao.id)).where(
                Contribuicao.status_moderacao == status
            )
        )
        stats[f"contribuicoes_{status.value.lower()}"] = result.scalar() or 0

    # Por tipo de contribuição
    stats["por_tipo"] = {}
    for tipo in TipoContribuicao:
        result = await db.execute(
            select(func.count(Contribuicao.id)).where(
                and_(
                    Contribuicao.tipo == tipo,
                    Contribuicao.status_moderacao == StatusModeracao.APROVADA
                )
            )
        )
        stats["por_tipo"][tipo.value] = result.scalar() or 0

    # Por documento
    stats["por_documento"] = {}
    for doc in DocumentoConsulta:
        result = await db.execute(
            select(func.count(Contribuicao.id)).where(
                and_(
                    Contribuicao.documento == doc,
                    Contribuicao.status_moderacao == StatusModeracao.APROVADA
                )
            )
        )
        stats["por_documento"][doc.value] = result.scalar() or 0

    # === PARTICIPANTES ===

    # Total de participantes
    result_participantes = await db.execute(
        select(func.count(Participante.id))
    )
    stats["total_participantes"] = result_participantes.scalar() or 0

    # Participantes por tipo
    stats["participantes_pf"] = 0
    stats["participantes_pj"] = 0

    for tipo in TipoParticipante:
        result = await db.execute(
            select(func.count(Participante.id)).where(
                Participante.tipo == tipo
            )
        )
        if tipo == TipoParticipante.PESSOA_FISICA:
            stats["participantes_pf"] = result.scalar() or 0
        else:
            stats["participantes_pj"] = result.scalar() or 0

    # === PROTOCOLOS ===

    # Total de protocolos
    result_protocolos = await db.execute(
        select(func.count(Protocolo.id))
    )
    stats["total_protocolos"] = result_protocolos.scalar() or 0

    # === TEMPO REAL (últimas 24h) ===

    ontem = datetime.utcnow() - timedelta(days=1)

    result_24h = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.criado_em >= ontem
        )
    )
    stats["contribuicoes_24h"] = result_24h.scalar() or 0

    # Taxa de crescimento (últimas 24h vs anterior)
    anteontem = datetime.utcnow() - timedelta(days=2)
    result_anterior = await db.execute(
        select(func.count(Contribuicao.id)).where(
            and_(
                Contribuicao.criado_em >= anteontem,
                Contribuicao.criado_em < ontem
            )
        )
    )
    contrib_anterior = result_anterior.scalar() or 0

    if contrib_anterior > 0:
        taxa = ((stats["contribuicoes_24h"] - contrib_anterior) / contrib_anterior) * 100
        stats["taxa_crescimento_24h"] = round(taxa, 2)
    else:
        stats["taxa_crescimento_24h"] = 0

    return stats


async def obter_contribuicoes_por_uf(
    db: AsyncSession,
    limit: int = 27
) -> List[Dict[str, Any]]:
    """
    Retorna contribuições agrupadas por UF (top N)

    Args:
        db: Sessão do banco
        limit: Quantidade de UFs a retornar

    Returns:
        Lista de dicts com {uf, total}
    """
    result = await db.execute(
        select(
            Participante.uf,
            func.count(Contribuicao.id).label("total")
        )
        .join(Contribuicao, Contribuicao.participante_id == Participante.id)
        .where(Contribuicao.status_moderacao == StatusModeracao.APROVADA)
        .group_by(Participante.uf)
        .order_by(desc("total"))
        .limit(limit)
    )

    return [{"uf": row.uf, "total": row.total} for row in result.all()]


async def obter_contribuicoes_por_periodo(
    db: AsyncSession,
    dias: int = 30
) -> List[Dict[str, Any]]:
    """
    Retorna contribuições agrupadas por dia (últimos N dias)

    Args:
        db: Sessão do banco
        dias: Quantidade de dias

    Returns:
        Lista de dicts com {data, total}
    """
    data_inicio = datetime.utcnow() - timedelta(days=dias)

    result = await db.execute(
        select(
            func.date(Contribuicao.criado_em).label("data"),
            func.count(Contribuicao.id).label("total")
        )
        .where(Contribuicao.criado_em >= data_inicio)
        .group_by(func.date(Contribuicao.criado_em))
        .order_by("data")
    )

    # Converte para dict
    dados = {}
    for row in result.all():
        data_str = row.data.strftime("%Y-%m-%d") if row.data else ""
        dados[data_str] = row.total

    # Preenche dias sem contribuição com 0
    resultado = []
    for i in range(dias):
        data = (datetime.utcnow() - timedelta(days=dias - i - 1)).date()
        data_str = data.strftime("%Y-%m-%d")
        resultado.append({
            "data": data_str,
            "total": dados.get(data_str, 0)
        })

    return resultado


async def obter_contribuicoes_recentes(
    db: AsyncSession,
    limit: int = 10
) -> List[Contribuicao]:
    """
    Retorna as contribuições mais recentes

    Args:
        db: Sessão do banco
        limit: Quantidade de contribuições

    Returns:
        Lista de contribuições
    """
    result = await db.execute(
        select(Contribuicao)
        .order_by(Contribuicao.criado_em.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def obter_metricas_tempo_real(db: AsyncSession) -> Dict[str, Any]:
    """
    Retorna métricas em tempo real para dashboard

    Args:
        db: Sessão do banco

    Returns:
        Dict com métricas
    """
    agora = datetime.utcnow()
    hoje_inicio = agora.replace(hour=0, minute=0, second=0, microsecond=0)
    semana_atras = agora - timedelta(days=7)
    mes_atras = agora - timedelta(days=30)

    metrics = {}

    # Contribuições pendentes (requer ação)
    result_pendentes = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.status_moderacao == StatusModeracao.PENDENTE
        )
    )
    metrics["pendentes_moderacao"] = result_pendentes.scalar() or 0

    # Contribuições hoje
    result_hoje = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.criado_em >= hoje_inicio
        )
    )
    metrics["contribuicoes_hoje"] = result_hoje.scalar() or 0

    # Contribuições esta semana
    result_semana = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.criado_em >= semana_atras
        )
    )
    metrics["contribuicoes_semana"] = result_semana.scalar() or 0

    # Contribuições este mês
    result_mes = await db.execute(
        select(func.count(Contribuicao.id)).where(
            Contribuicao.criado_em >= mes_atras
        )
    )
    metrics["contribuicoes_mes"] = result_mes.scalar() or 0

    # Participantes únicos este mês
    result_participantes = await db.execute(
        select(func.count(func.distinct(Contribuicao.participante_id))).where(
            Contribuicao.criado_em >= mes_atras
        )
    )
    metrics["participantes_mes"] = result_participantes.scalar() or 0

    # Protocolos gerados esta semana
    result_protocolos = await db.execute(
        select(func.count(Protocolo.id)).where(
            Protocolo.criado_em_utc >= semana_atras
        )
    )
    metrics["protocolos_semana"] = result_protocolos.scalar() or 0

    return metrics


async def obter_ranking_participantes(
    db: AsyncSession,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Retorna ranking de participantes mais ativos

    Args:
        db: Sessão do banco
        limit: Quantidade de participantes

    Returns:
        Lista com ranking
    """
    result = await db.execute(
        select(
            Participante.id,
            Participante.tipo,
            Participante.uf,
            func.count(Contribuicao.id).label("total_contribuicoes")
        )
        .join(Contribuicao, Contribuicao.participante_id == Participante.id)
        .where(Contribuicao.status_moderacao == StatusModeracao.APROVADA)
        .group_by(Participante.id, Participante.tipo, Participante.uf)
        .order_by(desc("total_contribuicoes"))
        .limit(limit)
    )

    return [
        {
            "participante_id": row.id,
            "tipo": row.tipo.value,
            "uf": row.uf,
            "total_contribuicoes": row.total_contribuicoes
        }
        for row in result.all()
    ]
