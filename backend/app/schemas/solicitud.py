"""Esquemas de solicitudes de servicio."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class SolicitudServicioCreate(BaseModel):
    servicio_id: int
    modalidad_id: int
    direccion_id: Optional[int] = None
    descripcion_necesidad: str = Field(..., min_length=5)
    fecha_propuesta: datetime
    valor_acordado: Optional[Decimal] = Field(None, gt=Decimal('0'))
    plataforma_remota: Optional[str] = Field(None, max_length=80)


class SolicitudServicioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    solicitud_servicio_id: int
    cliente_usuario_id: int
    servicio_id: int
    modalidad_id: int
    estado_solicitud_id: int
    estado_codigo: str
    direccion_id: Optional[int] = None
    descripcion_necesidad: str
    fecha_propuesta: datetime
    valor_acordado: Optional[Decimal] = None
    plataforma_remota: Optional[str] = None
    servicio_titulo: Optional[str] = None
    cliente_nombre: Optional[str] = None
    trabajador_nombre: Optional[str] = None
    creada_en: datetime
    respondida_en: Optional[datetime] = None
    actualizado_en: datetime