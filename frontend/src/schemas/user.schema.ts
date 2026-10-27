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
    .regex(/^(\+57)?\s?[3][0-9]{9}$/, "Debe ingresar un número de celular colombiano válido (ej. +57 300 123 4567 o 3001234567)")
    .optional()
    .or(z.literal("")),
});

export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;

export const direccionSchema = z.object({
  ciudad_id: z.coerce.number().positive("Seleccione una ciudad de Colombia"),
  direccion_linea: z
    .string()
    .min(5, "La dirección debe contener al menos 5 caracteres")
    .max(250, "La dirección no puede exceder 250 caracteres"),
  referencia: z.string().max(250, "La referencia no puede exceder 250 caracteres").optional(),
  codigo_postal: z.string().max(10).optional(),
  es_principal: z.boolean().default(false),
});

export type DireccionInput = z.infer<typeof direccionSchema>;

export const perfilTrabajadorSchema = z.object({
  titulo_profesional: z
    .string()
    .min(4, "El título profesional debe tener al menos 4 caracteres")
    .max(120, "El título no puede exceder 120 caracteres"),
  descripcion_perfil: z
    .string()
    .min(15, "La descripción del perfil debe tener al menos 15 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  anos_experiencia: z.coerce
    .number()
    .int()
    .min(0, "Los años de experiencia no pueden ser negativos")
    .max(50, "El valor máximo es 50 años"),
  ciudad_id: z.coerce.number().positive("Seleccione una ciudad base"),
});

export type PerfilTrabajadorInput = z.infer<typeof perfilTrabajadorSchema>;

export const habilidadTrabajadorSchema = z.object({
  habilidad_id: z.coerce.number().positive("Seleccione una habilidad técnica"),
  descripcion_competencia: z
    .string()
    .min(5, "Describa su competencia con al menos 5 caracteres")
    .max(500, "La descripción no puede exceder 500 caracteres"),
});

export type HabilidadTrabajadorInput = z.infer<typeof habilidadTrabajadorSchema>;

export const coberturaTrabajadorSchema = z.object({
  ciudad_id: z.coerce.number().positive("Seleccione la ciudad a incluir en su cobertura"),
});

export type CoberturaTrabajadorInput = z.infer<typeof coberturaTrabajadorSchema>;
