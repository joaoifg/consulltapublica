"""
Sistema de Consulta Pública - CFO
Aplicação principal FastAPI
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import time

from .core.config import settings
from .api import identificacao, contribuicao, protocolo, publico

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# Aplicação
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    Sistema institucional para recebimento de contribuições públicas estruturadas
    para normas do Conselho Federal de Odontologia (CFO).

    ## Documentos
    - **CEO**: Código de Ética Odontológica
    - **CPEO**: Código de Processo Ético Odontológico

    ## Fluxo
    1. **Identificação**: Participante se identifica (PF ou PJ)
    2. **Contribuição**: Envia uma ou mais contribuições
    3. **Finalização**: Gera protocolo único

    ## Segurança
    - Dados sensíveis criptografados (LGPD)
    - Rate limiting
    - Auditoria completa
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# State para rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
cors_origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Middleware para logging de requisições
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware para logging de requisições"""
    start_time = time.time()

    # Processa requisição
    response = await call_next(request)

    # Calcula tempo de processamento
    process_time = time.time() - start_time

    # Adiciona header com tempo de processamento
    response.headers["X-Process-Time"] = str(process_time)

    return response


# Rotas
app.include_router(publico.router, prefix="/api/v1")
app.include_router(identificacao.router, prefix="/api/v1")
app.include_router(contribuicao.router, prefix="/api/v1")
app.include_router(protocolo.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": time.time()
    }


# Handler global de erros
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handler global de exceções"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Erro interno do servidor",
            "type": type(exc).__name__
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
