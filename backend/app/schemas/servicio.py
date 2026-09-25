"""Esquemas para servicios y modalidades ofertadas."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalogo import ModalidadOut


class ServicioBase(BaseModel):
    subcategoria_id: int
    titulo: str = Field(..., max_length=180)
    descripcion: str
    precio_base: Decimal = Field(..., gt=Decimal('0'))
    tiempo_estimado_horas: int = Field(..., ge=1, le=8760)
    revisiones_incluidas: int = Field(default=0, ge=0)


class ServicioCreate(ServicioBase):
    modalidades_ids: List[int] = Field(..., min_length=1)


class ServicioUpdate(BaseModel):
    subcategoria_id: Optional[int] = None
    titulo: Optional[str] = Field(None, max_length=180)
    descripcion: Optional[str] = None
    precio_base: Optional[Decimal] = Field(None, gt=Decimal('0'))
    tiempo_estimado_horas: Optional[int] = Field(None, ge=1, le=8760)
    revisiones_incluidas: Optional[int] = Field(None, ge=0)
    activo: Optional[bool] = None


class ServicioModalidadesUpdate(BaseModel):
    modalidades_ids: List[int] = Field(..., min_length=1)


class ServicioOut(ServicioBase):
    model_config = ConfigDict(from_attributes=True)
    servicio_id: int
    perfil_trabajador_id: int
    activo: bool
    trabajador_nombres: Optional[str] = None
    trabajador_apellidos: Optional[str] = None
    categoria_nombre: Optional[str] = None
    subcategoria_nombre: Optional[str] = None
    modalidades: List[ModalidadOut] = []
    calificacion_promedio: Optional[float] = None
    creado_en: datetime
    actualizado_en: datetime