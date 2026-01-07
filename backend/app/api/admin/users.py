"""
Router de gerenciamento de administradores (apenas SUPER_ADMIN)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from ...core.database import get_db
from ...schemas.admin import AdminCreate, AdminUpdate, AdminResponse
from ...services import admin_service, auditoria_service
from ...services.auditoria_service import AcoesLog
from ...utils.permissions import require_super_admin
from ...models.admin import Admin

router = APIRouter(prefix="/admin/users", tags=["Admin - Usuários"])


@router.post("", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def criar_admin(
    data: AdminCreate,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Cria novo administrador

    Requer: SUPER_ADMIN
    """
    # Verifica se email já existe
    admin_existente = await admin_service.buscar_admin_por_email(db, data.email)
    if admin_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )

    # Cria admin
    novo_admin = await admin_service.criar_admin(db, data, admin.id)
    await db.commit()

    # Descriptografa email para resposta
    email = admin_service.descriptografar_email_admin(novo_admin)

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.CRIAR_ADMIN,
        recurso=f"Admin #{novo_admin.id}",
        detalhes={"nome": novo_admin.nome, "email": email, "role": novo_admin.role.value},
        request=request
    )
    await db.commit()

    # Retorna resposta
    return AdminResponse(
        id=novo_admin.id,
        nome=novo_admin.nome,
        email=email,
        role=novo_admin.role,
        ativo=novo_admin.ativo,
        criado_em=novo_admin.criado_em,
        atualizado_em=novo_admin.atualizado_em
    )


@router.get("", response_model=List[AdminResponse])
async def listar_admins(
    ativo: Optional[bool] = None,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos os administradores

    Requer: SUPER_ADMIN
    """
    admins = await admin_service.listar_admins(db, ativo=ativo)

    # Descriptografa emails
    resultado = []
    for a in admins:
        email = admin_service.descriptografar_email_admin(a)
        resultado.append(
            AdminResponse(
                id=a.id,
                nome=a.nome,
                email=email,
                role=a.role,
                ativo=a.ativo,
                criado_em=a.criado_em,
                atualizado_em=a.atualizado_em
            )
        )

    return resultado


@router.get("/{admin_id}", response_model=AdminResponse)
async def obter_admin(
    admin_id: int,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca admin por ID

    Requer: SUPER_ADMIN
    """
    admin_buscado = await admin_service.obter_admin_por_id(db, admin_id)

    if not admin_buscado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )

    email = admin_service.descriptografar_email_admin(admin_buscado)

    return AdminResponse(
        id=admin_buscado.id,
        nome=admin_buscado.nome,
        email=email,
        role=admin_buscado.role,
        ativo=admin_buscado.ativo,
        criado_em=admin_buscado.criado_em,
        atualizado_em=admin_buscado.atualizado_em
    )


@router.patch("/{admin_id}", response_model=AdminResponse)
async def atualizar_admin(
    admin_id: int,
    data: AdminUpdate,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Atualiza dados do administrador

    Requer: SUPER_ADMIN
    """
    # Verifica se admin existe
    admin_atualizar = await admin_service.obter_admin_por_id(db, admin_id)
    if not admin_atualizar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )

    # Se está alterando email, verifica se já existe
    if data.email:
        admin_existente = await admin_service.buscar_admin_por_email(db, data.email)
        if admin_existente and admin_existente.id != admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado por outro administrador"
            )

    # Atualiza
    admin_atualizado = await admin_service.atualizar_admin(db, admin_id, data)
    await db.commit()

    email = admin_service.descriptografar_email_admin(admin_atualizado)

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.ATUALIZAR_ADMIN,
        recurso=f"Admin #{admin_id}",
        detalhes=data.dict(exclude_unset=True),
        request=request
    )
    await db.commit()

    return AdminResponse(
        id=admin_atualizado.id,
        nome=admin_atualizado.nome,
        email=email,
        role=admin_atualizado.role,
        ativo=admin_atualizado.ativo,
        criado_em=admin_atualizado.criado_em,
        atualizado_em=admin_atualizado.atualizado_em
    )


@router.delete("/{admin_id}")
async def desativar_admin(
    admin_id: int,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Desativa administrador (soft delete)

    Não permite desativar o último SUPER_ADMIN

    Requer: SUPER_ADMIN
    """
    # Verifica se existe
    admin_desativar = await admin_service.obter_admin_por_id(db, admin_id)
    if not admin_desativar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )

    # Verifica se é o último SUPER_ADMIN
    if admin_desativar.role.value == "SUPER_ADMIN":
        total_super_admins = await admin_service.contar_super_admins_ativos(db)
        if total_super_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não é possível desativar o último SUPER_ADMIN do sistema"
            )

    # Desativa
    await admin_service.desativar_admin(db, admin_id)
    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.DESATIVAR_ADMIN,
        recurso=f"Admin #{admin_id}",
        request=request
    )
    await db.commit()

    return {"message": "Administrador desativado com sucesso"}


@router.post("/{admin_id}/ativar")
async def ativar_admin(
    admin_id: int,
    request: Request,
    admin: Admin = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Reativa administrador

    Requer: SUPER_ADMIN
    """
    admin_ativar = await admin_service.ativar_admin(db, admin_id)

    if not admin_ativar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )

    await db.commit()

    # Registra log
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.ATIVAR_ADMIN,
        recurso=f"Admin #{admin_id}",
        request=request
    )
    await db.commit()

    return {"message": "Administrador ativado com sucesso"}
