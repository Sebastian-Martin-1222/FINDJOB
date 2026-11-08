import DOMPurify from "dompurify";
import { apiClient } from "@/lib/api-client";
import { AuthUser } from "@/lib/auth-storage";
import {
  EditarPerfilInput,
  DireccionInput,
  PerfilTrabajadorInput,
  HabilidadTrabajadorInput,
} from "@/schemas/user.schema";

function sanitize(text: string): string {
  if (typeof window !== "undefined") return DOMPurify.sanitize(text);
  return text.replace(/[<>]/g, "");
}

export interface DireccionItem {
  direccion_id: number;
  usuario_id: number;
  ciudad_id: number;
  ciudad_nombre?: string | null;
  alias: string;
  linea_direccion: string;
  complemento?: string | null;
  referencia?: string | null;
  codigo_postal?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  activa: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface PerfilTrabajadorPrivado {
  perfil_trabajador_id: number;
  usuario_id: number;
  ciudad_id?: number | null;
  ciudad_nombre?: string | null;
  titulo_profesional?: string | null;
  descripcion_profesional?: string | null;
  experiencia_resumen?: string | null;
  activo: boolean;
  nombres?: string | null;
  apellidos?: string | null;
  calificacion_promedio?: number | null;
  total_calificaciones: number;
  habilidades: Array<{
    habilidad_id: number;
    nombre: string;
    descripcion?: string | null;
    activa: boolean;
  }>;
  coberturas: Array<{
    ciudad_id: number;
    region_id: number;
    nombre: string;
    codigo_externo?: string | null;
  }>;
  creado_en: string;
  actualizado_en: string;
}

export interface HabilidadTrabajadorItem {
  usuario_id: number;
  habilidad_id: number;
  nombre?: string | null;
  descripcion_competencia?: string | null;
  registrada_en: string;
}

export interface CoberturaTrabajadorItem {
  perfil_trabajador_id: number;
  ciudad_id: number;
  ciudad_nombre?: string | null;
}

export interface TrabajadorPagoItem {
  pago_id: number;
  cita_id: number;
  metodo_pago_id: number;
  metodo_pago_nombre?: string | null;
  estado_pago_id: number;
  estado_pago_codigo: string;
  politica_comision_id: number;
  porcentaje_comision?: number | null;
  monto_total: number;
  monto_comision?: number | null;
  monto_trabajador?: number | null;
  referencia_pasarela?: string | null;
  fecha_pago?: string | null;
  creado_en: string;
  servicio_titulo?: string | null;
  cliente_nombre?: string | null;
  trabajador_nombre?: string | null;
}

export interface CalificacionRecibidaItem {
  calificacion_id: number;
  cita_id: number;
  puntuacion: number;
  comentario?: string | null;
  cliente_nombre?: string | null;
  servicio_titulo?: string | null;
  creada_en: string;
}

export const userService = {
  getMe: () => apiClient.get<AuthUser>("/me"),

  updateMe: (payload: EditarPerfilInput) =>
    apiClient.patch<AuthUser>("/me", {
      nombres: sanitize(payload.nombres),
      apellidos: sanitize(payload.apellidos),
      telefono: payload.telefono ? sanitize(payload.telefono) : null,
    }),

  async getRoles(): Promise<Array<{ codigo: string; nombre: string; descripcion: string; asignado: boolean }>> {
    const rolesCodes = await apiClient.get<string[]>("/me/roles");
    const metadata: Record<string, { nombre: string; descripcion: string }> = {
      CLIENTE: { nombre: "Contratar servicios", descripcion: "Permite explorar y solicitar servicios." },
      TRABAJADOR: { nombre: "Ofrecer servicios", descripcion: "Permite publicar servicios y atender solicitudes." },
      ADMIN: { nombre: "Administrar plataforma", descripcion: "Permite gestionar la operación de la plataforma." },
    };
    return rolesCodes.map((codigo) => ({
      codigo,
      nombre: metadata[codigo]?.nombre ?? codigo,
      descripcion: metadata[codigo]?.descripcion ?? "Acceso asignado a la cuenta.",
      asignado: true,
    }));
  },

  getDirecciones: () => apiClient.get<DireccionItem[]>("/me/direcciones"),

  createDireccion: (payload: DireccionInput) =>
    apiClient.post<DireccionItem>("/me/direcciones", {
      ciudad_id: Number(payload.ciudad_id),
      alias: sanitize(payload.alias),
      linea_direccion: sanitize(payload.linea_direccion),
      complemento: payload.complemento ? sanitize(payload.complemento) : null,
      referencia: payload.referencia ? sanitize(payload.referencia) : null,
      codigo_postal: payload.codigo_postal ? sanitize(payload.codigo_postal) : null,
      latitud: payload.latitud ?? null,
      longitud: payload.longitud ?? null,
    }),

  updateDireccion: (id: number | string, payload: Partial<DireccionInput>) => {
    const body: Record<string, unknown> = {};
    if (payload.ciudad_id !== undefined) body.ciudad_id = Number(payload.ciudad_id);
    if (payload.alias !== undefined) body.alias = sanitize(payload.alias);
    if (payload.linea_direccion !== undefined) body.linea_direccion = sanitize(payload.linea_direccion);
    if (payload.complemento !== undefined) body.complemento = payload.complemento ? sanitize(payload.complemento) : null;
    if (payload.referencia !== undefined) body.referencia = payload.referencia ? sanitize(payload.referencia) : null;
    if (payload.codigo_postal !== undefined) body.codigo_postal = payload.codigo_postal ? sanitize(payload.codigo_postal) : null;
    if (payload.latitud !== undefined) body.latitud = payload.latitud ?? null;
    if (payload.longitud !== undefined) body.longitud = payload.longitud ?? null;
    return apiClient.patch<DireccionItem>(`/me/direcciones/${id}`, body);
  },

  deleteDireccion: (id: number | string) => apiClient.delete<void>(`/me/direcciones/${id}`),

  getPerfilTrabajador: () => apiClient.get<PerfilTrabajadorPrivado>("/trabajador/perfil"),

  crearPerfilTrabajador: (payload: PerfilTrabajadorInput) =>
    apiClient.post<PerfilTrabajadorPrivado>("/trabajador/perfil", {
      ciudad_id: Number(payload.ciudad_id),
      titulo_profesional: sanitize(payload.titulo_profesional),
      descripcion_profesional: sanitize(payload.descripcion_profesional),
      experiencia_resumen: payload.experiencia_resumen ? sanitize(payload.experiencia_resumen) : null,
    }),

  actualizarPerfilTrabajador: (payload: Partial<PerfilTrabajadorInput>) => {
    const body: Record<string, unknown> = {};
    if (payload.ciudad_id !== undefined) body.ciudad_id = Number(payload.ciudad_id);
    if (payload.titulo_profesional !== undefined) body.titulo_profesional = sanitize(payload.titulo_profesional);
    if (payload.descripcion_profesional !== undefined) body.descripcion_profesional = sanitize(payload.descripcion_profesional);
    if (payload.experiencia_resumen !== undefined) body.experiencia_resumen = payload.experiencia_resumen ? sanitize(payload.experiencia_resumen) : null;
    return apiClient.patch<PerfilTrabajadorPrivado>("/trabajador/perfil", body);
  },

  getHabilidadesTrabajador: () => apiClient.get<HabilidadTrabajadorItem[]>("/trabajador/habilidades"),
  agregarHabilidadTrabajador: (payload: HabilidadTrabajadorInput) =>
    apiClient.post<HabilidadTrabajadorItem>("/trabajador/habilidades", {
      habilidad_id: Number(payload.habilidad_id),
      descripcion_competencia: payload.descripcion_competencia ? sanitize(payload.descripcion_competencia) : null,
    }),
  quitarHabilidadTrabajador: (habilidadId: number | string) => apiClient.delete<void>(`/trabajador/habilidades/${habilidadId}`),

  getCoberturasTrabajador: () => apiClient.get<CoberturaTrabajadorItem[]>("/trabajador/coberturas"),
  agregarCoberturaTrabajador: (ciudadId: number | string) => apiClient.post<CoberturaTrabajadorItem>("/trabajador/coberturas", { ciudad_id: Number(ciudadId) }),
  quitarCoberturaTrabajador: (ciudadId: number | string) => apiClient.delete<void>(`/trabajador/coberturas/${ciudadId}`),

  getPagosTrabajador: () => apiClient.get<TrabajadorPagoItem[]>("/trabajador/pagos"),
  getCalificacionesTrabajador: () => apiClient.get<CalificacionRecibidaItem[]>("/trabajador/calificaciones"),
};
