"""Esquemas de citas y ejecuciones de servicio."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


class CitaCreate(BaseInputSchema):
    direccion_id: int | None = None
    fecha_inicio: datetime
    fecha_fin: datetime | None = None
    plataforma_remota: str | None = Field(None, max_length=80)
    enlace_reunion: str | None = Field(None, max_length=2048)


class CitaUpdate(BaseInputSchema):
    direccion_id: int | None = None
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    plataforma_remota: str | None = Field(None, max_length=80)
    enlace_reunion: str | None = Field(None, max_length=2048)


class CitaConfirmarRequest(BaseInputSchema):
    codigo_confirmacion: str = Field(..., min_length=1, max_length=64)


class CitaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    cita_id: int
    solicitud_servicio_id: int
    estado_cita_id: int
    estado_codigo: str
    direccion_id: int | None = None
    fecha_inicio: datetime
    fecha_fin: datetime | None = None
    codigo_confirmacion: str | None = None
    plataforma_remota: str | None = None
    enlace_reunion: str | None = None
    modalidad_codigo: str | None = None
    servicio_titulo: str | None = None
    creada_en: datetime
    actualizado_en: datetime
