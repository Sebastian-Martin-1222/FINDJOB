"""Endpoints de respuestas a chequeos de seguridad presencial."""

from fastapi import APIRouter, Depends, status

from app.api.deps import CurrentUser, get_current_user
from app.schemas.seguridad import RespuestaChequeoCreate, RespuestaChequeoOut
from app.services.seguridad_service import seguridad_service

router = APIRouter(tags=["Seguridad Presencial"])


@router.post(
    "/chequeos-seguridad/{chequeo_id}/respuestas",
    response_model=RespuestaChequeoOut,
    status_code=status.HTTP_201_CREATED,
)
def responder_chequeo_seguridad(
    chequeo_id: int,
    data: RespuestaChequeoCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> RespuestaChequeoOut:
    """Responder preguntas de chequeo de seguridad durante un servicio presencial."""
    return seguridad_service.responder_chequeo(
        current_user.usuario_id, chequeo_id, data
    )
