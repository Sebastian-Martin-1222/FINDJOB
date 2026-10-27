import { z } from "zod";

export const cambiarEstadoUsuarioSchema = z.object({
  estado: z.enum(["ACTIVO", "SUSPENDIDO", "INACTIVO"]),
  motivo: z.string().max(500, "El motivo no puede exceder 500 caracteres").optional(),
});

export type CambiarEstadoUsuarioInput = z.infer<typeof cambiarEstadoUsuarioSchema>;

export const actualizarRolesUsuarioSchema = z.object({
  roles: z
    .array(z.enum(["CLIENTE", "TRABAJADOR", "ADMIN"]))
    .min(1, "El usuario debe tener al menos un rol asignado"),
});

export type ActualizarRolesUsuarioInput = z.infer<typeof actualizarRolesUsuarioSchema>;

export const crearCategoriaSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  descripcion: z.string().max(500).optional(),
});

export type CrearCategoriaInput = z.infer<typeof crearCategoriaSchema>;

export const crearSubcategoriaSchema = z.object({
  categoria_id: z.coerce.number().positive(),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
  descripcion: z.string().max(500).optional(),
});

export type CrearSubcategoriaInput = z.infer<typeof crearSubcategoriaSchema>;

export const crearPoliticaComisionSchema = z.object({
  porcentaje: z.coerce
    .number()
    .min(0, "El porcentaje no puede ser negativo")
    .max(50, "La comisión no puede exceder el 50%"),
  descripcion: z.string().min(5, "Describa la vigencia o justificación de la política").max(250),
});

export type CrearPoliticaComisionInput = z.infer<typeof crearPoliticaComisionSchema>;

export const adminHabilidadSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  descripcion: z.string().min(5, "La descripción debe tener al menos 5 caracteres").max(500),
  categoria_id: z.coerce.number().positive("Seleccione una categoría"),
});

export type AdminHabilidadInput = z.infer<typeof adminHabilidadSchema>;

export const adminPreguntaSeguridadSchema = z.object({
  pregunta: z.string().min(5, "La pregunta debe tener al menos 5 caracteres").max(300),
  tipo_cita: z.enum(["PRESENCIAL", "REMOTA"]).default("PRESENCIAL"),
  activa: z.boolean().default(true),
});

export type AdminPreguntaSeguridadInput = z.infer<typeof adminPreguntaSeguridadSchema>;

