"""Servicio de solicitudes de contratación y ciclo de vida de la postulación."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.solicitud import (
    SolicitudServicioCreate,
    SolicitudServicioOut,
)


class SolicitudesService:
    """Lógica de negocio para solicitudes de servicio con validaciones de 3FN."""

    def _ensamblar_solicitud(self, sol: dict[str, Any]) -> SolicitudServicioOut:
        srv = next(
            (s for s in mock_db.servicios if s["servicio_id"] == sol["servicio_id"]),
            None,
        )
        est = next(
            (
                e
                for e in mock_db.estados_solicitud
                if e["estado_solicitud_id"] == sol["estado_solicitud_id"]
            ),
            None,
        )
        cli = next(
            (
                u
                for u in mock_db.usuarios
                if u["usuario_id"] == sol["cliente_usuario_id"]
            ),
            None,
        )
        perfil = (
            next(
                (
                    p
                    for p in mock_db.perfiles_trabajador
                    if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
                ),
                None,
            )
            if srv
            else None
        )
        trabajador = (
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

        return SolicitudServicioOut(
            **sol,
            estado_codigo=est["codigo"] if est else "DESCONOCIDO",
            servicio_titulo=srv["titulo"] if srv else None,
            cliente_nombre=f"{cli['nombres']} {cli['apellidos']}" if cli else None,
            trabajador_nombre=f"{trabajador['nombres']} {trabajador['apellidos']}"
            if trabajador
            else None,
        )

    def crear_solicitud(
        self, cliente_usuario_id: int, data: SolicitudServicioCreate
    ) -> SolicitudServicioOut:
        srv = next(
            (
                s
                for s in mock_db.servicios
                if s["servicio_id"] == data.servicio_id and s.get("activo", True)
            ),
            None,
        )
        if not srv:
            raise EntityNotFoundException(
                f"Servicio {data.servicio_id} no encontrado o inactivo."
            )

        perfil = next(
            (
                p
                for p in mock_db.perfiles_trabajador
                if p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]
            ),
            None,
        )
        # Regla 1: No contratar servicio propio (Trigger fn_validar_solicitud_contexto)
        if perfil and perfil["usuario_id"] == cliente_usuario_id:
            raise BusinessRuleException(
                "Un usuario no puede solicitar o contratar su propio servicio."
            )

        # Regla 2: Validar que el servicio soporte la modalidad solicitada (FK compuesta)
        soporta_modalidad = any(
            sm["servicio_id"] == data.servicio_id
            and sm["modalidad_id"] == data.modalidad_id
            for sm in mock_db.servicio_modalidades
        )
        if not soporta_modalidad:
            raise BusinessRuleException(
                "La modalidad solicitada no está habilitada para este servicio."
            )

        modalidad = next(
            (m for m in mock_db.modalidades if m["modalidad_id"] == data.modalidad_id),
            None,
        )
        codigo_modalidad = modalidad["codigo"] if modalidad else ""

        # Regla 3: Solicitud presencial requiere dirección del cliente
        if codigo_modalidad == "PRESENCIAL":
            if not data.direccion_id:
                raise BusinessRuleException(
                    "Las solicitudes para servicios de modalidad PRESENCIAL requieren una dirección del cliente."
                )
            dir_cliente = next(
                (
                    d
                    for d in mock_db.direcciones
                    if d["direccion_id"] == data.direccion_id and d.get("activa", True)
                ),
                None,
            )
            if not dir_cliente or dir_cliente["usuario_id"] != cliente_usuario_id:
                raise BusinessRuleException(
                    "La dirección seleccionada debe pertenecer al cliente solicitante."
                )

        # Regla 4: Solicitud remota no utiliza dirección
        if codigo_modalidad == "REMOTO" and data.direccion_id is not None:
            raise BusinessRuleException(
                "Las solicitudes para servicios de modalidad REMOTA no deben asociar una dirección física."
            )

        estado_pendiente = next(
            (e for e in mock_db.estados_solicitud if e["codigo"] == "PENDIENTE"),
            None,
        )
        estado_id = estado_pendiente["estado_solicitud_id"] if estado_pendiente else 1

        ahora = datetime.now(UTC)
        nueva_id = (
            max(
                [s["solicitud_servicio_id"] for s in mock_db.solicitudes_servicio],
                default=0,
            )
            + 1
        )
        item: dict[str, Any] = {
            "solicitud_servicio_id": nueva_id,
            "cliente_usuario_id": cliente_usuario_id,
            "servicio_id": data.servicio_id,
            "modalidad_id": data.modalidad_id,
            "estado_solicitud_id": estado_id,
            "direccion_id": data.direccion_id
            if codigo_modalidad == "PRESENCIAL"
            else None,
            "descripcion_necesidad": data.descripcion_necesidad,
            "fecha_propuesta": data.fecha_propuesta,
            "valor_acordado": data.valor_acordado or srv["precio_base"],
            "plataforma_remota": data.plataforma_remota,
            "creada_en": ahora,
            "respondida_en": None,
            "actualizado_en": ahora,
        }
        mock_db.solicitudes_servicio.append(item)
        return self._ensamblar_solicitud(item)

    def get_mis_solicitudes(
        self, cliente_usuario_id: int, limit: int = 20, offset: int = 0
    ) -> list[SolicitudServicioOut]:
        solicitudes = [
            s
            for s in mock_db.solicitudes_servicio
            if s["cliente_usuario_id"] == cliente_usuario_id
        ]
        return [self._ensamblar_solicitud(s) for s in solicitudes][
            offset : offset + limit
        ]

    def get_solicitudes_recibidas(
        self, trabajador_usuario_id: int, limit: int = 20, offset: int = 0
    ) -> list[SolicitudServicioOut]:
        perfil = next(
            (
                p
                for p in mock_db.perfiles_trabajador
                if p["usuario_id"] == trabajador_usuario_id
            ),
            None,
        )
        if not perfil:
            return []
        servicios_propios = {
            s["servicio_id"]
            for s in mock_db.servicios
            if s["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]
        }
        solicitudes = [
            s
            for s in mock_db.solicitudes_servicio
            if s["servicio_id"] in servicios_propios
        ]
        return [self._ensamblar_solicitud(s) for s in solicitudes][
            offset : offset + limit
        ]

    def get_solicitud_por_id(
        self, usuario_id: int, solicitud_id: int
    ) -> SolicitudServicioOut:
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

        # Autorización por recurso: solo cliente o trabajador relacionado
        es_cliente = sol["cliente_usuario_id"] == usuario_id
        es_trabajador = perfil["usuario_id"] == usuario_id
        es_admin = any(
            ur["usuario_id"] == usuario_id and ur["rol_id"] == 3
            for ur in mock_db.usuario_roles
        )
        if not (es_cliente or es_trabajador or es_admin):
            raise AuthorizationException(
                "No tienes permisos para consultar esta solicitud de servicio."
            )

        return self._ensamblar_solicitud(sol)

    def responder_solicitud(
        self, trabajador_usuario_id: int, solicitud_id: int, aceptar: bool
    ) -> SolicitudServicioOut:
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

        if perfil["usuario_id"] != trabajador_usuario_id:
            raise AuthorizationException(
                "Solo el trabajador asignado puede responder esta solicitud."
            )

        estado_actual = next(
            e
            for e in mock_db.estados_solicitud
            if e["estado_solicitud_id"] == sol["estado_solicitud_id"]
        )
        if estado_actual["codigo"] != "PENDIENTE":
            raise BusinessRuleException(
                f"La solicitud ya se encuentra en estado '{estado_actual['codigo']}' y no puede ser modificada."
            )

        nuevo_codigo = "ACEPTADA" if aceptar else "RECHAZADA"
        nuevo_estado = next(
            e for e in mock_db.estados_solicitud if e["codigo"] == nuevo_codigo
        )

        ahora = datetime.now(UTC)
        sol["estado_solicitud_id"] = nuevo_estado["estado_solicitud_id"]
        sol["respondida_en"] = ahora
        sol["actualizado_en"] = ahora

        # Regla: Si se acepta, se habilita automáticamente la conversación interna de chat si no existe
        if aceptar and not any(
            c["solicitud_servicio_id"] == solicitud_id
            for c in mock_db.conversaciones
        ):
            nueva_conv_id = (
                max(
                    [c["conversacion_id"] for c in mock_db.conversaciones],
                    default=0,
                )
                + 1
            )
            mock_db.conversaciones.append(
                {
                    "conversacion_id": nueva_conv_id,
                    "solicitud_servicio_id": solicitud_id,
                    "creada_en": ahora,
                    "cerrada_en": None,
                }
            )
            # Registrar cliente y trabajador como participantes autorizados
            mock_db.participantes_conversacion.append(
                {
                    "conversacion_id": nueva_conv_id,
                    "usuario_id": sol["cliente_usuario_id"],
                    "unido_en": ahora,
                    "salido_en": None,
                }
            )
            mock_db.participantes_conversacion.append(
                {
                    "conversacion_id": nueva_conv_id,
                    "usuario_id": trabajador_usuario_id,
                    "unido_en": ahora,
                    "salido_en": None,
                }
            )

        return self._ensamblar_solicitud(sol)

    def cancelar_solicitud(
        self, cliente_usuario_id: int, solicitud_id: int
    ) -> SolicitudServicioOut:
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

        if sol["cliente_usuario_id"] != cliente_usuario_id:
            raise AuthorizationException(
                "Solo el cliente propietario puede cancelar la solicitud."
            )

        estado_actual = next(
            e
            for e in mock_db.estados_solicitud
            if e["estado_solicitud_id"] == sol["estado_solicitud_id"]
        )
        if estado_actual["codigo"] in ["CANCELADA", "RECHAZADA"]:
            raise BusinessRuleException(
                f"La solicitud ya se encuentra en estado '{estado_actual['codigo']}'."
            )

        # Verificar si ya existe cita en ejecución
        cita = next(
            (c for c in mock_db.citas if c["solicitud_servicio_id"] == solicitud_id),
            None,
        )
        if cita:
            est_cita = next(
                e
                for e in mock_db.estados_cita
                if e["estado_cita_id"] == cita["estado_cita_id"]
            )
            if est_cita["codigo"] in ["EN_EJECUCION", "FINALIZADA"]:
                raise BusinessRuleException(
                    "No es posible cancelar una solicitud con una cita en ejecución o finalizada."
                )

        estado_cancelada = next(
            e for e in mock_db.estados_solicitud if e["codigo"] == "CANCELADA"
        )
        ahora = datetime.now(UTC)
        sol["estado_solicitud_id"] = estado_cancelada["estado_solicitud_id"]
        sol["actualizado_en"] = ahora

        return self._ensamblar_solicitud(sol)


solicitudes_service = SolicitudesService()
