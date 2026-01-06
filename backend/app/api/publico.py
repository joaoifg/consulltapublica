"""
Endpoints Públicos (sem autenticação)
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from ..core.database import get_db
from ..core.config import settings
from ..schemas.contribuicao import ContribuicaoPublicaResponse
from ..services import contribuicao_service
from ..models.contribuicao import DocumentoConsulta

router = APIRouter(prefix="/publico", tags=["Público"])


@router.get("/contribuicoes", response_model=dict)
async def listar_contribuicoes_publicas(
    documento: Optional[DocumentoConsulta] = None,
    artigo: Optional[str] = None,
    page: int = Query(1, ge=1, description="Página (inicia em 1)"),
    per_page: int = Query(50, ge=1, le=100, description="Itens por página (máx 100)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Lista contribuições públicas

    **Público**: Não requer autenticação

    **Filtros**:
    - documento: CEO ou CPEO (opcional)
    - artigo: Filtrar por artigo específico (opcional)
    - page: Número da página (padrão: 1)
    - per_page: Itens por página (padrão: 50, máx: 100)

    **Retorna**:
    - Lista de contribuições (sem dados sensíveis)
    - Total de contribuições
    - Informações de paginação

    **LGPD**: Exibe apenas nome público e UF. Sem CPF, CNPJ ou email.
    """
    # Calcula offset
    offset = (page - 1) * per_page

    # Busca contribuições
    contribuicoes = await contribuicao_service.listar_contribuicoes_publicas(
        db, documento, artigo, limit=per_page, offset=offset
    )

    # Conta total
    total = await contribuicao_service.contar_contribuicoes_publicas(db, documento)

    # Calcula total de páginas
    total_pages = (total + per_page - 1) // per_page

    return {
        "data": contribuicoes,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": total_pages
        }
    }


@router.get("/documentos", response_model=List[dict])
async def listar_documentos():
    """
    Lista documentos disponíveis para consulta pública

    **Público**: Não requer autenticação

    **Retorna**:
    - Lista de documentos com código e nome
    """
    documentos = [
        {
            "codigo": "CEO",
            "nome": "Código de Ética Odontológica",
            "descricao": "Novo Código de Ética Odontológica"
        },
        {
            "codigo": "CPEO",
            "nome": "Código de Processo Ético Odontológico",
            "descricao": "Novo Código de Processo Ético Odontológico"
        }
    ]

    return documentos


@router.get("/estatisticas", response_model=dict)
async def obter_estatisticas(
    db: AsyncSession = Depends(get_db)
):
    """
    Retorna estatísticas da consulta pública

    **Público**: Não requer autenticação

    **Retorna**:
    - Total de contribuições por documento
    - Total geral
    """
    total_ceo = await contribuicao_service.contar_contribuicoes_publicas(
        db, DocumentoConsulta.CEO
    )

    total_cpeo = await contribuicao_service.contar_contribuicoes_publicas(
        db, DocumentoConsulta.CPEO
    )

    return {
        "total_geral": total_ceo + total_cpeo,
        "por_documento": {
            "CEO": total_ceo,
            "CPEO": total_cpeo
        }
    }
