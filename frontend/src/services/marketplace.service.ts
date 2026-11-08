import DOMPurify from "dompurify";
import { apiClient } from "@/lib/api-client";
import {
  CreateSolicitudInput,
  ProgramarCitaInput,
  AlertaSeguridadInput,
  ResponderChequeoInput,
  RegistroPagoInput,
  CalificacionInput,
  PublicarServicioInput,
} from "@/schemas/marketplace.schema";
import { ModalidadCatalogoItem } from "@/services/catalog.service";
import { PerfilTrabajadorPrivado } from "@/services/user.service";

function sanitize(text: string): string {
  if (typeof window !== "undefined") return DOMPurify.sanitize(text);
  return text.replace(/[<>]/g, "");
}

export type TrabajadorPerfilPublico = PerfilTrabajadorPrivado;

export interface ServicioDetalle {
  servicio_id: number;
  id?: number;
  perfil_trabajador_id: number;
  subcategoria_id: number;
  titulo: string;
  descripcion: string;
  precio_base: number;
  tiempo_estimado_horas: number;
  revisiones_incluidas: number;
  activo: boolean;
  trabajador_nombres?: string | null;
  trabajador_apellidos?: string | null;
  categoria_nombre?: string | null;
  subcategoria_nombre?: string | null;
  modalidades: ModalidadCatalogoItem[];
  calificacion_promedio?: number | null;
  creado_en: string;
  actualizado_en: string;
  estado?: "ACTIVO" | "INACTIVO";
  trabajador_nombre?: string;
  trabajador_rating?: number | null;
  fecha_creacion?: string;
}

export interface SolicitudItem {
  solicitud_servicio_id: number;
  id?: number;
  cliente_id?: number;
  cliente_usuario_id: number;
  servicio_id: number;
  modalidad_id: number;
  estado_solicitud_id: number;
  estado_codigo: string;
  direccion_id?: number | null;
  descripcion_necesidad: string;
  fecha_propuesta: string;
  valor_acordado?: number | null;
  plataforma_remota?: string | null;
  servicio_titulo?: string | null;
  cliente_nombre?: string | null;
  trabajador_nombre?: string | null;
  modalidad_codigo?: string | null;
  modalidad_nombre?: string | null;
  direccion_texto?: string | null;
  ciudad_nombre?: string | null;
  cita_id?: number | null;
  creada_en: string;
  respondida_en?: string | null;
  actualizado_en: string;
  modalidad?: string | null;
  estado?: string;
  descripcion?: string;
  fecha_preferida?: string;
  fecha_creacion?: string;
}

export interface CitaDetalle {
  cita_id: number;
  id?: number;
  solicitud_id?: number;
  solicitud_servicio_id: number;
  estado_cita_id: number;
  estado_codigo: string;
  direccion_id?: number | null;
  fecha_inicio: string;
  fecha_fin?: string | null;
  codigo_confirmacion?: string | null;
  plataforma_remota?: string | null;
  enlace_reunion?: string | null;
  modalidad_codigo?: string | null;
  servicio_titulo?: string | null;
  cliente_usuario_id?: number | null;
  cliente_nombre?: string | null;
  trabajador_usuario_id?: number | null;
  trabajador_nombre?: string | null;
  direccion_texto?: string | null;
  pago_id?: number | null;
  pago_realizado: boolean;
  calificacion_realizada: boolean;
  monto_acordado?: number | null;
  creada_en: string;
  actualizado_en: string;
  estado?: string;
  modalidad?: string | null;
}

export interface RespuestaChequeoItem {
  chequeo_seguridad_id: number;
  pregunta_seguridad_id: number;
  pregunta_texto?: string | null;
  usuario_id: number;
  respuesta_ok: boolean;
  comentario?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  respondido_en: string;
}

export interface ChequeoSeguridadItem {
  chequeo_seguridad_id: number;
  cita_id: number;
  generado_en: string;
  cerrado_en?: string | null;
  respuestas: RespuestaChequeoItem[];
  preguntas: Array<{ pregunta_seguridad_id: number; texto: string; activa: boolean }>;
}

export interface AlertaSeguridadItem {
  alerta_seguridad_id: number;
  cita_id: number;
  usuario_id: number;
  usuario_nombre?: string | null;
  tipo_alerta_id: number;
  tipo_alerta_codigo?: string | null;
  descripcion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  ubicacion_capturada_en?: string | null;
  creada_en: string;
}

