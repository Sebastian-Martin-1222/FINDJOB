import DOMPurify from "dompurify";
import { apiClient } from "@/lib/api-client";
import {
  CreateSolicitudInput,
  ProgramarCitaInput,
  ConfirmarCitaInput,
  AlertaSeguridadInput,
  ResponderChequeoInput,
  RegistroPagoInput,
  CalificacionInput,
  PublicarServicioInput,
} from "@/schemas/marketplace.schema";
import { ModalidadCatalogoItem } from "@/services/catalog.service";
import { PerfilTrabajadorPrivado } from "@/services/user.service";

// Alias de compatibilidad para vistas existentes
export type TrabajadorPerfilPublico = PerfilTrabajadorPrivado;

// SSR-Safe Sanitizer
function sanitize(text: string): string {
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(text);
  }
  return text.replace(/[<>]/g, "");
}

export interface ServicioDetalle {
  servicio_id: number;
  id?: number;
  perfil_trabajador_id: number;
  trabajador_id?: number;
  subcategoria_id: number;
  titulo: string;
  descripcion: string;
  precio_base: number;
  tiempo_estimado_horas: number;
  revisiones_incluidas: number;
  activo: boolean;
  estado?: "ACTIVO" | "INACTIVO";
  trabajador_nombres?: string | null;
  trabajador_apellidos?: string | null;
  trabajador_nombre?: string;
  categoria_nombre?: string | null;
  subcategoria_nombre?: string | null;
  modalidades: ModalidadCatalogoItem[];
  calificacion_promedio?: number | null;
  trabajador_rating?: number;
  trabajador_total_calificaciones?: number;
  creado_en: string;
  fecha_creacion?: string;
  actualizado_en?: string;
}

export interface SolicitudItem {
  solicitud_servicio_id: number;
  id?: number;
  cliente_usuario_id: number;
  cliente_id?: number;
  servicio_id: number;
  modalidad_id: number;
  modalidad?: string;
  estado_solicitud_id: number;
  estado_codigo: string;
  estado?: string;
  direccion_id?: number | null;
  direccion_texto?: string;
  ciudad_nombre?: string;
  descripcion_necesidad: string;
  descripcion?: string;
  fecha_propuesta: string;
  fecha_preferida?: string;
  valor_acordado?: number | null;
  plataforma_remota?: string | null;
  servicio_titulo?: string | null;
  cliente_nombre?: string | null;
  trabajador_nombre?: string | null;
  creada_en: string;
  fecha_creacion?: string;
  respondida_en?: string | null;
  actualizado_en: string;
  cita_id?: number;
}

export interface CitaDetalle {
  cita_id: number;
  id?: number;
  solicitud_servicio_id: number;
  solicitud_id?: number;
  estado_cita_id: number;
  estado_codigo: string;
  estado?: string;
  direccion_id?: number | null;
  direccion_texto?: string;
  fecha_inicio: string;
  fecha_fin?: string | null;
  codigo_confirmacion?: string | null;
  pin_confirmado?: boolean;
  pin_seguridad?: string;
  pin_requerido?: boolean;
  plataforma_remota?: string | null;
  enlace_reunion?: string | null;
  modalidad_codigo?: string | null;
  modalidad?: string;
  servicio_titulo?: string | null;
  cliente_id?: number;
  cliente_nombre?: string;
  trabajador_id?: number;
  trabajador_nombre?: string;
  monto_acordado?: number;
  pago_realizado?: boolean;
  pago_id?: number;
  calificacion_realizada?: boolean;
  creada_en: string;
  actualizado_en: string;
}

export interface RespuestaChequeoItem {
  chequeo_seguridad_id: number;
  id?: number;
  pregunta_seguridad_id: number;
  pregunta_texto?: string | null;
  pregunta?: string;
  usuario_id: number;
  respuesta_ok: boolean;
  respondida?: boolean;
  respuesta?: string;
  comentario?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  respondido_en: string;
  fecha_pregunta?: string;
}

export interface ChequeoSeguridadItem {
  chequeo_seguridad_id: number;
  id?: number;
  cita_id: number;
  generado_en: string;
  fecha_pregunta?: string;
  cerrado_en?: string | null;
  respuestas: RespuestaChequeoItem[];
  pregunta?: string;
  respondida?: boolean;
  respuesta?: string;
}

