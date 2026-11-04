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
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(text);
  }
  return text.replace(/[<>]/g, "");
}

export interface DireccionItem {
  direccion_id: number;
  id?: number;
  usuario_id: number;
  ciudad_id: number;
  ciudad_nombre?: string;
  alias: string;
  linea_direccion: string;
  direccion_linea?: string;
  complemento?: string | null;
  referencia?: string | null;
  codigo_postal?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  es_principal?: boolean;
  activa: boolean;
  creado_en: string;
  fecha_creacion?: string;
}

export interface PerfilTrabajadorPrivado {
  perfil_trabajador_id: number;
  id?: number;
  usuario_id: number;
  ciudad_id?: number | null;
  ciudad_nombre?: string;
  titulo_profesional?: string | null;
  descripcion_profesional?: string | null;
  descripcion_perfil?: string;
  experiencia_resumen?: string | null;
  anos_experiencia?: number;
  activo: boolean;
  estado?: "ACTIVO" | "EN_REVISION" | "SUSPENDIDO";
  nombres?: string | null;
  apellidos?: string | null;
  calificacion_promedio?: number | null;
  promedio_calificacion?: number;
  total_calificaciones: number;
  servicios?: Array<Record<string, unknown>>;
  habilidades: Array<{
    habilidad_id: number;
    nombre: string;
    descripcion?: string | null;
    activa: boolean;
  }>;
  coberturas: Array<{
    ciudad_id: number;
    region_id?: number;
    nombre: string;
    codigo_externo?: string | null;
  }>;
  creado_en: string;
  actualizado_en?: string;
}

export interface HabilidadTrabajadorItem {
  usuario_id: number;
  habilidad_id: number;
  id?: number;
  nombre?: string | null;
  descripcion_competencia?: string | null;
  registrada_en: string;
  fecha_registro?: string;
}

export interface CoberturaTrabajadorItem {
  perfil_trabajador_id: number;
  ciudad_id: number;
  id?: number;
  ciudad_nombre?: string | null;
  departamento?: string;
  fecha_registro?: string;
}

export interface TrabajadorPagoItem {
  pago_id: number;
  id?: number;
  cita_id: number;
  metodo_pago_id: number;
  metodo_pago_nombre?: string | null;
  metodo_pago?: string;
  estado_pago_id?: number;
  estado_pago_codigo: string;
  estado?: "COMPLETADO" | "PENDIENTE";
  politica_comision_id?: number;
  porcentaje_comision?: number | null;
  monto_total: number;
  monto_bruto?: number;
  monto_comision?: number | null;
  comision_descontada?: number;
  monto_trabajador?: number | null;
  monto_neto?: number;
  referencia_pasarela?: string | null;
  referencia?: string;
  fecha_pago?: string | null;
  fecha?: string;
  servicio_titulo?: string;
  cliente_nombre?: string;
  creado_en: string;
}

export interface CalificacionRecibidaItem {
  calificacion_id: number;
  id?: number;
  cita_id: number;
  puntuacion: number;
  comentario?: string | null;
  cliente_nombre?: string | null;
  servicio_titulo?: string;
  creada_en: string;
  fecha?: string;
}

function mapDireccion(d: DireccionItem): DireccionItem {
  return {
    ...d,
    id: d.direccion_id,
    direccion_linea: d.linea_direccion,
    fecha_creacion: d.creado_en,
    es_principal: false,
    ciudad_nombre: "Colombia",
  };
}

function mapPerfil(p: PerfilTrabajadorPrivado): PerfilTrabajadorPrivado {
  return {
    ...p,
    id: p.perfil_trabajador_id,
    descripcion_perfil: p.descripcion_profesional || "",
    promedio_calificacion: p.calificacion_promedio ?? 5.0,
    estado: p.activo ? "ACTIVO" : "SUSPENDIDO",
    anos_experiencia: 0,
    ciudad_nombre: "Colombia",
    servicios: [],
  };
}

