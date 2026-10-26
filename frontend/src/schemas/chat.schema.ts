import { z } from "zod";

export const enviarMensajeSchema = z.object({
  contenido: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(2000, "El mensaje no puede exceder 2000 caracteres"),
});

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;

export const adjuntoSchema = z.object({
  nombre_archivo: z.string().min(1, "Nombre de archivo requerido").max(255),
  tipo_mime: z.string().regex(/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/, {
    message: "Solo se permiten imágenes (JPEG, PNG, WEBP) o documentos PDF",
  }),
  tamano_bytes: z.number().positive().max(10 * 1024 * 1024, {
    message: "El archivo adjunto no puede exceder 10 MB",
  }),
  storage_url: z.string().url("URL de almacenamiento inválida"),
});

export type AdjuntoInput = z.infer<typeof adjuntoSchema>;
