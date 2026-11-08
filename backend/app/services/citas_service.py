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
from app.persistence.store import data_store
from app.schemas.cita import CitaConfirmarRequest, CitaCreate, CitaOut, CitaUpdate


class CitasService:
    """Lógica de negocio para citas y coordinación de la ejecución."""

    def _contexto(self, cita: dict[str, Any]) -> dict[str, Any]:
        sol = next((s for s in data_store.solicitudes_servicio if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]), None)
        if not sol:
            raise EntityNotFoundException("La solicitud asociada a la cita no existe.")
        srv = next((s for s in data_store.servicios if s["servicio_id"] == sol["servicio_id"]), None)
        perfil = next((p for p in data_store.perfiles_trabajador if srv and p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]), None)
        cliente = next((u for u in data_store.usuarios if u["usuario_id"] == sol["cliente_usuario_id"]), None)
        trabajador = next((u for u in data_store.usuarios if perfil and u["usuario_id"] == perfil["usuario_id"]), None)
        modalidad = next((m for m in data_store.modalidades if m["modalidad_id"] == sol["modalidad_id"]), None)
        direccion = next((d for d in data_store.direcciones if cita.get("direccion_id") and d["direccion_id"] == cita["direccion_id"]), None)
        return {"sol": sol, "srv": srv, "perfil": perfil, "cliente": cliente, "trabajador": trabajador, "modalidad": modalidad, "direccion": direccion}

    def _ensamblar_cita(self, c: dict[str, Any], viewer_id: int | None = None) -> CitaOut:
        ctx = self._contexto(c)
        est = next((e for e in data_store.estados_cita if e["estado_cita_id"] == c["estado_cita_id"]), None)
        pago = next((p for p in data_store.pagos if p["cita_id"] == c["cita_id"]), None)
        calificacion = next((x for x in data_store.calificaciones if x["cita_id"] == c["cita_id"]), None)

        # El secreto presencial solo lo conoce el cliente. Una vez confirmado queda invalidado (NULL).
        codigo_visible = c.get("codigo_confirmacion") if viewer_id == ctx["sol"]["cliente_usuario_id"] else None
        payload = {**c, "codigo_confirmacion": codigo_visible}
        return CitaOut(
            **payload,
            estado_codigo=est["codigo"] if est else "DESCONOCIDO",
            modalidad_codigo=ctx["modalidad"]["codigo"] if ctx["modalidad"] else None,
            servicio_titulo=ctx["srv"]["titulo"] if ctx["srv"] else None,
            cliente_usuario_id=ctx["sol"]["cliente_usuario_id"],
            cliente_nombre=(f"{ctx['cliente']['nombres']} {ctx['cliente']['apellidos']}" if ctx["cliente"] else None),
            trabajador_usuario_id=(ctx["perfil"]["usuario_id"] if ctx["perfil"] else None),
            trabajador_nombre=(f"{ctx['trabajador']['nombres']} {ctx['trabajador']['apellidos']}" if ctx["trabajador"] else None),
            direccion_texto=(ctx["direccion"]["linea_direccion"] if ctx["direccion"] else None),
            pago_id=pago["pago_id"] if pago else None,
            pago_realizado=pago is not None,
            calificacion_realizada=calificacion is not None,
            monto_acordado=ctx["sol"].get("valor_acordado"),
        )

    def _autorizar_participante(self, usuario_id: int, cita: dict[str, Any]) -> tuple[dict[str, Any], bool, bool]:
        ctx = self._contexto(cita)
        es_cliente = ctx["sol"]["cliente_usuario_id"] == usuario_id
        es_trabajador = bool(ctx["perfil"] and ctx["perfil"]["usuario_id"] == usuario_id)
        es_admin = any(ur["usuario_id"] == usuario_id and ur["rol_id"] == 3 for ur in data_store.usuario_roles)
        if not (es_cliente or es_trabajador or es_admin):
            raise AuthorizationException("No tienes permisos para operar esta cita.")
        return ctx, es_cliente, es_trabajador

    def programar_cita(self, usuario_id: int, solicitud_id: int, data: CitaCreate) -> CitaOut:
        sol = next((s for s in data_store.solicitudes_servicio if s["solicitud_servicio_id"] == solicitud_id), None)
        if not sol:
            raise EntityNotFoundException(f"Solicitud {solicitud_id} no encontrada.")
        srv = next((s for s in data_store.servicios if s["servicio_id"] == sol["servicio_id"]), None)
        perfil = next((p for p in data_store.perfiles_trabajador if srv and p["perfil_trabajador_id"] == srv["perfil_trabajador_id"]), None)
        if not perfil or perfil["usuario_id"] != usuario_id:
            raise AuthorizationException("Solo el trabajador asignado puede programar la cita.")
        est_sol = next((e for e in data_store.estados_solicitud if e["estado_solicitud_id"] == sol["estado_solicitud_id"]), None)
        if not est_sol or est_sol["codigo"] != "ACEPTADA":
            raise BusinessRuleException("Solo se pueden programar citas para solicitudes en estado ACEPTADA.")
        if any(c["solicitud_servicio_id"] == solicitud_id for c in data_store.citas):
            raise ConflictException("Ya existe una cita programada para esta solicitud.")

        modalidad = next((m for m in data_store.modalidades if m["modalidad_id"] == sol["modalidad_id"]), None)
        if not modalidad:
            raise BusinessRuleException("La modalidad de la solicitud no es válida.")
        if data.fecha_fin is not None and data.fecha_fin <= data.fecha_inicio:
            raise BusinessRuleException("La fecha de fin debe ser posterior a la fecha de inicio.")

        if modalidad["codigo"] == "PRESENCIAL":
            dir_id = data.direccion_id or sol.get("direccion_id")
            direccion = next((d for d in data_store.direcciones if dir_id and d["direccion_id"] == dir_id and d.get("activa", True)), None)
            if not direccion or direccion["usuario_id"] != sol["cliente_usuario_id"]:
                raise BusinessRuleException("Una cita PRESENCIAL requiere una dirección activa del cliente.")
            codigo_confirmacion = f"CONF-{secrets.token_hex(4).upper()}"
            plataforma = None
            enlace = None
        else:
            dir_id = None
            codigo_confirmacion = None
            plataforma = data.plataforma_remota or sol.get("plataforma_remota")
            enlace = data.enlace_reunion

        estado_prog = next(e for e in data_store.estados_cita if e["codigo"] == "PROGRAMADA")
        ahora = datetime.now(UTC)
        item: dict[str, Any] = {
            "cita_id": max([c["cita_id"] for c in data_store.citas], default=0) + 1,
            "solicitud_servicio_id": solicitud_id,
            "estado_cita_id": estado_prog["estado_cita_id"],
            "direccion_id": dir_id,
            "fecha_inicio": data.fecha_inicio,
            "fecha_fin": data.fecha_fin,
            "codigo_confirmacion": codigo_confirmacion,
            "plataforma_remota": plataforma,
            "enlace_reunion": enlace,
            "creada_en": ahora,
            "actualizado_en": ahora,
        }
        data_store.citas.append(item)
        return self._ensamblar_cita(item, viewer_id=usuario_id)

    def get_mis_citas(self, usuario_id: int, limit: int = 20, offset: int = 0) -> list[CitaOut]:
        solicitudes_cliente = {s["solicitud_servicio_id"] for s in data_store.solicitudes_servicio if s["cliente_usuario_id"] == usuario_id}
        perfil = next((p for p in data_store.perfiles_trabajador if p["usuario_id"] == usuario_id), None)
        solicitudes_trabajador: set[int] = set()
        if perfil:
            servicios = {s["servicio_id"] for s in data_store.servicios if s["perfil_trabajador_id"] == perfil["perfil_trabajador_id"]}
            solicitudes_trabajador = {s["solicitud_servicio_id"] for s in data_store.solicitudes_servicio if s["servicio_id"] in servicios}
        ids = solicitudes_cliente | solicitudes_trabajador
        citas = [c for c in data_store.citas if c["solicitud_servicio_id"] in ids]
        return [self._ensamblar_cita(c, viewer_id=usuario_id) for c in citas][offset:offset + limit]

    def get_cita_por_id(self, usuario_id: int, cita_id: int) -> CitaOut:
        cita = next((c for c in data_store.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")
        self._autorizar_participante(usuario_id, cita)
        return self._ensamblar_cita(cita, viewer_id=usuario_id)

    def actualizar_cita(self, usuario_id: int, cita_id: int, data: CitaUpdate) -> CitaOut:
        cita = next((c for c in data_store.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")
        ctx, _, es_trabajador = self._autorizar_participante(usuario_id, cita)
        if not es_trabajador:
            raise AuthorizationException("Solo el trabajador asignado puede reprogramar la cita.")
        estado = next(e for e in data_store.estados_cita if e["estado_cita_id"] == cita["estado_cita_id"])
        if estado["codigo"] != "PROGRAMADA":
            raise BusinessRuleException("Solo se puede editar una cita PROGRAMADA.")

        modalidad_codigo = ctx["modalidad"]["codigo"] if ctx["modalidad"] else None
        if data.fecha_inicio is not None:
            cita["fecha_inicio"] = data.fecha_inicio
        if data.fecha_fin is not None:
            cita["fecha_fin"] = data.fecha_fin
        if cita.get("fecha_fin") is not None and cita["fecha_fin"] <= cita["fecha_inicio"]:
            raise BusinessRuleException("La fecha de fin debe ser posterior a la fecha de inicio.")
        if modalidad_codigo == "PRESENCIAL" and data.direccion_id is not None:
            direccion = next((d for d in data_store.direcciones if d["direccion_id"] == data.direccion_id and d.get("activa", True)), None)
            if not direccion or direccion["usuario_id"] != ctx["sol"]["cliente_usuario_id"]:
                raise BusinessRuleException("La dirección debe pertenecer al cliente.")
            cita["direccion_id"] = data.direccion_id
        if modalidad_codigo == "REMOTO":
            if data.plataforma_remota is not None:
                cita["plataforma_remota"] = data.plataforma_remota
            if data.enlace_reunion is not None:
                cita["enlace_reunion"] = data.enlace_reunion
        cita["actualizado_en"] = datetime.now(UTC)
        return self._ensamblar_cita(cita, viewer_id=usuario_id)

    def confirmar_cita(self, usuario_id: int, cita_id: int, data: CitaConfirmarRequest) -> CitaOut:
        cita = next((c for c in data_store.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")
        ctx, _, es_trabajador = self._autorizar_participante(usuario_id, cita)
        if not es_trabajador:
            raise AuthorizationException("Solo el trabajador asignado puede confirmar la llegada.")
        if not ctx["modalidad"] or ctx["modalidad"]["codigo"] != "PRESENCIAL":
            raise BusinessRuleException("La confirmación por código solo aplica a citas PRESENCIALES.")
        if cita.get("codigo_confirmacion") is None:
            raise ConflictException("La cita ya fue confirmada.")
        if cita["codigo_confirmacion"] != data.codigo_confirmacion.strip():
            raise BusinessRuleException("El código de confirmación ingresado no es válido.")
        cita["codigo_confirmacion"] = None
        cita["actualizado_en"] = datetime.now(UTC)
        return self._ensamblar_cita(cita, viewer_id=usuario_id)

    def iniciar_cita(self, usuario_id: int, cita_id: int) -> CitaOut:
        cita = next((c for c in data_store.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")
        ctx, _, es_trabajador = self._autorizar_participante(usuario_id, cita)
        if not es_trabajador:
            raise AuthorizationException("Solo el trabajador puede marcar el inicio de la cita.")
        estado = next(e for e in data_store.estados_cita if e["estado_cita_id"] == cita["estado_cita_id"])
        if estado["codigo"] != "PROGRAMADA":
            raise BusinessRuleException(f"La cita no puede iniciarse desde el estado '{estado['codigo']}'.")
        if ctx["modalidad"] and ctx["modalidad"]["codigo"] == "PRESENCIAL" and cita.get("codigo_confirmacion") is not None:
            raise BusinessRuleException("La cita presencial debe confirmar el código de llegada antes de iniciar.")

        ejec = next(e for e in data_store.estados_cita if e["codigo"] == "EN_EJECUCION")
        cita["estado_cita_id"] = ejec["estado_cita_id"]
        cita["actualizado_en"] = datetime.now(UTC)

        if ctx["modalidad"] and ctx["modalidad"]["codigo"] == "PRESENCIAL" and not any(ch["cita_id"] == cita_id for ch in data_store.chequeos_seguridad):
            data_store.chequeos_seguridad.append({
                "chequeo_seguridad_id": max([ch["chequeo_seguridad_id"] for ch in data_store.chequeos_seguridad], default=0) + 1,
                "cita_id": cita_id,
                "generado_en": datetime.now(UTC),
                "cerrado_en": None,
            })
        return self._ensamblar_cita(cita, viewer_id=usuario_id)

    def finalizar_cita(self, usuario_id: int, cita_id: int) -> CitaOut:
        cita = next((c for c in data_store.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")
        _, _, es_trabajador = self._autorizar_participante(usuario_id, cita)
        if not es_trabajador:
            raise AuthorizationException("Solo el trabajador puede marcar la finalización de la cita.")
        estado = next(e for e in data_store.estados_cita if e["estado_cita_id"] == cita["estado_cita_id"])
        if estado["codigo"] != "EN_EJECUCION":
            raise BusinessRuleException("La cita debe estar EN_EJECUCION para poder finalizarse.")
        fin = next(e for e in data_store.estados_cita if e["codigo"] == "FINALIZADA")
        ahora = datetime.now(UTC)
        cita["estado_cita_id"] = fin["estado_cita_id"]
        cita["fecha_fin"] = ahora
        cita["actualizado_en"] = ahora
        for chk in data_store.chequeos_seguridad:
            if chk["cita_id"] == cita_id and chk.get("cerrado_en") is None:
                chk["cerrado_en"] = ahora
        return self._ensamblar_cita(cita, viewer_id=usuario_id)


citas_service = CitasService()
