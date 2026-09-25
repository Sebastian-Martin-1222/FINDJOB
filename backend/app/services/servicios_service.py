"""Servicio de gestión y búsqueda de ofertas de servicios."""

from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.catalogo import ModalidadOut
from app.schemas.servicio import (
    ServicioCreate,
    ServicioOut,
    ServicioUpdate,
)


class ServiciosService:
    """Lógica de negocio para publicación, consulta y modalidades de servicios."""

    def _ensamblar_servicio(self, s: dict[str, Any]) -> ServicioOut:
        perfil = next(
            (
                p
                for p in mock_db.perfiles_trabajador
                if p["perfil_trabajador_id"] == s["perfil_trabajador_id"]
            ),
            None,
        )
        usr = (
            next(
                (
                    u
                    for u in mock_db.usuarios
                    if u["usuario_id"] == perfil["usuario_id"]
                ),
                None,
            )
            if perfil
            else None
        )

        subcat = next(
            (
                sc
                for sc in mock_db.subcategorias
                if sc["subcategoria_id"] == s["subcategoria_id"]
            ),
            None,
        )
        cat = (
            next(
                (
                    c
                    for c in mock_db.categorias
                    if c["categoria_id"] == subcat["categoria_id"]
                ),
                None,
            )
            if subcat
            else None
        )

        # Modalidades asociadas
        mods: list[ModalidadOut] = []
        for sm in mock_db.servicio_modalidades:
            if sm["servicio_id"] == s["servicio_id"]:
                m_item = next(
                    (
                        m
                        for m in mock_db.modalidades
                        if m["modalidad_id"] == sm["modalidad_id"]
                    ),
                    None,
                )
                if m_item:
                    mods.append(ModalidadOut(**m_item))

        # Calificación promedio de citas de este servicio
        solicitudes_ids = [
            sol["solicitud_servicio_id"]
            for sol in mock_db.solicitudes_servicio
            if sol["servicio_id"] == s["servicio_id"]
        ]
        citas_ids = [
            c["cita_id"]
            for c in mock_db.citas
            if c["solicitud_servicio_id"] in solicitudes_ids
        ]
        califs = [
            cal["puntuacion"]
            for cal in mock_db.calificaciones
            if cal["cita_id"] in citas_ids
        ]
        promedio = round(sum(califs) / len(califs), 2) if califs else None

        return ServicioOut(
            **s,
            trabajador_nombres=usr["nombres"] if usr else None,
            trabajador_apellidos=usr["apellidos"] if usr else None,
            categoria_nombre=cat["nombre"] if cat else None,
            subcategoria_nombre=subcat["nombre"] if subcat else None,
            modalidades=mods,
            calificacion_promedio=promedio,
        )

    def buscar_servicios(
        self,
        categoria_id: int | None = None,
        subcategoria_id: int | None = None,
        modalidad_id: int | None = None,
        ciudad_id: int | None = None,
        precio_max: Decimal | None = None,
        calificacion_min: float | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> list[ServicioOut]:
        resultados: list[ServicioOut] = []
        for s in mock_db.servicios:
            if not s.get("activo", True):
                continue

            subcat = next(
                (
                    sc
                    for sc in mock_db.subcategorias
                    if sc["subcategoria_id"] == s["subcategoria_id"]
                ),
                None,
            )
            if not subcat or not subcat.get("activa", True):
                continue

            if subcategoria_id and s["subcategoria_id"] != subcategoria_id:
                continue

            if categoria_id and subcat["categoria_id"] != categoria_id:
                continue

            if precio_max and s["precio_base"] > precio_max:
                continue

            if modalidad_id:
                tiene_mod = any(
                    sm["servicio_id"] == s["servicio_id"]
                    and sm["modalidad_id"] == modalidad_id
                    for sm in mock_db.servicio_modalidades
                )
                if not tiene_mod:
                    continue

            if ciudad_id:
                # Si se filtra por ciudad, el trabajador debe cubrirla o tenerla en su perfil
                perfil = next(
                    (
                        p
                        for p in mock_db.perfiles_trabajador
                        if p["perfil_trabajador_id"] == s["perfil_trabajador_id"]
                    ),
                    None,
                )
                if not perfil:
                    continue
                cubre_ciudad = any(
                    cob["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]
                    and cob["ciudad_id"] == ciudad_id
                    for cob in mock_db.coberturas
                ) or (perfil.get("ciudad_id") == ciudad_id)
                if not cubre_ciudad:
                    continue

            ensamblado = self._ensamblar_servicio(s)
            if calificacion_min and (
                ensamblado.calificacion_promedio is None
                or ensamblado.calificacion_promedio < calificacion_min
            ):
                continue

            resultados.append(ensamblado)

        return resultados[offset : offset + limit]

    def get_servicio_por_id(self, servicio_id: int) -> ServicioOut:
        for s in mock_db.servicios:
            if s["servicio_id"] == servicio_id and s.get("activo", True):
                return self._ensamblar_servicio(s)
        raise EntityNotFoundException(f"Servicio con ID {servicio_id} no encontrado.")

    def get_servicios_trabajador(
        self, usuario_id: int, limit: int = 20, offset: int = 0
    ) -> list[ServicioOut]:
        perfil = next(
            (p for p in mock_db.perfiles_trabajador if p["usuario_id"] == usuario_id),
            None,
        )
        if not perfil:
            raise EntityNotFoundException(
                "No tienes un perfil de trabajador configurado."
            )
        servicios = [
            s
            for s in mock_db.servicios
            if s["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]
            and s.get("activo", True)
        ]
        return [self._ensamblar_servicio(s) for s in servicios][
            offset : offset + limit
        ]

    def crear_servicio(self, usuario_id: int, data: ServicioCreate) -> ServicioOut:
        perfil = next(
            (p for p in mock_db.perfiles_trabajador if p["usuario_id"] == usuario_id),
            None,
        )
        if not perfil:
            raise BusinessRuleException(
                "Debes tener un perfil de trabajador activo antes de publicar un servicio."
            )

        if not any(
            sc["subcategoria_id"] == data.subcategoria_id
            for sc in mock_db.subcategorias
        ):
            raise EntityNotFoundException(
                f"La subcategoría {data.subcategoria_id} no existe."
            )

        for mod_id in data.modalidades_ids:
            if not any(m["modalidad_id"] == mod_id for m in mock_db.modalidades):
                raise EntityNotFoundException(f"La modalidad {mod_id} no existe.")

        ahora = datetime.now(UTC)
        nueva_id = max([s["servicio_id"] for s in mock_db.servicios], default=0) + 1
        item: dict[str, Any] = {
            "servicio_id": nueva_id,
            "perfil_trabajador_id": perfil["perfil_trabajador_id"],
            "subcategoria_id": data.subcategoria_id,
            "titulo": data.titulo,
            "descripcion": data.descripcion,
            "precio_base": data.precio_base,
            "tiempo_estimado_horas": data.tiempo_estimado_horas,
            "revisiones_incluidas": data.revisiones_incluidas,
            "activo": True,
            "creado_en": ahora,
            "actualizado_en": ahora,
        }
        mock_db.servicios.append(item)

        for mod_id in data.modalidades_ids:
            mock_db.servicio_modalidades.append(
                {"servicio_id": nueva_id, "modalidad_id": mod_id}
            )

        return self._ensamblar_servicio(item)

    def actualizar_servicio(
        self, usuario_id: int, servicio_id: int, data: ServicioUpdate
    ) -> ServicioOut:
        for s in mock_db.servicios:
            if s["servicio_id"] == servicio_id:
                perfil = next(
                    (
                        p
                        for p in mock_db.perfiles_trabajador
                        if p["perfil_trabajador_id"] == s["perfil_trabajador_id"]
                    ),
                    None,
                )
                if not perfil or perfil["usuario_id"] != usuario_id:
                    raise AuthorizationException(
                        "No tienes permiso para modificar este servicio."
                    )
                if data.subcategoria_id is not None:
                    if not any(
                        sc["subcategoria_id"] == data.subcategoria_id
                        for sc in mock_db.subcategorias
                    ):
                        raise EntityNotFoundException(
                            f"La subcategoría {data.subcategoria_id} no existe."
                        )
                    s["subcategoria_id"] = data.subcategoria_id
                if data.titulo is not None:
                    s["titulo"] = data.titulo
                if data.descripcion is not None:
                    s["descripcion"] = data.descripcion
                if data.precio_base is not None:
                    s["precio_base"] = data.precio_base
                if data.tiempo_estimado_horas is not None:
                    s["tiempo_estimado_horas"] = data.tiempo_estimado_horas
                if data.revisiones_incluidas is not None:
                    s["revisiones_incluidas"] = data.revisiones_incluidas
                if data.activo is not None:
                    s["activo"] = data.activo
                s["actualizado_en"] = datetime.now(UTC)
                return self._ensamblar_servicio(s)

        raise EntityNotFoundException(f"Servicio con ID {servicio_id} no encontrado.")

    def eliminar_servicio(self, usuario_id: int, servicio_id: int) -> None:
        for s in mock_db.servicios:
            if s["servicio_id"] == servicio_id:
                perfil = next(
                    (
                        p
                        for p in mock_db.perfiles_trabajador
                        if p["perfil_trabajador_id"] == s["perfil_trabajador_id"]
                    ),
                    None,
                )
                if not perfil or perfil["usuario_id"] != usuario_id:
                    raise AuthorizationException(
                        "No tienes permiso para desactivar este servicio."
                    )
                s["activo"] = False
                s["actualizado_en"] = datetime.now(UTC)
                return
        raise EntityNotFoundException(f"Servicio con ID {servicio_id} no encontrado.")

    def actualizar_modalidades_servicio(
        self, usuario_id: int, servicio_id: int, modalidades_ids: list[int]
    ) -> ServicioOut:
        s = next(
            (srv for srv in mock_db.servicios if srv["servicio_id"] == servicio_id),
            None,
        )
        if not s:
            raise EntityNotFoundException(
                f"Servicio con ID {servicio_id} no encontrado."
            )

        perfil = next(
            (
                p
                for p in mock_db.perfiles_trabajador
                if p["perfil_trabajador_id"] == s["perfil_trabajador_id"]
            ),
            None,
        )
        if not perfil or perfil["usuario_id"] != usuario_id:
            raise AuthorizationException(
                "No tienes permiso para configurar modalidades de este servicio."
            )

        for m_id in modalidades_ids:
            if not any(m["modalidad_id"] == m_id for m in mock_db.modalidades):
                raise EntityNotFoundException(f"La modalidad {m_id} no existe.")

        # Reemplazar modalidades del servicio
        mock_db.servicio_modalidades = [
            sm
            for sm in mock_db.servicio_modalidades
            if sm["servicio_id"] != servicio_id
        ]
        for m_id in modalidades_ids:
            mock_db.servicio_modalidades.append(
                {"servicio_id": servicio_id, "modalidad_id": m_id}
            )

        s["actualizado_en"] = datetime.now(UTC)
        return self._ensamblar_servicio(s)


servicios_service = ServiciosService()
