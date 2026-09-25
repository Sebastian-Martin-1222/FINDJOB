"""Endpoints para el rol ADMIN de gestión, moderación y catálogos."""

from typing import Any

from fastapi import APIRouter, Depends, Query, status

from app.api.deps import CurrentUser, require_admin
from app.schemas.catalogo import (
    CategoriaCreate,
    CategoriaOut,
    CategoriaUpdate,
    HabilidadCreate,
    HabilidadOut,
    HabilidadUpdate,
    SubcategoriaCreate,
    SubcategoriaOut,
    SubcategoriaUpdate,
)
from app.schemas.cita import CitaOut
from app.schemas.pago import PagoOut, PoliticaComisionCreate, PoliticaComisionOut
from app.schemas.seguridad import (
    AlertaSeguridadOut,
    AlertaSeguridadUpdate,
    PreguntaSeguridadCreate,
    PreguntaSeguridadOut,
    PreguntaSeguridadUpdate,
)
from app.schemas.solicitud import SolicitudServicioOut
from app.schemas.usuario import UsuarioEstadoUpdate, UsuarioOut, UsuarioRolesUpdate
from app.services.admin_service import admin_service
from app.services.catalogos_service import catalogos_service
from app.services.citas_service import citas_service
from app.services.pagos_service import pagos_service
from app.services.seguridad_service import seguridad_service
from app.services.solicitudes_service import solicitudes_service

router = APIRouter(prefix="/admin", tags=["Administración (Rol ADMIN)"])


@router.get("/usuarios", response_model=list[UsuarioOut])
def listar_usuarios(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    _: CurrentUser = Depends(require_admin),
) -> list[UsuarioOut]:
    """Consultar usuarios registrados con filtros administrativos."""
    return admin_service.listar_usuarios(limit=limit, offset=offset)


@router.patch("/usuarios/{usuario_id}/estado", response_model=UsuarioOut)
def actualizar_estado_usuario(
    usuario_id: int,
    data: UsuarioEstadoUpdate,
    _: CurrentUser = Depends(require_admin),
) -> UsuarioOut:
    """Activar, suspender o desactivar una cuenta de negocio."""
    return admin_service.actualizar_estado_usuario(usuario_id, data.activo)


@router.put("/usuarios/{usuario_id}/roles", response_model=UsuarioOut)
def asignar_roles_usuario(
    usuario_id: int,
    data: UsuarioRolesUpdate,
    _: CurrentUser = Depends(require_admin),
) -> UsuarioOut:
    """Asignar o retirar roles a un usuario (CLIENTE, TRABAJADOR, ADMIN)."""
    return admin_service.actualizar_roles_usuario(usuario_id, data.roles_ids)


@router.post(
    "/categorias", response_model=CategoriaOut, status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    data: CategoriaCreate,
    _: CurrentUser = Depends(require_admin),
) -> CategoriaOut:
    """Crear una nueva categoría de servicios."""
    return catalogos_service.crear_categoria(data)


@router.patch("/categorias/{categoria_id}", response_model=CategoriaOut)
def editar_categoria(
    categoria_id: int,
    data: CategoriaUpdate,
    _: CurrentUser = Depends(require_admin),
) -> CategoriaOut:
    """Editar, activar o desactivar una categoría."""
    return catalogos_service.actualizar_categoria(categoria_id, data)


