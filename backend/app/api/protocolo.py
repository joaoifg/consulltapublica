"""
Endpoints de Protocolo
"""
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from ..core.database import get_db
from ..schemas.protocolo import ProtocoloResponse, ProtocoloCompletoResponse
from ..schemas.contribuicao import ContribuicaoResponse
from ..services import protocolo_service, contribuicao_service, participante_service
from ..services.email_service import email_service
from ..utils.security import verificar_token_sessao
from ..models.contribuicao import DocumentoConsulta

router = APIRouter(prefix="/protocolos", tags=["Protocolos"])
logger = logging.getLogger(__name__)


async def obter_participante_da_sessao(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db)
) -> int:
    """Dependency para obter participante do token"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    token = authorization.replace("Bearer ", "")
    payload = verificar_token_sessao(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão expirada ou inválida"
        )

    return payload.get("participante_id")


@router.post("/finalizar", response_model=ProtocoloCompletoResponse, status_code=status.HTTP_201_CREATED)
async def finalizar_contribuicoes(
    documento: DocumentoConsulta,
    request: Request,
    participante_id: int = Depends(obter_participante_da_sessao),
    db: AsyncSession = Depends(get_db)
):
    """
    Finaliza contribuições e gera protocolo

    **Requer autenticação**: Bearer token

    **Fluxo**:
    1. Busca todas as contribuições do participante para o documento
    2. Valida que existem contribuições
    3. Gera protocolo único
    4. Retorna dados completos (para exibição e email)

    **Formato do Protocolo**: CP-{DOCUMENTO}-{ANO}-{SEQUENCIAL}
    Exemplo: CP-CEO-2026-000154
    """
    # Obtém IP e User-Agent
    ip_origem = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    # Busca contribuições do participante para o documento
    contribuicoes = await contribuicao_service.listar_contribuicoes_participante(
        db, participante_id, documento
    )

    if not contribuicoes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma contribuição encontrada para finalizar"
        )

    # Extrai IDs das contribuições
    contribuicoes_ids = [c.id for c in contribuicoes]

    # Cria protocolo
    protocolo = await protocolo_service.criar_protocolo(
        db, participante_id, documento, contribuicoes_ids, ip_origem, user_agent
    )
    
    # Commit do protocolo
    await db.commit()
    await db.refresh(protocolo)

    # Busca participante para resposta
    participante = await participante_service.buscar_participante_por_id(db, participante_id)

    # Prepara dados para email
    contribuicoes_dict = [
        {
            "id": c.id,
            "artigo": c.artigo or "",
            "tipo": c.tipo.value if hasattr(c.tipo, 'value') else str(c.tipo),
            "texto_proposto": c.texto_proposto or "",
            "fundamentacao": c.fundamentacao or ""
        }
        for c in contribuicoes
    ]

    # Envia email de confirmação (em background, não bloqueia resposta)
    try:
        email_enviado = await email_service.enviar_email_protocolo(
            email_criptografado=participante.email_criptografado,
            numero_protocolo=protocolo.numero_protocolo,
            documento=protocolo.documento,
            nome_participante=participante.nome_publico,
            total_contribuicoes=protocolo.total_contribuicoes,
            data_submissao=protocolo.criado_em_brasilia,
            contribuicoes=contribuicoes_dict,
            public_url=None  # Será usado o PUBLIC_URL do settings
        )

        if email_enviado:
            # Marca email como enviado
            await protocolo_service.marcar_email_enviado(db, protocolo.id)
            await db.commit()
            logger.info(f"Email de protocolo {protocolo.numero_protocolo} enviado com sucesso")
        else:
            logger.warning(f"Falha ao enviar email para protocolo {protocolo.numero_protocolo}")
    except Exception as e:
        # Não falha a requisição se o email falhar, apenas loga o erro
        logger.error(f"Erro ao enviar email de protocolo {protocolo.numero_protocolo}: {str(e)}", exc_info=True)
    except Exception as e:
        # Não falha a requisição se o email falhar, apenas loga o erro
        logger.error(f"Erro ao enviar email de protocolo {protocolo.numero_protocolo}: {str(e)}")

    # Monta resposta
    return {
        "numero_protocolo": protocolo.numero_protocolo,
        "documento": protocolo.documento,
        "total_contribuicoes": protocolo.total_contribuicoes,
        "criado_em": protocolo.criado_em_brasilia,
        "participante": {
            "nome": participante.nome_publico,
            "uf": participante.uf
        },
        "contribuicoes": contribuicoes
    }


@router.get("/{numero_protocolo}", response_model=ProtocoloCompletoResponse)
async def consultar_protocolo(
    numero_protocolo: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Consulta protocolo pelo número

    **Público**: Não requer autenticação

    **Exibe**:
    - Número do protocolo
    - Documento (CEO ou CPEO)
    - Total de contribuições
    - Data de submissão
    - Nome público do participante (sem CPF/CNPJ)
    - Lista de contribuições

    **LGPD**: Não exibe dados sensíveis (CPF, CNPJ, email)
    """
    resultado = await protocolo_service.buscar_protocolo_completo(db, numero_protocolo)

    if not resultado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Protocolo não encontrado"
        )

    protocolo = resultado["protocolo"]
    participante = resultado["participante"]
    contribuicoes = resultado["contribuicoes"]

    return {
        "numero_protocolo": protocolo.numero_protocolo,
        "documento": protocolo.documento,
        "total_contribuicoes": protocolo.total_contribuicoes,
        "criado_em": protocolo.criado_em_brasilia,
        "participante": {
            "nome": participante.nome_publico,
            "uf": participante.uf
        },
        "contribuicoes": contribuicoes
    }
