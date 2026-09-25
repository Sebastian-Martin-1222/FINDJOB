"""Endpoints para perfiles profesionales, habilidades y reputación del trabajador."""

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, require_trabajador
from app.schemas.calificacion import CalificacionOut
from app.schemas.common import MessageResponse
from app.schemas.pago import PagoOut
from app.schemas.perfil import (
    CoberturaCreate,
    CoberturaOut,
    PerfilTrabajadorCreate,
    PerfilTrabajadorOut,
    PerfilTrabajadorUpdate,
    UsuarioHabilidadCreate,
    UsuarioHabilidadOut,
)
from app.schemas.servicio import ServicioOut
from app.services.calificaciones_service import calificaciones_service
from app.services.pagos_service import pagos_service
from app.services.servicios_service import servicios_service
from app.services.trabajadores_service import trabajadores_service

router = APIRouter(tags=["Trabajadores"])


# 1. Endpoints Públicos
@router.get("/trabajadores/{perfil_trabajador_id}", response_model=PerfilTrabajadorOut)
def consultar_perfil_publico(perfil_trabajador_id: int) -> PerfilTrabajadorOut:
    """Consultar perfil público, habilidades, experiencia y reputación promedio."""
    return trabajadores_service.get_perfil_publico(perfil_trabajador_id)


@router.get(
    "/trabajadores/{perfil_trabajador_id}/calificaciones",
    response_model=list[CalificacionOut],
)
def consultar_calificaciones_publicas(
    perfil_trabajador_id: int,
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
) -> list[CalificacionOut]:
    """Consultar lista de calificaciones públicas recibidas por el trabajador."""
    return trabajadores_service.get_calificaciones_publicas(
        perfil_trabajador_id, limit=limit, offset=offset
    )


# 2. Endpoints Propios del Trabajador Autenticado
@router.post(
    "/trabajador/perfil",
    response_model=PerfilTrabajadorOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_perfil_propio(
    data: PerfilTrabajadorCreate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> PerfilTrabajadorOut:
    """Crear el perfil profesional público (requiere rol TRABAJADOR)."""
    return trabajadores_service.crear_perfil_trabajador(current_user.usuario_id, data)


@router.get("/trabajador/perfil", response_model=PerfilTrabajadorOut)
def consultar_perfil_propio(
    current_user: CurrentUser = Depends(require_trabajador),
) -> PerfilTrabajadorOut:
    """Consultar el perfil profesional propio."""
    return trabajadores_service.get_perfil_por_usuario(current_user.usuario_id)


@router.patch("/trabajador/perfil", response_model=PerfilTrabajadorOut)
def actualizar_perfil_propio(
    data: PerfilTrabajadorUpdate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> PerfilTrabajadorOut:
    """Actualizar datos del perfil profesional (título, descripción, ciudad)."""
    return trabajadores_service.actualizar_perfil_trabajador(
        current_user.usuario_id, data
    )


@router.get("/trabajador/habilidades", response_model=list[UsuarioHabilidadOut])
def listar_mis_habilidades(
    current_user: CurrentUser = Depends(require_trabajador),
) -> list[UsuarioHabilidadOut]:
    """Consultar habilidades profesionales vinculadas al trabajador."""
    return trabajadores_service.get_habilidades_propias(current_user.usuario_id)


@router.post(
    "/trabajador/habilidades",
    response_model=UsuarioHabilidadOut,
    status_code=status.HTTP_201_CREATED,
)
def asociar_habilidad(
    data: UsuarioHabilidadCreate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> UsuarioHabilidadOut:
    """Vincular una habilidad profesional al perfil."""
    return trabajadores_service.asociar_habilidad(current_user.usuario_id, data)


@router.delete("/trabajador/habilidades/{habilidad_id}", response_model=MessageResponse)
def retirar_habilidad(
    habilidad_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> MessageResponse:
    """Retirar una habilidad vinculada al perfil."""
    trabajadores_service.retirar_habilidad(current_user.usuario_id, habilidad_id)
    return MessageResponse(message="Habilidad desvinculada exitosamente.")


@router.get("/trabajador/coberturas", response_model=list[CoberturaOut])
def listar_mis_coberturas(
    current_user: CurrentUser = Depends(require_trabajador),
) -> list[CoberturaOut]:
    """Consultar ciudades de cobertura para servicios presenciales."""
    return trabajadores_service.get_coberturas_propias(current_user.usuario_id)


@router.post(
    "/trabajador/coberturas",
    response_model=CoberturaOut,
    status_code=status.HTTP_201_CREATED,
)
def agregar_ciudad_cobertura(
    data: CoberturaCreate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> CoberturaOut:
    """Agregar ciudad a la cobertura de servicios presenciales."""
    return trabajadores_service.agregar_cobertura(
        current_user.usuario_id, data.ciudad_id
    )


@router.delete("/trabajador/coberturas/{ciudad_id}", response_model=MessageResponse)
def retirar_ciudad_cobertura(
    ciudad_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> MessageResponse:
    """Retirar ciudad de la cobertura presencial."""
    trabajadores_service.retirar_cobertura(current_user.usuario_id, ciudad_id)
    return MessageResponse(message="Ciudad de cobertura retirada exitosamente.")


@router.get("/trabajador/servicios", response_model=list[ServicioOut])
def listar_mis_servicios(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    current_user: CurrentUser = Depends(require_trabajador),
) -> list[ServicioOut]:
    """Listar servicios propios publicados por el trabajador."""
    return servicios_service.get_servicios_trabajador(
        current_user.usuario_id, limit=limit, offset=offset
    )


@router.get("/trabajador/pagos", response_model=list[PagoOut])
def listar_mis_pagos(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    current_user: CurrentUser = Depends(require_trabajador),
) -> list[PagoOut]:
    """Consultar pagos y liquidaciones correspondientes a trabajos realizados."""
    return pagos_service.get_pagos_trabajador(
        current_user.usuario_id, limit=limit, offset=offset
    )


@router.get("/trabajador/calificaciones", response_model=list[CalificacionOut])
def listar_mis_calificaciones(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    current_user: CurrentUser = Depends(require_trabajador),
) -> list[CalificacionOut]:
    """Consultar calificaciones y comentarios recibidos en citas finalizadas."""
    return calificaciones_service.get_calificaciones_recibidas_trabajador(
        current_user.usuario_id, limit=limit, offset=offset
    )
