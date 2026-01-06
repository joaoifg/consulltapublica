"""
Geração de protocolos únicos
Formato: CP-{DOCUMENTO}-{ANO}-{SEQUENCIAL}
Exemplo: CP-CEO-2026-000001
"""
from datetime import datetime
import pytz
from typing import Literal
from ..core.config import settings


def gerar_protocolo(
    documento: Literal["CEO", "CPEO"],
    sequencial: int
) -> str:
    """
    Gera protocolo único para contribuição

    Args:
        documento: CEO ou CPEO
        sequencial: Número sequencial da contribuição

    Returns:
        Protocolo formatado: CP-{DOC}-{ANO}-{SEQ}
    """
    # Obtém ano atual em horário de Brasília
    tz = pytz.timezone(settings.TIMEZONE)
    agora = datetime.now(tz)
    ano = agora.year

    # Formata sequencial com 6 dígitos
    seq_formatado = str(sequencial).zfill(6)

    # Monta protocolo
    protocolo = f"CP-{documento}-{ano}-{seq_formatado}"

    return protocolo


def obter_timestamp_brasilia() -> datetime:
    """
    Retorna timestamp atual no horário de Brasília

    Returns:
        datetime com timezone de Brasília
    """
    tz = pytz.timezone(settings.TIMEZONE)
    return datetime.now(tz)


def extrair_info_protocolo(protocolo: str) -> dict:
    """
    Extrai informações de um protocolo

    Args:
        protocolo: String do protocolo (ex: CP-CEO-2026-000001)

    Returns:
        Dict com: documento, ano, sequencial
    """
    try:
        partes = protocolo.split('-')
        if len(partes) != 4 or partes[0] != 'CP':
            return None

        return {
            'documento': partes[1],
            'ano': int(partes[2]),
            'sequencial': int(partes[3])
        }
    except (IndexError, ValueError):
        return None


def validar_protocolo(protocolo: str) -> bool:
    """
    Valida formato de protocolo

    Args:
        protocolo: String do protocolo

    Returns:
        True se válido, False caso contrário
    """
    info = extrair_info_protocolo(protocolo)
    if not info:
        return False

    # Valida documento
    if info['documento'] not in settings.DOCUMENTOS_DISPONIVEIS:
        return False

    # Valida ano (entre 2020 e 2050)
    if not (2020 <= info['ano'] <= 2050):
        return False

    # Valida sequencial (positivo)
    if info['sequencial'] <= 0:
        return False

    return True
