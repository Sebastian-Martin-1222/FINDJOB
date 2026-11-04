import DOMPurify from "dompurify";
import { apiClient } from "@/lib/api-client";
import { EnviarMensajeInput, AdjuntoInput } from "@/schemas/chat.schema";

function sanitizeText(text: string): string {
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(text);
  }
  return text.replace(/[<>]/g, "");
}

export interface ArchivoAdjuntoItem {
  archivo_adjunto_id: number;
  id?: number;
  mensaje_id: number;
  nombre_original: string;
  nombre_archivo?: string;
  tipo_mime?: string | null;
  tamano_bytes?: number | null;
  bucket: string;
  ruta_objeto: string;
  url_descarga?: string;
  creado_en: string;
}

export interface MensajeItem {
  mensaje_id: number;
  id?: number;
  conversacion_id: number;
  remitente_usuario_id: number;
  remitente_id?: number;
  remitente_nombre?: string;
  tipo_mensaje_id: number;
  tipo_mensaje_codigo?: string | null;
  contenido?: string | null;
  leido?: boolean;
  enviado_en: string;
  fecha_envio?: string;
  editado_en?: string | null;
  adjuntos: ArchivoAdjuntoItem[];
  adjunto?: ArchivoAdjuntoItem;
}

export interface ConversacionItem {
  conversacion_id: number;
  id?: number;
  solicitud_servicio_id: number;
  solicitud_id?: number;
  servicio_titulo?: string;
  creada_en: string;
  cerrada_en?: string | null;
  participantes_ids: number[];
  otro_participante_id?: number;
  otro_participante_nombre?: string;
  otro_participante_rol?: "CLIENTE" | "TRABAJADOR";
  ultimo_mensaje?: string | MensajeItem | null;
  ultimo_mensaje_fecha?: string;
  mensajes_no_leidos?: number;
  activa?: boolean;
}

function mapMensaje(m: MensajeItem): MensajeItem {
  const adj = m.adjuntos && m.adjuntos.length > 0 ? {
    ...m.adjuntos[0],
    id: m.adjuntos[0].archivo_adjunto_id,
    nombre_archivo: m.adjuntos[0].nombre_original,
    url_descarga: "#",
  } : undefined;

  return {
    ...m,
    id: m.mensaje_id,
    remitente_id: m.remitente_usuario_id,
    remitente_nombre: `Usuario #${m.remitente_usuario_id}`,
    leido: true,
    fecha_envio: m.enviado_en,
    adjunto: adj,
  };
}

function mapConversacion(c: ConversacionItem): ConversacionItem {
  let ultMsgText: string | undefined = undefined;
  let ultMsgDate: string | undefined = undefined;

  if (c.ultimo_mensaje) {
    if (typeof c.ultimo_mensaje === "object" && c.ultimo_mensaje !== null) {
      ultMsgText = (c.ultimo_mensaje as MensajeItem).contenido || undefined;
      ultMsgDate = (c.ultimo_mensaje as MensajeItem).enviado_en;
    } else if (typeof c.ultimo_mensaje === "string") {
      ultMsgText = c.ultimo_mensaje;
    }
  }

  return {
    ...c,
    id: c.conversacion_id,
    solicitud_id: c.solicitud_servicio_id,
    servicio_titulo: `Solicitud de Servicio #${c.solicitud_servicio_id}`,
    otro_participante_id: c.participantes_ids[0] || 0,
    otro_participante_nombre: `Participante #${c.participantes_ids[0] || 0}`,
    otro_participante_rol: "TRABAJADOR",
    ultimo_mensaje: ultMsgText || "Sin mensajes",
    ultimo_mensaje_fecha: ultMsgDate || c.creada_en,
    mensajes_no_leidos: 0,
    activa: !c.cerrada_en,
  };
}

export const chatService = {
  async getConversaciones(): Promise<ConversacionItem[]> {
    const res = await apiClient.get<ConversacionItem[]>("/conversaciones");
    return (Array.isArray(res) ? res : []).map(mapConversacion);
  },

  async getMensajes(conversacionId: number | string): Promise<MensajeItem[]> {
    const res = await apiClient.get<MensajeItem[]>(
      `/conversaciones/${conversacionId}/mensajes`
    );
    return (Array.isArray(res) ? res : []).map(mapMensaje);
  },

  async enviarMensaje(
    conversacionId: number | string,
    payload: EnviarMensajeInput
  ): Promise<MensajeItem> {
    const sanitized = {
      contenido: sanitizeText(payload.contenido),
      tipo_mensaje_id: payload.tipo_mensaje_id || 1,
    };
    const res = await apiClient.post<MensajeItem>(
      `/conversaciones/${conversacionId}/mensajes`,
      sanitized
    );
    return mapMensaje(res);
  },

  /**
   * Registra metadata de un archivo adjunto.
   * NOTA: BRECHA DE ALMACENAMIENTO DE ARCHIVOS - El backend solo recibe metadata
   * (nombre_original, tipo_mime, tamano_bytes, bucket, ruta_objeto). No existe endpoint
   * multipart/binario para subir físicamente el archivo al bucket de Cloud Storage.
   */
  async adjuntarArchivo(
    conversacionId: number | string,
    payload: AdjuntoInput
  ): Promise<MensajeItem> {
    const sanitized = {
      nombre_original: sanitizeText(payload.nombre_original),
      tipo_mime: payload.tipo_mime || undefined,
      tamano_bytes: payload.tamano_bytes ? Number(payload.tamano_bytes) : undefined,
      bucket: sanitizeText(payload.bucket),
      ruta_objeto: sanitizeText(payload.ruta_objeto),
    };
    const adj = await apiClient.post<ArchivoAdjuntoItem>(
      `/conversaciones/${conversacionId}/adjuntos`,
      sanitized
    );
    return {
      mensaje_id: adj.mensaje_id,
      id: adj.mensaje_id,
      conversacion_id: Number(conversacionId),
      remitente_usuario_id: 0,
      remitente_id: 0,
      remitente_nombre: "Yo",
      tipo_mensaje_id: 2,
      contenido: `Archivo adjunto: ${adj.nombre_original}`,
      leido: false,
      enviado_en: adj.creado_en,
      fecha_envio: adj.creado_en,
      adjuntos: [adj],
      adjunto: {
        ...adj,
        id: adj.archivo_adjunto_id,
        nombre_archivo: adj.nombre_original,
      },
    };
  },

  async marcarLeido(mensajeId: number | string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`/mensajes/${mensajeId}/lectura`, {});
  },
};
