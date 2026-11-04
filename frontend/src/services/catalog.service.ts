import { apiClient } from "@/lib/api-client";

export interface CategoriaCatalogoItem {
  categoria_id: number;
  id?: number;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
  total_subcategorias?: number;
  icono?: string;
}

export interface SubcategoriaCatalogoItem {
  subcategoria_id: number;
  id?: number;
  categoria_id: number;
  categoria_nombre?: string;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
}

export interface ModalidadCatalogoItem {
  modalidad_id: number;
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  protocolo_seguridad?: string;
}

export interface CiudadCatalogoItem {
  ciudad_id: number;
  id?: number;
  region_id?: number;
  nombre: string;
  codigo_externo?: string | null;
  departamento?: string;
  codigo_dane?: string;
  activa?: boolean;
}

export interface HabilidadCatalogoItem {
  habilidad_id: number;
  id?: number;
  categoria_id?: number;
  categoria_nombre?: string;
  nombre: string;
  descripcion?: string | null;
  activa: boolean;
}

function mapCategoria(c: CategoriaCatalogoItem): CategoriaCatalogoItem {
  return {
    ...c,
    id: c.categoria_id,
    total_subcategorias: 0,
  };
}

function mapSubcategoria(s: SubcategoriaCatalogoItem): SubcategoriaCatalogoItem {
  return {
    ...s,
    id: s.subcategoria_id,
  };
}

function mapCiudad(c: CiudadCatalogoItem): CiudadCatalogoItem {
  return {
    ...c,
    id: c.ciudad_id,
    departamento: "Colombia",
    codigo_dane: c.codigo_externo || "00000",
    activa: true,
  };
}

function mapHabilidad(h: HabilidadCatalogoItem): HabilidadCatalogoItem {
  return {
    ...h,
    id: h.habilidad_id,
  };
}

export const catalogService = {
  async getCategorias(): Promise<CategoriaCatalogoItem[]> {
    const res = await apiClient.get<CategoriaCatalogoItem[]>("/categorias", {
      requiresAuth: false,
    });
    return (Array.isArray(res) ? res : []).map(mapCategoria);
  },

  async getSubcategorias(
    categoriaId: number | string
  ): Promise<SubcategoriaCatalogoItem[]> {
    const res = await apiClient.get<SubcategoriaCatalogoItem[]>(
      `/categorias/${categoriaId}/subcategorias`,
      {
        requiresAuth: false,
      }
    );
    return (Array.isArray(res) ? res : []).map(mapSubcategoria);
  },

  async getModalidades(): Promise<ModalidadCatalogoItem[]> {
    const res = await apiClient.get<ModalidadCatalogoItem[]>("/modalidades", {
      requiresAuth: false,
    });
    return Array.isArray(res) ? res : [];
  },

  async getCiudades(): Promise<CiudadCatalogoItem[]> {
    const res = await apiClient.get<CiudadCatalogoItem[]>("/ciudades", {
      requiresAuth: false,
    });
    return (Array.isArray(res) ? res : []).map(mapCiudad);
  },

  async getHabilidades(): Promise<HabilidadCatalogoItem[]> {
    const res = await apiClient.get<HabilidadCatalogoItem[]>("/habilidades", {
      requiresAuth: false,
    });
    return (Array.isArray(res) ? res : []).map(mapHabilidad);
  },
};
