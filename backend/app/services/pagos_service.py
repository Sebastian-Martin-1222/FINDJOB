"""Servicio para gestión de pagos y políticas de comisión."""

import secrets
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    ConflictException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.pago import (
    PagoCreate,
    PagoOut,
    PoliticaComisionCreate,
    PoliticaComisionOut,
)


class PagosService:
    """Lógica de negocio para cobros, comisiones y pasarelas simuladas."""

    def _obtener_politica_vigente(self, fecha: datetime) -> dict[str, Any]:
        """Obtiene la política de comisión activa para la fecha indicada."""
        for pol in mock_db.politicas_comision:
            desde = pol["vigente_desde"]
            hasta = pol.get("vigente_hasta")
            if desde <= fecha and (hasta is None or fecha < hasta):
                return pol
        raise BusinessRuleException(
            "No existe una política de comisión vigente para la fecha de pago."
        )

    def _ensamblar_pago(self, p: dict[str, Any]) -> PagoOut:
        metodo = next(
            (
                m
                for m in mock_db.metodos_pago
                if m["metodo_pago_id"] == p["metodo_pago_id"]
            ),
            None,
        )
        estado = next(
            (
                e
                for e in mock_db.estados_pago
                if e["estado_pago_id"] == p["estado_pago_id"]
            ),
            None,
        )
        politica = next(
            (
                pol
                for pol in mock_db.politicas_comision
                if pol["politica_comision_id"] == p["politica_comision_id"]
            ),
            None,
        )
        pct = politica["porcentaje_comision"] if politica else Decimal("10.00")
        monto_total = p["monto_total"]
        comision = round(monto_total * (pct / Decimal("100.00")), 2)
        trabajador = monto_total - comision

        return PagoOut(
            **p,
            metodo_pago_nombre=metodo["nombre"] if metodo else None,
            estado_pago_codigo=estado["codigo"] if estado else "DESCONOCIDO",
            porcentaje_comision=pct,
            monto_comision=comision,
            monto_trabajador=trabajador,
        )

    def registrar_pago(
        self, usuario_id: int, cita_id: int, data: PagoCreate
    ) -> PagoOut:
        cita = next((c for c in mock_db.citas if c["cita_id"] == cita_id), None)
        if not cita:
            raise EntityNotFoundException(f"Cita con ID {cita_id} no encontrada.")

        sol = next(
            s
            for s in mock_db.solicitudes_servicio
            if s["solicitud_servicio_id"] == cita["solicitud_servicio_id"]
        )

        # Regla de autorización: Solo el cliente de la solicitud puede pagar
        if sol["cliente_usuario_id"] != usuario_id:
            raise AuthorizationException(
                "Solo el cliente de la cita puede procesar el pago."
            )

        # Regla 1: Pago solo para cita FINALIZADA (Trigger fn_validar_pago)
        est_cita = next(
            e
            for e in mock_db.estados_cita
            if e["estado_cita_id"] == cita["estado_cita_id"]
        )
        if est_cita["codigo"] != "FINALIZADA":
            raise BusinessRuleException(
                "Solo se pueden pagar citas que se encuentren en estado FINALIZADA."
            )

        # Regla 2: Un solo pago por cita (UQ uq_pagos_cita)
        if any(p["cita_id"] == cita_id for p in mock_db.pagos):
            raise ConflictException("Ya existe un pago registrado para esta cita.")

        # Regla 3: Método de pago válido y activo
        metodo = next(
            (
                m
                for m in mock_db.metodos_pago
                if m["metodo_pago_id"] == data.metodo_pago_id and m.get("activo", True)
            ),
            None,
        )
        if not metodo:
            raise EntityNotFoundException(
                f"Método de pago {data.metodo_pago_id} no válido o inactivo."
            )

        ahora = datetime.now(UTC)
        politica = self._obtener_politica_vigente(ahora)
        est_aprobado = next(
            e for e in mock_db.estados_pago if e["codigo"] == "APROBADO"
        )

        referencia = (
            data.referencia_pasarela or f"SIM-PAY-{secrets.token_hex(6).upper()}"
        )
        nueva_id = max([p["pago_id"] for p in mock_db.pagos], default=0) + 1
        item: dict[str, Any] = {
            "pago_id": nueva_id,
            "cita_id": cita_id,
            "metodo_pago_id": data.metodo_pago_id,
            "estado_pago_id": est_aprobado["estado_pago_id"],
            "politica_comision_id": politica["politica_comision_id"],
            "monto_total": data.monto_total,
            "referencia_pasarela": referencia,
            "fecha_pago": ahora,
            "creado_en": ahora,
            "actualizado_en": ahora,
        }
        mock_db.pagos.append(item)
        return self._ensamblar_pago(item)

    def get_pago_por_cita(self, usuario_id: int, cita_id: int) -> PagoOut:
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
                "No tienes permisos para consultar el pago de esta cita."
            )

        pago = next((p for p in mock_db.pagos if p["cita_id"] == cita_id), None)
        if not pago:
            raise EntityNotFoundException(
                f"Aún no se ha registrado pago para la cita {cita_id}."
            )

        return self._ensamblar_pago(pago)

    def get_pagos_trabajador(self, usuario_id: int) -> list[PagoOut]:
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

        pagos = [p for p in mock_db.pagos if p["cita_id"] in citas_ids]
        return [self._ensamblar_pago(p) for p in pagos]

    def listar_politicas_comision(self) -> list[PoliticaComisionOut]:
        return [PoliticaComisionOut(**pol) for pol in mock_db.politicas_comision]

    def crear_politica_comision(
        self, data: PoliticaComisionCreate
    ) -> PoliticaComisionOut:
        # Validar no solapamiento temporal básico (EXCLUDE USING gist)
        for pol in mock_db.politicas_comision:
            p_desde = pol["vigente_desde"]
            p_hasta = pol.get("vigente_hasta")
            # Si se solapa
            if p_hasta is None or (
                data.vigente_desde < p_hasta
                and (data.vigente_hasta is None or data.vigente_hasta > p_desde)
            ):
                # En desarrollo cerramos la anterior si estaba abierta
                if p_hasta is None and data.vigente_desde > p_desde:
                    pol["vigente_hasta"] = data.vigente_desde
                else:
                    raise ConflictException(
                        "El rango de fechas se solapa con una política de comisión existente."
                    )

        ahora = datetime.now(UTC)
        nueva_id = (
            max(
                [p["politica_comision_id"] for p in mock_db.politicas_comision],
                default=0,
            )
            + 1
        )
        item = {
            "politica_comision_id": nueva_id,
            "nombre": data.nombre,
            "porcentaje_comision": data.porcentaje_comision,
            "vigente_desde": data.vigente_desde,
            "vigente_hasta": data.vigente_hasta,
            "descripcion": data.descripcion,
            "creada_en": ahora,
        }
        mock_db.politicas_comision.append(item)
        return PoliticaComisionOut(**item)


pagos_service = PagosService()