@router.post(
    "/subcategorias",
    response_model=SubcategoriaOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_subcategoria(
    data: SubcategoriaCreate,
    _: CurrentUser = Depends(require_admin),
) -> SubcategoriaOut:
    """Crear una nueva subcategoría vinculada a una categoría padre."""
    return catalogos_service.crear_subcategoria(data)


@router.patch("/subcategorias/{subcategoria_id}", response_model=SubcategoriaOut)
def editar_subcategoria(
    subcategoria_id: int,
    data: SubcategoriaUpdate,
    _: CurrentUser = Depends(require_admin),
) -> SubcategoriaOut:
    """Editar, activar o desactivar una subcategoría."""
    return catalogos_service.actualizar_subcategoria(subcategoria_id, data)


@router.post(
    "/habilidades", response_model=HabilidadOut, status_code=status.HTTP_201_CREATED
)
def crear_habilidad(
    data: HabilidadCreate,
    _: CurrentUser = Depends(require_admin),
) -> HabilidadOut:
    """Crear una habilidad en el catálogo general."""
    return catalogos_service.crear_habilidad(data)


@router.patch("/habilidades/{habilidad_id}", response_model=HabilidadOut)
def editar_habilidad(
    habilidad_id: int,
    data: HabilidadUpdate,
    _: CurrentUser = Depends(require_admin),
) -> HabilidadOut:
    """Editar o desactivar una habilidad de catálogo."""
    return catalogos_service.actualizar_habilidad(habilidad_id, data)


@router.get("/solicitudes", response_model=list[SolicitudServicioOut])
def listar_todas_las_solicitudes(
    _: CurrentUser = Depends(require_admin),
) -> list[SolicitudServicioOut]:
    """Consultar solicitudes para fines de soporte o auditoría."""
    from app.mocks.mock_db import mock_db

    return [
        solicitudes_service._ensamblar_solicitud(s)
        for s in mock_db.solicitudes_servicio
    ]


@router.get("/citas", response_model=list[CitaOut])
def listar_todas_las_citas(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    _: CurrentUser = Depends(require_admin),
) -> list[CitaOut]:
    """Consultar citas para gestión operativa global."""
    from app.mocks.mock_db import mock_db

    return [citas_service._ensamblar_cita(c) for c in mock_db.citas][
        offset : offset + limit
    ]


@router.get("/alertas-seguridad", response_model=list[AlertaSeguridadOut])
def listar_alertas_seguridad(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    _: CurrentUser = Depends(require_admin),
) -> list[AlertaSeguridadOut]:
    """Gestionar alertas de seguridad presencial."""
    return admin_service.listar_alertas()[offset : offset + limit]


@router.patch("/alertas-seguridad/{alerta_id}", response_model=AlertaSeguridadOut)
def actualizar_alerta_seguridad(
    alerta_id: int,
    data: AlertaSeguridadUpdate,
    _: CurrentUser = Depends(require_admin),
) -> AlertaSeguridadOut:
    """Actualizar notas o seguimiento de una alerta de seguridad."""
    return admin_service.actualizar_alerta(alerta_id, data)


@router.get("/pagos", response_model=list[PagoOut])
def listar_pagos_admin(
    limit: int = Query(
        20, ge=1, le=100, description="Límite máximo de resultados (OWASP API4)"
    ),
    offset: int = Query(0, ge=0, description="Desplazamiento para paginación"),
    _: CurrentUser = Depends(require_admin),
) -> list[PagoOut]:
    """Consultar historial completo de transacciones financieras."""
    return admin_service.listar_pagos_admin(limit=limit, offset=offset)


@router.post(
    "/politicas-comision",
    response_model=PoliticaComisionOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_politica_comision(
    data: PoliticaComisionCreate,
    _: CurrentUser = Depends(require_admin),
) -> PoliticaComisionOut:
    """Crear una nueva política de comisión con rango de vigencia."""
    return pagos_service.crear_politica_comision(data)


@router.get("/politicas-comision", response_model=list[PoliticaComisionOut])
def listar_politicas_comision(
    _: CurrentUser = Depends(require_admin),
) -> list[PoliticaComisionOut]:
    """Consultar histórico de políticas de comisión."""
    return pagos_service.listar_politicas_comision()


@router.post(
    "/preguntas-seguridad",
    response_model=PreguntaSeguridadOut,
    status_code=status.HTTP_201_CREATED,
)
def crear_pregunta_seguridad(
    data: PreguntaSeguridadCreate,
    _: CurrentUser = Depends(require_admin),
) -> PreguntaSeguridadOut:
    """Crear pregunta reutilizable para chequeos presenciales."""
    return seguridad_service.crear_pregunta_seguridad(data)


@router.patch("/preguntas-seguridad/{pregunta_id}", response_model=PreguntaSeguridadOut)
def editar_pregunta_seguridad(
    pregunta_id: int,
    data: PreguntaSeguridadUpdate,
    _: CurrentUser = Depends(require_admin),
) -> PreguntaSeguridadOut:
    """Editar o desactivar pregunta de seguridad."""
    return seguridad_service.actualizar_pregunta_seguridad(pregunta_id, data)


@router.get("/catalogos/{catalogo}")
def consultar_catalogo_interno(
    catalogo: str,
    _: CurrentUser = Depends(require_admin),
) -> list[dict[str, Any]]:
    """Consultar catálogos internos (estados, tipos, métodos)."""
    return admin_service.consultar_catalogo(catalogo)
