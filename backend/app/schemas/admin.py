"""
Schemas Pydantic para Admin
"""
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional
from datetime import datetime
from ..models.admin import AdminRole


class AdminLogin(BaseModel):
    """Schema para login de administrador"""
    email: EmailStr
    senha: str = Field(..., min_length=1)


class AdminCreate(BaseModel):
    """Schema para criação de administrador"""
    nome: str = Field(..., min_length=3, max_length=255)
    email: EmailStr
    senha: str = Field(..., min_length=8, description="Mínimo 8 caracteres")
    role: AdminRole

    @validator('nome')
    def validar_nome(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Nome deve ter pelo menos 3 caracteres')
        return v

    @validator('senha')
    def validar_senha(cls, v):
        """Valida força da senha"""
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')

        # Verifica se tem pelo menos uma letra maiúscula
        if not any(c.isupper() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')

        # Verifica se tem pelo menos uma letra minúscula
        if not any(c.islower() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra minúscula')

        # Verifica se tem pelo menos um número
        if not any(c.isdigit() for c in v):
            raise ValueError('Senha deve conter pelo menos um número')

        return v


class AdminUpdate(BaseModel):
    """Schema para atualização de administrador"""
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    role: Optional[AdminRole] = None
    ativo: Optional[bool] = None

    @validator('nome')
    def validar_nome(cls, v):
        if v is not None:
            v = v.strip()
            if len(v) < 3:
                raise ValueError('Nome deve ter pelo menos 3 caracteres')
        return v


class AdminAlterarSenha(BaseModel):
    """Schema para alteração de senha"""
    senha_atual: str = Field(..., min_length=1)
    senha_nova: str = Field(..., min_length=8)

    @validator('senha_nova')
    def validar_senha_nova(cls, v):
        """Valida força da senha nova"""
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')

        if not any(c.isupper() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')

        if not any(c.islower() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra minúscula')

        if not any(c.isdigit() for c in v):
            raise ValueError('Senha deve conter pelo menos um número')

        return v


class AdminRecuperarSenha(BaseModel):
    """Schema para solicitar recuperação de senha"""
    email: EmailStr


class AdminResetarSenha(BaseModel):
    """Schema para resetar senha com token"""
    token: str = Field(..., min_length=1)
    senha_nova: str = Field(..., min_length=8)

    @validator('senha_nova')
    def validar_senha(cls, v):
        if len(v) < 8:
            raise ValueError('Senha deve ter no mínimo 8 caracteres')

        if not any(c.isupper() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra maiúscula')

        if not any(c.islower() for c in v):
            raise ValueError('Senha deve conter pelo menos uma letra minúscula')

        if not any(c.isdigit() for c in v):
            raise ValueError('Senha deve conter pelo menos um número')

        return v


class AdminResponse(BaseModel):
    """Schema de resposta de administrador (sem dados sensíveis)"""
    id: int
    nome: str
    email: str  # Descriptografado apenas para admins
    role: AdminRole
    ativo: bool
    criado_em: datetime
    atualizado_em: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminLoginResponse(BaseModel):
    """Schema de resposta de login"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    admin: AdminResponse
