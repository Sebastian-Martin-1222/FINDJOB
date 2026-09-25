"""Enrutador principal para la versión 1 de la API REST."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    catalogos,
    citas,
    conversaciones,
    seguridad,
    servicios,
    solicitudes,
    trabajadores,
    usuarios,
)

api_router = APIRouter()


# Health check para monitoreo y pipelines
@api_router.get("/health", tags=["Salud del Sistema"])
def health_check() -> dict[str, str]:
    """Endpoint de verificación de estado y disponibilidad del servicio."""
    return {"status": "ok", "service": "FindJob Backend", "version": "1.0.0"}


# Montar subenrutadores del dominio
api_router.include_router(catalogos.router)
api_router.include_router(usuarios.router)
api_router.include_router(servicios.router)
api_router.include_router(trabajadores.router)
api_router.include_router(solicitudes.router)
api_router.include_router(citas.router)
api_router.include_router(conversaciones.router)
api_router.include_router(seguridad.router)
api_router.include_router(admin.router)
