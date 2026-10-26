import { z } from "zod";

/**
 * Esquema Zod de validación defensiva para crear hilos en comunidades (OWASP).
 */
export const createPostSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, "El título debe contener al menos 5 caracteres.")
    .max(150, "El título no puede exceder los 150 caracteres."),
  comunidad_slug: z.string().min(1, "Debes seleccionar una comunidad."),
  contenido_markdown: z
    .string()
    .trim()
    .min(10, "El contenido debe tener al menos 10 caracteres.")
    .max(5000, "El contenido no puede superar los 5000 caracteres."),
  tags: z.array(z.string().trim().max(30)).max(5, "Máximo 5 etiquetas permitidas.").optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

/**
 * Esquema Zod para comentarios anidados compatibles con ltree (PostgreSQL).
 */
export const createCommentSchema = z.object({
  hilo_id: z.number().int().positive(),
  parent_path: z.string().trim().default(""), // ej: "1.4" para sub-respuestas
  contenido: z
    .string()
    .trim()
    .min(2, "El comentario debe tener al menos 2 caracteres.")
    .max(2000, "El comentario no puede superar los 2000 caracteres."),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
