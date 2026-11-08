import DOMPurify from "dompurify";
import { apiClient } from "@/lib/api-client";
import { EnviarMensajeInput } from "@/schemas/chat.schema";

function sanitizeText(text: string): string {
  if (typeof window !== "undefined") return DOMPurify.sanitize(text);
  return text.replace(/[<>]/g, "");
}

export interface ArchivoAdjuntoItem {
  archivo_adjunto_id: number;
  mensaje_id: number;
  nombre_original: string;
  tipo_mime?: string | null;
  tamano_bytes?: number | null;
  bucket: string;
  ruta_objeto: string;
  creado_en: string;
}

export interface MensajeItem {
  mensaje_id: number;
  conversacion_id: number;
  remitente_usuario_id: number;
  remitente_nombre?: string | null;
  tipo_mensaje_id: number;
  tipo_mensaje_codigo?: string | null;
  contenido?: string | null;
  enviado_en: string;
  editado_en?: string | null;
  adjuntos: ArchivoAdjuntoItem[];
  leido: boolean;
}

export interface ConversacionItem {
  conversacion_id: number;
  solicitud_servicio_id: number;
  creada_en: string;
  cerrada_en?: string | null;
  participantes_ids: number[];
  ultimo_mensaje?: MensajeItem | null;
  otro_participante_id?: number | null;
  otro_participante_nombre?: string | null;
  otro_participante_rol?: string | null;
  servicio_titulo?: string | null;
  mensajes_no_leidos: number;
}

export const chatService = {
  getConversaciones: () => apiClient.get<ConversacionItem[]>("/conversaciones"),
  getMensajes: (conversacionId: number | string) => apiClient.get<MensajeItem[]>(`/conversaciones/${conversacionId}/mensajes`),
  enviarMensaje: (conversacionId: number | string, payload: EnviarMensajeInput) => apiClient.post<MensajeItem>(`/conversaciones/${conversacionId}/mensajes`, {
    contenido: sanitizeText(payload.contenido),
  }),
  marcarLeido: (mensajeId: number | string) => apiClient.post<{ message: string }>(`/mensajes/${mensajeId}/lectura`, {}),
};
