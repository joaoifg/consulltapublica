"""
Sistema de Permissões e Autenticação de Administradores
"""
from fastapi import HTTPException, Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from ..core.database import get_db
from ..models.admin import Admin, AdminRole
from .security import verificar_token_admin


async def obter_admin_atual(
    authorization: str = Header(..., description="Bearer token"),
    db: AsyncSession = Depends(get_db)
) -> Admin:
    """
    Dependency para obter administrador autenticado

    Valida token JWT e retorna o admin autenticado.
    Levanta HTTPException 401 se token inválido ou admin não encontrado.

    Args:
        authorization: Header Authorization com Bearer token
        db: Sessão do banco de dados

    Returns:
        Admin autenticado

    Raises:
        HTTPException: 401 se não autenticado
    """
    # Verifica formato do header
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou ausente",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extrai token
    token = authorization.replace("Bearer ", "")

    # Verifica e decodifica token
    payload = verificar_token_admin(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Busca admin no banco
    admin_id = payload.get("admin_id")
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = await db.get(Admin, admin_id)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrador não encontrado"
        )

    if not admin.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrador desativado"
        )

    return admin


def require_role(allowed_roles: List[AdminRole]):
    """
    Decorator factory para exigir roles específicas

    Exemplo de uso:
        @router.get("/admin/users")
        async def listar_users(admin: Admin = Depends(require_role([AdminRole.SUPER_ADMIN]))):
            ...

    Args:
        allowed_roles: Lista de roles permitidas

    Returns:
        Dependency function que valida role
    """
    async def role_checker(admin: Admin = Depends(obter_admin_atual)) -> Admin:
        if admin.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permissão negada. Requer role: {', '.join([r.value for r in allowed_roles])}"
            )
        return admin

    return role_checker


# Atalhos para roles comuns
def require_super_admin():
    """Dependency que exige SUPER_ADMIN"""
    return require_role([AdminRole.SUPER_ADMIN])


def require_moderador():
    """Dependency que exige MODERADOR ou superior"""
    return require_role([AdminRole.SUPER_ADMIN, AdminRole.MODERADOR])


def require_analista():
    """Dependency que exige ANALISTA ou superior (qualquer admin)"""
    return require_role([AdminRole.SUPER_ADMIN, AdminRole.MODERADOR, AdminRole.ANALISTA])


async def verificar_pode_moderar(admin: Admin) -> bool:
    """
    Verifica se admin pode moderar contribuições

    Args:
        admin: Administrador

    Returns:
        True se pode moderar (SUPER_ADMIN ou MODERADOR)
    """
    return admin.role in [AdminRole.SUPER_ADMIN, AdminRole.MODERADOR]


async def verificar_pode_gerenciar_admins(admin: Admin) -> bool:
    """
    Verifica se admin pode gerenciar outros admins

    Args:
        admin: Administrador

    Returns:
        True se pode gerenciar (apenas SUPER_ADMIN)
    """
    return admin.role == AdminRole.SUPER_ADMIN


async def verificar_pode_gerenciar_consultas(admin: Admin) -> bool:
    """
    Verifica se admin pode gerenciar consultas públicas

    Args:
        admin: Administrador

    Returns:
        True se pode gerenciar (apenas SUPER_ADMIN)
    """
    return admin.role == AdminRole.SUPER_ADMIN
