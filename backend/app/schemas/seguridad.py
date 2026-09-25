"""Esquemas de seguridad presencial, chequeos, respuestas y alertas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


class PreguntaSeguridadBase(BaseInputSchema):
    texto: str = Field(..., max_length=300)
    activa: bool = True


class PreguntaSeguridadCreate(PreguntaSeguridadBase):
    pass


class PreguntaSeguridadUpdate(BaseInputSchema):
    texto: str | None = Field(None, max_length=300)
    activa: bool | None = None


class PreguntaSeguridadOut(PreguntaSeguridadBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    pregunta_seguridad_id: int


class RespuestaChequeoCreate(BaseInputSchema):
    pregunta_seguridad_id: int
    respuesta_ok: bool
    comentario: str | None = Field(None, max_length=500)
    latitud: Decimal | None = Field(None, ge=-90, le=90)
    longitud: Decimal | None = Field(None, ge=-180, le=180)


class RespuestaChequeoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    chequeo_seguridad_id: int
    pregunta_seguridad_id: int
    pregunta_texto: str | None = None
    usuario_id: int
    respuesta_ok: bool
    comentario: str | None = None
    latitud: Decimal | None = None
    longitud: Decimal | None = None
    respondido_en: datetime


class ChequeoSeguridadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    chequeo_seguridad_id: int
    cita_id: int
    generado_en: datetime
    cerrado_en: datetime | None = None
    respuestas: list[RespuestaChequeoOut] = []


class AlertaSeguridadCreate(BaseInputSchema):
    tipo_alerta_id: int
    descripcion: str | None = Field(None, max_length=1000)
    latitud: Decimal | None = Field(None, ge=-90, le=90)
    longitud: Decimal | None = Field(None, ge=-180, le=180)


class AlertaSeguridadUpdate(BaseInputSchema):
    descripcion: str | None = Field(None, max_length=1000)


class AlertaSeguridadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    alerta_seguridad_id: int
    cita_id: int
    usuario_id: int
    usuario_nombre: str | None = None
    tipo_alerta_id: int
    tipo_alerta_codigo: str | None = None
    descripcion: str | None = None
    latitud: Decimal | None = None
    longitud: Decimal | None = None
    ubicacion_capturada_en: datetime | None = None
    creada_en: datetime
