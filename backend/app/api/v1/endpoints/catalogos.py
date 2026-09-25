"""Endpoints públicos para catálogos del marketplace."""

from fastapi import APIRouter

from app.schemas.catalogo import (
    CategoriaOut,
    CiudadOut,
    HabilidadOut,
    ModalidadOut,
    SubcategoriaOut,
)
from app.services.catalogos_service import catalogos_service

router = APIRouter(tags=["Catálogos y Geografía"])


@router.get("/categorias", response_model=list[CategoriaOut])
def listar_categorias() -> list[CategoriaOut]:
    """Listar categorías activas del marketplace."""
    return catalogos_service.get_categorias(solo_activas=True)


@router.get(
    "/categorias/{categoria_id}/subcategorias", response_model=list[SubcategoriaOut]
)
def consultar_subcategorias(categoria_id: int) -> list[SubcategoriaOut]:
    """Consultar subcategorías pertenecientes a una categoría."""
    return catalogos_service.get_subcategorias_por_categoria(
        categoria_id, solo_activas=True
    )


@router.get("/modalidades", response_model=list[ModalidadOut])
def consultar_modalidades() -> list[ModalidadOut]:
    """Consultar modalidades de prestación disponibles (REMOTO, PRESENCIAL)."""
    return catalogos_service.get_modalidades()


@router.get("/ciudades", response_model=list[CiudadOut])
def consultar_ciudades() -> list[CiudadOut]:
    """Consultar ciudades disponibles para cobertura geográfica."""
    return catalogos_service.get_ciudades()


@router.get("/habilidades", response_model=list[HabilidadOut])
def consultar_habilidades() -> list[HabilidadOut]:
    """Consultar catálogo de habilidades profesionales."""
    return catalogos_service.get_habilidades(solo_activas=True)
