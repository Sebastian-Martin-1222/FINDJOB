"""Servicio de chat interno, mensajería y adjuntos en Cloud Storage."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import (
    AuthorizationException,
    BusinessRuleException,
    EntityNotFoundException,
)
from app.mocks.mock_db import mock_db
from app.schemas.conversacion import (
    ArchivoAdjuntoCreate,
    ArchivoAdjuntoOut,
    ConversacionOut,
    MensajeCreate,
    MensajeOut,
)


class ConversacionesService:
    """Lógica de negocio para comunicación interna restringida a participantes."""

    def _es_participante(self, conversacion_id: int, usuario_id: int) -> bool:
        return any(
            p["conversacion_id"] == conversacion_id
            and p["usuario_id"] == usuario_id
            and p.get("salido_en") is None
            for p in mock_db.participantes_conversacion
        )

    def _ensamblar_mensaje(self, m: dict[str, Any]) -> MensajeOut:
        tipo = next(
            (
                t
                for t in mock_db.tipos_mensaje
                if t["tipo_mensaje_id"] == m["tipo_mensaje_id"]
            ),
            None,
        )
        adjuntos = [
            ArchivoAdjuntoOut(**a)
            for a in mock_db.archivos_adjuntos
            if a["mensaje_id"] == m["mensaje_id"]
        ]
        return MensajeOut(
            **m,
            tipo_mensaje_codigo=tipo["codigo"] if tipo else None,
            adjuntos=adjuntos,
        )

    def listar_conversaciones(self, usuario_id: int) -> list[ConversacionOut]:
        conv_ids = [
            p["conversacion_id"]
            for p in mock_db.participantes_conversacion
            if p["usuario_id"] == usuario_id and p.get("salido_en") is None
        ]
        resultados: list[ConversacionOut] = []
        for c in mock_db.conversaciones:
            if c["conversacion_id"] in conv_ids:
                participantes = [
                    p["usuario_id"]
                    for p in mock_db.participantes_conversacion
                    if p["conversacion_id"] == c["conversacion_id"]
                ]
                mensajes_conv = [
                    m
                    for m in mock_db.mensajes
                    if m["conversacion_id"] == c["conversacion_id"]
                ]
                ultimo = None
                if mensajes_conv:
                    mensajes_conv.sort(key=lambda x: x["enviado_en"])
                    ultimo = self._ensamblar_mensaje(mensajes_conv[-1])

                resultados.append(
                    ConversacionOut(
                        conversacion_id=c["conversacion_id"],
                        solicitud_servicio_id=c["solicitud_servicio_id"],
                        creada_en=c["creada_en"],
                        cerrada_en=c.get("cerrada_en"),
                        participantes_ids=participantes,
                        ultimo_mensaje=ultimo,
                    )
                )
        return resultados

    def get_mensajes_conversacion(
        self, usuario_id: int, conversacion_id: int
    ) -> list[MensajeOut]:
        if not self._es_participante(conversacion_id, usuario_id):
            raise AuthorizationException(
                "No tienes autorización para acceder a los mensajes de esta conversación."
            )

        mensajes = [
            m for m in mock_db.mensajes if m["conversacion_id"] == conversacion_id
        ]
        mensajes.sort(key=lambda x: x["enviado_en"])
        return [self._ensamblar_mensaje(m) for m in mensajes]

    def enviar_mensaje(
        self, usuario_id: int, conversacion_id: int, data: MensajeCreate
    ) -> MensajeOut:
        if not self._es_participante(conversacion_id, usuario_id):
            raise AuthorizationException(
                "Solo los participantes autorizados pueden enviar mensajes."
            )

        conv = next(
            (
                c
                for c in mock_db.conversaciones
                if c["conversacion_id"] == conversacion_id
            ),
            None,
        )
        if not conv or conv.get("cerrada_en") is not None:
            raise BusinessRuleException("La conversación se encuentra cerrada.")

        ahora = datetime.now(UTC)
        nueva_id = max([m["mensaje_id"] for m in mock_db.mensajes], default=0) + 1
        item: dict[str, Any] = {
            "mensaje_id": nueva_id,
            "conversacion_id": conversacion_id,
            "remitente_usuario_id": usuario_id,
            "tipo_mensaje_id": data.tipo_mensaje_id,
            "contenido": data.contenido,
            "enviado_en": ahora,
            "editado_en": None,
        }
        mock_db.mensajes.append(item)
        return self._ensamblar_mensaje(item)

    def adjuntar_archivo(
        self, usuario_id: int, conversacion_id: int, data: ArchivoAdjuntoCreate
    ) -> ArchivoAdjuntoOut:
        if not self._es_participante(conversacion_id, usuario_id):
            raise AuthorizationException("No tienes autorización en esta conversación.")

        # Crear mensaje contenedor de tipo ADJUNTO (tipo_mensaje_id = 2)
        ahora = datetime.now(UTC)
        nueva_msg_id = max([m["mensaje_id"] for m in mock_db.mensajes], default=0) + 1
        mock_db.mensajes.append(
            {
                "mensaje_id": nueva_msg_id,
                "conversacion_id": conversacion_id,
                "remitente_usuario_id": usuario_id,
                "tipo_mensaje_id": 2,  # ADJUNTO
                "contenido": f"Archivo adjunto: {data.nombre_original}",
                "enviado_en": ahora,
                "editado_en": None,
            }
        )

        nueva_adj_id = (
            max([a["archivo_adjunto_id"] for a in mock_db.archivos_adjuntos], default=0)
            + 1
        )
        adj_item: dict[str, Any] = {
            "archivo_adjunto_id": nueva_adj_id,
            "mensaje_id": nueva_msg_id,
            "nombre_original": data.nombre_original,
            "tipo_mime": data.tipo_mime,
            "tamano_bytes": data.tamano_bytes,
            "bucket": data.bucket,
            "ruta_objeto": data.ruta_objeto,
            "creado_en": ahora,
        }
        mock_db.archivos_adjuntos.append(adj_item)
        return ArchivoAdjuntoOut(**adj_item)

    def registrar_lectura(self, usuario_id: int, mensaje_id: int) -> None:
        msg = next((m for m in mock_db.mensajes if m["mensaje_id"] == mensaje_id), None)
        if not msg:
            raise EntityNotFoundException("Mensaje no encontrado.")

        if not self._es_participante(msg["conversacion_id"], usuario_id):
            raise AuthorizationException(
                "No eres participante de la conversación del mensaje."
            )

        # Si ya lo leyó, no duplicar
        if not any(
            lec["mensaje_id"] == mensaje_id and lec["usuario_id"] == usuario_id
            for lec in mock_db.lecturas_mensajes
        ):
            mock_db.lecturas_mensajes.append(
                {
                    "mensaje_id": mensaje_id,
                    "usuario_id": usuario_id,
                    "leido_en": datetime.now(UTC),
                }
            )


conversaciones_service = ConversacionesService()
