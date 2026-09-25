"""Servicio de catálogos y referencias geográficas."""

from typing import Any

from app.core.exceptions import ConflictException, EntityNotFoundException
from app.mocks.mock_db import mock_db
from app.schemas.catalogo import (
    CategoriaCreate,
    CategoriaOut,
    CategoriaUpdate,
    CiudadOut,
    HabilidadCreate,
    HabilidadOut,
    HabilidadUpdate,
    ModalidadOut,
    SubcategoriaCreate,
    SubcategoriaOut,
    SubcategoriaUpdate,
)


class CatalogosService:
    """Lógica de negocio para catálogos y datos maestros."""

    def get_categorias(self, solo_activas: bool = True) -> list[CategoriaOut]:
        categorias = [
            c for c in mock_db.categorias if not solo_activas or c.get("activa", True)
        ]
        return [CategoriaOut(**c) for c in categorias]

    def get_subcategorias_por_categoria(
        self, categoria_id: int, solo_activas: bool = True
    ) -> list[SubcategoriaOut]:
        # Validar si existe la categoría
        if not any(c["categoria_id"] == categoria_id for c in mock_db.categorias):
            raise EntityNotFoundException(
                f"La categoría con ID {categoria_id} no existe."
            )
        subs = [
            s
            for s in mock_db.subcategorias
            if s["categoria_id"] == categoria_id
            and (not solo_activas or s.get("activa", True))
        ]
        return [SubcategoriaOut(**s) for s in subs]

    def get_modalidades(self) -> list[ModalidadOut]:
        return [ModalidadOut(**m) for m in mock_db.modalidades]

    def get_ciudades(self) -> list[CiudadOut]:
        return [CiudadOut(**c) for c in mock_db.ciudades]

    def get_habilidades(self, solo_activas: bool = True) -> list[HabilidadOut]:
        habs = [
            h for h in mock_db.habilidades if not solo_activas or h.get("activa", True)
        ]
        return [HabilidadOut(**h) for h in habs]

    def crear_categoria(self, data: CategoriaCreate) -> CategoriaOut:
        if any(c["nombre"].lower() == data.nombre.lower() for c in mock_db.categorias):
            raise ConflictException(
                f"Ya existe una categoría con nombre '{data.nombre}'."
            )
        nueva_id = max([c["categoria_id"] for c in mock_db.categorias], default=0) + 1
        item: dict[str, Any] = {
            "categoria_id": nueva_id,
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "activa": data.activa,
        }
        mock_db.categorias.append(item)
        return CategoriaOut(**item)

    def actualizar_categoria(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaOut:
        for c in mock_db.categorias:
            if c["categoria_id"] == categoria_id:
                if data.nombre is not None:
                    c["nombre"] = data.nombre
                if data.descripcion is not None:
                    c["descripcion"] = data.descripcion
                if data.activa is not None:
                    c["activa"] = data.activa
                return CategoriaOut(**c)
        raise EntityNotFoundException(f"Categoría con ID {categoria_id} no encontrada.")

    def crear_subcategoria(self, data: SubcategoriaCreate) -> SubcategoriaOut:
        if not any(c["categoria_id"] == data.categoria_id for c in mock_db.categorias):
            raise EntityNotFoundException(
                f"La categoría padre {data.categoria_id} no existe."
            )
        if any(
            s["categoria_id"] == data.categoria_id
            and s["nombre"].lower() == data.nombre.lower()
            for s in mock_db.subcategorias
        ):
            raise ConflictException(
                f"Ya existe una subcategoría '{data.nombre}' en esa categoría."
            )
        nueva_id = (
            max([s["subcategoria_id"] for s in mock_db.subcategorias], default=0) + 1
        )
        item: dict[str, Any] = {
            "subcategoria_id": nueva_id,
            "categoria_id": data.categoria_id,
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "activa": data.activa,
        }
        mock_db.subcategorias.append(item)
        return SubcategoriaOut(**item)

    def actualizar_subcategoria(
        self, subcategoria_id: int, data: SubcategoriaUpdate
    ) -> SubcategoriaOut:
        for s in mock_db.subcategorias:
            if s["subcategoria_id"] == subcategoria_id:
                if data.nombre is not None:
                    s["nombre"] = data.nombre
                if data.descripcion is not None:
                    s["descripcion"] = data.descripcion
                if data.activa is not None:
                    s["activa"] = data.activa
                return SubcategoriaOut(**s)
        raise EntityNotFoundException(
            f"Subcategoría con ID {subcategoria_id} no encontrada."
        )

    def crear_habilidad(self, data: HabilidadCreate) -> HabilidadOut:
        if any(h["nombre"].lower() == data.nombre.lower() for h in mock_db.habilidades):
            raise ConflictException(
                f"Ya existe una habilidad con nombre '{data.nombre}'."
            )
        nueva_id = max([h["habilidad_id"] for h in mock_db.habilidades], default=0) + 1
        item: dict[str, Any] = {
            "habilidad_id": nueva_id,
            "nombre": data.nombre,
            "descripcion": data.descripcion,
            "activa": data.activa,
        }
        mock_db.habilidades.append(item)
        return HabilidadOut(**item)

    def actualizar_habilidad(
        self, habilidad_id: int, data: HabilidadUpdate
    ) -> HabilidadOut:
        for h in mock_db.habilidades:
            if h["habilidad_id"] == habilidad_id:
                if data.nombre is not None:
                    h["nombre"] = data.nombre
                if data.descripcion is not None:
                    h["descripcion"] = data.descripcion
                if data.activa is not None:
                    h["activa"] = data.activa
                return HabilidadOut(**h)
        raise EntityNotFoundException(f"Habilidad con ID {habilidad_id} no encontrada.")


catalogos_service = CatalogosService()
