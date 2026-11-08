import { z } from "zod";

export const cambiarEstadoUsuarioSchema = z.object({
  activo: z.boolean(),
});

export type CambiarEstadoUsuarioInput = z.infer<typeof cambiarEstadoUsuarioSchema>;

export const actualizarRolesUsuarioSchema = z.object({
  roles_ids: z
    .array(z.coerce.number().positive())
    .min(1, "El usuario debe tener al menos un rol asignado"),
});

export type ActualizarRolesUsuarioInput = z.infer<typeof actualizarRolesUsuarioSchema>;

export const crearCategoriaSchema = z.object({
  nombre: z.string().max(120),
  descripcion: z.string().max(500).optional().or(z.literal("")),
  activa: z.boolean().default(true),
});

export type CrearCategoriaInput = z.infer<typeof crearCategoriaSchema>;

export const crearSubcategoriaSchema = z.object({
  categoria_id: z.coerce.number().positive("Seleccione una categoría principal"),
  nombre: z.string().max(120),
  descripcion: z.string().max(500).optional().or(z.literal("")),
  activa: z.boolean().default(true),
});

export type CrearSubcategoriaInput = z.infer<typeof crearSubcategoriaSchema>;

export const crearPoliticaComisionSchema = z.object({
  nombre: z.string().max(120),
  porcentaje_comision: z.coerce
    .number()
    .min(0, "El porcentaje no puede ser negativo")
    .max(100, "La comisión no puede exceder el 100%"),
  vigente_desde: z.string().min(1, "Fecha de inicio de vigencia requerida"),
  vigente_hasta: z.string().optional().or(z.literal("")).nullable(),
  descripcion: z.string().max(500).optional().or(z.literal("")),
});

export type CrearPoliticaComisionInput = z.infer<typeof crearPoliticaComisionSchema>;

export const adminHabilidadSchema = z.object({
  nombre: z.string().max(120),
  descripcion: z.string().max(500).optional().or(z.literal("")),
  activa: z.boolean().default(true),
});

export type AdminHabilidadInput = z.infer<typeof adminHabilidadSchema>;

export const adminPreguntaSeguridadSchema = z.object({
  texto: z.string().max(300),
  activa: z.boolean().default(true),
});

export type AdminPreguntaSeguridadInput = z.infer<typeof adminPreguntaSeguridadSchema>;
