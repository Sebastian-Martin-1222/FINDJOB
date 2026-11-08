import { z } from "zod";

export const enviarMensajeSchema = z.object({
  contenido: z.string().min(1, "El mensaje no puede estar vacío"),
});

export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;

export const adjuntoSchema = z.object({
  nombre_original: z.string().min(1, "Nombre de archivo requerido").max(255),
  tipo_mime: z.string().max(100).optional(),
  tamano_bytes: z.number().optional(),
  bucket: z.string().min(1, "El bucket es requerido").max(63),
  ruta_objeto: z.string().min(1, "La ruta de objeto es requerida").max(1024),
});

export type AdjuntoInput = z.infer<typeof adjuntoSchema>;
