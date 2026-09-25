"""Endpoints de comunicación interna (Chat, mensajes, adjuntos y lecturas)."""

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, get_current_user
from app.schemas.common import MessageResponse
from app.schemas.conversacion import (
    ArchivoAdjuntoCreate,
    ArchivoAdjuntoOut,
    ConversacionOut,
    MensajeCreate,
    MensajeOut,
)
from app.services.conversaciones_service import conversaciones_service

router = APIRouter(tags=["Conversaciones y Chat"])


@router.get("/conversaciones", response_model=list[ConversacionOut])
def listar_conversaciones(
    current_user: CurrentUser = Depends(get_current_user),
) -> list[ConversacionOut]:
    """Listar conversaciones del usuario autenticado asociadas a solicitudes aceptadas."""
    return conversaciones_service.listar_conversaciones(current_user.usuario_id)


@router.get(
    "/conversaciones/{conversacion_id}/mensajes", response_model=list[MensajeOut]
)
def consultar_mensajes(
    conversacion_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> list[MensajeOut]:
    """Consultar mensajes ordenados cronológicamente de una conversación autorizada."""
    return conversaciones_service.get_mensajes_conversacion(
        current_user.usuario_id, conversacion_id
    )


@router.post(
    "/conversaciones/{conversacion_id}/mensajes",
    response_model=MensajeOut,
    status_code=status.HTTP_201_CREATED,
)
def enviar_mensaje(
    conversacion_id: int,
    data: MensajeCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> MensajeOut:
    """Enviar un nuevo mensaje de texto dentro de una conversación activa."""
    return conversaciones_service.enviar_mensaje(
        current_user.usuario_id, conversacion_id, data
    )


@router.post(
    "/conversaciones/{conversacion_id}/adjuntos",
    response_model=ArchivoAdjuntoOut,
    status_code=status.HTTP_201_CREATED,
)
def registrar_archivo_adjunto(
    conversacion_id: int,
    data: ArchivoAdjuntoCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> ArchivoAdjuntoOut:
    """Registrar metadatos y referencia en Cloud Storage de un archivo adjunto."""
    return conversaciones_service.adjuntar_archivo(
        current_user.usuario_id, conversacion_id, data
    )


@router.post("/mensajes/{mensaje_id}/lectura", response_model=MessageResponse)
def registrar_lectura_mensaje(
    mensaje_id: int,
    current_user: CurrentUser = Depends(get_current_user),
) -> MessageResponse:
    """Registrar confirmación de lectura de un mensaje recibido."""
    conversaciones_service.registrar_lectura(current_user.usuario_id, mensaje_id)
    return MessageResponse(message="Lectura registrada con éxito.")
