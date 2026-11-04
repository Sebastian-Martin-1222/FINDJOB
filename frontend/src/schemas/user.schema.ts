import { z } from "zod";

export const editarPerfilSchema = z.object({
  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(100, "Los nombres no pueden exceder 100 caracteres"),
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(100, "Los apellidos no pueden exceder 100 caracteres"),
  telefono: z
    .string()
    .regex(
      /^(\+57)?\s?[3][0-9]{9}$/,
      "Debe ingresar un número de celular colombiano válido (ej. +57 300 123 4567 o 3001234567)"
    )
    .optional()
    .or(z.literal("")),
});

export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;

export const direccionSchema = z.object({
  ciudad_id: z.coerce.number().positive("Seleccione una ciudad de Colombia"),
  alias: z
    .string()
    .min(2, "El alias de la dirección debe tener al menos 2 caracteres (ej: Casa, Oficina)")
    .max(80, "El alias no puede exceder 80 caracteres"),
  linea_direccion: z
    .string()
    .min(5, "La dirección debe contener al menos 5 caracteres")
    .max(250, "La dirección no puede exceder 250 caracteres"),
  complemento: z.string().max(150, "El complemento no puede exceder 150 caracteres").optional().or(z.literal("")),
  referencia: z.string().max(250, "La referencia no puede exceder 250 caracteres").optional().or(z.literal("")),
  codigo_postal: z.string().max(20, "El código postal no puede exceder 20 caracteres").optional().or(z.literal("")),
  latitud: z.coerce.number().min(-90).max(90).optional(),
  longitud: z.coerce.number().min(-180).max(180).optional(),
});

export type DireccionInput = z.infer<typeof direccionSchema>;

export const perfilTrabajadorSchema = z.object({
  titulo_profesional: z
    .string()
    .min(4, "El título profesional debe tener al menos 4 caracteres")
    .max(160, "El título no puede exceder 160 caracteres"),
  descripcion_profesional: z
    .string()
    .min(15, "La descripción profesional debe tener al menos 15 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  experiencia_resumen: z
    .string()
    .max(1000, "El resumen de experiencia no puede exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
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