export interface AlertaSeguridadItem {
  alerta_seguridad_id: number;
  id?: number;
  cita_id: number;
  usuario_id: number;
  usuario_nombre?: string | null;
  cliente_nombre?: string;
  trabajador_nombre?: string;
  tipo_alerta_id: number;
  tipo_alerta_codigo?: string | null;
  tipo_alerta?: string;
  descripcion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  ubicacion_capturada_en?: string | null;
  creada_en: string;
  fecha_registro?: string;
  estado?: string;
}

export interface PagoDetalle {
  pago_id: number;
  id?: number;
  cita_id: number;
  metodo_pago_id: number;
  metodo_pago_nombre?: string | null;
  metodo_pago?: string;
  estado_pago_id: number;
  estado_pago_codigo: string;
  estado?: string;
  politica_comision_id: number;
  porcentaje_comision?: number | null;
  monto_total: number;
  monto?: number;
  monto_comision?: number | null;
  comision_plataforma?: number;
  monto_trabajador?: number | null;
  referencia_pasarela?: string | null;
  referencia?: string;
  fecha_pago?: string | null;
  creado_en: string;
  fecha_creacion?: string;
  cliente_nombre?: string;
  trabajador_nombre?: string;
}

export interface CalificacionItem {
  calificacion_id: number;
  id?: number;
  cita_id: number;
  puntuacion: number;
  comentario?: string | null;
  cliente_nombre?: string | null;
  creada_en: string;
  fecha?: string;
}

export interface FiltrosServicio {
  categoria_id?: number;
  subcategoria_id?: number;
  modalidad_id?: number;
  ciudad_id?: number;
  precio_max?: number;
  calificacion_min?: number;
  limit?: number;
  offset?: number;
}

function mapServicio(s: ServicioDetalle): ServicioDetalle {
  const nombreCompleto = [s.trabajador_nombres, s.trabajador_apellidos].filter(Boolean).join(" ");
  return {
    ...s,
    id: s.servicio_id,
    trabajador_id: s.perfil_trabajador_id,
    trabajador_nombre: nombreCompleto || "Profesional FindJob",
    estado: s.activo ? "ACTIVO" : "INACTIVO",
    trabajador_rating: s.calificacion_promedio ?? 5.0,
    trabajador_total_calificaciones: 0,
    fecha_creacion: s.creado_en,
  };
}

function mapSolicitud(sol: SolicitudItem): SolicitudItem {
  return {
    ...sol,
    id: sol.solicitud_servicio_id,
    cliente_id: sol.cliente_usuario_id,
    modalidad: sol.modalidad_id === 1 ? "REMOTA" : "PRESENCIAL",
    estado: sol.estado_codigo,
    descripcion: sol.descripcion_necesidad,
    fecha_preferida: sol.fecha_propuesta,
    fecha_creacion: sol.creada_en,
  };
}

function mapCita(c: CitaDetalle): CitaDetalle {
  return {
    ...c,
    id: c.cita_id,
    solicitud_id: c.solicitud_servicio_id,
    estado: c.estado_codigo,
    modalidad: c.modalidad_codigo || "PRESENCIAL",
    pin_confirmado: c.estado_codigo === "CONFIRMADA" || c.estado_codigo === "EN_EJECUCION" || c.estado_codigo === "FINALIZADA",
    pin_requerido: true,
  };
}

