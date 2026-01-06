"""
Serviço de Protocolo
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List
from datetime import datetime

from ..models.protocolo import Protocolo
from ..models.participante import Participante
from ..models.contribuicao import Contribuicao, DocumentoConsulta
from ..utils.protocol import gerar_protocolo, obter_timestamp_brasilia


async def obter_proximo_sequencial(
    db: AsyncSession,
    documento: str,
    ano: int
) -> int:
    """
    Obtém o próximo número sequencial para um documento/ano

    Args:
        db: Sessão do banco
        documento: CEO ou CPEO
        ano: Ano atual

    Returns:
        Próximo número sequencial
    """
    # Busca o maior sequencial existente para o documento/ano
    query = select(func.max(Protocolo.id)).where(
        Protocolo.documento == documento,
        func.extract('year', Protocolo.criado_em_brasilia) == ano
    )

    result = await db.execute(query)
    max_seq = result.scalar()

    # Se não existe nenhum protocolo, começa do 1
    if max_seq is None:
        return 1

    return max_seq + 1


async def criar_protocolo(
    db: AsyncSession,
    participante_id: int,
    documento: DocumentoConsulta,
    contribuicoes_ids: List[int],
    ip_origem: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Protocolo:
    """
    Cria um protocolo para a submissão

    Args:
        db: Sessão do banco
        participante_id: ID do participante
        documento: Documento (CEO ou CPEO)
        contribuicoes_ids: Lista de IDs das contribuições
        ip_origem: IP de origem
        user_agent: User agent

    Returns:
        Protocolo criado
    """
    # Obtém timestamp de Brasília
    timestamp_brasilia = obter_timestamp_brasilia()
    ano = timestamp_brasilia.year

    # Obtém próximo sequencial
    sequencial = await obter_proximo_sequencial(db, documento.value, ano)

    # Gera número do protocolo
    numero_protocolo = gerar_protocolo(documento.value, sequencial)

    # Cria protocolo
    protocolo = Protocolo(
        numero_protocolo=numero_protocolo,
        participante_id=participante_id,
        documento=documento.value,
        total_contribuicoes=len(contribuicoes_ids),
        contribuicoes_ids=contribuicoes_ids,
        criado_em_brasilia=timestamp_brasilia,
        criado_em_utc=datetime.utcnow(),
        ip_origem=ip_origem,
        user_agent=user_agent
    )

    db.add(protocolo)
    await db.flush()
    await db.refresh(protocolo)

    return protocolo


async def buscar_protocolo_por_numero(
    db: AsyncSession,
    numero_protocolo: str
) -> Optional[Protocolo]:
    """Busca protocolo por número"""
    result = await db.execute(
        select(Protocolo).where(Protocolo.numero_protocolo == numero_protocolo)
    )
    return result.scalar_one_or_none()


async def buscar_protocolo_completo(
    db: AsyncSession,
    numero_protocolo: str
) -> Optional[dict]:
    """
    Busca protocolo com todas as informações (para exibição pública)

    Returns:
        Dict com protocolo, participante e contribuições
    """
    protocolo = await buscar_protocolo_por_numero(db, numero_protocolo)
    if not protocolo:
        return None

    # Busca participante
    result = await db.execute(
        select(Participante).where(Participante.id == protocolo.participante_id)
    )
    participante = result.scalar_one_or_none()

    # Busca contribuições
    result = await db.execute(
        select(Contribuicao).where(
            Contribuicao.id.in_(protocolo.contribuicoes_ids)
        ).order_by(Contribuicao.criado_em)
    )
    contribuicoes = list(result.scalars().all())

    return {
        "protocolo": protocolo,
        "participante": participante,
        "contribuicoes": contribuicoes
    }


async def marcar_email_enviado(
    db: AsyncSession,
    protocolo_id: int
) -> None:
    """Marca que o email de confirmação foi enviado"""
    result = await db.execute(
        select(Protocolo).where(Protocolo.id == protocolo_id)
    )
    protocolo = result.scalar_one_or_none()

    if protocolo:
        protocolo.email_enviado = datetime.utcnow()
        await db.flush()
