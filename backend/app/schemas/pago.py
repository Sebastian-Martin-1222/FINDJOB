"""Esquemas de pagos y políticas de comisión."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


class PoliticaComisionBase(BaseInputSchema):
    nombre: str = Field(..., max_length=120)
    porcentaje_comision: Decimal = Field(..., ge=0, le=100)
    vigente_desde: datetime
    vigente_hasta: datetime | None = None
    descripcion: str | None = Field(None, max_length=500)


class PoliticaComisionCreate(PoliticaComisionBase):
    pass


class PoliticaComisionOut(PoliticaComisionBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    politica_comision_id: int
    creada_en: datetime


class PagoCreate(BaseInputSchema):
    metodo_pago_id: int
    monto_total: Decimal = Field(..., gt=0)
    referencia_pasarela: str | None = Field(None, max_length=255)


class PagoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    pago_id: int
    cita_id: int
    metodo_pago_id: int
    metodo_pago_nombre: str | None = None
    estado_pago_id: int
    estado_pago_codigo: str
    politica_comision_id: int
    porcentaje_comision: Decimal | None = None
    monto_total: Decimal
    monto_comision: Decimal | None = None
    monto_trabajador: Decimal | None = None
    referencia_pasarela: str | None = None
    fecha_pago: datetime | None = None
    creado_en: datetime
