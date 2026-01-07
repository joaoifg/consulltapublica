"""
Router de autenticação de administradores
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from ...core.database import get_db
from ...schemas.admin import (
    AdminLogin,
    AdminLoginResponse,
    AdminResponse,
    AdminRecuperarSenha,
    AdminResetarSenha,
    AdminAlterarSenha
)
from ...services import admin_service, auditoria_service
from ...services.auditoria_service import AcoesLog
from ...utils.security import (
    gerar_token_admin,
    gerar_refresh_token,
    verificar_refresh_token,
    descriptografar_dados
)
from ...utils.permissions import obter_admin_atual
from ...models.admin import Admin

router = APIRouter(prefix="/admin/auth", tags=["Admin - Autenticação"])


@router.post("/login", response_model=AdminLoginResponse)
async def login_admin(
    credentials: AdminLogin,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Login de administrador

    Retorna access_token e refresh_token
    """
    # Autentica
    admin = await admin_service.autenticar_admin(
        db,
        credentials.email,
        credentials.senha
    )

    if not admin:
        # Registra tentativa falha
        await auditoria_service.registrar_log(
            db,
            admin_id=None,
            acao=AcoesLog.LOGIN_FALHOU,
            detalhes={"email": credentials.email},
            request=request
        )
        await db.commit()

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos"
        )

    # Gera tokens
    access_token = gerar_token_admin(admin.id, admin.role.value)
    refresh_token = gerar_refresh_token(admin.id)

    # Descriptografa email
    email = admin_service.descriptografar_email_admin(admin)

    # Registra login
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.LOGIN,
        request=request
    )
    await db.commit()

    # Retorna resposta
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "nome": admin.nome,
            "email": email,
            "role": admin.role,
            "ativo": admin.ativo,
            "criado_em": admin.criado_em,
            "atualizado_em": admin.atualizado_em
        }
    }


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Renova access token usando refresh token
    """
    admin_id = verificar_refresh_token(refresh_token)

    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido ou expirado"
        )

    # Busca admin
    admin = await admin_service.obter_admin_por_id(db, admin_id)

    if not admin or not admin.ativo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrador não encontrado ou desativado"
        )

    # Gera novo access token
    new_access_token = gerar_token_admin(admin.id, admin.role.value)

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout_admin(
    request: Request,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Logout de administrador
    """
    # Registra logout
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.LOGOUT,
        request=request
    )
    await db.commit()

    return {"message": "Logout realizado com sucesso"}


@router.post("/alterar-senha")
async def alterar_senha(
    data: AdminAlterarSenha,
    request: Request,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Altera senha do admin logado
    """
    sucesso = await admin_service.alterar_senha(
        db,
        admin.id,
        data.senha_atual,
        data.senha_nova
    )

    if not sucesso:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )

    await db.commit()

    # Registra alteração
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao="ALTERAR_SENHA",
        request=request
    )
    await db.commit()

    return {"message": "Senha alterada com sucesso"}


@router.post("/recuperar-senha")
async def recuperar_senha(
    data: AdminRecuperarSenha,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Solicita recuperação de senha
    Gera token e envia por email
    """
    admin = await admin_service.buscar_admin_por_email(db, data.email)

    if not admin:
        # Não revela se email existe
        return {"message": "Se o email estiver cadastrado, você receberá instruções para recuperação"}

    # Gera token de recuperação (válido por 1h)
    from ...utils.security import gerar_token_sessao
    recovery_token = gerar_token_sessao(admin.id, "admin_recovery")

    # TODO: Enviar email com token
    # Por enquanto, apenas retorna o token (em produção, enviar por email)

    # Registra solicitação
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.RECUPERAR_SENHA,
        request=request
    )
    await db.commit()

    return {
        "message": "Se o email estiver cadastrado, você receberá instruções para recuperação",
        "token": recovery_token  # REMOVER EM PRODUÇÃO
    }


@router.post("/resetar-senha")
async def resetar_senha(
    data: AdminResetarSenha,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Reseta senha usando token de recuperação
    """
    from ...utils.security import verificar_token_sessao

    # Verifica token
    payload = verificar_token_sessao(data.token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )

    admin_id = payload.get("participante_id")  # Reutiliza campo
    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido"
        )

    # Reseta senha
    admin = await admin_service.resetar_senha(db, admin_id, data.senha_nova)

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Administrador não encontrado"
        )

    await db.commit()

    # Registra reset
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.RESETAR_SENHA,
        request=request
    )
    await db.commit()

    return {"message": "Senha resetada com sucesso"}
