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
  id: number;
  ciudad_id: number;
  ciudad_nombre: string;
  direccion_linea: string;
  referencia?: string;
  codigo_postal?: string;
  es_principal: boolean;
  activa: boolean;
  fecha_creacion: string;
}

export interface UserRoleItem {
  id: number;
  codigo: "CLIENTE" | "TRABAJADOR" | "ADMIN";
  nombre: string;
  descripcion: string;
  asignado: boolean;
}

export interface PerfilTrabajadorPrivado {
  id: number;
  usuario_id: number;
  titulo_profesional: string;
  descripcion_perfil: string;
  anos_experiencia: number;
  ciudad_id: number;
  ciudad_nombre: string;
  promedio_calificacion: number;
  total_calificaciones: number;
  estado: "ACTIVO" | "EN_REVISION" | "SUSPENDIDO";
}

export interface HabilidadTrabajadorItem {
  id: number;
  habilidad_id: number;
  nombre: string;
  descripcion_competencia: string;
  fecha_registro: string;
}

export interface CoberturaTrabajadorItem {
  id: number;
  ciudad_id: number;
  ciudad_nombre: string;
  departamento: string;
  fecha_registro: string;
}

export interface TrabajadorPagoItem {
  id: number;
  cita_id: number;
  servicio_titulo: string;
  cliente_nombre: string;
  monto_bruto: number;
  comision_descontada: number;
  monto_neto: number;
  metodo_pago: string;
  estado: "COMPLETADO" | "PENDIENTE";
  referencia: string;
  fecha: string;
}

export interface CalificacionRecibidaItem {
  id: number;
  puntuacion: number;
  servicio_titulo: string;
  cliente_nombre: string;
  comentario: string;
  fecha: string;
}