export const userService = {
  // === USUARIO ME ===
  async getMe(): Promise<AuthUser> {
    return await apiClient.get<AuthUser>("/me");
  },

  async updateMe(payload: EditarPerfilInput): Promise<AuthUser> {
    const sanitized = {
      nombres: sanitize(payload.nombres),
      apellidos: sanitize(payload.apellidos),
      telefono: payload.telefono ? sanitize(payload.telefono) : null,
    };
    return await apiClient.patch<AuthUser>("/me", sanitized);
  },

  async getRoles(): Promise<Array<{ id: number; codigo: string; nombre: string; descripcion: string; asignado: boolean }>> {
    const rolesCodes = await apiClient.get<string[]>("/me/roles");
    const activeRoles = Array.isArray(rolesCodes) ? rolesCodes : [];

    const catalogRoles = [
      { id: 1, codigo: "CLIENTE", nombre: "Cliente / Contratante", descripcion: "Permite explorar servicios, cotizar, programar citas y calificar profesionales." },
      { id: 2, codigo: "TRABAJADOR", nombre: "Profesional / Proveedor", descripcion: "Permite publicar servicios, recibir solicitudes, coordinar citas y gestionar cobros." },
      { id: 3, codigo: "ADMIN", nombre: "Administrador de Plataforma", descripcion: "Supervisión operativa, moderación, catálogos y políticas de comisión." },
    ];

    return catalogRoles.map((r) => ({
      ...r,
      asignado: activeRoles.includes(r.codigo),
    }));
  },

  // === DIRECCIONES ===
  async getDirecciones(): Promise<DireccionItem[]> {
    const res = await apiClient.get<DireccionItem[]>("/me/direcciones");
    return (Array.isArray(res) ? res : []).map(mapDireccion);
  },

  async createDireccion(payload: DireccionInput): Promise<DireccionItem> {
    const sanitized = {
      ciudad_id: Number(payload.ciudad_id),
      alias: sanitize(payload.alias),
      linea_direccion: sanitize(payload.linea_direccion),
      complemento: payload.complemento ? sanitize(payload.complemento) : undefined,
      referencia: payload.referencia ? sanitize(payload.referencia) : undefined,
      codigo_postal: payload.codigo_postal ? sanitize(payload.codigo_postal) : undefined,
      latitud: payload.latitud ? Number(payload.latitud) : undefined,
      longitud: payload.longitud ? Number(payload.longitud) : undefined,
    };
    const res = await apiClient.post<DireccionItem>("/me/direcciones", sanitized);
    return mapDireccion(res);
  },

  async updateDireccion(id: number | string, payload: Partial<DireccionInput>): Promise<DireccionItem> {
    const sanitized: Record<string, unknown> = {};
    if (payload.ciudad_id !== undefined) sanitized.ciudad_id = Number(payload.ciudad_id);
    if (payload.alias !== undefined) sanitized.alias = sanitize(payload.alias);
    if (payload.linea_direccion !== undefined) sanitized.linea_direccion = sanitize(payload.linea_direccion);
    if (payload.complemento !== undefined) sanitized.complemento = payload.complemento ? sanitize(payload.complemento) : null;
    if (payload.referencia !== undefined) sanitized.referencia = payload.referencia ? sanitize(payload.referencia) : null;
    if (payload.codigo_postal !== undefined) sanitized.codigo_postal = payload.codigo_postal ? sanitize(payload.codigo_postal) : null;
    if (payload.latitud !== undefined) sanitized.latitud = payload.latitud ? Number(payload.latitud) : null;
    if (payload.longitud !== undefined) sanitized.longitud = payload.longitud ? Number(payload.longitud) : null;

    const res = await apiClient.patch<DireccionItem>(`/me/direcciones/${id}`, sanitized);
    return mapDireccion(res);
  },

  async deleteDireccion(id: number | string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/me/direcciones/${id}`);
  },

  // === PERFIL PROFESIONAL PRIVADO ===
  async getPerfilTrabajador(): Promise<PerfilTrabajadorPrivado> {
    const res = await apiClient.get<PerfilTrabajadorPrivado>("/trabajador/perfil");
    return mapPerfil(res);
  },

  async crearPerfilTrabajador(payload: PerfilTrabajadorInput): Promise<PerfilTrabajadorPrivado> {
    const sanitized = {
      ciudad_id: Number(payload.ciudad_id),
      titulo_profesional: sanitize(payload.titulo_profesional),
      descripcion_profesional: sanitize(payload.descripcion_profesional),
      experiencia_resumen: payload.experiencia_resumen ? sanitize(payload.experiencia_resumen) : undefined,
    };
    const res = await apiClient.post<PerfilTrabajadorPrivado>("/trabajador/perfil", sanitized);
    return mapPerfil(res);
  },

  async actualizarPerfilTrabajador(payload: Partial<PerfilTrabajadorInput>): Promise<PerfilTrabajadorPrivado> {
    const sanitized: Record<string, unknown> = {};
    if (payload.ciudad_id !== undefined) sanitized.ciudad_id = Number(payload.ciudad_id);
    if (payload.titulo_profesional !== undefined) sanitized.titulo_profesional = sanitize(payload.titulo_profesional);
    if (payload.descripcion_profesional !== undefined) sanitized.descripcion_profesional = sanitize(payload.descripcion_profesional);
    if (payload.experiencia_resumen !== undefined) sanitized.experiencia_resumen = payload.experiencia_resumen ? sanitize(payload.experiencia_resumen) : null;

    const res = await apiClient.patch<PerfilTrabajadorPrivado>("/trabajador/perfil", sanitized);
    return mapPerfil(res);
  },

  // === HABILIDADES DEL TRABAJADOR ===
  async getHabilidadesTrabajador(): Promise<HabilidadTrabajadorItem[]> {
    const res = await apiClient.get<HabilidadTrabajadorItem[]>("/trabajador/habilidades");
    return (Array.isArray(res) ? res : []).map((h) => ({
      ...h,
      id: h.habilidad_id,
      fecha_registro: h.registrada_en,
    }));
  },

  async agregarHabilidadTrabajador(payload: HabilidadTrabajadorInput): Promise<HabilidadTrabajadorItem> {
    const res = await apiClient.post<HabilidadTrabajadorItem>("/trabajador/habilidades", {
      habilidad_id: Number(payload.habilidad_id),
      descripcion_competencia: payload.descripcion_competencia ? sanitize(payload.descripcion_competencia) : null,
    });
    return {
      ...res,
      id: res.habilidad_id,
      fecha_registro: res.registrada_en,
    };
  },

  async quitarHabilidadTrabajador(habilidadId: number | string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/trabajador/habilidades/${habilidadId}`);
  },

  // === COBERTURAS DEL TRABAJADOR ===
  async getCoberturasTrabajador(): Promise<CoberturaTrabajadorItem[]> {
    const res = await apiClient.get<CoberturaTrabajadorItem[]>("/trabajador/coberturas");
    return (Array.isArray(res) ? res : []).map((c) => ({
      ...c,
      id: c.ciudad_id,
      departamento: "Colombia",
      fecha_registro: new Date().toISOString(),
    }));
  },

  async agregarCoberturaTrabajador(ciudadId: number | string): Promise<CoberturaTrabajadorItem> {
    const res = await apiClient.post<CoberturaTrabajadorItem>("/trabajador/coberturas", {
      ciudad_id: Number(ciudadId),
    });
    return {
      ...res,
      id: res.ciudad_id,
      departamento: "Colombia",
      fecha_registro: new Date().toISOString(),
    };
  },

  async quitarCoberturaTrabajador(ciudadId: number | string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/trabajador/coberturas/${ciudadId}`);
  },

  // === PAGOS DEL TRABAJADOR ===
  async getPagosTrabajador(): Promise<TrabajadorPagoItem[]> {
    const res = await apiClient.get<TrabajadorPagoItem[]>("/trabajador/pagos");
    return (Array.isArray(res) ? res : []).map((p) => ({
      ...p,
      id: p.pago_id,
      monto_bruto: p.monto_total,
      comision_descontada: p.monto_comision ?? 0,
      monto_neto: p.monto_trabajador ?? p.monto_total,
      metodo_pago: p.metodo_pago_nombre || "SIMULADO",
      estado: p.estado_pago_codigo === "PAGADO" ? "COMPLETADO" : "PENDIENTE",
      referencia: p.referencia_pasarela || `PAG-${p.pago_id}`,
      fecha: p.creado_en,
      servicio_titulo: "Servicio Finalizado",
      cliente_nombre: "Cliente FindJob",
    }));
  },

  // === CALIFICACIONES DEL TRABAJADOR ===
  async getCalificacionesTrabajador(): Promise<CalificacionRecibidaItem[]> {
    const res = await apiClient.get<CalificacionRecibidaItem[]>("/trabajador/calificaciones");
    return (Array.isArray(res) ? res : []).map((c) => ({
      ...c,
      id: c.calificacion_id,
      fecha: c.creada_en,
      servicio_titulo: "Servicio Calificado",
    }));
  },
};
