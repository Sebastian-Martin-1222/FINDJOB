"""Servicio de chat interno y metadata de adjuntos."""

from datetime import UTC, datetime
from typing import Any

from app.core.exceptions import AuthorizationException, BusinessRuleException, EntityNotFoundException
from app.persistence.store import data_store
from app.schemas.conversacion import ArchivoAdjuntoCreate, ArchivoAdjuntoOut, ConversacionOut, MensajeCreate, MensajeOut


class ConversacionesService:
    def _es_participante(self, conversacion_id: int, usuario_id: int) -> bool:
        return any(p["conversacion_id"] == conversacion_id and p["usuario_id"] == usuario_id and p.get("salido_en") is None for p in data_store.participantes_conversacion)

    def _nombre_usuario(self, usuario_id: int) -> str | None:
        u = next((x for x in data_store.usuarios if x["usuario_id"] == usuario_id), None)
        return f"{u['nombres']} {u['apellidos']}" if u else None

    def _rol_usuario(self, usuario_id: int) -> str | None:
        role_ids = [x["rol_id"] for x in data_store.usuario_roles if x["usuario_id"] == usuario_id]
        roles = [r["codigo"] for r in data_store.roles if r["rol_id"] in role_ids]
        if "TRABAJADOR" in roles:
            return "TRABAJADOR"
        if "CLIENTE" in roles:
            return "CLIENTE"
        if "ADMIN" in roles:
            return "ADMIN"
        return roles[0] if roles else None

    def _ensamblar_mensaje(self, m: dict[str, Any], viewer_id: int | None = None) -> MensajeOut:
        tipo = next((t for t in data_store.tipos_mensaje if t["tipo_mensaje_id"] == m["tipo_mensaje_id"]), None)
        adjuntos = [ArchivoAdjuntoOut(**a) for a in data_store.archivos_adjuntos if a["mensaje_id"] == m["mensaje_id"]]
        leido = False
        if viewer_id is not None:
            leido = any(l["mensaje_id"] == m["mensaje_id"] and l["usuario_id"] == viewer_id for l in data_store.lecturas_mensajes)
        return MensajeOut(
            **m,
            tipo_mensaje_codigo=tipo["codigo"] if tipo else None,
            adjuntos=adjuntos,
            remitente_nombre=self._nombre_usuario(m["remitente_usuario_id"]),
            leido=leido,
        )

    def listar_conversaciones(self, usuario_id: int, limit: int = 20, offset: int = 0) -> list[ConversacionOut]:
        conv_ids = {p["conversacion_id"] for p in data_store.participantes_conversacion if p["usuario_id"] == usuario_id and p.get("salido_en") is None}
        resultados: list[ConversacionOut] = []
        for c in data_store.conversaciones:
            if c["conversacion_id"] not in conv_ids:
                continue
            participantes = [p["usuario_id"] for p in data_store.participantes_conversacion if p["conversacion_id"] == c["conversacion_id"] and p.get("salido_en") is None]
            otro_id = next((pid for pid in participantes if pid != usuario_id), None)
            mensajes = sorted([m for m in data_store.mensajes if m["conversacion_id"] == c["conversacion_id"]], key=lambda x: x["enviado_en"])
            ultimo = self._ensamblar_mensaje(mensajes[-1], viewer_id=usuario_id) if mensajes else None
            no_leidos = sum(
                1 for m in mensajes
                if m["remitente_usuario_id"] != usuario_id
                and not any(l["mensaje_id"] == m["mensaje_id"] and l["usuario_id"] == usuario_id for l in data_store.lecturas_mensajes)
            )
            sol = next((s for s in data_store.solicitudes_servicio if s["solicitud_servicio_id"] == c["solicitud_servicio_id"]), None)
            srv = next((s for s in data_store.servicios if sol and s["servicio_id"] == sol["servicio_id"]), None)
            resultados.append(ConversacionOut(
                conversacion_id=c["conversacion_id"], solicitud_servicio_id=c["solicitud_servicio_id"], creada_en=c["creada_en"], cerrada_en=c.get("cerrada_en"),
                participantes_ids=participantes, ultimo_mensaje=ultimo,
                otro_participante_id=otro_id,
                otro_participante_nombre=self._nombre_usuario(otro_id) if otro_id else None,
                otro_participante_rol=self._rol_usuario(otro_id) if otro_id else None,
                servicio_titulo=srv["titulo"] if srv else None,
                mensajes_no_leidos=no_leidos,
            ))
        resultados.sort(key=lambda x: (x.ultimo_mensaje.enviado_en if x.ultimo_mensaje else x.creada_en), reverse=True)
        return resultados[offset:offset + limit]

    def get_mensajes_conversacion(self, usuario_id: int, conversacion_id: int, limit: int = 50, offset: int = 0) -> list[MensajeOut]:
        if not self._es_participante(conversacion_id, usuario_id):
            raise AuthorizationException("No tienes autorización para acceder a los mensajes de esta conversación.")
        mensajes = sorted([m for m in data_store.mensajes if m["conversacion_id"] == conversacion_id], key=lambda x: x["enviado_en"])
        return [self._ensamblar_mensaje(m, viewer_id=usuario_id) for m in mensajes][offset:offset + limit]

    def enviar_mensaje(self, usuario_id: int, conversacion_id: int, data: MensajeCreate) -> MensajeOut:
        if not self._es_participante(conversacion_id, usuario_id):
            raise AuthorizationException("Solo los participantes autorizados pueden enviar mensajes.")
        conv = next((c for c in data_store.conversaciones if c["conversacion_id"] == conversacion_id), None)
        if not conv or conv.get("cerrada_en") is not None:
            raise BusinessRuleException("La conversación se encuentra cerrada.")
        if not any(t["tipo_mensaje_id"] == data.tipo_mensaje_id for t in data_store.tipos_mensaje):
            raise EntityNotFoundException("El tipo de mensaje no existe.")
        ahora = datetime.now(UTC)
        item = {"mensaje_id": max([m["mensaje_id"] for m in data_store.mensajes], default=0) + 1, "conversacion_id": conversacion_id, "remitente_usuario_id": usuario_id, "tipo_mensaje_id": data.tipo_mensaje_id, "contenido": data.contenido, "enviado_en": ahora, "editado_en": None}
        data_store.mensajes.append(item)
        return self._ensamblar_mensaje(item, viewer_id=usuario_id)

    def adjuntar_archivo(self, usuario_id: int, conversacion_id: int, data: ArchivoAdjuntoCreate) -> ArchivoAdjuntoOut:
        if not self._es_participante(conversacion_id, usuario_id):
            raise AuthorizationException("No tienes autorización en esta conversación.")
        conv = next((c for c in data_store.conversaciones if c["conversacion_id"] == conversacion_id), None)
        if not conv or conv.get("cerrada_en") is not None:
            raise BusinessRuleException("La conversación se encuentra cerrada.")
        ahora = datetime.now(UTC)
        msg_id = max([m["mensaje_id"] for m in data_store.mensajes], default=0) + 1
        data_store.mensajes.append({"mensaje_id": msg_id, "conversacion_id": conversacion_id, "remitente_usuario_id": usuario_id, "tipo_mensaje_id": 2, "contenido": f"Archivo adjunto: {data.nombre_original}", "enviado_en": ahora, "editado_en": None})
        adj = {"archivo_adjunto_id": max([a["archivo_adjunto_id"] for a in data_store.archivos_adjuntos], default=0) + 1, "mensaje_id": msg_id, "nombre_original": data.nombre_original, "tipo_mime": data.tipo_mime, "tamano_bytes": data.tamano_bytes, "bucket": data.bucket, "ruta_objeto": data.ruta_objeto, "creado_en": ahora}
        data_store.archivos_adjuntos.append(adj)
        return ArchivoAdjuntoOut(**adj)

    def registrar_lectura(self, usuario_id: int, mensaje_id: int) -> None:
        msg = next((m for m in data_store.mensajes if m["mensaje_id"] == mensaje_id), None)
        if not msg:
            raise EntityNotFoundException("Mensaje no encontrado.")
        if not self._es_participante(msg["conversacion_id"], usuario_id):
            raise AuthorizationException("No eres participante de la conversación del mensaje.")
        if msg["remitente_usuario_id"] == usuario_id:
            return
        if not any(l["mensaje_id"] == mensaje_id and l["usuario_id"] == usuario_id for l in data_store.lecturas_mensajes):
            data_store.lecturas_mensajes.append({"mensaje_id": mensaje_id, "usuario_id": usuario_id, "leido_en": datetime.now(UTC)})


conversaciones_service = ConversacionesService()
