import { apiClient } from "@/lib/api-client";

export interface CategoriaCatalogoItem { categoria_id: number; nombre: string; descripcion?: string | null; activa: boolean; }
export interface SubcategoriaCatalogoItem { subcategoria_id: number; categoria_id: number; nombre: string; descripcion?: string | null; activa: boolean; }
export interface ModalidadCatalogoItem { modalidad_id: number; codigo: string; nombre: string; descripcion?: string | null; }
export interface CiudadCatalogoItem { ciudad_id: number; region_id: number; nombre: string; codigo_externo?: string | null; }
export interface HabilidadCatalogoItem { habilidad_id: number; nombre: string; descripcion?: string | null; activa: boolean; }
export interface MetodoPagoCatalogoItem { metodo_pago_id: number; codigo: string; nombre: string; descripcion?: string | null; activo: boolean; }
export interface TipoAlertaCatalogoItem { tipo_alerta_id: number; codigo: string; nombre: string; descripcion?: string | null; }

export const catalogService = {
  getCategorias: () => apiClient.get<CategoriaCatalogoItem[]>("/categorias", { requiresAuth: false }),
  getSubcategorias: (categoriaId: number | string) => apiClient.get<SubcategoriaCatalogoItem[]>(`/categorias/${categoriaId}/subcategorias`, { requiresAuth: false }),
  getModalidades: () => apiClient.get<ModalidadCatalogoItem[]>("/modalidades", { requiresAuth: false }),
  getCiudades: () => apiClient.get<CiudadCatalogoItem[]>("/ciudades", { requiresAuth: false }),
  getHabilidades: () => apiClient.get<HabilidadCatalogoItem[]>("/habilidades", { requiresAuth: false }),
  getMetodosPago: () => apiClient.get<MetodoPagoCatalogoItem[]>("/metodos-pago", { requiresAuth: false }),
  getTiposAlerta: () => apiClient.get<TipoAlertaCatalogoItem[]>("/tipos-alerta", { requiresAuth: false }),
};
