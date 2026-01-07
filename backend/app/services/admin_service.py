"""
Service para gerenciamento de administradores
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List, Optional
from datetime import datetime

from ..models.admin import Admin, AdminRole
from ..schemas.admin import AdminCreate, AdminUpdate
from ..utils.security import (
    hash_senha,
    verificar_senha,
    gerar_token_admin,
    gerar_refresh_token,
    gerar_hash_sha256,
    criptografar_dados,
    descriptografar_dados,
    gerar_token_sessao  # Para token de recuperação de senha
)


async def autenticar_admin(
    db: AsyncSession,
    email: str,
    senha: str
) -> Optional[Admin]:
    """
    Autentica administrador por email e senha

    Args:
        db: Sessão do banco
        email: Email do admin
        senha: Senha em texto plano

    Returns:
        Admin se autenticado, None se inválido
    """
    email_hash = gerar_hash_sha256(email)

    # Busca admin por hash do email
    result = await db.execute(
        select(Admin).where(
            and_(
                Admin.email_hash == email_hash,
                Admin.ativo == True
            )
        )
    )
    admin = result.scalar_one_or_none()

    if not admin:
        return None

    # Verifica senha
    if not verificar_senha(senha, admin.senha_hash):
        return None

    return admin


async def criar_admin(
    db: AsyncSession,
    data: AdminCreate,
    criado_por_admin_id: Optional[int] = None
) -> Admin:
    """
    Cria novo administrador

    Args:
        db: Sessão do banco
        data: Dados do admin
        criado_por_admin_id: ID do admin que está criando (para auditoria)

    Returns:
        Admin criado
    """
    # Cria admin
    admin = Admin(
        email_hash=gerar_hash_sha256(data.email),
        email_criptografado=criptografar_dados(data.email),
        senha_hash=hash_senha(data.senha),
        nome=data.nome,
        role=data.role,
        ativo=True
    )

    db.add(admin)
    await db.flush()
    await db.refresh(admin)

    return admin


async def listar_admins(
    db: AsyncSession,
    ativo: Optional[bool] = None
) -> List[Admin]:
    """
    Lista todos os administradores

    Args:
        db: Sessão do banco
        ativo: Filtrar por status ativo (None = todos)

    Returns:
        Lista de admins
    """
    query = select(Admin).order_by(Admin.criado_em.desc())

    if ativo is not None:
        query = query.where(Admin.ativo == ativo)

    result = await db.execute(query)
    return list(result.scalars().all())


async def obter_admin_por_id(
    db: AsyncSession,
    admin_id: int
) -> Optional[Admin]:
    """
    Busca admin por ID

    Args:
        db: Sessão do banco
        admin_id: ID do admin

    Returns:
        Admin ou None
    """
    return await db.get(Admin, admin_id)


async def atualizar_admin(
    db: AsyncSession,
    admin_id: int,
    data: AdminUpdate
) -> Optional[Admin]:
    """
    Atualiza dados do administrador

    Args:
        db: Sessão do banco
        admin_id: ID do admin
        data: Dados para atualizar

    Returns:
        Admin atualizado ou None se não encontrado
    """
    admin = await db.get(Admin, admin_id)
    if not admin:
        return None

    # Atualiza campos fornecidos
    if data.nome is not None:
        admin.nome = data.nome

    if data.email is not None:
        admin.email_hash = gerar_hash_sha256(data.email)
        admin.email_criptografado = criptografar_dados(data.email)

    if data.role is not None:
        admin.role = data.role

    if data.ativo is not None:
        admin.ativo = data.ativo

    admin.atualizado_em = datetime.utcnow()

    await db.flush()
    await db.refresh(admin)

    return admin


async def desativar_admin(
    db: AsyncSession,
    admin_id: int
) -> Optional[Admin]:
    """
    Desativa administrador (soft delete)

    Args:
        db: Sessão do banco
        admin_id: ID do admin

    Returns:
        Admin desativado ou None se não encontrado
    """
    admin = await db.get(Admin, admin_id)
    if not admin:
        return None

    admin.ativo = False
    admin.atualizado_em = datetime.utcnow()

    await db.flush()
    await db.refresh(admin)

    return admin


async def ativar_admin(
    db: AsyncSession,
    admin_id: int
) -> Optional[Admin]:
    """
    Reativa administrador

    Args:
        db: Sessão do banco
        admin_id: ID do admin

    Returns:
        Admin ativado ou None se não encontrado
    """
    admin = await db.get(Admin, admin_id)
    if not admin:
        return None

    admin.ativo = True
    admin.atualizado_em = datetime.utcnow()

    await db.flush()
    await db.refresh(admin)

    return admin


async def contar_super_admins_ativos(db: AsyncSession) -> int:
    """
    Conta quantos SUPER_ADMINs ativos existem

    Args:
        db: Sessão do banco

    Returns:
        Quantidade de SUPER_ADMINs ativos
    """
    result = await db.execute(
        select(func.count(Admin.id)).where(
            and_(
                Admin.role == AdminRole.SUPER_ADMIN,
                Admin.ativo == True
            )
        )
    )
    return result.scalar() or 0


async def alterar_senha(
    db: AsyncSession,
    admin_id: int,
    senha_atual: str,
    senha_nova: str
) -> bool:
    """
    Altera senha do administrador

    Args:
        db: Sessão do banco
        admin_id: ID do admin
        senha_atual: Senha atual (para validação)
        senha_nova: Nova senha

    Returns:
        True se alterada com sucesso, False se senha atual incorreta
    """
    admin = await db.get(Admin, admin_id)
    if not admin:
        return False

    # Verifica senha atual
    if not verificar_senha(senha_atual, admin.senha_hash):
        return False

    # Atualiza senha
    admin.senha_hash = hash_senha(senha_nova)
    admin.atualizado_em = datetime.utcnow()

    await db.flush()

    return True


async def buscar_admin_por_email(
    db: AsyncSession,
    email: str
) -> Optional[Admin]:
    """
    Busca admin por email

    Args:
        db: Sessão do banco
        email: Email do admin

    Returns:
        Admin ou None
    """
    email_hash = gerar_hash_sha256(email)

    result = await db.execute(
        select(Admin).where(Admin.email_hash == email_hash)
    )
    return result.scalar_one_or_none()


async def resetar_senha(
    db: AsyncSession,
    admin_id: int,
    senha_nova: str
) -> Optional[Admin]:
    """
    Reseta senha do admin (sem validar senha atual)
    Usado para recuperação de senha via token

    Args:
        db: Sessão do banco
        admin_id: ID do admin
        senha_nova: Nova senha

    Returns:
        Admin ou None se não encontrado
    """
    admin = await db.get(Admin, admin_id)
    if not admin:
        return None

    admin.senha_hash = hash_senha(senha_nova)
    admin.atualizado_em = datetime.utcnow()

    await db.flush()
    await db.refresh(admin)

    return admin


def descriptografar_email_admin(admin: Admin) -> str:
    """
    Descriptografa email do admin

    Args:
        admin: Admin

    Returns:
        Email descriptografado
    """
    return descriptografar_dados(admin.email_criptografado)