export const marketplaceService = {
  // === SERVICIOS ===
  async buscarServicios(filtros: FiltrosServicio = {}): Promise<ServicioDetalle[]> {
    const params = new URLSearchParams();
    if (filtros.categoria_id) params.set("categoria_id", String(filtros.categoria_id));
    if (filtros.subcategoria_id) params.set("subcategoria_id", String(filtros.subcategoria_id));
    if (filtros.modalidad_id) params.set("modalidad_id", String(filtros.modalidad_id));
    if (filtros.ciudad_id) params.set("ciudad_id", String(filtros.ciudad_id));
    if (filtros.precio_max) params.set("precio_max", String(filtros.precio_max));
    if (filtros.calificacion_min) params.set("calificacion_min", String(filtros.calificacion_min));
    if (filtros.limit) params.set("limit", String(filtros.limit));
    if (filtros.offset) params.set("offset", String(filtros.offset));

    const endpoint = `/servicios${params.toString() ? `?${params.toString()}` : ""}`;
    const res = await apiClient.get<ServicioDetalle[]>(endpoint, { requiresAuth: false });
    return (Array.isArray(res) ? res : []).map(mapServicio);
  },

  async getServicioById(id: number | string): Promise<ServicioDetalle> {
    const res = await apiClient.get<ServicioDetalle>(`/servicios/${id}`, { requiresAuth: false });
    return mapServicio(res);
  },

  async publicarServicio(payload: PublicarServicioInput): Promise<ServicioDetalle> {
    const sanitized = {
      subcategoria_id: Number(payload.subcategoria_id),
      titulo: sanitize(payload.titulo),
      descripcion: sanitize(payload.descripcion),
      precio_base: Number(payload.precio_base),
      tiempo_estimado_horas: Number(payload.tiempo_estimado_horas),
      revisiones_incluidas: Number(payload.revisiones_incluidas),
      modalidades_ids: payload.modalidades_ids.map(Number),
    };
    const res = await apiClient.post<ServicioDetalle>("/servicios", sanitized);
    return mapServicio(res);
  },

  async actualizarServicio(
    id: number | string,
    payload: Partial<PublicarServicioInput> & { activo?: boolean }
  ): Promise<ServicioDetalle> {
    const sanitized: Record<string, unknown> = {};
    if (payload.subcategoria_id !== undefined) sanitized.subcategoria_id = Number(payload.subcategoria_id);
    if (payload.titulo !== undefined) sanitized.titulo = sanitize(payload.titulo);
    if (payload.descripcion !== undefined) sanitized.descripcion = sanitize(payload.descripcion);
    if (payload.precio_base !== undefined) sanitized.precio_base = Number(payload.precio_base);
    if (payload.tiempo_estimado_horas !== undefined) sanitized.tiempo_estimado_horas = Number(payload.tiempo_estimado_horas);
    if (payload.revisiones_incluidas !== undefined) sanitized.revisiones_incluidas = Number(payload.revisiones_incluidas);
    if (payload.activo !== undefined) sanitized.activo = Boolean(payload.activo);

    const res = await apiClient.patch<ServicioDetalle>(`/servicios/${id}`, sanitized);
    return mapServicio(res);
  },

  async desactivarServicio(id: number | string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/servicios/${id}`);
  },

  async configurarModalidades(
    servicioId: number | string,
    modalidades_ids: number[]
  ): Promise<ServicioDetalle> {
    const res = await apiClient.put<ServicioDetalle>(`/servicios/${servicioId}/modalidades`, {
      modalidades_ids: modalidades_ids.map(Number),
    });
    return mapServicio(res);
  },

  async getMisServiciosTrabajador(): Promise<ServicioDetalle[]> {
    const res = await apiClient.get<ServicioDetalle[]>("/trabajador/servicios");
    return (Array.isArray(res) ? res : []).map(mapServicio);
  },

  // === SOLICITUDES ===
  async createSolicitud(payload: CreateSolicitudInput): Promise<SolicitudItem> {
    const sanitized = {
      servicio_id: Number(payload.servicio_id),
      modalidad_id: Number(payload.modalidad_id),
      direccion_id: payload.direccion_id ? Number(payload.direccion_id) : null,
      descripcion_necesidad: sanitize(payload.descripcion_necesidad),
      fecha_propuesta: payload.fecha_propuesta,
      valor_acordado: payload.valor_acordado ? Number(payload.valor_acordado) : null,
      plataforma_remota: payload.plataforma_remota ? sanitize(payload.plataforma_remota) : null,
    };
    const res = await apiClient.post<SolicitudItem>("/solicitudes", sanitized);
    return mapSolicitud(res);
  },

  async getMisSolicitudes(): Promise<SolicitudItem[]> {
    const res = await apiClient.get<SolicitudItem[]>("/solicitudes/mis-solicitudes");
    return (Array.isArray(res) ? res : []).map(mapSolicitud);
  },

  async getSolicitudesRecibidas(): Promise<SolicitudItem[]> {
    const res = await apiClient.get<SolicitudItem[]>("/solicitudes/recibidas");
    return (Array.isArray(res) ? res : []).map(mapSolicitud);
  },

  async getSolicitudById(id: number | string): Promise<SolicitudItem> {
    const res = await apiClient.get<SolicitudItem>(`/solicitudes/${id}`);
    return mapSolicitud(res);
  },

  async aceptarSolicitud(id: number | string): Promise<SolicitudItem> {
    const res = await apiClient.patch<SolicitudItem>(`/solicitudes/${id}/aceptar`);
    return mapSolicitud(res);
  },

  async rechazarSolicitud(id: number | string): Promise<SolicitudItem> {
    const res = await apiClient.patch<SolicitudItem>(`/solicitudes/${id}/rechazar`);
    return mapSolicitud(res);
  },

  async cancelarSolicitud(id: number | string): Promise<SolicitudItem> {
    const res = await apiClient.patch<SolicitudItem>(`/solicitudes/${id}/cancelar`);
    return mapSolicitud(res);
  },

  // === CITAS ===
  async programarCita(
    solicitudId: number | string,
    payload: ProgramarCitaInput
  ): Promise<CitaDetalle> {
    const sanitized = {
      direccion_id: payload.direccion_id ? Number(payload.direccion_id) : null,
      fecha_inicio: payload.fecha_inicio,
      fecha_fin: payload.fecha_fin || null,
      plataforma_remota: payload.plataforma_remota ? sanitize(payload.plataforma_remota) : null,
      enlace_reunion: payload.enlace_reunion ? sanitize(payload.enlace_reunion) : null,
    };
    const res = await apiClient.post<CitaDetalle>(`/solicitudes/${solicitudId}/cita`, sanitized);
    return mapCita(res);
  },

  async getMisCitas(): Promise<CitaDetalle[]> {
    const res = await apiClient.get<CitaDetalle[]>("/citas/mis-citas");
    return (Array.isArray(res) ? res : []).map(mapCita);
  },

  async getCitaById(id: number | string): Promise<CitaDetalle> {
    const res = await apiClient.get<CitaDetalle>(`/citas/${id}`);
    return mapCita(res);
  },

  async actualizarCita(
    id: number | string,
    payload: Partial<ProgramarCitaInput>
  ): Promise<CitaDetalle> {
    const sanitized: Record<string, unknown> = {};
    if (payload.direccion_id !== undefined) sanitized.direccion_id = payload.direccion_id ? Number(payload.direccion_id) : null;
    if (payload.fecha_inicio !== undefined) sanitized.fecha_inicio = payload.fecha_inicio;
    if (payload.fecha_fin !== undefined) sanitized.fecha_fin = payload.fecha_fin || null;
    if (payload.plataforma_remota !== undefined) sanitized.plataforma_remota = payload.plataforma_remota ? sanitize(payload.plataforma_remota) : null;
    if (payload.enlace_reunion !== undefined) sanitized.enlace_reunion = payload.enlace_reunion ? sanitize(payload.enlace_reunion) : null;

    const res = await apiClient.patch<CitaDetalle>(`/citas/${id}`, sanitized);
    return mapCita(res);
  },

  async iniciarCita(id: number | string): Promise<CitaDetalle> {
    const res = await apiClient.patch<CitaDetalle>(`/citas/${id}/iniciar`);
    return mapCita(res);
  },

  async finalizarCita(id: number | string): Promise<CitaDetalle> {
    const res = await apiClient.patch<CitaDetalle>(`/citas/${id}/finalizar`);
    return mapCita(res);
  },

  async confirmarCitaPin(
    id: number | string,
    codigoConfirmacion: string
  ): Promise<CitaDetalle> {
    const res = await apiClient.post<CitaDetalle>(`/citas/${id}/confirmar`, {
      codigo_confirmacion: codigoConfirmacion.trim(),
    });
    return mapCita(res);
  },

  // === SEGURIDAD PRESENCIAL ===
  async crearAlertaSeguridad(
    citaId: number | string,
    payload: AlertaSeguridadInput
  ): Promise<AlertaSeguridadItem> {
    const res = await apiClient.post<AlertaSeguridadItem>(
      `/citas/${citaId}/alertas-seguridad`,
      {
        tipo_alerta_id: Number(payload.tipo_alerta_id),
        descripcion: payload.descripcion ? sanitize(payload.descripcion) : null,
        latitud: payload.latitud ? Number(payload.latitud) : null,
        longitud: payload.longitud ? Number(payload.longitud) : null,
      }
    );
    return {
      ...res,
      id: res.alerta_seguridad_id,
      tipo_alerta: res.tipo_alerta_codigo || "ALERTA",
      fecha_registro: res.creada_en,
    };
  },

  async getChequeosCita(citaId: number | string): Promise<ChequeoSeguridadItem[]> {
    const res = await apiClient.get<ChequeoSeguridadItem[]>(`/citas/${citaId}/chequeos-seguridad`);
    return (Array.isArray(res) ? res : []).map((ch) => ({
      ...ch,
      id: ch.chequeo_seguridad_id,
      pregunta: ch.respuestas[0]?.pregunta_texto || `Chequeo #${ch.chequeo_seguridad_id}`,
      respondida: ch.respuestas.length > 0,
      respuesta: ch.respuestas[0] ? (ch.respuestas[0].respuesta_ok ? "Sí" : "No") : undefined,
      fecha_pregunta: ch.generado_en,
    }));
  },

  async responderChequeo(
    chequeoId: number | string,
    payload: ResponderChequeoInput
  ): Promise<RespuestaChequeoItem> {
    const res = await apiClient.post<RespuestaChequeoItem>(
      `/chequeos-seguridad/${chequeoId}/respuestas`,
      {
        pregunta_seguridad_id: Number(payload.pregunta_seguridad_id),
        respuesta_ok: Boolean(payload.respuesta_ok),
        comentario: payload.comentario ? sanitize(payload.comentario) : null,
        latitud: payload.latitud ? Number(payload.latitud) : null,
        longitud: payload.longitud ? Number(payload.longitud) : null,
      }
    );
    return {
      ...res,
      id: res.chequeo_seguridad_id,
      pregunta: res.pregunta_texto || undefined,
      respondida: true,
      respuesta: res.respuesta_ok ? "Sí" : "No",
      fecha_pregunta: res.respondido_en,
    };
  },

  // === PAGOS Y CALIFICACIONES ===
  async registrarPagoCita(
    citaId: number | string,
    payload: RegistroPagoInput
  ): Promise<PagoDetalle> {
    const res = await apiClient.post<PagoDetalle>(`/citas/${citaId}/pagos`, {
      metodo_pago_id: Number(payload.metodo_pago_id),
      monto_total: Number(payload.monto_total),
      referencia_pasarela: payload.referencia_pasarela ? sanitize(payload.referencia_pasarela) : null,
    });
    return {
      ...res,
      id: res.pago_id,
      monto: res.monto_total,
      comision_plataforma: res.monto_comision ?? 0,
      metodo_pago: res.metodo_pago_nombre || "SIMULADO",
      estado: res.estado_pago_codigo,
      referencia: res.referencia_pasarela || `PAG-${res.pago_id}`,
      fecha_creacion: res.creado_en,
    };
  },

  async getPagoCita(citaId: number | string): Promise<PagoDetalle> {
    const res = await apiClient.get<PagoDetalle>(`/citas/${citaId}/pago`);
    return {
      ...res,
      id: res.pago_id,
      monto: res.monto_total,
      comision_plataforma: res.monto_comision ?? 0,
      metodo_pago: res.metodo_pago_nombre || "SIMULADO",
      estado: res.estado_pago_codigo,
      referencia: res.referencia_pasarela || `PAG-${res.pago_id}`,
      fecha_creacion: res.creado_en,
    };
  },

  async calificarCita(
    citaId: number | string,
    payload: CalificacionInput
  ): Promise<CalificacionItem> {
    const res = await apiClient.post<CalificacionItem>(`/citas/${citaId}/calificacion`, {
      puntuacion: Number(payload.puntuacion),
      comentario: payload.comentario ? sanitize(payload.comentario) : null,
    });
    return {
      ...res,
      id: res.calificacion_id,
      fecha: res.creada_en,
    };
  },

  // === PERFILES PÚBLICOS DE TRABAJADOR ===
  async getPerfilTrabajador(perfilTrabajadorId: number | string): Promise<PerfilTrabajadorPrivado> {
    return await apiClient.get<PerfilTrabajadorPrivado>(`/trabajadores/${perfilTrabajadorId}`, {
      requiresAuth: false,
    });
  },

  async getCalificacionesTrabajador(perfilTrabajadorId: number | string): Promise<CalificacionItem[]> {
    return await this.getCalificacionesPublicas(perfilTrabajadorId);
  },

  async getCalificacionesPublicas(perfilTrabajadorId: number | string): Promise<CalificacionItem[]> {
    const res = await apiClient.get<CalificacionItem[]>(
      `/trabajadores/${perfilTrabajadorId}/calificaciones`,
      { requiresAuth: false }
    );
    return (Array.isArray(res) ? res : []).map((c) => ({
      ...c,
      id: c.calificacion_id,
      fecha: c.creada_en,
    }));
  },
};
