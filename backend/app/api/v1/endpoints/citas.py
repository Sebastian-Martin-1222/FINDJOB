"""Endpoints de citas, ejecución, pagos, calificaciones y eventos de seguridad."""

from fastapi import APIRouter, Depends, status

from app.api.deps import (
    CurrentUser,
    get_current_user,
    require_cliente,
    require_trabajador,
)
from app.schemas.calificacion import CalificacionCreate, CalificacionOut
from app.schemas.cita import CitaConfirmarRequest, CitaCreate, CitaOut, CitaUpdate
from app.schemas.pago import PagoCreate, PagoOut
from app.schemas.seguridad import (
    AlertaSeguridadCreate,
    AlertaSeguridadOut,
    ChequeoSeguridadOut,
)
from app.services.calificaciones_service import calificaciones_service
from app.services.citas_service import citas_service
from app.services.pagos_service import pagos_service
from app.services.seguridad_service import seguridad_service

router = APIRouter(tags=["Citas y Ejecución"])


@router.post(
    "/solicitudes/{solicitud_id}/cita",
    response_model=CitaOut,
    status_code=status.HTTP_201_CREATED,
)
def programar_cita_solicitud(
    solicitud_id: int,
    data: CitaCreate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> CitaOut:
    """Programar cita asociada a una solicitud ACEPTADA (Rol TRABAJADOR)."""
    return citas_service.programar_cita(current_user.usuario_id, solicitud_id, data)


@router.get("/citas/mis-citas", response_model=list[CitaOut])
def listar_mis_citas(
    current_user: CurrentUser = Depends(get_current_user),
) -> list[CitaOut]:
    """Consultar citas asociadas al usuario autenticado (como cliente o trabajador)."""
    return citas_service.get_mis_citas(current_user.usuario_id)


@router.get("/citas/{cita_id}", response_model=CitaOut)
def consultar_detalle_cita(
    cita_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> CitaOut:
    """Consultar detalle completo de una cita para participantes autorizados."""
    return citas_service.get_cita_por_id(current_user.usuario_id, cita_id)


@router.patch("/citas/{cita_id}", response_model=CitaOut)
def actualizar_cita(
    cita_id: int,
    data: CitaUpdate,
    current_user: CurrentUser = Depends(require_trabajador),
) -> CitaOut:
    """Actualizar datos de programación de una cita (Rol TRABAJADOR)."""
    return citas_service.actualizar_cita(current_user.usuario_id, cita_id, data)


@router.patch("/citas/{cita_id}/iniciar", response_model=CitaOut)
def iniciar_ejecucion_cita(
    cita_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> CitaOut:
    """Marcar inicio de ejecución del trabajo (cambio de PROGRAMADA a EN_EJECUCION)."""
    return citas_service.iniciar_cita(current_user.usuario_id, cita_id)


@router.patch("/citas/{cita_id}/finalizar", response_model=CitaOut)
def finalizar_ejecucion_cita(
    cita_id: int,
    current_user: CurrentUser = Depends(require_trabajador),
) -> CitaOut:
    """Marcar finalización de la ejecución (cambio a FINALIZADA; habilita pago y calificación)."""
    return citas_service.finalizar_cita(current_user.usuario_id, cita_id)


@router.post("/citas/{cita_id}/confirmar", response_model=CitaOut)
def confirmar_cita(
    cita_id: int,
    data: CitaConfirmarRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> CitaOut:
    """Confirmar cita mediante código de seguridad de confirmación."""
    return citas_service.confirmar_cita(current_user.usuario_id, cita_id, data)


# Eventos de Seguridad presencial sobre la Cita
@router.post(
    "/citas/{cita_id}/alertas-seguridad",
    response_model=AlertaSeguridadOut,
    status_code=status.HTTP_201_CREATED,
)
def generar_alerta_seguridad(
    cita_id: int,
    data: AlertaSeguridadCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> AlertaSeguridadOut:
    """Generar alerta de seguridad durante una cita presencial (Participante)."""
    return seguridad_service.generar_alerta(current_user.usuario_id, cita_id, data)


@router.get(
    "/citas/{cita_id}/chequeos-seguridad", response_model=list[ChequeoSeguridadOut]
)
def listar_chequeos_seguridad(
    cita_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> list[ChequeoSeguridadOut]:
    """Consultar chequeos de seguridad de una cita presencial."""
    return seguridad_service.get_chequeos_cita(current_user.usuario_id, cita_id)


# Pagos y Calificaciones vinculados a la Cita Finalizada
@router.post(
    "/citas/{cita_id}/pagos",
    response_model=PagoOut,
    status_code=status.HTTP_201_CREATED,
)
def procesar_pago_cita(
    cita_id: int,
    data: PagoCreate,
    current_user: CurrentUser = Depends(require_cliente),
) -> PagoOut:
    """Registrar y procesar pago para una cita FINALIZADA (Rol CLIENTE)."""
    return pagos_service.registrar_pago(current_user.usuario_id, cita_id, data)


@router.get("/citas/{cita_id}/pago", response_model=PagoOut)
def consultar_pago_cita(
    cita_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> PagoOut:
    """Consultar estado y detalle del pago de la cita."""
    return pagos_service.get_pago_por_cita(current_user.usuario_id, cita_id)


@router.post(
    "/citas/{cita_id}/calificacion",
    response_model=CalificacionOut,
    status_code=status.HTTP_201_CREATED,
)
def calificar_cita(
    cita_id: int,
    data: CalificacionCreate,
    current_user: CurrentUser = Depends(require_cliente),
) -> CalificacionOut:
    """Registrar una única calificación (1 a 5) y reseña de una cita FINALIZADA (Rol CLIENTE)."""
    return calificaciones_service.calificar_cita(current_user.usuario_id, cita_id, data)
