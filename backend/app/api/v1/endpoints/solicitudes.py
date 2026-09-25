"""Endpoints de solicitudes de contratación de servicios."""

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import (
    CurrentUser,
    get_current_user,
    require_cliente,
    require_trabajador,
)
from app.schemas.solicitud import SolicitudServicioCreate, SolicitudServicioOut
from app.services.solicitudes_service import solicitudes_service

router = APIRouter(tags=["Solicitudes de Servicio"])


@router.post(
    "/solicitudes",
    response_model=SolicitudServicioOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_solicitud(
    data: SolicitudServicioCreate,
    current_user: CurrentUser = Depends(require_cliente),
) -> SolicitudServicioOut:
    """Crear una solicitud sobre un servicio y modalidad habilitada (Rol CLIENTE autenticado)."""
    return solicitudes_service.crear_solicitud(current_user.usuario_id, data)


@router.get("/solicitudes/mis-solicitudes", response_model=list[SolicitudServicioOut])
def listar_mis_solicitudes(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    current_user: CurrentUser = Depends(require_cliente),
) -> list[SolicitudServicioOut]:
    """Consultar solicitudes de servicio creadas por el usuario autenticado (Rol CLIENTE)."""
    return solicitudes_service.get_mis_solicitudes(
        current_user.usuario_id, limit=limit, offset=offset
    )


@router.get("/solicitudes/recibidas", response_model=list[SolicitudServicioOut])
def listar_solicitudes_recibidas(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    current_user: CurrentUser = Depends(require_trabajador),
) -> list[SolicitudServicioOut]:
    """Consultar solicitudes recibidas para los servicios propios (Rol TRABAJADOR)."""
    return solicitudes_service.get_solicitudes_recibidas(
        current_user.usuario_id, limit=limit, offset=offset
    )


@router.get("/solicitudes/{solicitud_id}", response_model=SolicitudServicioOut)
def consultar_detalle_solicitud(
    solicitud_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> SolicitudServicioOut:
    """Consultar detalle y estado de una solicitud (autorizado para cliente o trabajador)."""
    return solicitudes_service.get_solicitud_por_id(
        current_user.usuario_id, solicitud_id
    )


@router.patch(
    "/solicitudes/{solicitud_id}/aceptar", response_model=SolicitudServicioOut
)
def aceptar_solicitud(
    solicitud_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> SolicitudServicioOut:
    """Aceptar una solicitud de servicio recibida (habilita chat interno)."""
    return solicitudes_service.responder_solicitud(
        current_user.usuario_id, solicitud_id, aceptar=True
    )


@router.patch(
    "/solicitudes/{solicitud_id}/rechazar", response_model=SolicitudServicioOut
)
def rechazar_solicitud(
    solicitud_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> SolicitudServicioOut:
    """Rechazar una solicitud de servicio recibida."""
    return solicitudes_service.responder_solicitud(
        current_user.usuario_id, solicitud_id, aceptar=False
    )


@router.patch(
    "/solicitudes/{solicitud_id}/cancelar", response_model=SolicitudServicioOut
)
def cancelar_solicitud(
    solicitud_id: int,
    current_user: CurrentUser = Depends(require_cliente),
) -> SolicitudServicioOut:
    """Cancelar una solicitud propia según su estado (Rol CLIENTE)."""
    return solicitudes_service.cancelar_solicitud(current_user.usuario_id, solicitud_id)
