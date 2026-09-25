"""Esquemas de chat interno, mensajes y adjuntos."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


class ArchivoAdjuntoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    archivo_adjunto_id: int
    mensaje_id: int
    nombre_original: str
    tipo_mime: str | None = None
    tamano_bytes: int | None = None
    bucket: str
    ruta_objeto: str
    creado_en: datetime


class ArchivoAdjuntoCreate(BaseInputSchema):
    nombre_original: str = Field(..., max_length=255)
    tipo_mime: str | None = Field(None, max_length=100)
    tamano_bytes: int | None = None
    bucket: str = Field(..., max_length=63)
    ruta_objeto: str = Field(..., max_length=1024)


class MensajeCreate(BaseInputSchema):
    contenido: str = Field(..., min_length=1)
    tipo_mensaje_id: int = 1  # 1 = TEXTO por defecto


class MensajeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    mensaje_id: int
    conversacion_id: int
    remitente_usuario_id: int
    tipo_mensaje_id: int
    tipo_mensaje_codigo: str | None = None
    contenido: str | None = None
    enviado_en: datetime
    editado_en: datetime | None = None
    adjuntos: list[ArchivoAdjuntoOut] = []


class ConversacionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    conversacion_id: int
    solicitud_servicio_id: int
    creada_en: datetime
    cerrada_en: datetime | None = None
    participantes_ids: list[int] = []
    ultimo_mensaje: MensajeOut | None = None
