"""Servicio para perfiles de trabajador, habilidades, coberturas y reputación."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    BusinessRuleException,
    ConflictException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.calificacion import CalificacionOut
from app.schemas.catalogo import CiudadOut, HabilidadOut
from app.schemas.perfil import (
    CoberturaOut,
    PerfilTrabajadorCreate,
    PerfilTrabajadorOut,
    PerfilTrabajadorUpdate,
    UsuarioHabilidadCreate,
    UsuarioHabilidadOut,
)


class TrabajadoresService:
    """Lógica de negocio del prestador de servicios (Rol TRABAJADOR)."""

    def _calcular_reputacion(
        self, perfil_trabajador_id: int
    ) -> tuple[float | None, int]:
        """Calcula el promedio derivado de calificaciones de citas finalizadas."""
        # Obtener los servicios del trabajador
        servicios_ids = [
            s["servicio_id"]
            for s in mock_db.servicios
            if s["perfil_trabajador_id"] == perfil_trabajador_id
        ]
        # Obtener solicitudes de esos servicios
        solicitudes_ids = [
            sol["solicitud_servicio_id"]
            for sol in mock_db.solicitudes_servicio
            if sol["servicio_id"] in servicios_ids
        ]
        # Obtener citas de esas solicitudes
        citas_ids = [
            c["cita_id"]
            for c in mock_db.citas
            if c["solicitud_servicio_id"] in solicitudes_ids
        ]
        # Calificaciones de esas citas
        califs = [
            cal["puntuacion"]
            for cal in mock_db.calificaciones
            if cal["cita_id"] in citas_ids
        ]
        if not califs:
            return None, 0
        promedio = round(sum(califs) / len(califs), 2)
        return promedio, len(califs)

    def _ensamblar_perfil(self, perfil: dict[str, Any]) -> PerfilTrabajadorOut:
        usuario = next(
            (u for u in mock_db.usuarios if u["usuario_id"] == perfil["usuario_id"]),
            None,
        )
        nombres = usuario["nombres"] if usuario else None
        apellidos = usuario["apellidos"] if usuario else None

        # Habilidades
        habs_out: list[HabilidadOut] = []
        for uh in mock_db.usuario_habilidades:
            if uh["usuario_id"] == perfil["usuario_id"]:
                h_item = next(
                    (
                        h
                        for h in mock_db.habilidades
                        if h["habilidad_id"] == uh["habilidad_id"]
                    ),
                    None,
                )
                if h_item:
                    habs_out.append(HabilidadOut(**h_item))

        # Coberturas
        cobs_out: list[CiudadOut] = []
        for cob in mock_db.coberturas:
            if cob["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]:
                c_item = next(
                    (c for c in mock_db.ciudades if c["ciudad_id"] == cob["ciudad_id"]),
                    None,
                )
                if c_item:
                    cobs_out.append(CiudadOut(**c_item))

        promedio, total = self._calcular_reputacion(perfil["perfil_trabajador_id"])

        return PerfilTrabajadorOut(
            **perfil,
            nombres=nombres,
            apellidos=apellidos,
            calificacion_promedio=promedio,
            total_calificaciones=total,
            habilidades=habs_out,
            coberturas=cobs_out,
        )

    def get_perfil_publico(self, perfil_trabajador_id: int) -> PerfilTrabajadorOut:
        for p in mock_db.perfiles_trabajador:
            if p["perfil_trabajador_id"] == perfil_trabajador_id and p.get(
                "activo", True
            ):
                return self._ensamblar_perfil(p)
        raise EntityNotFoundException(
            f"Perfil de trabajador {perfil_trabajador_id} no encontrado."
        )

    def get_perfil_por_usuario(self, usuario_id: int) -> PerfilTrabajadorOut:
        for p in mock_db.perfiles_trabajador:
            if p["usuario_id"] == usuario_id:
                return self._ensamblar_perfil(p)
        raise EntityNotFoundException("No tienes un perfil de trabajador configurado.")

    def crear_perfil_trabajador(
        self, usuario_id: int, data: PerfilTrabajadorCreate
    ) -> PerfilTrabajadorOut:
        # Validar regla: El usuario debe tener rol TRABAJADOR (Trigger fn_validar_rol_trabajador)
        rol_trabajador = next(
            (r for r in mock_db.roles if r["codigo"] == "TRABAJADOR"), None
        )
        if not rol_trabajador:
            raise BusinessRuleException("Rol TRABAJADOR no configurado en catálogo.")

        tiene_rol = any(
            ur["usuario_id"] == usuario_id and ur["rol_id"] == rol_trabajador["rol_id"]
            for ur in mock_db.usuario_roles
        )
        if not tiene_rol:
            raise BusinessRuleException(
                "Para crear un perfil profesional primero debes contar con el rol TRABAJADOR asignado."
            )

        # Validar unicidad (uq_perfiles_trabajador_usuario)
        if any(p["usuario_id"] == usuario_id for p in mock_db.perfiles_trabajador):
            raise ConflictException(
                "Ya posees un perfil de trabajador creado. Debes editar el existente."
            )

        ahora = datetime.now(UTC)
        nueva_id = (
            max(
                [p["perfil_trabajador_id"] for p in mock_db.perfiles_trabajador],
                default=0,
            )
            + 1
        )
        item: dict[str, Any] = {
            "perfil_trabajador_id": nueva_id,
            "usuario_id": usuario_id,
            "ciudad_id": data.ciudad_id,
            "titulo_profesional": data.titulo_profesional,
            "descripcion_profesional": data.descripcion_profesional,
            "experiencia_resumen": data.experiencia_resumen,
            "activo": True,
            "creado_en": ahora,
            "actualizado_en": ahora,
        }
        mock_db.perfiles_trabajador.append(item)
        return self._ensamblar_perfil(item)

    def actualizar_perfil_trabajador(
        self, usuario_id: int, data: PerfilTrabajadorUpdate
    ) -> PerfilTrabajadorOut:
        for p in mock_db.perfiles_trabajador:
            if p["usuario_id"] == usuario_id:
                if data.ciudad_id is not None:
                    p["ciudad_id"] = data.ciudad_id
                if data.titulo_profesional is not None:
                    p["titulo_profesional"] = data.titulo_profesional
                if data.descripcion_profesional is not None:
                    p["descripcion_profesional"] = data.descripcion_profesional
                if data.experiencia_resumen is not None:
                    p["experiencia_resumen"] = data.experiencia_resumen
                p["actualizado_en"] = datetime.now(UTC)
                return self._ensamblar_perfil(p)
        raise EntityNotFoundException("No tienes un perfil de trabajador configurado.")

    def get_habilidades_propias(self, usuario_id: int) -> list[UsuarioHabilidadOut]:
        resultado: list[UsuarioHabilidadOut] = []
        for uh in mock_db.usuario_habilidades:
            if uh["usuario_id"] == usuario_id:
                h = next(
                    (
                        item
                        for item in mock_db.habilidades
                        if item["habilidad_id"] == uh["habilidad_id"]
                    ),
                    None,
                )
                nombre = h["nombre"] if h else None
                resultado.append(
                    UsuarioHabilidadOut(
                        usuario_id=uh["usuario_id"],
                        habilidad_id=uh["habilidad_id"],
                        nombre=nombre,
                        descripcion_competencia=uh.get("descripcion_competencia"),
                        registrada_en=uh["registrada_en"],
                    )
                )
        return resultado

    def asociar_habilidad(
        self, usuario_id: int, data: UsuarioHabilidadCreate
    ) -> UsuarioHabilidadOut:
        if not any(h["habilidad_id"] == data.habilidad_id for h in mock_db.habilidades):
            raise EntityNotFoundException(
                f"La habilidad {data.habilidad_id} no existe."
            )

        if any(
            uh["usuario_id"] == usuario_id and uh["habilidad_id"] == data.habilidad_id
            for uh in mock_db.usuario_habilidades
        ):
            raise ConflictException("Ya tienes vinculada esta habilidad profesional.")

        ahora = datetime.now(UTC)
        item = {
            "usuario_id": usuario_id,
            "habilidad_id": data.habilidad_id,
            "descripcion_competencia": data.descripcion_competencia,
            "registrada_en": ahora,
        }
        mock_db.usuario_habilidades.append(item)
        h = next(
            (
                item
                for item in mock_db.habilidades
                if item["habilidad_id"] == data.habilidad_id
            ),
            None,
        )
        return UsuarioHabilidadOut(
            usuario_id=usuario_id,
            habilidad_id=data.habilidad_id,
            nombre=h["nombre"] if h else None,
            descripcion_competencia=data.descripcion_competencia,
            registrada_en=ahora,
        )

    def retirar_habilidad(self, usuario_id: int, habilidad_id: int) -> None:
        inicial = len(mock_db.usuario_habilidades)
        mock_db.usuario_habilidades = [
            uh
            for uh in mock_db.usuario_habilidades
            if not (
                uh["usuario_id"] == usuario_id and uh["habilidad_id"] == habilidad_id
            )
        ]
        if len(mock_db.usuario_habilidades) == inicial:
            raise EntityNotFoundException("Habilidad no encontrada en tu perfil.")

    def get_coberturas_propias(self, usuario_id: int) -> list[CoberturaOut]:
        perfil = self.get_perfil_por_usuario(usuario_id)
        resultado: list[CoberturaOut] = []
        for cob in mock_db.coberturas:
            if cob["perfil_trabajador_id"] == perfil.perfil_trabajador_id:
                c = next(
                    (
                        item
                        for item in mock_db.ciudades
                        if item["ciudad_id"] == cob["ciudad_id"]
                    ),
                    None,
                )
                resultado.append(
                    CoberturaOut(
                        perfil_trabajador_id=cob["perfil_trabajador_id"],
                        ciudad_id=cob["ciudad_id"],
                        ciudad_nombre=c["nombre"] if c else None,
                    )
                )
        return resultado

    def agregar_cobertura(self, usuario_id: int, ciudad_id: int) -> CoberturaOut:
        perfil = self.get_perfil_por_usuario(usuario_id)
        c = next(
            (item for item in mock_db.ciudades if item["ciudad_id"] == ciudad_id), None
        )
        if not c:
            raise EntityNotFoundException(f"La ciudad {ciudad_id} no existe.")

        if any(
            cob["perfil_trabajador_id"] == perfil.perfil_trabajador_id
            and cob["ciudad_id"] == ciudad_id
            for cob in mock_db.coberturas
        ):
            raise ConflictException(
                "Esta ciudad ya se encuentra en tu cobertura presencial."
            )

        mock_db.coberturas.append(
            {
                "perfil_trabajador_id": perfil.perfil_trabajador_id,
                "ciudad_id": ciudad_id,
            }
        )
        return CoberturaOut(
            perfil_trabajador_id=perfil.perfil_trabajador_id,
            ciudad_id=ciudad_id,
            ciudad_nombre=c["nombre"],
        )

    def retirar_cobertura(self, usuario_id: int, ciudad_id: int) -> None:
        perfil = self.get_perfil_por_usuario(usuario_id)
        inicial = len(mock_db.coberturas)
        mock_db.coberturas = [
            cob
            for cob in mock_db.coberturas
            if not (
                cob["perfil_trabajador_id"] == perfil.perfil_trabajador_id
                and cob["ciudad_id"] == ciudad_id
            )
        ]
        if len(mock_db.coberturas) == inicial:
            raise EntityNotFoundException("Ciudad no encontrada en tu cobertura.")

    def get_calificaciones_publicas(
        self, perfil_trabajador_id: int
    ) -> list[CalificacionOut]:
        # Validar perfil
        self.get_perfil_publico(perfil_trabajador_id)
        servicios_ids = [
            s["servicio_id"]
            for s in mock_db.servicios
            if s["perfil_trabajador_id"] == perfil_trabajador_id
        ]
        solicitudes_ids = [
            sol["solicitud_servicio_id"]
            for sol in mock_db.solicitudes_servicio
            if sol["servicio_id"] in servicios_ids
        ]
        citas_dict = {
            c["cita_id"]: c
            for c in mock_db.citas
            if c["solicitud_servicio_id"] in solicitudes_ids
        }
        res: list[CalificacionOut] = []
        for cal in mock_db.calificaciones:
            if cal["cita_id"] in citas_dict:
                cita = citas_dict[cal["cita_id"]]
                sol = next(
                    s
                    for s in mock_db.solicitudes_servicio
                    if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
                )
                srv = next(
                    srv
                    for srv in mock_db.servicios
                    if srv["servicio_id"] == sol["servicio_id"]
                )
                usr_cliente = next(
                    u
                    for u in mock_db.usuarios
                    if u["usuario_id"] == sol["cliente_usuario_id"]
                )
                res.append(
                    CalificacionOut(
                        calificacion_id=cal["calificacion_id"],
                        cita_id=cal["cita_id"],
                        puntuacion=cal["puntuacion"],
                        comentario=cal.get("comentario"),
                        cliente_nombre=f"{usr_cliente['nombres']} {usr_cliente['apellidos']}",
                        servicio_titulo=srv["titulo"],
                        creada_en=cal["creada_en"],
                    )
                )
        return res


trabajadores_service = TrabajadoresService()
