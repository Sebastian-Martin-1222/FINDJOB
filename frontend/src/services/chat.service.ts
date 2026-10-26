import DOMPurify from "dompurify";
import { apiClient } from "@/lib/api-client";
import { EnviarMensajeInput, AdjuntoInput } from "@/schemas/chat.schema";

function sanitizeText(text: string): string {
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(text);
  }
  return text.replace(/[<>]/g, "");
}

export interface ConversacionItem {
  id: number;
  solicitud_id: number;
  servicio_titulo: string;
  otro_participante_id: number;
  otro_participante_nombre: string;
  otro_participante_rol: "CLIENTE" | "TRABAJADOR";
  ultimo_mensaje?: string;
  ultimo_mensaje_fecha?: string;
  mensajes_no_leidos: number;
  activa: boolean;
}

export interface MensajeItem {
  id: number;
  conversacion_id: number;
  remitente_id: number;
  remitente_nombre: string;
  contenido: string;
  leido: boolean;
  fecha_envio: string;
  adjunto?: {
    id: number;
    nombre_archivo: string;
    tipo_mime: string;
    tamano_bytes: number;
    url_descarga: string;
  };
}

export const chatService = {
  async getConversaciones(): Promise<ConversacionItem[]> {
    try {
      const res = await apiClient.get<ConversacionItem[]>("/conversaciones");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          solicitud_id: 501,
          servicio_titulo: "Desarrollo de API REST Segura y Arquitectura Cloud en GCP",
          otro_participante_id: 101,
          otro_participante_nombre: "Carlos Mendoza",
          otro_participante_rol: "TRABAJADOR",
          ultimo_mensaje: "Perfecto, nos vemos en la fecha acordada para validar el cluster.",
          ultimo_mensaje_fecha: new Date(Date.now() - 3600000).toISOString(),
          mensajes_no_leidos: 1,
          activa: true,
        },
        {
          id: 2,
          solicitud_id: 502,
          servicio_titulo: "Diagnóstico Eléctrico y Cableado Estructurado",
          otro_participante_id: 102,
          otro_participante_nombre: "Luisa Rodríguez",
          otro_participante_rol: "TRABAJADOR",
          ultimo_mensaje: "¿Tienes el plano de los tableros de breakers disponible?",
          ultimo_mensaje_fecha: new Date(Date.now() - 86400000).toISOString(),
          mensajes_no_leidos: 0,
          activa: true,
        },
      ];
    }
  },

  async getMensajes(conversacionId: number | string): Promise<MensajeItem[]> {
    try {
      const res = await apiClient.get<MensajeItem[]>(`/conversaciones/${conversacionId}/mensajes`);
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          conversacion_id: Number(conversacionId),
          remitente_id: 101,
          remitente_nombre: "Carlos Mendoza",
          contenido: "Hola, un gusto saludarte. Recibí tu solicitud para la arquitectura en GCP.",
          leido: true,
          fecha_envio: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: 2,
          conversacion_id: Number(conversacionId),
          remitente_id: 1,
          remitente_nombre: "Yo",
          contenido: "Hola Carlos, excelente. Requerimos asegurar que las migraciones en Cloud SQL queden en 3FN y auditadas.",
          leido: true,
          fecha_envio: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 3,
          conversacion_id: Number(conversacionId),
          remitente_id: 101,
          remitente_nombre: "Carlos Mendoza",
          contenido: "Perfecto, nos vemos en la fecha acordada para validar el cluster y las políticas de Cloud Armor.",
          leido: true,
          fecha_envio: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }
  },

  async enviarMensaje(
    conversacionId: number | string,
    payload: EnviarMensajeInput
  ): Promise<MensajeItem> {
    const sanitized = {
      contenido: sanitizeText(payload.contenido),
    };
    try {
      return await apiClient.post<MensajeItem>(
        `/conversaciones/${conversacionId}/mensajes`,
        sanitized
      );
    } catch {
      return {
        id: Date.now(),
        conversacion_id: Number(conversacionId),
        remitente_id: 1,
        remitente_nombre: "Yo",
        contenido: sanitized.contenido,
        leido: false,
        fecha_envio: new Date().toISOString(),
      };
    }
  },

  async adjuntarArchivo(
    conversacionId: number | string,
    payload: AdjuntoInput
  ): Promise<MensajeItem> {
    try {
      return await apiClient.post<MensajeItem>(
        `/conversaciones/${conversacionId}/adjuntos`,
        payload
      );
    } catch {
      return {
        id: Date.now(),
        conversacion_id: Number(conversacionId),
        remitente_id: 1,
        remitente_nombre: "Yo",
        contenido: `Archivo adjunto: ${payload.nombre_archivo}`,
        leido: false,
        fecha_envio: new Date().toISOString(),
        adjunto: {
          id: Date.now(),
          nombre_archivo: payload.nombre_archivo,
          tipo_mime: payload.tipo_mime,
          tamano_bytes: payload.tamano_bytes,
          url_descarga: payload.storage_url,
        },
      };
    }
  },

  async marcarLeido(mensajeId: number | string): Promise<void> {
    try {
      await apiClient.post(`/mensajes/${mensajeId}/lectura`, {});
    } catch {
      // Ignorar error si no está disponible el endpoint en local
    }
  },
};
