"""
Serviço de Contribuição
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from typing import List, Optional

from ..models.contribuicao import Contribuicao, DocumentoConsulta, StatusModeracao
from ..models.participante import Participante
from ..schemas.contribuicao import ContribuicaoCreate


async def criar_contribuicao(
    db: AsyncSession,
    participante_id: int,
    data: ContribuicaoCreate,
    ip_origem: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Contribuicao:
    """
    Cria uma contribuição

    Args:
        db: Sessão do banco
        participante_id: ID do participante
        data: Dados da contribuição
        ip_origem: IP de origem
        user_agent: User agent

    Returns:
        Contribuição criada
    """
    contribuicao = Contribuicao(
        participante_id=participante_id,
        documento=data.documento,
        titulo_capitulo=data.titulo_capitulo,
        secao=data.secao,
        artigo=data.artigo,
        paragrafo_inciso_alinea=data.paragrafo_inciso_alinea,
        tipo=data.tipo,
        texto_proposto=data.texto_proposto,
        fundamentacao=data.fundamentacao,
        publicada=True,  # Mantido para backward compatibility
        status_moderacao=StatusModeracao.PENDENTE,  # NOVO: Inicia como PENDENTE
        ip_origem=ip_origem,
        user_agent=user_agent
    )

    db.add(contribuicao)
    await db.flush()
    await db.refresh(contribuicao)

    return contribuicao


async def listar_contribuicoes_participante(
    db: AsyncSession,
    participante_id: int,
    documento: Optional[DocumentoConsulta] = None
) -> List[Contribuicao]:
    """Lista contribuições de um participante"""
    query = select(Contribuicao).where(
        Contribuicao.participante_id == participante_id
    )

    if documento:
        query = query.where(Contribuicao.documento == documento)

    query = query.order_by(Contribuicao.criado_em.desc())

    result = await db.execute(query)
    return list(result.scalars().all())


async def listar_contribuicoes_publicas(
    db: AsyncSession,
    documento: Optional[DocumentoConsulta] = None,
    artigo: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[dict]:
    """
    Lista contribuições públicas (sem dados sensíveis)

    Returns:
        Lista de dicts com dados públicos
    """
    query = (
        select(
            Contribuicao.id,
            Contribuicao.documento,
            Contribuicao.titulo_capitulo,
            Contribuicao.secao,
            Contribuicao.artigo,
            Contribuicao.paragrafo_inciso_alinea,
            Contribuicao.tipo,
            Contribuicao.texto_proposto,
            Contribuicao.fundamentacao,
            Contribuicao.criado_em,
            Participante.nome_completo,
            Participante.razao_social,
            Participante.tipo.label("tipo_participante"),
            Participante.uf
        )
        .join(Participante, Contribuicao.participante_id == Participante.id)
        .where(Contribuicao.status_moderacao == StatusModeracao.APROVADA)  # MODIFICADO: Apenas aprovadas
    )

    if documento:
        query = query.where(Contribuicao.documento == documento)

    if artigo:
        query = query.where(Contribuicao.artigo == artigo)

    query = query.order_by(Contribuicao.criado_em.desc())
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    rows = result.all()

    contribuicoes = []
    for row in rows:
        # Define nome público baseado no tipo
        nome_publico = row.nome_completo if row.nome_completo else row.razao_social

        # Monta localização completa
        partes = [row.titulo_capitulo]
        if row.secao:
            partes.append(row.secao)
        partes.append(row.artigo)
        if row.paragrafo_inciso_alinea:
            partes.append(row.paragrafo_inciso_alinea)
        localizacao = " - ".join(partes)

        contribuicoes.append({
            "id": row.id,
            "documento": row.documento.value,
            "localizacao": localizacao,
            "tipo": row.tipo.value,
            "texto_proposto": row.texto_proposto,
            "fundamentacao": row.fundamentacao,
            "nome_participante": nome_publico,
            "uf": row.uf,
            "criado_em": row.criado_em
        })

    return contribuicoes


async def contar_contribuicoes_publicas(
    db: AsyncSession,
    documento: Optional[DocumentoConsulta] = None
) -> int:
    """Conta total de contribuições públicas"""
    query = select(func.count(Contribuicao.id)).where(
        Contribuicao.status_moderacao == StatusModeracao.APROVADA  # MODIFICADO: Apenas aprovadas
    )

    if documento:
        query = query.where(Contribuicao.documento == documento)

    result = await db.execute(query)
    return result.scalar()
