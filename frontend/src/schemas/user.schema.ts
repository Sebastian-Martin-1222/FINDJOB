import { z } from "zod";

export const editarPerfilSchema = z.object({
  nombres: z.string().max(100, "Los nombres no pueden exceder 100 caracteres"),
  apellidos: z.string().max(100, "Los apellidos no pueden exceder 100 caracteres"),
  telefono: z.string().max(20, "El teléfono no puede exceder 20 caracteres").optional().or(z.literal("")),
});

export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;

export const direccionSchema = z.object({
  ciudad_id: z.coerce.number().positive("Seleccione una ciudad de Colombia"),
  alias: z.string().max(80, "El alias no puede exceder 80 caracteres"),
  linea_direccion: z.string().max(250, "La dirección no puede exceder 250 caracteres"),
  complemento: z.string().max(150, "El complemento no puede exceder 150 caracteres").optional().or(z.literal("")),
  referencia: z.string().max(250, "La referencia no puede exceder 250 caracteres").optional().or(z.literal("")),
  codigo_postal: z.string().max(20, "El código postal no puede exceder 20 caracteres").optional().or(z.literal("")),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
});

export type DireccionInput = z.infer<typeof direccionSchema>;

export const perfilTrabajadorSchema = z.object({
  titulo_profesional: z.string().max(160, "El título no puede exceder 160 caracteres"),
  descripcion_profesional: z.string(),
  experiencia_resumen: z.string().optional().or(z.literal("")),
  ciudad_id: z.coerce.number().positive("Seleccione una ciudad base"),
});

export type PerfilTrabajadorInput = z.infer<typeof perfilTrabajadorSchema>;

export const habilidadTrabajadorSchema = z.object({
  habilidad_id: z.coerce.number().positive("Seleccione una habilidad técnica"),
  descripcion_competencia: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type HabilidadTrabajadorInput = z.infer<typeof habilidadTrabajadorSchema>;

export const coberturaTrabajadorSchema = z.object({
  ciudad_id: z.coerce.number().positive("Seleccione la ciudad a incluir en su cobertura"),
});

export type CoberturaTrabajadorInput = z.infer<typeof coberturaTrabajadorSchema>;
