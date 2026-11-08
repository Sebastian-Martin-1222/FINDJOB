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
import { SolicitudItem, CitaDetalle, AlertaSeguridadItem, PagoDetalle } from "@/services/marketplace.service";

export interface AdminUsuarioItem {
  usuario_id: number;
  id?: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  activo: boolean;
  roles: string[];
  creado_en: string;
  actualizado_en?: string;
  estado?: "ACTIVO" | "INACTIVO";
  fecha_registro?: string;
}

export interface AdminPoliticaComisionItem {
  politica_comision_id: number;
  id?: number;
  nombre: string;
  porcentaje_comision: number;
  vigente_desde: string;
  vigente_hasta?: string | null;
  descripcion?: string | null;
  creada_en: string;
  porcentaje?: number;
  activa?: boolean;
}

export interface AdminPreguntaSeguridadItem {
  pregunta_seguridad_id: number;
  texto: string;
  activa: boolean;
}


export type AdminCategoriaItem = CategoriaCatalogoItem & { subcategorias: SubcategoriaCatalogoItem[] };
export type AdminAlertaItem = AlertaSeguridadItem;
export type AdminPagoItem = PagoDetalle;
export interface SystemHealthStatus {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  database?: string;
  connection?: string;
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

export const adminService = {
  getUsuarios: async (limit = 50, offset = 0) => (await apiClient.get<AdminUsuarioItem[]>(`/admin/usuarios?limit=${limit}&offset=${offset}`)).map((u) => ({ ...u, id: u.usuario_id, estado: u.activo ? ("ACTIVO" as const) : ("INACTIVO" as const), fecha_registro: u.creado_en })),
  cambiarEstadoUsuario: (usuarioId: number | string, activo: boolean) => apiClient.patch<AdminUsuarioItem>(`/admin/usuarios/${usuarioId}/estado`, { activo }),
  actualizarRolesUsuario: (usuarioId: number | string, rolesIds: number[]) => apiClient.put<AdminUsuarioItem>(`/admin/usuarios/${usuarioId}/roles`, { roles_ids: rolesIds.map(Number) }),

  async getCategorias(): Promise<Array<CategoriaCatalogoItem & { subcategorias: SubcategoriaCatalogoItem[] }>> {
    const categorias = await catalogService.getCategorias();
    return Promise.all(categorias.map(async (categoria) => ({
      ...categoria,
      subcategorias: await catalogService.getSubcategorias(categoria.categoria_id),
    })));
  },
  crearCategoria: (payload: CrearCategoriaInput) => apiClient.post<CategoriaCatalogoItem>("/admin/categorias", {
    nombre: payload.nombre.trim(), descripcion: payload.descripcion?.trim() || null, activa: payload.activa ?? true,
  }),
  actualizarCategoria: (id: number | string, payload: Partial<CrearCategoriaInput>) => apiClient.patch<CategoriaCatalogoItem>(`/admin/categorias/${id}`, payload),
  crearSubcategoria: (payload: CrearSubcategoriaInput) => apiClient.post<SubcategoriaCatalogoItem>("/admin/subcategorias", {
    categoria_id: Number(payload.categoria_id), nombre: payload.nombre.trim(), descripcion: payload.descripcion?.trim() || null, activa: payload.activa ?? true,
  }),
  actualizarSubcategoria: (id: number | string, payload: Partial<CrearSubcategoriaInput>) => apiClient.patch<SubcategoriaCatalogoItem>(`/admin/subcategorias/${id}`, payload),

  getPoliticasComision: async () => (await apiClient.get<AdminPoliticaComisionItem[]>("/admin/politicas-comision")).map((p) => ({ ...p, id: p.politica_comision_id, porcentaje: p.porcentaje_comision, activa: !p.vigente_hasta || new Date(p.vigente_hasta) > new Date() })),
  crearPoliticaComision: (payload: CrearPoliticaComisionInput) => apiClient.post<AdminPoliticaComisionItem>("/admin/politicas-comision", {
    nombre: payload.nombre.trim(), porcentaje_comision: Number(payload.porcentaje_comision), vigente_desde: payload.vigente_desde,
    vigente_hasta: payload.vigente_hasta || null, descripcion: payload.descripcion?.trim() || null,
  }),

  getSolicitudes: () => apiClient.get<SolicitudItem[]>("/admin/solicitudes"),
  getCitas: (limit = 50, offset = 0) => apiClient.get<CitaDetalle[]>(`/admin/citas?limit=${limit}&offset=${offset}`),
  getAlertas: (limit = 50, offset = 0) => apiClient.get<AlertaSeguridadItem[]>(`/admin/alertas-seguridad?limit=${limit}&offset=${offset}`),
  actualizarAlerta: (alertaId: number | string, payload: { descripcion?: string | null }) => apiClient.patch<AlertaSeguridadItem>(`/admin/alertas-seguridad/${alertaId}`, payload),
  getPagos: (limit = 50, offset = 0) => apiClient.get<PagoDetalle[]>(`/admin/pagos?limit=${limit}&offset=${offset}`),

  getHabilidadesAdmin: () => catalogService.getHabilidades(),
  crearHabilidad: (payload: AdminHabilidadInput) => apiClient.post<HabilidadCatalogoItem>("/admin/habilidades", {
    nombre: payload.nombre.trim(), descripcion: payload.descripcion?.trim() || null, activa: payload.activa ?? true,
  }),
  actualizarHabilidad: (id: number | string, payload: Partial<AdminHabilidadInput>) => apiClient.patch<HabilidadCatalogoItem>(`/admin/habilidades/${id}`, payload),

  getPreguntasSeguridad: () => apiClient.get<AdminPreguntaSeguridadItem[]>("/admin/preguntas-seguridad"),
  crearPreguntaSeguridad: (payload: AdminPreguntaSeguridadInput) => apiClient.post<AdminPreguntaSeguridadItem>("/admin/preguntas-seguridad", {
    texto: payload.texto.trim(), activa: payload.activa ?? true,
  }),
  actualizarPreguntaSeguridad: (id: number | string, payload: Partial<AdminPreguntaSeguridadInput>) => apiClient.patch<AdminPreguntaSeguridadItem>(`/admin/preguntas-seguridad/${id}`, payload),

  getCatalogoInterno: (catalogo: CatalogoPermitido) => apiClient.get<Array<Record<string, unknown>>>(`/admin/catalogos/${catalogo}`),
  getHealthSystem: () => apiClient.get<{ status: string; service: string; version: string }>("/health", { requiresAuth: false }),
  async getHealthDb(): Promise<SystemHealthStatus> {
    const res = await apiClient.get<{ status: string; database: string; connection: string }>("/health/db", { requiresAuth: false });
    return { status: res.status === "ok" ? "HEALTHY" : "DEGRADED", database: res.database, connection: res.connection };
  },
};
