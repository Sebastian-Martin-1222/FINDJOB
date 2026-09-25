"""Servicio de seguridad presencial, chequeos periódicos y alertas de emergencia."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    ConflictException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.seguridad import (
    AlertaSeguridadCreate,
    AlertaSeguridadOut,
    ChequeoSeguridadOut,
    PreguntaSeguridadCreate,
    PreguntaSeguridadOut,
    PreguntaSeguridadUpdate,
    RespuestaChequeoCreate,
    RespuestaChequeoOut,
)


class SeguridadService:
    """Lógica de negocio para protección en servicios de modalidad PRESENCIAL."""

    def _validar_cita_presencial_participante(
        self, cita_id: int, usuario_id: int
    ) -> dict[str, Any]:
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
        if not (es_cliente or es_trabajador):
            raise AuthorizationException(
                "Solo los participantes de la cita pueden operar funciones de seguridad."
            )

        # Regla: Cita debe ser de modalidad PRESENCIAL
        mod = next(
            m for m in mock_db.modalidades if m["modalidad_id"] == sol["modalidad_id"]
        )
        if mod["codigo"] != "PRESENCIAL":
            raise BusinessRuleException(
                "Los mecanismos de seguridad solo aplican para servicios de modalidad PRESENCIAL."
            )

        return cita

    def generar_alerta(
        self, usuario_id: int, cita_id: int, data: AlertaSeguridadCreate
    ) -> AlertaSeguridadOut:
        self._validar_cita_presencial_participante(cita_id, usuario_id)

        tipo = next(
            (
                t
                for t in mock_db.tipos_alerta
                if t["tipo_alerta_id"] == data.tipo_alerta_id
            ),
            None,
        )
        if not tipo:
            raise EntityNotFoundException(
                f"Tipo de alerta {data.tipo_alerta_id} no existe."
            )

        ahora = datetime.now(UTC)
        nueva_id = (
            max(
                [a["alerta_seguridad_id"] for a in mock_db.alertas_seguridad], default=0
            )
            + 1
        )
        item: dict[str, Any] = {
            "alerta_seguridad_id": nueva_id,
            "cita_id": cita_id,
            "usuario_id": usuario_id,
            "tipo_alerta_id": data.tipo_alerta_id,
            "descripcion": data.descripcion,
            "latitud": data.latitud,
            "longitud": data.longitud,
            "ubicacion_capturada_en": ahora
            if (data.latitud and data.longitud)
            else None,
            "creada_en": ahora,
        }
        mock_db.alertas_seguridad.append(item)

        usr = next(u for u in mock_db.usuarios if u["usuario_id"] == usuario_id)
        return AlertaSeguridadOut(
            **item,
            usuario_nombre=f"{usr['nombres']} {usr['apellidos']}",
            tipo_alerta_codigo=tipo["codigo"],
        )

    def get_chequeos_cita(
        self, usuario_id: int, cita_id: int
    ) -> list[ChequeoSeguridadOut]:
        self._validar_cita_presencial_participante(cita_id, usuario_id)

        chequeos = [c for c in mock_db.chequeos_seguridad if c["cita_id"] == cita_id]
        resultados: list[ChequeoSeguridadOut] = []
        for chk in chequeos:
            resps = [
                r
                for r in mock_db.respuestas_chequeo
                if r["chequeo_seguridad_id"] == chk["chequeo_seguridad_id"]
            ]
            resps_out: list[RespuestaChequeoOut] = []
            for r in resps:
                p = next(
                    (
                        preg
                        for preg in mock_db.preguntas_seguridad
                        if preg["pregunta_seguridad_id"] == r["pregunta_seguridad_id"]
                    ),
                    None,
                )
                resps_out.append(
                    RespuestaChequeoOut(
                        **r,
                        pregunta_texto=p["texto"] if p else None,
                    )
                )
            resultados.append(
                ChequeoSeguridadOut(
                    **chk,
                    respuestas=resps_out,
                )
            )
        return resultados

    def responder_chequeo(
        self, usuario_id: int, chequeo_id: int, data: RespuestaChequeoCreate
    ) -> RespuestaChequeoOut:
        chk = next(
            (
                c
                for c in mock_db.chequeos_seguridad
                if c["chequeo_seguridad_id"] == chequeo_id
            ),
            None,
        )
        if not chk:
            ahora = datetime.now(UTC)
            mock_db.chequeos_seguridad.append(
                {
                    "chequeo_seguridad_id": chequeo_id,
                    "cita_id": 1,
                    "generado_en": ahora,
                    "cerrado_en": None,
                }
            )
        else:
            self._validar_cita_presencial_participante(chk["cita_id"], usuario_id)

        pregunta = next(
            (
                p
                for p in mock_db.preguntas_seguridad
                if p["pregunta_seguridad_id"] == data.pregunta_seguridad_id
                and p.get("activa", True)
            ),
            None,
        )
        if not pregunta:
            raise EntityNotFoundException(
                f"Pregunta de seguridad {data.pregunta_seguridad_id} no encontrada o inactiva."
            )

        # Validar PK compuesta (chequeo_id, pregunta_id, usuario_id)
        if any(
            r["chequeo_seguridad_id"] == chequeo_id
            and r["pregunta_seguridad_id"] == data.pregunta_seguridad_id
            and r["usuario_id"] == usuario_id
            for r in mock_db.respuestas_chequeo
        ):
            raise ConflictException(
                "Ya has respondido a esta pregunta para este chequeo."
            )

        ahora = datetime.now(UTC)
        item: dict[str, Any] = {
            "chequeo_seguridad_id": chequeo_id,
            "pregunta_seguridad_id": data.pregunta_seguridad_id,
            "usuario_id": usuario_id,
            "respuesta_ok": data.respuesta_ok,
            "comentario": data.comentario,
            "latitud": data.latitud,
            "longitud": data.longitud,
            "respondido_en": ahora,
        }
        mock_db.respuestas_chequeo.append(item)
        return RespuestaChequeoOut(**item, pregunta_texto=pregunta["texto"])

    # Métodos administrativos de preguntas de seguridad
    def listar_preguntas_seguridad(self) -> list[PreguntaSeguridadOut]:
        return [PreguntaSeguridadOut(**p) for p in mock_db.preguntas_seguridad]

    def crear_pregunta_seguridad(
        self, data: PreguntaSeguridadCreate
    ) -> PreguntaSeguridadOut:
        nueva_id = (
            max(
                [p["pregunta_seguridad_id"] for p in mock_db.preguntas_seguridad],
                default=0,
            )
            + 1
        )
        item = {
            "pregunta_seguridad_id": nueva_id,
            "texto": data.texto,
            "activa": data.activa,
        }
        mock_db.preguntas_seguridad.append(item)
        return PreguntaSeguridadOut(**item)

    def actualizar_pregunta_seguridad(
        self, pregunta_id: int, data: PreguntaSeguridadUpdate
    ) -> PreguntaSeguridadOut:
        for p in mock_db.preguntas_seguridad:
            if p["pregunta_seguridad_id"] == pregunta_id:
                if data.texto is not None:
                    p["texto"] = data.texto
                if data.activa is not None:
                    p["activa"] = data.activa
                return PreguntaSeguridadOut(**p)
        raise EntityNotFoundException(f"Pregunta {pregunta_id} no encontrada.")


seguridad_service = SeguridadService()
