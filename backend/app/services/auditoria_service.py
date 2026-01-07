"""
Service para auditoria e logs administrativos
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional, Tuple
from datetime import datetime
from fastapi import Request

from ..models.admin_log import AdminLog


async def registrar_log(
    db: AsyncSession,
    admin_id: Optional[int],
    acao: str,
    recurso: Optional[str] = None,
    detalhes: Optional[dict] = None,
    request: Optional[Request] = None
) -> AdminLog:
    """
    Registra ação administrativa para auditoria

    Args:
        db: Sessão do banco
        admin_id: ID do admin (None se admin foi deletado)
        acao: Tipo de ação (LOGIN, LOGOUT, APROVAR_CONTRIBUICAO, etc.)
        recurso: Recurso afetado (ex: "Contribuição #123")
        detalhes: Dados adicionais em JSON
        request: Request do FastAPI (para extrair IP e user-agent)

    Returns:
        AdminLog criado
    """
    ip_origem = None
    user_agent = None

    if request:
        # Extrai IP (considera proxies)
        ip_origem = request.client.host if request.client else None

        # Considera X-Forwarded-For se disponível
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            ip_origem = forwarded.split(",")[0].strip()

        # Extrai User-Agent
        user_agent = request.headers.get("User-Agent")

    log = AdminLog(
        admin_id=admin_id,
        acao=acao,
        recurso=recurso,
        detalhes=detalhes,
        ip_origem=ip_origem,
        user_agent=user_agent
    )

    db.add(log)
    await db.flush()

    return log


async def listar_logs(
    db: AsyncSession,
    admin_id: Optional[int] = None,
    acao: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
    page: int = 1,
    per_page: int = 50
) -> Tuple[List[AdminLog], int]:
    """
    Lista logs administrativos com filtros

    Args:
        db: Sessão do banco
        admin_id: Filtrar por admin
        acao: Filtrar por tipo de ação
        data_inicio: Filtrar por data (início)
        data_fim: Filtrar por data (fim)
        page: Página (1-indexed)
        per_page: Itens por página

    Returns:
        Tupla (lista de logs, total de registros)
    """
    query = select(AdminLog)

    # Aplicar filtros
    conditions = []

    if admin_id is not None:
        conditions.append(AdminLog.admin_id == admin_id)

    if acao:
        conditions.append(AdminLog.acao == acao)

    if data_inicio:
        conditions.append(AdminLog.criado_em >= data_inicio)

    if data_fim:
        conditions.append(AdminLog.criado_em <= data_fim)

    if conditions:
        query = query.where(and_(*conditions))

    # Conta total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Aplica paginação
    offset = (page - 1) * per_page
    query = query.order_by(AdminLog.criado_em.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    logs = list(result.scalars().all())

    return logs, total


async def obter_log_por_id(
    db: AsyncSession,
    log_id: int
) -> Optional[AdminLog]:
    """
    Busca log por ID

    Args:
        db: Sessão do banco
        log_id: ID do log

    Returns:
        AdminLog ou None
    """
    return await db.get(AdminLog, log_id)


async def obter_logs_por_admin(
    db: AsyncSession,
    admin_id: int,
    limit: int = 100
) -> List[AdminLog]:
    """
    Retorna últimos logs de um admin específico

    Args:
        db: Sessão do banco
        admin_id: ID do admin
        limit: Quantidade de logs

    Returns:
        Lista de logs
    """
    result = await db.execute(
        select(AdminLog)
        .where(AdminLog.admin_id == admin_id)
        .order_by(AdminLog.criado_em.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def obter_acoes_disponiveis(db: AsyncSession) -> List[str]:
    """
    Retorna lista de ações únicas registradas (para filtros)

    Args:
        db: Sessão do banco

    Returns:
        Lista de ações
    """
    result = await db.execute(
        select(AdminLog.acao).distinct().order_by(AdminLog.acao)
    )
    return [row[0] for row in result.all()]


# Constantes para tipos de ação (para consistência)
class AcoesLog:
    """Constantes para tipos de ações de log"""
    # Autenticação
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    LOGIN_FALHOU = "LOGIN_FALHOU"
    RECUPERAR_SENHA = "RECUPERAR_SENHA"
    RESETAR_SENHA = "RESETAR_SENHA"

    # Admins
    CRIAR_ADMIN = "CRIAR_ADMIN"
    ATUALIZAR_ADMIN = "ATUALIZAR_ADMIN"
    DESATIVAR_ADMIN = "DESATIVAR_ADMIN"
    ATIVAR_ADMIN = "ATIVAR_ADMIN"

    # Moderação
    APROVAR_CONTRIBUICAO = "APROVAR_CONTRIBUICAO"
    REJEITAR_CONTRIBUICAO = "REJEITAR_CONTRIBUICAO"
    APROVAR_EM_LOTE = "APROVAR_EM_LOTE"
    REJEITAR_EM_LOTE = "REJEITAR_EM_LOTE"

    # Consultas
    CRIAR_CONSULTA = "CRIAR_CONSULTA"
    ATUALIZAR_CONSULTA = "ATUALIZAR_CONSULTA"
    ENCERRAR_CONSULTA = "ENCERRAR_CONSULTA"

    # Dados
    EXPORTAR_PARTICIPANTES = "EXPORTAR_PARTICIPANTES"
    EXPORTAR_CONTRIBUICOES = "EXPORTAR_CONTRIBUICOES"
    VISUALIZAR_DADOS_SENSIVEIS = "VISUALIZAR_DADOS_SENSIVEIS"
