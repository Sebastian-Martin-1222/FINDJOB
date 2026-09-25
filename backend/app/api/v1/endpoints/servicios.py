"""Endpoints de búsqueda pública y administración de ofertas de servicios."""

from decimal import Decimal

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, require_trabajador
from app.schemas.common import MessageResponse
from app.schemas.servicio import (
    ServicioCreate,
    ServicioModalidadesUpdate,
    ServicioOut,
    ServicioUpdate,
)
from app.services.servicios_service import servicios_service

router = APIRouter(tags=["Servicios"])


@router.get("/servicios", response_model=list[ServicioOut])
def buscar_servicios(
    categoria_id: int | None = Query(None, description="Filtrar por categoría"),
    subcategoria_id: int | None = Query(None, description="Filtrar por subcategoría"),
    modalidad_id: int | None = Query(
        None, description="Filtrar por modalidad (1=Remoto, 2=Presencial)"
    ),
    ciudad_id: int | None = Query(
        None, description="Filtrar por ciudad para servicios presenciales"
    ),
    precio_max: Decimal | None = Query(None, description="Precio máximo"),
    calificacion_min: float | None = Query(
        None, ge=1, le=5, description="Calificación mínima (1 a 5)"
    ),
) -> list[ServicioOut]:
    """Búsqueda pública de servicios con filtros avanzados en el marketplace."""
    return servicios_service.buscar_servicios(
        categoria_id=categoria_id,
        subcategoria_id=subcategoria_id,
        modalidad_id=modalidad_id,
        ciudad_id=ciudad_id,
        precio_max=precio_max,
        calificacion_min=calificacion_min,
    )


@router.get("/servicios/{servicio_id}", response_model=ServicioOut)
def consultar_detalle_servicio(servicio_id: int) -> ServicioOut:
    """Consultar detalle completo de un servicio publicado."""
    return servicios_service.get_servicio_por_id(servicio_id)


@router.post(
    "/servicios", response_model=ServicioOut, status_code=status.HTTP_201_CREATED
)
def publicar_servicio(
    data: ServicioCreate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> ServicioOut:
    """Publicar un nuevo servicio (Rol TRABAJADOR con perfil activo)."""
    return servicios_service.crear_servicio(current_user.usuario_id, data)


@router.patch("/servicios/{servicio_id}", response_model=ServicioOut)
def editar_servicio(
    servicio_id: int,
    data: ServicioUpdate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> ServicioOut:
    """Editar información de un servicio propio."""
    return servicios_service.actualizar_servicio(
        current_user.usuario_id, servicio_id, data
    )


@router.delete("/servicios/{servicio_id}", response_model=MessageResponse)
def desactivar_servicio(
    servicio_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> MessageResponse:
    """Desactivar servicio propio preservando el histórico de contrataciones."""
    servicios_service.eliminar_servicio(current_user.usuario_id, servicio_id)
    return MessageResponse(message="Servicio desactivado exitosamente.")


@router.put("/servicios/{servicio_id}/modalidades", response_model=ServicioOut)
def configurar_modalidades_servicio(
    servicio_id: int,
    data: ServicioModalidadesUpdate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> ServicioOut:
    """Definir las modalidades habilitadas para un servicio (REMOTO, PRESENCIAL o ambas)."""
    return servicios_service.actualizar_modalidades_servicio(
        current_user.usuario_id, servicio_id, data.modalidades_ids
    )
