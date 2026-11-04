import { z } from "zod";

export const enviarMensajeSchema = z.object({
  contenido: z
    .string()
    .min(1, "El mensaje no puede estar vacío")
    .max(2000, "El mensaje no puede exceder 2000 caracteres"),
  tipo_mensaje_id: z.coerce.number().int().default(1),
});

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;

export const adjuntoSchema = z.object({
  nombre_original: z.string().min(1, "Nombre de archivo requerido").max(255),
  tipo_mime: z
    .string()
    .regex(/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/, {
      message: "Solo se permiten imágenes (JPEG, PNG, WEBP) o documentos PDF",
    })
    .max(100)
    .optional(),
  tamano_bytes: z
    .number()
    .positive()
    .max(10 * 1024 * 1024, "El archivo adjunto no puede exceder 10 MB")
    .optional(),
  bucket: z.string().min(1, "El bucket es requerido").max(63),
  ruta_objeto: z.string().min(1, "La ruta de objeto es requerida").max(1024),
});

export type AdjuntoInput = z.infer<typeof adjuntoSchema>;
