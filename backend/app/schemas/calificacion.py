"""Esquemas de calificaciones de servicio."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


class CalificacionCreate(BaseInputSchema):
    puntuacion: int = Field(
        ..., ge=1, le=5, description="Puntuación obligatoria de 1 a 5"
    )
    comentario: str | None = None


class CalificacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    calificacion_id: int
    cita_id: int
    puntuacion: int
    comentario: str | None = None
    cliente_nombre: str | None = None
    servicio_titulo: str | None = None
    creada_en: datetime
