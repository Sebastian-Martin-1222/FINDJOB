"""Punto de entrada de la aplicación FastAPI para FindJob Marketplace."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.error_handlers import register_error_handlers


def create_application() -> FastAPI:
    """Fábrica de la aplicación FastAPI con configuración y middlewares seguros."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description=(
            "Backend REST API para la plataforma FindJob - Marketplace de contratación de servicios. "
            "Implementado con Clean Architecture, PEP 8, PEP 484, esquemas Pydantic y autorización RBAC."
        ),
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # 1. Configuración de Middleware CORS
    if settings.BACKEND_CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=[
                str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS
            ],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # 2. Registro de manejadores de excepción globales (sin fuga de stack traces)
    register_error_handlers(application)

    # 3. Montaje del enrutador de API versión 1
    application.include_router(api_router, prefix=settings.API_V1_STR)

    @application.get("/", tags=["Raíz"])
    def root() -> dict[str, str]:
        """Información base del servicio y enlace a documentación."""
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs": f"{settings.API_V1_STR}/docs",
            "health": f"{settings.API_V1_STR}/health",
        }

    return application


app: FastAPI = create_application()
