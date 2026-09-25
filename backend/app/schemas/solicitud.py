"""Esquemas de solicitudes de servicio."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SolicitudServicioCreate(BaseModel):
    servicio_id: int
    modalidad_id: int
    direccion_id: int | None = None
    descripcion_necesidad: str = Field(..., min_length=5)
    fecha_propuesta: datetime
    valor_acordado: Decimal | None = Field(None, gt=0)
    plataforma_remota: str | None = Field(None, max_length=80)


class SolicitudServicioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    solicitud_servicio_id: int
    cliente_usuario_id: int
    servicio_id: int
    modalidad_id: int
    estado_solicitud_id: int
    estado_codigo: str
    direccion_id: int | None = None
    descripcion_necesidad: str
    fecha_propuesta: datetime
    valor_acordado: Decimal | None = None
    plataforma_remota: str | None = None
    servicio_titulo: str | None = None
    cliente_nombre: str | None = None
    trabajador_nombre: str | None = None
    creada_en: datetime
    respondida_en: datetime | None = None
    actualizado_en: datetime
