"""Servicio para programación y ejecución de citas de servicio."""

import secrets
from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    ConflictException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.cita import CitaConfirmarRequest, CitaCreate, CitaOut, CitaUpdate


class CitasService:
    """Lógica de negocio para citas y coordinación de la ejecución."""

    def _ensamblar_cita(self, c: dict[str, Any]) -> CitaOut:
        est = next(
            (
                e
                for e in mock_db.estados_cita
                if e["estado_cita_id"] == c["estado_cita_id"]
            ),
            None,
        )
        sol = next(
            (
                s
                for s in mock_db.solicitudes_servicio
                if s["solicitud_servicio_id"] == c["solicitud_servicio_id"]
            ),
            None,
        )
        mod = (
            next(
                (
                    m
                    for m in mock_db.modalidades
                    if m["modalidad_id"] == sol["modalidad_id"]
                ),
                None,
            )
            if sol
            else None
        )
        srv = (
            next(
                (
                    s
                    for s in mock_db.servicios
                    if s["servicio_id"] == sol["servicio_id"]
                ),
                None,
            )
            if sol
            else None
        )

        return CitaOut(
            **c,
            estado_codigo=est["codigo"] if est else "DESCONOCIDO",
            modalidad_codigo=mod["codigo"] if mod else None,
            servicio_titulo=srv["titulo"] if srv else None,
        )

    def programar_cita(
        self, usuario_id: int, solicitud_id: int, data: CitaCreate
    ) -> CitaOut:
        sol = next(
            (
                s
                for s in mock_db.solicitudes_servicio
                if s["solicitud_servicio_id"] == solicitud_id
            ),
            None,
        )
        if not sol:
            raise EntityNotFoundException(f"Solicitud {solicitud_id} no encontrada.")

        srv = next(
            s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]
        )
        perfil = next(
            p
            for p in mock_db.perfiles_trabajador
            if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
        )

        # Solo el trabajador puede programar la cita
        if perfil["usuario_id"] != usuario_id:
            raise AuthorizationException(
                "Solo el trabajador asignado puede programar la cita."
            )

        # Regla: La solicitud debe estar ACEPTADA
        est_sol = next(
            e
            for e in mock_db.estados_solicitud
            if e["estado_solicitud_id"] == sol["estado_solicitud_id"]
        )
        if est_sol["codigo"] != "ACEPTADA":
            raise BusinessRuleException(
                "Solo se pueden programar citas para solicitudes en estado ACEPTADA."
            )

        # Regla: Máximo 1 cita por solicitud (UQ uq_citas_solicitud)
        if any(c["solicitud_servicio_id"] == solicitud_id for c in mock_db.citas):
            raise ConflictException(
                "Ya existe una cita programada para esta solicitud."
            )

        # Regla: Coherencia de modalidad (Trigger fn_validar_cita_contexto)
        mod = next(
            m for m in mock_db.modalidades if m["modalidad_id"] == sol["modalidad_id"]
        )
        if mod["codigo"] == "PRESENCIAL":
            dir_id = data.direccion_id or sol["direccion_id"]
            if not dir_id:
                raise BusinessRuleException(
                    "Una cita PRESENCIAL requiere una dirección válida."
                )
        else:
            dir_id = None

        estado_prog = next(
            e for e in mock_db.estados_cita if e["codigo"] == "PROGRAMADA"
        )
        codigo_confirmacion = f"CONF-{secrets.token_hex(4).upper()}"

        ahora = datetime.now(UTC)
        nueva_id = max([c["cita_id"] for c in mock_db.citas], default=0) + 1
        item: dict[str, Any] = {
            "cita_id": nueva_id,
            "solicitud_servicio_id": solicitud_id,
            "estado_cita_id": estado_prog["estado_cita_id"],
            "direccion_id": dir_id,
            "fecha_inicio": data.fecha_inicio,
            "fecha_fin": data.fecha_fin,
            "codigo_confirmacion": codigo_confirmacion,
            "plataforma_remota": data.plataforma_remota or sol.get("plataforma_remota"),
            "enlace_reunion": data.enlace_reunion,
            "creada_en": ahora,
            "actualizado_en": ahora,
        }
        mock_db.citas.append(item)
        return self._ensamblar_cita(item)

    def get_mis_citas(
        self, usuario_id: int, limit: int = 20, offset: int = 0
    ) -> list[CitaOut]:
        # El usuario puede ser cliente o trabajador
        solicitudes_cliente = {
            s["solicitud_servicio_id"]
            for s in mock_db.solicitudes_servicio
            if s["cliente_usuario_id"] == usuario_id
        }
        perfil = next(
            (p for p in mock_db.perfiles_trabajador if p["usuario_id"] == usuario_id),
            None,
        )
        solicitudes_trabajador = set()
        if perfil:
            srvs_trabajador = {
                s["servicio_id"]
                for s in mock_db.servicios
                if s["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]
            }
            solicitudes_trabajador = {
                s["solicitud_servicio_id"]
                for s in mock_db.solicitudes_servicio
                if s["servicio_id"] in srvs_trabajador
            }

        todas_solicitudes = solicitudes_cliente.union(solicitudes_trabajador)
        citas_usuario = [
            c for c in mock_db.citas if c["solicitud_servicio_id"] in todas_solicitudes
        ]
        return [self._ensamblar_cita(c) for c in citas_usuario][
            offset : offset + limit
        ]

    def get_cita_por_id(self, usuario_id: int, cita_id: int) -> CitaOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )
        srv = next(
            s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]
        )
        perfil = next(
            p
            for p in mock_db.perfiles_trabajador
            if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
        )

        es_cliente = sol["cliente_usuario_id"] == usuario_id
        es_trabajador = perfil["usuario_id"] == usuario_id
        es_admin = any(
            ur["usuario_id"] == usuario_id and ur["rol_id"] == 3
            for ur in mock_db.usuario_roles
        )

        if not (es_cliente or es_trabajador or es_admin):
            raise AuthorizationException(
                "No tienes permisos para ver el detalle de esta cita."
            )

        return self._ensamblar_cita(cita)

    def actualizar_cita(
        self, usuario_id: int, cita_id: int, data: CitaUpdate
    ) -> CitaOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )
        srv = next(
            s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]
        )
        perfil = next(
            p
            for p in mock_db.perfiles_trabajador
            if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
        )

        if perfil["usuario_id"] != usuario_id:
            raise AuthorizationException(
                "Solo el trabajador asignado puede reprogramar la cita."
            )

        if data.fecha_inicio is not None:
            cita["fecha_inicio"] = data.fecha_inicio
        if data.fecha_fin is not None:
            cita["fecha_fin"] = data.fecha_fin
        if data.plataforma_remota is not None:
            cita["plataforma_remota"] = data.plataforma_remota
        if data.enlace_reunion is not None:
            cita["enlace_reunion"] = data.enlace_reunion
        if data.direccion_id is not None:
            cita["direccion_id"] = data.direccion_id

        cita["actualizado_en"] = datetime.now(UTC)
        return self._ensamblar_cita(cita)

    def iniciar_cita(self, usuario_id: int, cita_id: int) -> CitaOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )
        srv = next(
            s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]
        )
        perfil = next(
            p
            for p in mock_db.perfiles_trabajador
            if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
        )

        if perfil["usuario_id"] != usuario_id:
            raise AuthorizationException(
                "Solo el trabajador puede marcar el inicio de la cita."
            )

        est_actual = next(
            e
            for e in mock_db.estados_cita
            if e["estado_cita_id"] == cita["estado_cita_id"]
        )
        if est_actual["codigo"] != "PROGRAMADA":
            raise BusinessRuleException(
                f"La cita no puede iniciarse desde el estado '{est_actual['codigo']}'."
            )

        est_ejec = next(
            e for e in mock_db.estados_cita if e["codigo"] == "EN_EJECUCION"
        )
        cita["estado_cita_id"] = est_ejec["estado_cita_id"]
        cita["actualizado_en"] = datetime.now(UTC)
        return self._ensamblar_cita(cita)

    def finalizar_cita(self, usuario_id: int, cita_id: int) -> CitaOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )
        srv = next(
            s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]
        )
        perfil = next(
            p
            for p in mock_db.perfiles_trabajador
            if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
        )

        if perfil["usuario_id"] != usuario_id:
            raise AuthorizationException(
                "Solo el trabajador puede marcar la finalización de la cita."
            )

        est_actual = next(
            e
            for e in mock_db.estados_cita
            if e["estado_cita_id"] == cita["estado_cita_id"]
        )
        if est_actual["codigo"] != "EN_EJECUCION":
            raise BusinessRuleException(
                "La cita debe estar EN_EJECUCION para poder finalizarse."
            )

        est_fin = next(e for e in mock_db.estados_cita if e["codigo"] == "FINALIZADA")
        ahora = datetime.now(UTC)
        cita["estado_cita_id"] = est_fin["estado_cita_id"]
        cita["fecha_fin"] = ahora
        cita["actualizado_en"] = ahora
        return self._ensamblar_cita(cita)

    def confirmar_cita(
        self, usuario_id: int, cita_id: int, data: CitaConfirmarRequest
    ) -> CitaOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        if cita["codigo_confirmacion"] != data.codigo_confirmacion.strip():
            raise BusinessRuleException(
                "El código de confirmación ingresado no es válido."
            )

        # Confirmación exitosa
        cita["actualizado_en"] = datetime.now(UTC)
        return self._ensamblar_cita(cita)


citas_service = CitasService()