export const userService = {
  // === USUARIO ME ===
  async getMe(): Promise<AuthUser> {
    try {
      return await apiClient.get<AuthUser>("/me");
    } catch {
      return {
        id: 1,
        email: "sebastian.martin@findjob.co",
        nombres: "Sebastián",
        apellidos: "Martín",
        telefono: "+57 300 123 4567",
        roles: ["CLIENTE", "TRABAJADOR"],
      };
    }
  },

  async updateMe(payload: EditarPerfilInput): Promise<AuthUser> {
    const sanitized = {
      nombres: sanitize(payload.nombres),
      apellidos: sanitize(payload.apellidos),
      telefono: payload.telefono ? sanitize(payload.telefono) : null,
    };
    try {
      return await apiClient.patch<AuthUser>("/me", sanitized);
    } catch {
      return {
        id: 1,
        email: "sebastian.martin@findjob.co",
        nombres: sanitized.nombres,
        apellidos: sanitized.apellidos,
        telefono: sanitized.telefono || undefined,
        roles: ["CLIENTE", "TRABAJADOR"],
      };
    }
  },

  async getRoles(): Promise<UserRoleItem[]> {
    try {
      const res = await apiClient.get<UserRoleItem[]>("/me/roles");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          codigo: "CLIENTE",
          nombre: "Cliente / Contratante",
          descripcion: "Permite explorar servicios, cotizar, programar citas y calificar profesionales.",
          asignado: true,
        },
        {
          id: 2,
          codigo: "TRABAJADOR",
          nombre: "Profesional / Proveedor",
          descripcion: "Permite publicar servicios, recibir solicitudes, coordinar citas y gestionar cobros.",
          asignado: true,
        },
        {
          id: 3,
          codigo: "ADMIN",
          nombre: "Administrador de Plataforma",
          descripcion: "Supervisión operativa, moderación, catálogos y políticas de comisión.",
          asignado: false,
        },
      ];
    }
  },

  // === DIRECCIONES ===
  async getDirecciones(): Promise<DireccionItem[]> {
    try {
      const res = await apiClient.get<DireccionItem[]>("/me/direcciones");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          ciudad_id: 1,
          ciudad_nombre: "Bogotá D.C.",
          direccion_linea: "Calle 72 # 11-86, Apto 502",
          referencia: "Edificio Horizonte, frente al centro comercial",
          codigo_postal: "110221",
          es_principal: true,
          activa: true,
          fecha_creacion: "2026-09-12T10:30:00Z",
        },
        {
          id: 2,
          ciudad_id: 1,
          ciudad_nombre: "Bogotá D.C.",
          direccion_linea: "Carrera 15 # 93-60, Oficina 401",
          referencia: "Chicó Norte",
          codigo_postal: "110221",
          es_principal: false,
          activa: true,
          fecha_creacion: "2026-10-01T14:15:00Z",
        },
      ];
    }
  },

  async createDireccion(payload: DireccionInput): Promise<DireccionItem> {
    const sanitized = {
      ...payload,
      direccion_linea: sanitize(payload.direccion_linea),
      referencia: payload.referencia ? sanitize(payload.referencia) : undefined,
    };
    try {
      return await apiClient.post<DireccionItem>("/me/direcciones", sanitized);
    } catch {
      return {
        id: Date.now(),
        ciudad_id: payload.ciudad_id,
        ciudad_nombre: "Bogotá D.C.",
        direccion_linea: sanitized.direccion_linea,
        referencia: sanitized.referencia,
        codigo_postal: payload.codigo_postal,
        es_principal: payload.es_principal,
        activa: true,
        fecha_creacion: new Date().toISOString(),
      };
    }
  },

  async updateDireccion(id: number | string, payload: Partial<DireccionInput>): Promise<void> {
    const sanitized = {
      ...payload,
      direccion_linea: payload.direccion_linea ? sanitize(payload.direccion_linea) : undefined,
      referencia: payload.referencia ? sanitize(payload.referencia) : undefined,
    };
    await apiClient.patch(`/me/direcciones/${id}`, sanitized);
  },

  async deleteDireccion(id: number | string): Promise<void> {
    await apiClient.delete(`/me/direcciones/${id}`);
  },

  // === PERFIL PROFESIONAL PRIVADO ===
  async getPerfilTrabajador(): Promise<PerfilTrabajadorPrivado> {
    try {
      return await apiClient.get<PerfilTrabajadorPrivado>("/trabajador/perfil");
    } catch {
      return {
        id: 101,
        usuario_id: 1,
        titulo_profesional: "Desarrollador Web y Especialista Cloud en GCP",
        descripcion_perfil:
          "Más de 7 años de experiencia construyendo microservicios en Cloud Run con FastAPI, bases de datos PostgreSQL en Cloud SQL y aplicaciones frontend seguras.",
        anos_experiencia: 7,
        ciudad_id: 1,
        ciudad_nombre: "Bogotá D.C.",
        promedio_calificacion: 4.9,
        total_calificaciones: 27,
        estado: "ACTIVO",
      };
    }
  },

  async crearPerfilTrabajador(payload: PerfilTrabajadorInput): Promise<PerfilTrabajadorPrivado> {
    const sanitized = {
      ...payload,
      titulo_profesional: sanitize(payload.titulo_profesional),
      descripcion_perfil: sanitize(payload.descripcion_perfil),
    };
    try {
      return await apiClient.post<PerfilTrabajadorPrivado>("/trabajador/perfil", sanitized);
    } catch {
      return {
        id: Date.now(),
        usuario_id: 1,
        titulo_profesional: sanitized.titulo_profesional,
        descripcion_perfil: sanitized.descripcion_perfil,
        anos_experiencia: payload.anos_experiencia,
        ciudad_id: payload.ciudad_id,
        ciudad_nombre: "Bogotá D.C.",
        promedio_calificacion: 5.0,
        total_calificaciones: 0,
        estado: "ACTIVO",
      };
    }
  },

  async actualizarPerfilTrabajador(payload: Partial<PerfilTrabajadorInput>): Promise<void> {
    const sanitized = {
      ...payload,
      titulo_profesional: payload.titulo_profesional ? sanitize(payload.titulo_profesional) : undefined,
      descripcion_perfil: payload.descripcion_perfil ? sanitize(payload.descripcion_perfil) : undefined,
    };
    await apiClient.patch("/trabajador/perfil", sanitized);
  },

  // === HABILIDADES DEL TRABAJADOR ===
  async getHabilidadesTrabajador(): Promise<HabilidadTrabajadorItem[]> {
    try {
      const res = await apiClient.get<HabilidadTrabajadorItem[]>("/trabajador/habilidades");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          habilidad_id: 10,
          nombre: "Python & FastAPI",
          descripcion_competencia: "Desarrollo de microservicios asíncronos y arquitecturas REST.",
          fecha_registro: "2026-01-14",
        },
        {
          id: 2,
          habilidad_id: 12,
          nombre: "TypeScript & React",
          descripcion_competencia: "Construcción de interfaces tipadas con Next.js y Tailwind CSS.",
          fecha_registro: "2026-01-22",
        },
        {
          id: 3,
          habilidad_id: 15,
          nombre: "PostgreSQL & Cloud SQL",
          descripcion_competencia: "Modelado relacional en 3FN, índices GiST y extensiones ltree.",
          fecha_registro: "2026-02-18",
        },
        {
          id: 4,
          habilidad_id: 18,
          nombre: "Google Cloud Platform",
          descripcion_competencia: "Despliegue y escalado en Cloud Run, Cloud Armor y Secret Manager.",
          fecha_registro: "2026-03-02",
        },
      ];
    }
  },

  async agregarHabilidadTrabajador(payload: HabilidadTrabajadorInput): Promise<void> {
    await apiClient.post("/trabajador/habilidades", {
      ...payload,
      descripcion_competencia: sanitize(payload.descripcion_competencia),
    });
  },

  async quitarHabilidadTrabajador(habilidadId: number | string): Promise<void> {
    await apiClient.delete(`/trabajador/habilidades/${habilidadId}`);
  },

  // === COBERTURAS DEL TRABAJADOR ===
  async getCoberturasTrabajador(): Promise<CoberturaTrabajadorItem[]> {
    try {
      const res = await apiClient.get<CoberturaTrabajadorItem[]>("/trabajador/coberturas");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          ciudad_id: 1,
          ciudad_nombre: "Bogotá D.C.",
          departamento: "Cundinamarca",
          fecha_registro: "2026-01-15",
        },
        {
          id: 2,
          ciudad_id: 2,
          ciudad_nombre: "Medellín",
          departamento: "Antioquia",
          fecha_registro: "2026-02-01",
        },
        {
          id: 3,
          ciudad_id: 3,
          ciudad_nombre: "Cali",
          departamento: "Valle del Cauca",
          fecha_registro: "2026-02-20",
        },
      ];
    }
  },

  async agregarCoberturaTrabajador(ciudadId: number | string): Promise<void> {
    await apiClient.post("/trabajador/coberturas", { ciudad_id: Number(ciudadId) });
  },

  async quitarCoberturaTrabajador(ciudadId: number | string): Promise<void> {
    await apiClient.delete(`/trabajador/coberturas/${ciudadId}`);
  },

  // === PAGOS DEL TRABAJADOR ===
  async getPagosTrabajador(): Promise<TrabajadorPagoItem[]> {
    try {
      const res = await apiClient.get<TrabajadorPagoItem[]>("/trabajador/pagos");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 901,
          cita_id: 1001,
          servicio_titulo: "Desarrollo de API REST Segura en GCP",
          cliente_nombre: "Sebastián Martín",
          monto_bruto: 280000,
          comision_descontada: 33600,
          monto_neto: 246400,
          metodo_pago: "NEQUI_SIMULADO",
          estado: "COMPLETADO",
          referencia: "COP-FINDJOB-849201",
          fecha: "2026-10-24T20:10:00Z",
        },
        {
          id: 902,
          cita_id: 1002,
          servicio_titulo: "Instalación y Configuración de Firewall",
          cliente_nombre: "David Restrepo",
          monto_bruto: 180000,
          comision_descontada: 21600,
          monto_neto: 158400,
          metodo_pago: "TRANSFERENCIA_SIMULADA",
          estado: "COMPLETADO",
          referencia: "COP-FINDJOB-773192",
          fecha: "2026-10-15T16:30:00Z",
        },
      ];
    }
  },

  // === CALIFICACIONES DEL TRABAJADOR ===
  async getCalificacionesTrabajador(): Promise<CalificacionRecibidaItem[]> {
    try {
      const res = await apiClient.get<CalificacionRecibidaItem[]>("/trabajador/calificaciones");
      return Array.isArray(res) ? res : [];
    } catch {
      return [
        {
          id: 1,
          puntuacion: 5,
          servicio_titulo: "Desarrollo de sitio web corporativo",
          cliente_nombre: "Laura Gómez",
          comentario: "Excelente comunicación y entrega puntual. El código quedó muy bien estructurado y documentado.",
          fecha: "12 de octubre de 2026",
        },
        {
          id: 2,
          puntuacion: 5,
          servicio_titulo: "Optimización de base de datos PostgreSQL",
          cliente_nombre: "Andrés Felipe Castro",
          comentario: "Resolvió con rapidez los cuellos de botella en nuestras consultas. Gran profesional.",
          fecha: "28 de septiembre de 2026",
        },
        {
          id: 3,
          puntuacion: 4,
          servicio_titulo: "Integración de pasarela de pagos",
          cliente_nombre: "Carolina Rojas",
          comentario: "Muy buen trabajo técnico y disposición para solucionar dudas del equipo.",
          fecha: "15 de agosto de 2026",
        },
      ];
    }
  },
};
