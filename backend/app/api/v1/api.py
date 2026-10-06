"""Enrutador principal para la versión 1 de la API REST."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    catalogos,
    citas,
    conversaciones,
    health_db,
    seguridad,
    servicios,
    solicitudes,
    trabajadores,
    usuarios,
)

api_router = APIRouter()


@api_router.get("/health", tags=["Salud del Sistema"])
def health_check() -> dict[str, str]:
    """Endpoint de verificación de estado y disponibilidad del servicio."""
    return {"status": "ok", "service": "FindJob Backend", "version": "1.0.0"}


api_router.include_router(health_db.router)
api_router.include_router(catalogos.router)
api_router.include_router(usuarios.router)
api_router.include_router(servicios.router)
api_router.include_router(trabajadores.router)
api_router.include_router(solicitudes.router)
api_router.include_router(citas.router)
api_router.include_router(conversaciones.router)
api_router.include_router(seguridad.router)
api_router.include_router(admin.router)
