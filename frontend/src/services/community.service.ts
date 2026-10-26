import DOMPurify from "dompurify";
import { CreatePostInput, CreateCommentInput } from "@/schemas/forum.schema";
import { authStorage } from "@/lib/auth-storage";

export function sanitizeHtml(dirty: string): string {
  if (typeof window !== "undefined") {
    return sanitizeHtml(dirty);
  }
  return dirty
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface CommunityInfo {
  slug: string;
  nombre: string;
  descripcion: string;
  icono: string;
  miembros_count: number;
  hilos_count: number;
}

export interface CommentNode {
  comentario_id: number;
  hilo_id: number;
  autor_nombre: string;
  autor_rol: string;
  path: string; // Compatible con ltree (ej: "1", "1.1", "1.2.1")
  contenido_sanitizado: string;
  upvotes: number;
  fecha_creacion: string;
  replies?: CommentNode[];
}

export interface PostItem {
  hilo_id: number;
  titulo: string;
  comunidad_slug: string;
  comunidad_nombre: string;
  autor_nombre: string;
  autor_rol: string;
  contenido_sanitizado: string;
  upvotes: number;
  downvotes: number;
  hot_score: number;
  comentarios_count: number;
  fecha_creacion: string;
  tags: string[];
}

/**
 * Algoritmo de Atenuación Temporal (Hot Ranking Decay)
 * Score = (Upvotes - Downvotes) / (Age_in_Hours + 2)^1.5
 */
export function calculateHotRankingScore(upvotes: number, downvotes: number, createdAtIso: string): number {
  const netVotes = upvotes - downvotes;
  const ageInHours = Math.max(0, (Date.now() - new Date(createdAtIso).getTime()) / (1000 * 60 * 60));
  const gravity = 1.5;
  return Number((netVotes / Math.pow(ageInHours + 2, gravity)).toFixed(4));
}

// Catálogo base de comunidades oficiales de FindJob
export const COMMUNITIES_LIST: CommunityInfo[] = [
  {
    slug: "plomeria",
    nombre: "Plomería y Gas",
    descripcion: "Soluciones de tuberías, calentadores, griferías y normativa técnica de gas en Colombia.",
    icono: "Droplets",
    miembros_count: 1420,
    hilos_count: 342,
  },
  {
    slug: "electricidad",
    nombre: "Instalaciones Eléctricas",
    descripcion: "Normativa RETIE, cuadros de carga, protección residencial e iluminación eficiente.",
    icono: "Zap",
    miembros_count: 1890,
    hilos_count: 480,
  },
  {
    slug: "cerrajeria",
    nombre: "Cerrajería & Seguridad",
    descripcion: "Aperturas de emergencia, cerraduras de alta seguridad y cerraduras biométricas.",
    icono: "Key",
    miembros_count: 850,
    hilos_count: 195,
  },
  {
    slug: "redes-ti",
    nombre: "Redes, Soporte y Telecom",
    descripcion: "Cableado estructurado, fibra óptica residencial y conectividad corporativa.",
    icono: "Wrench",
    miembros_count: 2340,
    hilos_count: 610,
  },
  {
    slug: "carpinteria",
    nombre: "Carpintería y Acabados",
    descripcion: "Mobiliario a medida, reparación de puertas, impermeabilización y pisos laminados.",
    icono: "Hammer",
    miembros_count: 1120,
    hilos_count: 275,
  },
];

// Almacén reactivo en memoria para el prototipo y conexión real
const postsDatabase: PostItem[] = [
  {
    hilo_id: 1,
    titulo: "¿Cómo verificar la presión correcta en tuberías de agua potable residenciales según NTC?",
    comunidad_slug: "plomeria",
    comunidad_nombre: "Plomería y Gas",
    autor_nombre: "Carlos Restrepo",
    autor_rol: "Técnico Certificado",
    contenido_sanitizado: sanitizeHtml(
      "Al realizar pruebas hidrostáticas en viviendas unifamiliares en Bogotá, ¿qué manómetro y qué rango de presión recomiendan para evitar fatiga en uniones de CPVC? Es importante cumplir con la norma técnica colombiana para evitar garantías posteriores."
    ),
    upvotes: 28,
    downvotes: 1,
    hot_score: calculateHotRankingScore(28, 1, new Date(Date.now() - 3600000 * 4).toISOString()),
    comentarios_count: 4,
    fecha_creacion: "Hace 4 horas",
    tags: ["CPVC", "NTC", "Presión", "Manómetro"],
  },
  {
    hilo_id: 2,
    titulo: "Diferencias clave al cablear red Cat 6A en edificaciones con alta interferencia electromagnética",
    comunidad_slug: "redes-ti",
    comunidad_nombre: "Redes, Soporte y Telecom",
    autor_nombre: "Ing. Andrea Salamanca",
    autor_rol: "Especialista Redes",
    contenido_sanitizado: sanitizeHtml(
      "Comparto este tip para instalaciones industriales en Medellín: Siempre verificar la continuidad de la malla de blindaje (F/UTP vs U/UTP) y la puesta a tierra del rack para evitar pérdidas de paquetes en enlaces 10G."
    ),
    upvotes: 45,
    downvotes: 2,
    hot_score: calculateHotRankingScore(45, 2, new Date(Date.now() - 3600000 * 2).toISOString()),
    comentarios_count: 7,
    fecha_creacion: "Hace 2 horas",
    tags: ["Cat6A", "10Gbps", "PuestaATierra"],
  },
  {
    hilo_id: 3,
    titulo: "Guía rápida para certificación RETIE en reformas residenciales menores",
    comunidad_slug: "electricidad",
    comunidad_nombre: "Instalaciones Eléctricas",
    autor_nombre: "Mateo Cárdenas",
    autor_rol: "Electricista Matriculado",
    contenido_sanitizado: sanitizeHtml(
      "Resumen de los puntos no negociables para la inspección eléctrica: Calibre de conductores por ducto, código de colores en Colombia (Amarillo/Azul/Rojo fases, Blanco neutro, Verde tierra) y pruebas de disparo en interruptores diferenciales."
    ),
    upvotes: 36,
    downvotes: 0,
    hot_score: calculateHotRankingScore(36, 0, new Date(Date.now() - 3600000 * 6).toISOString()),
    comentarios_count: 5,
    fecha_creacion: "Hace 6 horas",
    tags: ["RETIE", "SeguridadElectrica", "Normativa"],
  },
];

const commentsDatabase: Record<number, CommentNode[]> = {
  1: [
    {
      comentario_id: 101,
      hilo_id: 1,
      autor_nombre: "Julián Benítez",
      autor_rol: "Plomero Máster",
      path: "1",
      contenido_sanitizado: sanitizeHtml(
        "Recomiendo mantener la prueba a 100 PSI durante mínimo 15 minutos con manómetro de glicerina. Si la aguja no cae, el sellado con pegamento solvente es óptimo."
      ),
      upvotes: 12,
      fecha_creacion: "Hace 3 horas",
      replies: [
        {
          comentario_id: 102,
          hilo_id: 1,
          autor_nombre: "Carlos Restrepo",
          autor_rol: "Técnico Certificado",
          path: "1.1",
          contenido_sanitizado: sanitizeHtml(
            "Excelente dato Julián, ¿aplicas la prueba inmediatamente o dejas curar 24 horas el solvente?"
          ),
          upvotes: 5,
          fecha_creacion: "Hace 2 horas",
          replies: [
            {
              comentario_id: 103,
              hilo_id: 1,
              autor_nombre: "Julián Benítez",
              autor_rol: "Plomero Máster",
              path: "1.1.1",
              contenido_sanitizado: sanitizeHtml(
                "Mínimo 12 horas en clima frío como Bogotá, 24 horas si hay tuberías de 1 pulgada o superior."
              ),
              upvotes: 8,
              fecha_creacion: "Hace 1 hora",
            },
          ],
        },
      ],
    },
    {
      comentario_id: 104,
      hilo_id: 1,
      autor_nombre: "Fabián Rincón",
      autor_rol: "Inspector de Obra",
      path: "2",
      contenido_sanitizado: sanitizeHtml(
        "No olviden purgar el aire de la línea antes de meter presión hidráulica, las burbujas de aire comprimido pueden falsear la lectura."
      ),
      upvotes: 7,
      fecha_creacion: "Hace 2 horas",
    },
  ],
};

export const communityService = {
  getCommunities(): CommunityInfo[] {
    return COMMUNITIES_LIST;
  },

  getPosts(communitySlug?: string, sortBy: "hot" | "new" | "top" = "hot"): PostItem[] {
    let list = [...postsDatabase];
    if (communitySlug && communitySlug !== "todas") {
      list = list.filter((p) => p.comunidad_slug === communitySlug);
    }

    if (sortBy === "hot") {
      list.sort((a, b) => b.hot_score - a.hot_score);
    } else if (sortBy === "new") {
      list.sort((a, b) => b.hilo_id - a.hilo_id);
    } else if (sortBy === "top") {
      list.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    }

    return list;
  },

  getPostById(hiloId: number): PostItem | null {
    return postsDatabase.find((p) => p.hilo_id === hiloId) || null;
  },

  getCommentsTree(hiloId: number): CommentNode[] {
    return commentsDatabase[hiloId] || [];
  },

  createPost(input: CreatePostInput): PostItem {
    const user = authStorage.getUser();
    const cleanContent = sanitizeHtml(input.contenido_markdown);
    const comm = COMMUNITIES_LIST.find((c) => c.slug === input.comunidad_slug);

    const newPost: PostItem = {
      hilo_id: postsDatabase.length + 1,
      titulo: sanitizeHtml(input.titulo),
      comunidad_slug: input.comunidad_slug,
      comunidad_nombre: comm ? comm.nombre : "Comunidad General",
      autor_nombre: user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : "Profesional FindJob",
      autor_rol: user?.roles?.[0] || "Miembro Verificado",
      contenido_sanitizado: cleanContent,
      upvotes: 1,
      downvotes: 0,
      hot_score: calculateHotRankingScore(1, 0, new Date().toISOString()),
      comentarios_count: 0,
      fecha_creacion: "Hace unos momentos",
      tags: input.tags || [],
    };

    postsDatabase.unshift(newPost);
    return newPost;
  },

  createComment(input: CreateCommentInput): CommentNode {
    const user = authStorage.getUser();
    const cleanContent = sanitizeHtml(input.contenido);

    const newComment: CommentNode = {
      comentario_id: Date.now(),
      hilo_id: input.hilo_id,
      autor_nombre: user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : "Colega Profesional",
      autor_rol: user?.roles?.[0] || "Miembro de Comunidad",
      path: input.parent_path ? `${input.parent_path}.${Date.now() % 100}` : `${Date.now() % 100}`,
      contenido_sanitizado: cleanContent,
      upvotes: 1,
      fecha_creacion: "Hace un momento",
    };

    if (!commentsDatabase[input.hilo_id]) {
      commentsDatabase[input.hilo_id] = [];
    }

    if (!input.parent_path) {
      commentsDatabase[input.hilo_id].push(newComment);
    } else {
      // Helper para insertar en el nodo padre correspondiente según el path jerárquico
      const insertInTree = (nodes: CommentNode[]): boolean => {
        for (const node of nodes) {
          if (node.path === input.parent_path) {
            if (!node.replies) node.replies = [];
            node.replies.push(newComment);
            return true;
          }
          if (node.replies && insertInTree(node.replies)) {
            return true;
          }
        }
        return false;
      };
      const inserted = insertInTree(commentsDatabase[input.hilo_id]);
      if (!inserted) {
        commentsDatabase[input.hilo_id].push(newComment);
      }
    }

    // Incrementar conteo en el post
    const post = postsDatabase.find((p) => p.hilo_id === input.hilo_id);
    if (post) {
      post.comentarios_count += 1;
    }

    return newComment;
  },

  votePost(hiloId: number, delta: number): number {
    const post = postsDatabase.find((p) => p.hilo_id === hiloId);
    if (post) {
      if (delta > 0) post.upvotes += 1;
      else post.downvotes += 1;
      post.hot_score = calculateHotRankingScore(post.upvotes, post.downvotes, new Date().toISOString());
      return post.upvotes - post.downvotes;
    }
    return 0;
  },
};
