import { apiClient } from "@/lib/api-client";
import {
  CrearCategoriaInput,
  CrearSubcategoriaInput,
  CrearPoliticaComisionInput,
  AdminHabilidadInput,
  AdminPreguntaSeguridadInput,
} from "@/schemas/admin.schema";
import {
  catalogService,
  CategoriaCatalogoItem,
  SubcategoriaCatalogoItem,
  HabilidadCatalogoItem,
} from "@/services/catalog.service";
import {
  SolicitudItem,
  CitaDetalle,
  AlertaSeguridadItem,
  PagoDetalle,
} from "@/services/marketplace.service";

export type AdminCategoriaItem = CategoriaCatalogoItem & {
  id?: number;
  total_servicios?: number;
  subcategorias?: Array<{ id: number; nombre: string; activa: boolean }>;
};

export type AdminAlertaItem = AlertaSeguridadItem & {
  id?: number;
  cliente_nombre?: string;
  trabajador_nombre?: string;
  tipo_alerta?: string;
  estado?: string;
  fecha_registro?: string;
};

export type AdminPagoItem = PagoDetalle & {
  id?: number;
  cliente_nombre?: string;
  trabajador_nombre?: string;
  monto?: number;
  comision_plataforma?: number;
  metodo_pago?: string;
  estado?: string;
  referencia?: string;
  fecha_creacion?: string;
};

export interface AdminUsuarioItem {
  usuario_id: number;
  id?: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  activo: boolean;
  estado?: "ACTIVO" | "SUSPENDIDO" | "INACTIVO";
  roles: string[];
  uid_externo?: string;
  creado_en: string;
  fecha_registro?: string;
  actualizado_en?: string;
}

export interface AdminPoliticaComisionItem {
  politica_comision_id: number;
  id?: number;
  nombre: string;
  porcentaje_comision: number;
  porcentaje?: number;
  vigente_desde: string;
  vigente_hasta?: string | null;
  descripcion?: string | null;
  activa?: boolean;
  creada_en: string;
}

export interface AdminPreguntaSeguridadItem {
  pregunta_seguridad_id: number;
  id?: number;
  texto: string;
  pregunta?: string;
  activa: boolean;
}

export interface SystemHealthStatus {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  service?: string;
  version?: string;
  db?: {
    engine: string;
    version?: string;
    connection: string;
    pool_active?: number;
    latency_ms?: number;
  };
  cloud_run?: {
    region: string;
    revision: string;
    uptime_seconds: number;
  };
  timestamp: string;
}

export type CatalogoPermitido =
  | "roles"
  | "estados_solicitud"
  | "estados_cita"
  | "metodos_pago"
  | "estados_pago"
  | "tipos_mensaje"
  | "tipos_alerta"
  | "modalidades";

function mapUsuario(u: AdminUsuarioItem): AdminUsuarioItem {
  return {
    ...u,
    id: u.usuario_id,
    estado: u.activo ? "ACTIVO" : "SUSPENDIDO",
    fecha_registro: u.creado_en,
  };
}

function mapPolitica(p: AdminPoliticaComisionItem): AdminPoliticaComisionItem {
  return {
    ...p,
    id: p.politica_comision_id,
    porcentaje: p.porcentaje_comision,
    activa: !p.vigente_hasta || new Date(p.vigente_hasta) > new Date(),
  };
}

