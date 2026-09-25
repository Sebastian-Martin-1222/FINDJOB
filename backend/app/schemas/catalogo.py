"""Esquemas de catálogos y entidades geográficas del modelo FindJob."""

from pydantic import BaseModel, ConfigDict, Field


class PaisOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    pais_id: int
    codigo_iso2: str
    nombre: str


class RegionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    region_id: int
    pais_id: int
    nombre: str
    codigo: str | None = None


class CiudadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    ciudad_id: int
    region_id: int
    nombre: str
    codigo_externo: str | None = None


class RolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    rol_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None


class HabilidadBase(BaseModel):
    nombre: str = Field(..., max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool = True


class HabilidadCreate(HabilidadBase):
    pass


class HabilidadUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool | None = None


class HabilidadOut(HabilidadBase):
    model_config = ConfigDict(from_attributes=True)
    habilidad_id: int


class CategoriaBase(BaseModel):
    nombre: str = Field(..., max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool | None = None


class CategoriaOut(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    categoria_id: int


class SubcategoriaBase(BaseModel):
    categoria_id: int
    nombre: str = Field(..., max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool = True


class SubcategoriaCreate(SubcategoriaBase):
    pass


class SubcategoriaUpdate(BaseModel):
    nombre: str | None = Field(None, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool | None = None


class SubcategoriaOut(SubcategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    subcategoria_id: int


class ModalidadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    modalidad_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None


class EstadoSolicitudOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    estado_solicitud_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None


class EstadoCitaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    estado_cita_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None


class MetodoPagoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    metodo_pago_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None
    activo: bool


class EstadoPagoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    estado_pago_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None


class TipoMensajeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    tipo_mensaje_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None


class TipoAlertaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    tipo_alerta_id: int
    codigo: str
    nombre: str
    descripcion: str | None = None
