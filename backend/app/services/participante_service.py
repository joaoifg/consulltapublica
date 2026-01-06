"""
Serviço de Participante
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional

from ..models.participante import Participante, TipoParticipante
from ..schemas.participante import ParticipantePFCreate, ParticipantePJCreate
from ..utils.security import crypto, hash_cpf_cnpj


async def criar_participante_pf(
    db: AsyncSession,
    data: ParticipantePFCreate,
    ip_origem: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Participante:
    """
    Cria participante Pessoa Física

    Args:
        db: Sessão do banco
        data: Dados do participante
        ip_origem: IP de origem
        user_agent: User agent do navegador

    Returns:
        Participante criado
    """
    # Criptografa dados sensíveis
    cpf_criptografado = crypto.encrypt(data.cpf)
    email_criptografado = crypto.encrypt(data.email)

    # Hash para busca (sem possibilidade de reversão)
    cpf_hash = hash_cpf_cnpj(data.cpf)

    # Cria participante
    participante = Participante(
        tipo=TipoParticipante.PESSOA_FISICA,
        nome_completo=data.nome_completo,
        cpf_hash=cpf_hash,
        cpf_criptografado=cpf_criptografado,
        categoria_pf=data.categoria,
        email_criptografado=email_criptografado,
        uf=data.uf,
        consentimento_lgpd=datetime.utcnow(),
        ip_origem=ip_origem,
        user_agent=user_agent
    )

    db.add(participante)
    await db.flush()
    await db.refresh(participante)

    return participante


async def criar_participante_pj(
    db: AsyncSession,
    data: ParticipantePJCreate,
    ip_origem: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Participante:
    """
    Cria participante Pessoa Jurídica

    Args:
        db: Sessão do banco
        data: Dados da entidade
        ip_origem: IP de origem
        user_agent: User agent do navegador

    Returns:
        Participante criado
    """
    # Criptografa dados sensíveis
    cnpj_criptografado = crypto.encrypt(data.cnpj)
    cpf_responsavel_criptografado = crypto.encrypt(data.cpf_responsavel)
    email_criptografado = crypto.encrypt(data.email)

    # Hashes para busca
    cnpj_hash = hash_cpf_cnpj(data.cnpj)
    cpf_responsavel_hash = hash_cpf_cnpj(data.cpf_responsavel)

    # Cria participante
    participante = Participante(
        tipo=TipoParticipante.PESSOA_JURIDICA,
        razao_social=data.razao_social,
        cnpj_hash=cnpj_hash,
        cnpj_criptografado=cnpj_criptografado,
        natureza_entidade=data.natureza_entidade,
        nome_responsavel_legal=data.nome_responsavel_legal,
        cpf_responsavel_hash=cpf_responsavel_hash,
        cpf_responsavel_criptografado=cpf_responsavel_criptografado,
        email_criptografado=email_criptografado,
        uf=data.uf,
        consentimento_lgpd=datetime.utcnow(),
        ip_origem=ip_origem,
        user_agent=user_agent
    )

    db.add(participante)
    await db.flush()
    await db.refresh(participante)

    return participante


async def buscar_participante_por_id(
    db: AsyncSession,
    participante_id: int
) -> Optional[Participante]:
    """Busca participante por ID"""
    result = await db.execute(
        select(Participante).where(Participante.id == participante_id)
    )
    return result.scalar_one_or_none()


async def buscar_participante_por_cpf(
    db: AsyncSession,
    cpf: str
) -> Optional[Participante]:
    """Busca participante PF por CPF (usando hash)"""
    cpf_hash = hash_cpf_cnpj(cpf)
    result = await db.execute(
        select(Participante).where(
            Participante.tipo == TipoParticipante.PESSOA_FISICA,
            Participante.cpf_hash == cpf_hash
        )
    )
    return result.scalar_one_or_none()


async def buscar_participante_por_cnpj(
    db: AsyncSession,
    cnpj: str
) -> Optional[Participante]:
    """Busca participante PJ por CNPJ (usando hash)"""
    cnpj_hash = hash_cpf_cnpj(cnpj)
    result = await db.execute(
        select(Participante).where(
            Participante.tipo == TipoParticipante.PESSOA_JURIDICA,
            Participante.cnpj_hash == cnpj_hash
        )
    )
    return result.scalar_one_or_none()
