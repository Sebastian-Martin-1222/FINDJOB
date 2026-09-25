"""Servicio para calificaciones y reputación de servicios."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    ConflictException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.calificacion import CalificacionCreate, CalificacionOut


class CalificacionesService:
    """Lógica de negocio para calificaciones de 1 a 5 estrellas."""

    def _ensamblar_calificacion(self, cal: dict[str, Any]) -> CalificacionOut:
        cita = next(c for c in mock_db.citas if c["cita_id"] == cal["cita_id"])
        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )
        srv = next(
            s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]
        )
        cli = next(
            u for u in mock_db.usuarios if u["usuario_id"] == sol["cliente_usuario_id"]
        )

        return CalificacionOut(
            calificacion_id=cal["calificacion_id"],
            cita_id=cal["cita_id"],
            puntuacion=cal["puntuacion"],
            comentario=cal.get("comentario"),
            cliente_nombre=f"{cli['nombres']} {cli['apellidos']}",
            servicio_titulo=srv["titulo"],
            creada_en=cal["creada_en"],
        )

    def calificar_cita(
        self, usuario_id: int, cita_id: int, data: CalificacionCreate
    ) -> CalificacionOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )

        # Regla: Solo el cliente que contrató el servicio puede calificar
        if sol["cliente_usuario_id"] != usuario_id:
            raise AuthorizationException(
                "Solo el cliente que solicitó el servicio puede calificar la cita."
            )

        # Regla 1: Solo cita FINALIZADA (Trigger fn_validar_calificacion_finalizada)
        est_cita = next(
            e
            for e in mock_db.estados_cita
            if e["estado_cita_id"] == cita["estado_cita_id"]
        )
        if est_cita["codigo"] != "FINALIZADA":
            raise BusinessRuleException(
                "Solo se pueden calificar citas en estado FINALIZADA."
            )

        # Regla 2: Una sola calificación por cita (UQ uq_calificaciones_cita)
        if any(c["cita_id"] == cita_id for c in mock_db.calificaciones):
            raise ConflictException("Ya has calificado esta cita previamente.")

        ahora = datetime.now(UTC)
        nueva_id = (
            max([c["calificacion_id"] for c in mock_db.calificaciones], default=0) + 1
        )
        item: dict[str, Any] = {
            "calificacion_id": nueva_id,
            "cita_id": cita_id,
            "puntuacion": data.puntuacion,
            "comentario": data.comentario,
            "creada_en": ahora,
        }
        mock_db.calificaciones.append(item)
        return self._ensamblar_calificacion(item)

    def get_calificaciones_recibidas_trabajador(
        self, usuario_id: int, limit: int = 20, offset: int = 0
    ) -> list[CalificacionOut]:
        perfil = next(
            (p for p in mock_db.perfiles_trabajador if p["usuario_id"] == usuario_id),
            None,
        )
        if not perfil:
            return []
        srvs_ids = {
            s["servicio_id"]
            for s in mock_db.servicios
            if s["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]
        }
        sols_ids = {
            s["solicitud_servicio_id"]
            for s in mock_db.solicitudes_servicio
            if s["servicio_id"] in srvs_ids
        }
        citas_ids = {
            c["cita_id"]
            for c in mock_db.citas
            if c["solicitud_servicio_id"] in sols_ids
        }

        califs = [c for c in mock_db.calificaciones if c["cita_id"] in citas_ids]
        return [self._ensamblar_calificacion(c) for c in califs][
            offset : offset + limit
        ]


calificaciones_service = CalificacionesService()
