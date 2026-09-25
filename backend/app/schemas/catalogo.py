"""Esquemas de catálogos y entidades geográficas del modelo FindJob."""

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import BaseInputSchema


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

class HabilidadBase(BaseInputSchema):
    nombre: str = Field(..., max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool = True


class HabilidadCreate(HabilidadBase):
    pass


class HabilidadUpdate(BaseInputSchema):
    nombre: str | None = Field(None, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool | None = None


class HabilidadOut(HabilidadBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    habilidad_id: int


class CategoriaBase(BaseInputSchema):
    nombre: str = Field(..., max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool = True


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(BaseInputSchema):
    nombre: str | None = Field(None, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool | None = None


class CategoriaOut(CategoriaBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
    categoria_id: int


class SubcategoriaBase(BaseInputSchema):
    categoria_id: int
    nombre: str = Field(..., max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool = True


class SubcategoriaCreate(SubcategoriaBase):
    pass


class SubcategoriaUpdate(BaseInputSchema):
    nombre: str | None = Field(None, max_length=120)
    descripcion: str | None = Field(None, max_length=500)
    activa: bool | None = None


class SubcategoriaOut(SubcategoriaBase):
    model_config = ConfigDict(from_attributes=True, extra="ignore")
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
