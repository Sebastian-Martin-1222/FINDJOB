"""Esquemas para usuarios, roles y direcciones."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional

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
    telefono: Optional[str] = Field(None, max_length=20)


class UsuarioUpdate(BaseModel):
    nombres: Optional[str] = Field(None, max_length=100)
    apellidos: Optional[str] = Field(None, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)


class UsuarioEstadoUpdate(BaseModel):
    activo: bool


class UsuarioRolesUpdate(BaseModel):
    roles_ids: List[int]


class UsuarioOut(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)
    usuario_id: int
    uid_autenticacion: Optional[str] = None
    activo: bool
    roles: List[str] = []
    creado_en: datetime
    actualizado_en: datetime


class DireccionBase(BaseModel):
    ciudad_id: int
    alias: str = Field(..., max_length=80)
    linea_direccion: str = Field(..., max_length=250)
    complemento: Optional[str] = Field(None, max_length=150)
    referencia: Optional[str] = Field(None, max_length=250)
    codigo_postal: Optional[str] = Field(None, max_length=20)
    latitud: Optional[Decimal] = Field(None, ge=Decimal('-90'), le=Decimal('90'))
    longitud: Optional[Decimal] = Field(None, ge=Decimal('-180'), le=Decimal('180'))


class DireccionCreate(DireccionBase):
    pass


class DireccionUpdate(BaseModel):
    ciudad_id: Optional[int] = None
    alias: Optional[str] = Field(None, max_length=80)
    linea_direccion: Optional[str] = Field(None, max_length=250)
    complemento: Optional[str] = Field(None, max_length=150)
    referencia: Optional[str] = Field(None, max_length=250)
    codigo_postal: Optional[str] = Field(None, max_length=20)
    latitud: Optional[Decimal] = Field(None, ge=Decimal('-90'), le=Decimal('90'))
    longitud: Optional[Decimal] = Field(None, ge=Decimal('-180'), le=Decimal('180'))
    activa: Optional[bool] = None


class DireccionOut(DireccionBase):
    model_config = ConfigDict(from_attributes=True)
    direccion_id: int
    usuario_id: int
    activa: bool
    creado_en: datetime
    actualizado_en: datetime