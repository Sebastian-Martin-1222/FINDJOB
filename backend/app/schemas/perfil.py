"""Esquemas de perfil profesional del trabajador, habilidades y coberturas."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.catalogo import CiudadOut, HabilidadOut
from app.schemas.common import BaseInputSchema


class PerfilTrabajadorBase(BaseInputSchema):
    ciudad_id: int | None = None
    titulo_profesional: str | None = Field(None, max_length=160)
    descripcion_profesional: str | None = None
    experiencia_resumen: str | None = None


class PerfilTrabajadorCreate(PerfilTrabajadorBase):
    pass


class PerfilTrabajadorUpdate(PerfilTrabajadorBase):
    pass


class PerfilTrabajadorOut(PerfilTrabajadorBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    perfil_trabajador_id: int
    usuario_id: int
    activo: bool
    nombres: str | None = None
    apellidos: str | None = None
    calificacion_promedio: float | None = None
    total_calificaciones: int = 0
    habilidades: list[HabilidadOut] = []
    coberturas: list[CiudadOut] = []
    creado_en: datetime
    actualizado_en: datetime


class UsuarioHabilidadCreate(BaseInputSchema):
    habilidad_id: int
    descripcion_competencia: str | None = Field(None, max_length=500)


class UsuarioHabilidadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    usuario_id: int
    habilidad_id: int
    nombre: str | None = None
    descripcion_competencia: str | None = None
    registrada_en: datetime


class CoberturaCreate(BaseInputSchema):
    ciudad_id: int


class CoberturaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    perfil_trabajador_id: int
    ciudad_id: int
    ciudad_nombre: str | None = None
