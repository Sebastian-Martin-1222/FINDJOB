"""Esquemas para usuarios, roles y direcciones."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class UsuarioBase(BaseModel):
    email: str = Field(
        ...,
        max_length=254,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Dirección de correo electrónico válida",
    )
    nombres: str = Field(..., max_length=100)
    apellidos: str = Field(..., max_length=100)
    telefono: str | None = Field(None, max_length=20)


class UsuarioUpdate(BaseModel):
    nombres: str | None = Field(None, max_length=100)
    apellidos: str | None = Field(None, max_length=100)
    telefono: str | None = Field(None, max_length=20)


class UsuarioEstadoUpdate(BaseModel):
    activo: bool


class UsuarioRolesUpdate(BaseModel):
    roles_ids: list[int]


class UsuarioOut(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)
    usuario_id: int
    uid_autenticacion: str | None = None
    activo: bool
    roles: list[str] = []
    creado_en: datetime
    actualizado_en: datetime


class DireccionBase(BaseModel):
    ciudad_id: int
    alias: str = Field(..., max_length=80)
    linea_direccion: str = Field(..., max_length=250)
    complemento: str | None = Field(None, max_length=150)
    referencia: str | None = Field(None, max_length=250)
    codigo_postal: str | None = Field(None, max_length=20)
    latitud: Decimal | None = Field(None, ge=-90, le=90)
    longitud: Decimal | None = Field(None, ge=-180, le=180)


class DireccionCreate(DireccionBase):
    pass


class DireccionUpdate(BaseModel):
    ciudad_id: int | None = None
    alias: str | None = Field(None, max_length=80)
    linea_direccion: str | None = Field(None, max_length=250)
    complemento: str | None = Field(None, max_length=150)
    referencia: str | None = Field(None, max_length=250)
    codigo_postal: str | None = Field(None, max_length=20)
    latitud: Decimal | None = Field(None, ge=-90, le=90)
    longitud: Decimal | None = Field(None, ge=-180, le=180)
    activa: bool | None = None


class DireccionOut(DireccionBase):
    model_config = ConfigDict(from_attributes=True)
    direccion_id: int
    usuario_id: int
    activa: bool
    creado_en: datetime
    actualizado_en: datetime
