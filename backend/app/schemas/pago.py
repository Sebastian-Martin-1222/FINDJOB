"""Esquemas de pagos y políticas de comisión."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PoliticaComisionBase(BaseModel):
    nombre: str = Field(..., max_length=120)
    porcentaje_comision: Decimal = Field(..., ge=Decimal('0'), le=Decimal('100'))
    vigente_desde: datetime
    vigente_hasta: Optional[datetime] = None
    descripcion: Optional[str] = Field(None, max_length=500)


class PoliticaComisionCreate(PoliticaComisionBase):
    pass


class PoliticaComisionOut(PoliticaComisionBase):
    model_config = ConfigDict(from_attributes=True)
    politica_comision_id: int
    creada_en: datetime


class PagoCreate(BaseModel):
    metodo_pago_id: int
    monto_total: Decimal = Field(..., gt=Decimal('0'))
    referencia_pasarela: Optional[str] = Field(None, max_length=255)


class PagoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    pago_id: int
    cita_id: int
    metodo_pago_id: int
    metodo_pago_nombre: Optional[str] = None
    estado_pago_id: int
    estado_pago_codigo: str
    politica_comision_id: int
    porcentaje_comision: Optional[Decimal] = None
    monto_total: Decimal
    monto_comision: Optional[Decimal] = None
    monto_trabajador: Optional[Decimal] = None
    referencia_pasarela: Optional[str] = None
    fecha_pago: Optional[datetime] = None
    creado_en: datetime