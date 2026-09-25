"""Esquemas para servicios y modalidades ofertadas."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalogo import ModalidadOut


class ServicioBase(BaseModel):
    subcategoria_id: int
    titulo: str = Field(..., max_length=180)
    descripcion: str
    precio_base: Decimal = Field(..., gt=0)
    tiempo_estimado_horas: int = Field(..., ge=1, le=8760)
    revisiones_incluidas: int = Field(default=0, ge=0)


class ServicioCreate(ServicioBase):
    modalidades_ids: list[int] = Field(..., min_length=1)


class ServicioUpdate(BaseModel):
    subcategoria_id: int | None = None
    titulo: str | None = Field(None, max_length=180)
    descripcion: str | None = None
    precio_base: Decimal | None = Field(None, gt=0)
    tiempo_estimado_horas: int | None = Field(None, ge=1, le=8760)
    revisiones_incluidas: int | None = Field(None, ge=0)
    activo: bool | None = None


class ServicioModalidadesUpdate(BaseModel):
    modalidades_ids: list[int] = Field(..., min_length=1)


class ServicioOut(ServicioBase):
    model_config = ConfigDict(from_attributes=True)
    servicio_id: int
    perfil_trabajador_id: int
    activo: bool
    trabajador_nombres: str | None = None
    trabajador_apellidos: str | None = None
    categoria_nombre: str | None = None
    subcategoria_nombre: str | None = None
    modalidades: list[ModalidadOut] = []
    calificacion_promedio: float | None = None
    creado_en: datetime
    actualizado_en: datetime