export interface PagoDetalle {
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

export interface CalificacionItem {
  calificacion_id: number;
  cita_id: number;
  puntuacion: number;
  comentario?: string | null;
  cliente_nombre?: string | null;
  servicio_titulo?: string | null;
  creada_en: string;
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
  const nombre = [s.trabajador_nombres, s.trabajador_apellidos].filter(Boolean).join(" ");
  return { ...s, id: s.servicio_id, estado: s.activo ? "ACTIVO" : "INACTIVO", trabajador_nombre: nombre || undefined, trabajador_rating: s.calificacion_promedio ?? null, fecha_creacion: s.creado_en };
}

function mapSolicitud(s: SolicitudItem): SolicitudItem {
  return { ...s, id: s.solicitud_servicio_id, cliente_id: s.cliente_usuario_id, modalidad: s.modalidad_codigo ?? null, estado: s.estado_codigo, descripcion: s.descripcion_necesidad, fecha_preferida: s.fecha_propuesta, fecha_creacion: s.creada_en };
}

function mapCita(c: CitaDetalle): CitaDetalle {
  return { ...c, id: c.cita_id, solicitud_id: c.solicitud_servicio_id, estado: c.estado_codigo, modalidad: c.modalidad_codigo ?? null };
}

export const marketplaceService = {
  async buscarServicios(filtros: FiltrosServicio = {}): Promise<ServicioDetalle[]> {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
    });
    return (await apiClient.get<ServicioDetalle[]>(`/servicios${params.toString() ? `?${params}` : ""}`, { requiresAuth: false })).map(mapServicio);
  },

  getServicioById: async (id: number | string) => mapServicio(await apiClient.get<ServicioDetalle>(`/servicios/${id}`, { requiresAuth: false })),

  publicarServicio: (payload: PublicarServicioInput) => apiClient.post<ServicioDetalle>("/servicios", {
    subcategoria_id: Number(payload.subcategoria_id),
    titulo: sanitize(payload.titulo),
    descripcion: sanitize(payload.descripcion),
    precio_base: Number(payload.precio_base),
    tiempo_estimado_horas: Number(payload.tiempo_estimado_horas),
    revisiones_incluidas: Number(payload.revisiones_incluidas),
    modalidades_ids: payload.modalidades_ids.map(Number),
  }),

  actualizarServicio: (id: number | string, payload: Partial<PublicarServicioInput> & { activo?: boolean }) => {
    const body: Record<string, unknown> = {};
    if (payload.subcategoria_id !== undefined) body.subcategoria_id = Number(payload.subcategoria_id);
    if (payload.titulo !== undefined) body.titulo = sanitize(payload.titulo);
    if (payload.descripcion !== undefined) body.descripcion = sanitize(payload.descripcion);
    if (payload.precio_base !== undefined) body.precio_base = Number(payload.precio_base);
    if (payload.tiempo_estimado_horas !== undefined) body.tiempo_estimado_horas = Number(payload.tiempo_estimado_horas);
    if (payload.revisiones_incluidas !== undefined) body.revisiones_incluidas = Number(payload.revisiones_incluidas);
    if (payload.activo !== undefined) body.activo = payload.activo;
    return apiClient.patch<ServicioDetalle>(`/servicios/${id}`, body);
  },

  desactivarServicio: (id: number | string) => apiClient.delete<void>(`/servicios/${id}`),
  configurarModalidades: (id: number | string, modalidades_ids: number[]) => apiClient.put<ServicioDetalle>(`/servicios/${id}/modalidades`, { modalidades_ids }),
  getMisServiciosTrabajador: async () => (await apiClient.get<ServicioDetalle[]>("/trabajador/servicios")).map(mapServicio),

  createSolicitud: (payload: CreateSolicitudInput) => apiClient.post<SolicitudItem>("/solicitudes", {
    servicio_id: Number(payload.servicio_id),
    modalidad_id: Number(payload.modalidad_id),
    direccion_id: payload.direccion_id ? Number(payload.direccion_id) : null,
    descripcion_necesidad: sanitize(payload.descripcion_necesidad),
    fecha_propuesta: payload.fecha_propuesta,
    valor_acordado: payload.valor_acordado ? Number(payload.valor_acordado) : null,
    plataforma_remota: payload.plataforma_remota ? sanitize(payload.plataforma_remota) : null,
  }),

  getMisSolicitudes: async () => (await apiClient.get<SolicitudItem[]>("/solicitudes/mis-solicitudes")).map(mapSolicitud),
  getSolicitudesRecibidas: async () => (await apiClient.get<SolicitudItem[]>("/solicitudes/recibidas")).map(mapSolicitud),
  getSolicitudById: async (id: number | string) => mapSolicitud(await apiClient.get<SolicitudItem>(`/solicitudes/${id}`)),
  aceptarSolicitud: (id: number | string) => apiClient.patch<SolicitudItem>(`/solicitudes/${id}/aceptar`),
  rechazarSolicitud: (id: number | string) => apiClient.patch<SolicitudItem>(`/solicitudes/${id}/rechazar`),
  cancelarSolicitud: (id: number | string) => apiClient.patch<SolicitudItem>(`/solicitudes/${id}/cancelar`),

  programarCita: (solicitudId: number | string, payload: ProgramarCitaInput) => apiClient.post<CitaDetalle>(`/solicitudes/${solicitudId}/cita`, {
    direccion_id: payload.direccion_id ? Number(payload.direccion_id) : null,
    fecha_inicio: payload.fecha_inicio,
    fecha_fin: payload.fecha_fin || null,
    plataforma_remota: payload.plataforma_remota ? sanitize(payload.plataforma_remota) : null,
    enlace_reunion: payload.enlace_reunion || null,
  }),

  getMisCitas: async () => (await apiClient.get<CitaDetalle[]>("/citas/mis-citas")).map(mapCita),
  getCitaById: async (id: number | string) => mapCita(await apiClient.get<CitaDetalle>(`/citas/${id}`)),
  actualizarCita: (id: number | string, payload: Partial<ProgramarCitaInput>) => apiClient.patch<CitaDetalle>(`/citas/${id}`, payload),
  iniciarCita: (id: number | string) => apiClient.patch<CitaDetalle>(`/citas/${id}/iniciar`),
  finalizarCita: (id: number | string) => apiClient.patch<CitaDetalle>(`/citas/${id}/finalizar`),
  confirmarCitaPin: (id: number | string, codigoConfirmacion: string) => apiClient.post<CitaDetalle>(`/citas/${id}/confirmar`, { codigo_confirmacion: codigoConfirmacion.trim() }),

  crearAlertaSeguridad: (citaId: number | string, payload: AlertaSeguridadInput) => apiClient.post<AlertaSeguridadItem>(`/citas/${citaId}/alertas-seguridad`, {
    tipo_alerta_id: Number(payload.tipo_alerta_id),
    descripcion: payload.descripcion ? sanitize(payload.descripcion) : null,
    latitud: payload.latitud ?? null,
    longitud: payload.longitud ?? null,
  }),
  getChequeosCita: (citaId: number | string) => apiClient.get<ChequeoSeguridadItem[]>(`/citas/${citaId}/chequeos-seguridad`),
  responderChequeo: (chequeoId: number | string, payload: ResponderChequeoInput) => apiClient.post<RespuestaChequeoItem>(`/chequeos-seguridad/${chequeoId}/respuestas`, {
    pregunta_seguridad_id: Number(payload.pregunta_seguridad_id),
    respuesta_ok: payload.respuesta_ok,
    comentario: payload.comentario ? sanitize(payload.comentario) : null,
    latitud: payload.latitud ?? null,
    longitud: payload.longitud ?? null,
  }),

  registrarPagoCita: (citaId: number | string, payload: RegistroPagoInput) => apiClient.post<PagoDetalle>(`/citas/${citaId}/pagos`, {
    metodo_pago_id: Number(payload.metodo_pago_id),
    monto_total: Number(payload.monto_total),
    referencia_pasarela: payload.referencia_pasarela ? sanitize(payload.referencia_pasarela) : null,
  }),
  // Alias temporal para vistas existentes; usa el mismo contrato real.
  registrarPago: (citaId: number | string, payload: RegistroPagoInput) => apiClient.post<PagoDetalle>(`/citas/${citaId}/pagos`, {
    metodo_pago_id: Number(payload.metodo_pago_id),
    monto_total: Number(payload.monto_total),
    referencia_pasarela: payload.referencia_pasarela ? sanitize(payload.referencia_pasarela) : null,
  }),
  getPagoCita: (citaId: number | string) => apiClient.get<PagoDetalle>(`/citas/${citaId}/pago`),
  calificarCita: (citaId: number | string, payload: CalificacionInput) => apiClient.post<CalificacionItem>(`/citas/${citaId}/calificacion`, {
    puntuacion: Number(payload.puntuacion),
    comentario: payload.comentario ? sanitize(payload.comentario) : null,
  }),

  getPerfilTrabajador: (perfilId: number | string) => apiClient.get<PerfilTrabajadorPrivado>(`/trabajadores/${perfilId}`, { requiresAuth: false }),
  getCalificacionesTrabajador: (perfilId: number | string) => apiClient.get<CalificacionItem[]>(`/trabajadores/${perfilId}/calificaciones`, { requiresAuth: false }),
};
