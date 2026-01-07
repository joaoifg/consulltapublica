"""
Router de gerenciamento de participantes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from io import StringIO
import csv

from ...core.database import get_db
from ...models.participante import Participante, TipoParticipante
from ...services import auditoria_service
from ...services.auditoria_service import AcoesLog
from ...utils.permissions import obter_admin_atual
from ...utils.security import descriptografar_dados
from ...models.admin import Admin

router = APIRouter(prefix="/admin/participantes", tags=["Admin - Participantes"])


@router.get("")
async def listar_participantes(
    tipo: Optional[TipoParticipante] = None,
    uf: Optional[str] = None,
    page: int = 1,
    per_page: int = 50,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista participantes com paginação

    ATENÇÃO: Descriptografa dados sensíveis
    """
    query = select(Participante)

    # Filtros
    if tipo:
        query = query.where(Participante.tipo == tipo)

    if uf:
        query = query.where(Participante.uf == uf.upper())

    # Conta total
    count_query = select(func.count()).select_from(query.subquery())
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Paginação
    offset = (page - 1) * per_page
    query = query.order_by(Participante.criado_em.desc()).offset(offset).limit(per_page)

    result = await db.execute(query)
    participantes = list(result.scalars().all())

    # Descriptografa dados
    participantes_descriptografados = []
    for p in participantes:
        email = descriptografar_dados(p.email_criptografado)
        cpf = descriptografar_dados(p.cpf_criptografado) if p.cpf_criptografado else None
        cnpj = descriptografar_dados(p.cnpj_criptografado) if p.cnpj_criptografado else None

        participantes_descriptografados.append({
            "id": p.id,
            "tipo": p.tipo.value,
            "nome_completo": p.nome_completo,
            "razao_social": p.razao_social,
            "cpf": cpf,
            "cnpj": cnpj,
            "email": email,
            "uf": p.uf,
            "criado_em": p.criado_em
        })

    return {
        "participantes": participantes_descriptografados,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page
    }


@router.get("/{participante_id}")
async def obter_participante(
    participante_id: int,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca participante por ID com dados completos descriptografados
    """
    participante = await db.get(Participante, participante_id)

    if not participante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante não encontrado"
        )

    # Descriptografa
    email = descriptografar_dados(participante.email_criptografado)
    cpf = descriptografar_dados(participante.cpf_criptografado) if participante.cpf_criptografado else None
    cnpj = descriptografar_dados(participante.cnpj_criptografado) if participante.cnpj_criptografado else None

    return {
        "id": participante.id,
        "tipo": participante.tipo.value,
        "nome_completo": participante.nome_completo,
        "cpf": cpf,
        "categoria_pf": participante.categoria_pf.value if participante.categoria_pf else None,
        "razao_social": participante.razao_social,
        "cnpj": cnpj,
        "natureza_entidade": participante.natureza_entidade.value if participante.natureza_entidade else None,
        "email": email,
        "uf": participante.uf,
        "criado_em": participante.criado_em,
        "ip_origem": participante.ip_origem
    }


@router.post("/buscar-cpf")
async def buscar_por_cpf(
    cpf: str,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca participante por CPF (usando hash)
    """
    from ...utils.validators import limpar_cpf
    from ...utils.security import hash_cpf_cnpj

    cpf_limpo = limpar_cpf(cpf)
    cpf_hash = hash_cpf_cnpj(cpf_limpo)

    result = await db.execute(
        select(Participante).where(Participante.cpf_hash == cpf_hash)
    )
    participante = result.scalar_one_or_none()

    if not participante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante não encontrado"
        )

    # Descriptografa
    email = descriptografar_dados(participante.email_criptografado)
    cpf_desc = descriptografar_dados(participante.cpf_criptografado)

    return {
        "id": participante.id,
        "tipo": participante.tipo.value,
        "nome_completo": participante.nome_completo,
        "cpf": cpf_desc,
        "email": email,
        "uf": participante.uf
    }


@router.post("/buscar-cnpj")
async def buscar_por_cnpj(
    cnpj: str,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca participante por CNPJ (usando hash)
    """
    from ...utils.validators import limpar_cnpj
    from ...utils.security import hash_cpf_cnpj

    cnpj_limpo = limpar_cnpj(cnpj)
    cnpj_hash = hash_cpf_cnpj(cnpj_limpo)

    result = await db.execute(
        select(Participante).where(Participante.cnpj_hash == cnpj_hash)
    )
    participante = result.scalar_one_or_none()

    if not participante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participante não encontrado"
        )

    # Descriptografa
    email = descriptografar_dados(participante.email_criptografado)
    cnpj_desc = descriptografar_dados(participante.cnpj_criptografado)

    return {
        "id": participante.id,
        "tipo": participante.tipo.value,
        "razao_social": participante.razao_social,
        "cnpj": cnpj_desc,
        "email": email,
        "uf": participante.uf
    }


@router.get("/exportar/csv")
async def exportar_participantes_csv(
    request: Request,
    tipo: Optional[TipoParticipante] = None,
    uf: Optional[str] = None,
    admin: Admin = Depends(obter_admin_atual),
    db: AsyncSession = Depends(get_db)
):
    """
    Exporta participantes para CSV

    IMPORTANTE: Registra log de exportação (LGPD)
    """
    query = select(Participante)

    if tipo:
        query = query.where(Participante.tipo == tipo)

    if uf:
        query = query.where(Participante.uf == uf.upper())

    query = query.order_by(Participante.criado_em.desc())

    result = await db.execute(query)
    participantes = list(result.scalars().all())

    # Gera CSV
    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(['ID', 'Tipo', 'Nome/Razão Social', 'CPF/CNPJ', 'Email', 'UF', 'Data Cadastro'])

    # Dados
    for p in participantes:
        email = descriptografar_dados(p.email_criptografado)
        documento = None

        if p.tipo == TipoParticipante.PESSOA_FISICA:
            nome = p.nome_completo
            if p.cpf_criptografado:
                documento = descriptografar_dados(p.cpf_criptografado)
        else:
            nome = p.razao_social
            if p.cnpj_criptografado:
                documento = descriptografar_dados(p.cnpj_criptografado)

        writer.writerow([
            p.id,
            p.tipo.value,
            nome,
            documento,
            email,
            p.uf,
            p.criado_em.strftime('%Y-%m-%d %H:%M:%S')
        ])

    # Registra log de exportação
    await auditoria_service.registrar_log(
        db,
        admin_id=admin.id,
        acao=AcoesLog.EXPORTAR_PARTICIPANTES,
        detalhes={"total_registros": len(participantes), "filtros": {"tipo": tipo.value if tipo else None, "uf": uf}},
        request=request
    )
    await db.commit()

    # Retorna CSV
    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=participantes.csv"}
    )