export const adminService = {
  // === USUARIOS ===
  async getUsuarios(limit = 50, offset = 0): Promise<AdminUsuarioItem[]> {
    const res = await apiClient.get<AdminUsuarioItem[]>(
      `/admin/usuarios?limit=${limit}&offset=${offset}`
    );
    return (Array.isArray(res) ? res : []).map(mapUsuario);
  },

  async cambiarEstadoUsuario(
    usuarioId: number | string,
    activo: boolean
  ): Promise<AdminUsuarioItem> {
    const res = await apiClient.patch<AdminUsuarioItem>(
      `/admin/usuarios/${usuarioId}/estado`,
      { activo: Boolean(activo) }
    );
    return mapUsuario(res);
  },

  async actualizarRolesUsuario(
    usuarioId: number | string,
    rolesIds: number[]
  ): Promise<AdminUsuarioItem> {
    const res = await apiClient.put<AdminUsuarioItem>(
      `/admin/usuarios/${usuarioId}/roles`,
      { roles_ids: rolesIds.map(Number) }
    );
    return mapUsuario(res);
  },

  // === CATEGORÍAS Y SUBCATEGORÍAS ===
  async getCategorias(): Promise<AdminCategoriaItem[]> {
    const categorias = await catalogService.getCategorias();
    return categorias.map((cat) => ({
      ...cat,
      id: cat.categoria_id,
      total_servicios: 0,
      subcategorias: [],
    }));
  },

  async crearCategoria(payload: CrearCategoriaInput): Promise<CategoriaCatalogoItem> {
    return await apiClient.post<CategoriaCatalogoItem>("/admin/categorias", {
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion ? payload.descripcion.trim() : null,
      activa: payload.activa ?? true,
    });
  },

  async actualizarCategoria(
    id: number | string,
    payload: Partial<CrearCategoriaInput>
  ): Promise<CategoriaCatalogoItem> {
    return await apiClient.patch<CategoriaCatalogoItem>(`/admin/categorias/${id}`, payload);
  },

  async crearSubcategoria(payload: CrearSubcategoriaInput): Promise<SubcategoriaCatalogoItem> {
    return await apiClient.post<SubcategoriaCatalogoItem>("/admin/subcategorias", {
      categoria_id: Number(payload.categoria_id),
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion ? payload.descripcion.trim() : null,
      activa: payload.activa ?? true,
    });
  },

  async actualizarSubcategoria(
    id: number | string,
    payload: Partial<CrearSubcategoriaInput>
  ): Promise<SubcategoriaCatalogoItem> {
    return await apiClient.patch<SubcategoriaCatalogoItem>(`/admin/subcategorias/${id}`, payload);
  },

  // === POLÍTICAS DE COMISIÓN ===
  async getPoliticasComision(): Promise<AdminPoliticaComisionItem[]> {
    const res = await apiClient.get<AdminPoliticaComisionItem[]>("/admin/politicas-comision");
    return (Array.isArray(res) ? res : []).map(mapPolitica);
  },

  async crearPoliticaComision(
    payload: CrearPoliticaComisionInput
  ): Promise<AdminPoliticaComisionItem> {
    const res = await apiClient.post<AdminPoliticaComisionItem>("/admin/politicas-comision", {
      nombre: payload.nombre.trim(),
      porcentaje_comision: Number(payload.porcentaje_comision),
      vigente_desde: payload.vigente_desde,
      vigente_hasta: payload.vigente_hasta || null,
      descripcion: payload.descripcion ? payload.descripcion.trim() : null,
    });
    return mapPolitica(res);
  },

  // === SOLICITUDES Y CITAS OPERATIVAS ===
  async getSolicitudes(): Promise<SolicitudItem[]> {
    const res = await apiClient.get<SolicitudItem[]>("/admin/solicitudes");
    return Array.isArray(res) ? res : [];
  },

  async getCitas(limit = 50, offset = 0): Promise<CitaDetalle[]> {
    const res = await apiClient.get<CitaDetalle[]>(
      `/admin/citas?limit=${limit}&offset=${offset}`
    );
    return Array.isArray(res) ? res : [];
  },

  // === ALERTAS DE SEGURIDAD ===
  async getAlertas(limit = 50, offset = 0): Promise<AdminAlertaItem[]> {
    const res = await apiClient.get<AdminAlertaItem[]>(
      `/admin/alertas-seguridad?limit=${limit}&offset=${offset}`
    );
    return (Array.isArray(res) ? res : []).map((a) => ({
      ...a,
      id: a.alerta_seguridad_id,
      tipo_alerta: a.tipo_alerta_codigo || "ALERTA",
      estado: "PENDIENTE",
      fecha_registro: a.creada_en,
    }));
  },

  async resolverAlerta(
    alertaId: number | string,
    descripcion = "Resuelta por administrador"
  ): Promise<AdminAlertaItem> {
    return await this.actualizarAlerta(alertaId, { descripcion });
  },

  async actualizarAlerta(
    alertaId: number | string,
    payload: { descripcion?: string | null }
  ): Promise<AdminAlertaItem> {
    const res = await apiClient.patch<AdminAlertaItem>(
      `/admin/alertas-seguridad/${alertaId}`,
      payload
    );
    return {
      ...res,
      id: res.alerta_seguridad_id,
      tipo_alerta: res.tipo_alerta_codigo || "ALERTA",
      fecha_registro: res.creada_en,
    };
  },

  // === PAGOS ===
  async getPagos(limit = 50, offset = 0): Promise<AdminPagoItem[]> {
    const res = await apiClient.get<AdminPagoItem[]>(
      `/admin/pagos?limit=${limit}&offset=${offset}`
    );
    return (Array.isArray(res) ? res : []).map((p) => ({
      ...p,
      id: p.pago_id,
      monto: p.monto_total,
      comision_plataforma: p.monto_comision ?? 0,
      metodo_pago: p.metodo_pago_nombre || "SIMULADO",
      estado: p.estado_pago_codigo,
      referencia: p.referencia_pasarela || `PAG-${p.pago_id}`,
      fecha_creacion: p.creado_en,
    }));
  },

  // === HABILIDADES ADMIN ===
  async getHabilidadesAdmin(): Promise<HabilidadCatalogoItem[]> {
    const res = await apiClient.get<HabilidadCatalogoItem[]>("/habilidades", {
      requiresAuth: false,
    });
    return Array.isArray(res) ? res : [];
  },

  async crearHabilidad(payload: AdminHabilidadInput): Promise<HabilidadCatalogoItem> {
    return await apiClient.post<HabilidadCatalogoItem>("/admin/habilidades", {
      nombre: payload.nombre.trim(),
      descripcion: payload.descripcion ? payload.descripcion.trim() : null,
      activa: payload.activa ?? true,
    });
  },

  async actualizarHabilidad(
    id: number | string,
    payload: Partial<AdminHabilidadInput>
  ): Promise<HabilidadCatalogoItem> {
    return await apiClient.patch<HabilidadCatalogoItem>(`/admin/habilidades/${id}`, payload);
  },

  // === PREGUNTAS DE SEGURIDAD ===
  async crearPreguntaSeguridad(
    payload: AdminPreguntaSeguridadInput
  ): Promise<AdminPreguntaSeguridadItem> {
    const res = await apiClient.post<AdminPreguntaSeguridadItem>("/admin/preguntas-seguridad", {
      texto: payload.texto.trim(),
      activa: payload.activa ?? true,
    });
    return {
      ...res,
      id: res.pregunta_seguridad_id,
      pregunta: res.texto,
    };
  },

  async actualizarPreguntaSeguridad(
    id: number | string,
    payload: Partial<AdminPreguntaSeguridadInput>
  ): Promise<AdminPreguntaSeguridadItem> {
    const res = await apiClient.patch<AdminPreguntaSeguridadItem>(
      `/admin/preguntas-seguridad/${id}`,
      payload
    );
    return {
      ...res,
      id: res.pregunta_seguridad_id,
      pregunta: res.texto,
    };
  },

  // === CATÁLOGOS INTERNOS ===
  async getCatalogoInterno(
    catalogo: CatalogoPermitido
  ): Promise<Array<Record<string, unknown>>> {
    const res = await apiClient.get<Array<Record<string, unknown>>>(
      `/admin/catalogos/${catalogo}`
    );
    return Array.isArray(res) ? res : [];
  },

  // === SALUD DEL SISTEMA ===
  async getHealthSystem(): Promise<{ status: string; service: string; version: string }> {
    return await apiClient.get<{ status: string; service: string; version: string }>("/health", {
      requiresAuth: false,
    });
  },

  async getHealthDb(): Promise<SystemHealthStatus> {
    const dbRes = await apiClient.get<{ status: string; database: string; connection: string }>(
      "/health/db",
      { requiresAuth: false }
    );
    return {
      status: dbRes && dbRes.status === "ok" ? "HEALTHY" : "DEGRADED",
      db: {
        engine: dbRes.database,
        connection: dbRes.connection,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
