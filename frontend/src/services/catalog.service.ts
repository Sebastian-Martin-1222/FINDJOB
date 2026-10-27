import { apiClient } from "@/lib/api-client";

export interface CategoriaCatalogoItem {
  id: number;
  nombre: string;
  descripcion: string;
  icono?: string;
  activa: boolean;
  total_subcategorias?: number;
}

export interface SubcategoriaCatalogoItem {
  id: number;
  categoria_id: number;
  categoria_nombre?: string;
  nombre: string;
  descripcion: string;
  activa: boolean;
}

export interface ModalidadCatalogoItem {
  codigo: "PRESENCIAL" | "REMOTA";
  nombre: string;
  descripcion: string;
  protocolo_seguridad: string;
}

export interface CiudadCatalogoItem {
  id: number;
  nombre: string;
  departamento: string;
  codigo_dane: string;
  activa: boolean;
}

export interface HabilidadCatalogoItem {
  id: number;
  nombre: string;
  descripcion: string;
  categoria_nombre?: string;
  activa: boolean;
}

export const catalogService = {
  async getCategorias(): Promise<CategoriaCatalogoItem[]> {
    try {
      const res = await apiClient.get<CategoriaCatalogoItem[]>("/categorias", { requiresAuth: false });
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          nombre: "Tecnología y Software",
          descripcion: "Servicios de desarrollo web, soporte técnico, arquitectura cloud y gestión de bases de datos.",
          activa: true,
          total_subcategorias: 6,
        },
        {
          id: 2,
          nombre: "Hogar y Remodelación",
          descripcion: "Reparaciones, pintura, instalaciones eléctricas, plomería y mantenimiento integral del hogar.",
          activa: true,
          total_subcategorias: 8,
        },
        {
          id: 3,
          nombre: "Cerrajería y Seguridad",
          descripcion: "Cerraduras digitales, puertas blindadas, duplicado de llaves y aperturas de emergencia.",
          activa: true,
          total_subcategorias: 4,
        },
        {
          id: 4,
          nombre: "Diseño y Creatividad",
          descripcion: "Diseño gráfico, branding, producción multimedia, UX/UI e identidad corporativa.",
          activa: true,
          total_subcategorias: 5,
        },
        {
          id: 5,
          nombre: "Educación y Capacitación",
          descripcion: "Tutorías técnicas, refuerzo escolar, idiomas y preparación en habilidades digitales.",
          activa: true,
          total_subcategorias: 4,
        },
        {
          id: 6,
          nombre: "Automotriz y Transporte",
          descripcion: "Mecánica preventiva, diagnóstico computarizado y servicios especializados de transporte.",
          activa: true,
          total_subcategorias: 3,
        },
      ];
    }
  },

  async getSubcategorias(categoriaId: number | string): Promise<SubcategoriaCatalogoItem[]> {
    try {
      const res = await apiClient.get<SubcategoriaCatalogoItem[]>(`/categorias/${categoriaId}/subcategorias`, {
        requiresAuth: false,
      });
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          categoria_id: Number(categoriaId),
          categoria_nombre: "Tecnología y Software",
          nombre: "Desarrollo web y backend",
          descripcion: "Construcción de APIs REST escalables, microservicios en GCP y arquitecturas Cloud SQL.",
          activa: true,
        },
        {
          id: 2,
          categoria_id: Number(categoriaId),
          categoria_nombre: "Tecnología y Software",
          nombre: "Cableado estructurado y redes",
          descripcion: "Instalación de racks, fibra óptica, puntos de red certificados y enlaces inalámbricos.",
          activa: true,
        },
        {
          id: 3,
          categoria_id: Number(categoriaId),
          categoria_nombre: "Tecnología y Software",
          nombre: "Mantenimiento preventivo y correctivo de PCs",
          descripcion: "Optimización de estaciones de trabajo, reemplazo de componentes y limpieza física.",
          activa: true,
        },
        {
          id: 4,
          categoria_id: Number(categoriaId),
          categoria_nombre: "Tecnología y Software",
          nombre: "Ciberseguridad y auditoría",
          descripcion: "Análisis de vulnerabilidades OWASP, configuración de Cloud Armor y cortafuegos.",
          activa: true,
        },
      ];
    }
  },

  async getModalidades(): Promise<ModalidadCatalogoItem[]> {
    try {
      const res = await apiClient.get<ModalidadCatalogoItem[]>("/modalidades", { requiresAuth: false });
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          codigo: "PRESENCIAL",
          nombre: "Presencial (Domicilio o Sitio)",
          descripcion: "El profesional asiste físicamente a la dirección acordada.",
          protocolo_seguridad: "Protegido por código de validación PIN de 4 dígitos, alertas en tiempo real y chequeos obligatorios.",
        },
        {
          codigo: "REMOTA",
          nombre: "Remoto (Virtual / Online)",
          descripcion: "Prestación del servicio mediante videoconferencia, soporte remoto o entrega digital de archivos.",
          protocolo_seguridad: "Chat cifrado, trazabilidad de mensajería y pagos con comisiones transparentes sin intermediarios opacos.",
        },
      ];
    }
  },

  async getCiudades(): Promise<CiudadCatalogoItem[]> {
    try {
      const res = await apiClient.get<CiudadCatalogoItem[]>("/ciudades", { requiresAuth: false });
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        { id: 1, nombre: "Bogotá D.C.", departamento: "Cundinamarca", codigo_dane: "11001", activa: true },
        { id: 2, nombre: "Medellín", departamento: "Antioquia", codigo_dane: "05001", activa: true },
        { id: 3, nombre: "Cali", departamento: "Valle del Cauca", codigo_dane: "76001", activa: true },
        { id: 4, nombre: "Barranquilla", departamento: "Atlántico", codigo_dane: "08001", activa: true },
        { id: 5, nombre: "Bucaramanga", departamento: "Santander", codigo_dane: "68001", activa: true },
        { id: 6, nombre: "Cartagena", departamento: "Bolívar", codigo_dane: "13001", activa: true },
        { id: 7, nombre: "Pereira", departamento: "Risaralda", codigo_dane: "66001", activa: true },
        { id: 8, nombre: "Manizales", departamento: "Caldas", codigo_dane: "17001", activa: true },
      ];
    }
  },

  async getHabilidades(): Promise<HabilidadCatalogoItem[]> {
    try {
      const res = await apiClient.get<HabilidadCatalogoItem[]>("/habilidades", { requiresAuth: false });
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        { id: 1, nombre: "Python / FastAPI", descripcion: "Desarrollo de servicios backend de alta velocidad.", categoria_nombre: "Tecnología", activa: true },
        { id: 2, nombre: "JavaScript / TypeScript", descripcion: "Lógica frontend y backend con tipado estricto.", categoria_nombre: "Tecnología", activa: true },
        { id: 3, nombre: "PostgreSQL & Cloud SQL", descripcion: "Modelado relacional y consultas complejas.", categoria_nombre: "Tecnología", activa: true },
        { id: 4, nombre: "Google Cloud Run", descripcion: "Contenedores serverless y despliegue continuo.", categoria_nombre: "Tecnología", activa: true },
        { id: 5, nombre: "Certificación Eléctrica RETIE", descripcion: "Normativa técnica colombiana de instalaciones.", categoria_nombre: "Hogar", activa: true },
        { id: 6, nombre: "Plomería Hidráulica y Gas", descripcion: "Termofusión y detección de fugas no destructiva.", categoria_nombre: "Hogar", activa: true },
        { id: 7, nombre: "Cerraduras Electrónicas Inteligentes", descripcion: "Instalación de cerraduras biométricas y WiFi.", categoria_nombre: "Cerrajería", activa: true },
        { id: 8, nombre: "Cableado Estructurado Cat 6A / Fibra", descripcion: "Conectividad física para empresas.", categoria_nombre: "Redes", activa: true },
      ];
    }
  },
};
