import { z } from "zod";

export const ModalidadEnum = z.enum(["PRESENCIAL", "REMOTA"]);
export type ModalidadType = z.infer<typeof ModalidadEnum>;

export const createSolicitudSchema = z.object({
  servicio_id: z.coerce.number().positive("El ID del servicio es requerido"),
  modalidad_id: z.coerce.number().positive("Seleccione una modalidad válida"),
  direccion_id: z.coerce.number().positive().optional().nullable(),
  descripcion_necesidad: z
    .string()
    .min(5, "La descripción del requerimiento debe tener al menos 5 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
  fecha_propuesta: z.string().min(1, "Debe seleccionar una fecha tentativa"),
  valor_acordado: z.coerce.number().positive("El valor acordado debe ser mayor a cero").optional().nullable(),
  plataforma_remota: z.string().max(80, "La plataforma no puede exceder 80 caracteres").optional().nullable(),
});

export type CreateSolicitudInput = z.infer<typeof createSolicitudSchema>;

export const programarCitaSchema = z.object({
  direccion_id: z.coerce.number().positive().optional().nullable(),
  fecha_inicio: z.string().min(1, "La fecha y hora de inicio es requerida"),
  fecha_fin: z.string().optional().nullable(),
  plataforma_remota: z.string().max(80).optional().nullable(),
  enlace_reunion: z.string().url("Debe ser una URL válida").max(2048).optional().or(z.literal("")).nullable(),
});

export type ProgramarCitaInput = z.infer<typeof programarCitaSchema>;

export const confirmarCitaSchema = z.object({
  codigo_confirmacion: z
    .string()
    .min(1, "El código de confirmación es requerido")
    .max(64, "El código no puede superar 64 caracteres"),
});

export type ConfirmarCitaInput = z.infer<typeof confirmarCitaSchema>;

export const alertaSeguridadSchema = z.object({
  tipo_alerta_id: z.coerce.number().positive("Seleccione el tipo de alerta de seguridad"),
  descripcion: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
  latitud: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitud: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export type AlertaSeguridadInput = z.infer<typeof alertaSeguridadSchema>;

export const responderChequeoSchema = z.object({
  pregunta_seguridad_id: z.coerce.number().positive("Identificador de pregunta requerido"),
  respuesta_ok: z.boolean(),
  comentario: z
    .string()
    .max(500, "El comentario no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
  latitud: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitud: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export type ResponderChequeoInput = z.infer<typeof responderChequeoSchema>;

export const registroPagoSchema = z.object({
  metodo_pago_id: z.coerce.number().positive("Seleccione un método de pago"),
  monto_total: z.coerce.number().min(1000, "El valor mínimo de pago es de $1.000 COP"),
  referencia_pasarela: z.string().max(255).optional().or(z.literal("")),
});

export type RegistroPagoInput = z.infer<typeof registroPagoSchema>;

export const calificacionSchema = z.object({
  puntuacion: z.coerce.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comentario: z
    .string()
    .max(1000, "El comentario no puede exceder 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

export type CalificacionInput = z.infer<typeof calificacionSchema>;

export const publicarServicioSchema = z.object({
  subcategoria_id: z.coerce.number().positive("Seleccione una subcategoría válida"),
  titulo: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(180, "El título no puede exceder 180 caracteres"),
  descripcion: z
    .string()
    .min(15, "La descripción del servicio debe tener al menos 15 caracteres")
    .max(3000, "La descripción no puede exceder 3000 caracteres"),
  precio_base: z.coerce.number().min(1000, "El precio base debe ser de al menos $1.000 COP"),
  tiempo_estimado_horas: z.coerce.number().min(1).max(8760, "El tiempo estimado debe ser entre 1 y 8760 horas"),
  revisiones_incluidas: z.coerce.number().min(0, "Las revisiones deben ser 0 o superior"),
  modalidades_ids: z
    .array(z.coerce.number().positive())
    .min(1, "Debe seleccionar al menos una modalidad disponible (Presencial o Remota)"),
});

export type PublicarServicioInput = z.infer<typeof publicarServicioSchema>;
