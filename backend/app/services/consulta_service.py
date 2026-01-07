"""
Service para gerenciamento de consultas públicas
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
from datetime import datetime

from ..models.consulta import ConsultaPublica, StatusConsulta
from ..models.contribuicao import DocumentoConsulta
from ..schemas.consulta import ConsultaCreate, ConsultaUpdate


async def criar_consulta(
    db: AsyncSession,
    data: ConsultaCreate,
    admin_id: int
) -> ConsultaPublica:
    """
    Cria nova consulta pública

    Args:
        db: Sessão do banco
        data: Dados da consulta
        admin_id: ID do admin criador

    Returns:
        ConsultaPublica criada
    """
    consulta = ConsultaPublica(
        titulo=data.titulo,
        descricao=data.descricao,
        data_inicio=data.data_inicio,
        data_fim=data.data_fim,
        status=data.status,
        documentos_disponiveis=[doc.value for doc in data.documentos_disponiveis],
        criado_por_admin_id=admin_id
    )

    db.add(consulta)
    await db.flush()
    await db.refresh(consulta)

    return consulta


async def listar_consultas(
    db: AsyncSession,
    status: Optional[StatusConsulta] = None
) -> List[ConsultaPublica]:
    """
    Lista todas as consultas públicas

    Args:
        db: Sessão do banco
        status: Filtrar por status (opcional)

    Returns:
        Lista de consultas
    """
    query = select(ConsultaPublica).order_by(ConsultaPublica.criado_em.desc())

    if status:
        query = query.where(ConsultaPublica.status == status)

    result = await db.execute(query)
    return list(result.scalars().all())


async def obter_consulta_ativa(db: AsyncSession) -> Optional[ConsultaPublica]:
    """
    Retorna consulta atualmente ativa (se houver)

    Args:
        db: Sessão do banco

    Returns:
        ConsultaPublica ativa ou None
    """
    result = await db.execute(
        select(ConsultaPublica)
        .where(ConsultaPublica.status == StatusConsulta.ATIVA)
        .order_by(ConsultaPublica.criado_em.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def obter_consulta_por_id(
    db: AsyncSession,
    consulta_id: int
) -> Optional[ConsultaPublica]:
    """
    Busca consulta por ID

    Args:
        db: Sessão do banco
        consulta_id: ID da consulta

    Returns:
        ConsultaPublica ou None
    """
    return await db.get(ConsultaPublica, consulta_id)


async def atualizar_consulta(
    db: AsyncSession,
    consulta_id: int,
    data: ConsultaUpdate
) -> Optional[ConsultaPublica]:
    """
    Atualiza consulta pública

    Args:
        db: Sessão do banco
        consulta_id: ID da consulta
        data: Dados para atualizar

    Returns:
        ConsultaPublica atualizada ou None se não encontrada
    """
    consulta = await db.get(ConsultaPublica, consulta_id)
    if not consulta:
        return None

    # Atualiza campos fornecidos
    if data.titulo is not None:
        consulta.titulo = data.titulo

    if data.descricao is not None:
        consulta.descricao = data.descricao

    if data.data_inicio is not None:
        consulta.data_inicio = data.data_inicio

    if data.data_fim is not None:
        consulta.data_fim = data.data_fim

    if data.status is not None:
        consulta.status = data.status

    if data.documentos_disponiveis is not None:
        consulta.documentos_disponiveis = [doc.value for doc in data.documentos_disponiveis]

    consulta.atualizado_em = datetime.utcnow()

    await db.flush()
    await db.refresh(consulta)

    return consulta


async def encerrar_consulta(
    db: AsyncSession,
    consulta_id: int
) -> Optional[ConsultaPublica]:
    """
    Encerra consulta pública

    Args:
        db: Sessão do banco
        consulta_id: ID da consulta

    Returns:
        ConsultaPublica encerrada ou None se não encontrada
    """
    consulta = await db.get(ConsultaPublica, consulta_id)
    if not consulta:
        return None

    consulta.status = StatusConsulta.ENCERRADA
    consulta.atualizado_em = datetime.utcnow()

    await db.flush()
    await db.refresh(consulta)

    return consulta


async def validar_contribuicao_em_periodo(
    db: AsyncSession,
    documento: DocumentoConsulta
) -> bool:
    """
    Valida se há consulta ativa para o documento

    Args:
        db: Sessão do banco
        documento: Documento (CEO ou CPEO)

    Returns:
        True se pode contribuir, False caso contrário
    """
    # Busca consulta ativa
    consulta = await obter_consulta_ativa(db)

    if not consulta:
        # Se não há consulta ativa, permitir (backward compatibility)
        return True

    # Verifica se o documento está disponível
    if documento.value not in consulta.documentos_disponiveis:
        return False

    # Verifica se está dentro do período
    agora = datetime.utcnow()
    if not (consulta.data_inicio <= agora <= consulta.data_fim):
        return False

    return True


async def obter_consultas_em_periodo(
    db: AsyncSession,
    data_inicio: datetime,
    data_fim: datetime
) -> List[ConsultaPublica]:
    """
    Busca consultas dentro de um período

    Args:
        db: Sessão do banco
        data_inicio: Data de início
        data_fim: Data de fim

    Returns:
        Lista de consultas no período
    """
    result = await db.execute(
        select(ConsultaPublica).where(
            or_(
                # Consulta inicia no período
                and_(
                    ConsultaPublica.data_inicio >= data_inicio,
                    ConsultaPublica.data_inicio <= data_fim
                ),
                # Consulta termina no período
                and_(
                    ConsultaPublica.data_fim >= data_inicio,
                    ConsultaPublica.data_fim <= data_fim
                ),
                # Consulta engloba o período
                and_(
                    ConsultaPublica.data_inicio <= data_inicio,
                    ConsultaPublica.data_fim >= data_fim
                )
            )
        ).order_by(ConsultaPublica.data_inicio.desc())
    )
    return list(result.scalars().all())
