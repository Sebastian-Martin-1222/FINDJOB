import { z } from "zod";

export const ModalidadEnum = z.enum(["PRESENCIAL", "REMOTA"]);
export type ModalidadType = z.infer<typeof ModalidadEnum>;

export const createSolicitudSchema = z.object({
  servicio_id: z.coerce.number().positive("El ID del servicio es requerido"),
  modalidad: ModalidadEnum,
  ciudad_id: z.coerce.number().optional(),
  direccion_texto: z.string().max(250, "La dirección no puede exceder 250 caracteres").optional(),
  fecha_preferida: z.string().min(1, "Debe seleccionar una fecha tentativa"),
  descripcion: z
    .string()
    .min(10, "La descripción del requerimiento debe tener al menos 10 caracteres")
    .max(2000, "La descripción no puede exceder 2000 caracteres"),
}).refine(
  (data) => {
    if (data.modalidad === "PRESENCIAL") {
      return Boolean(data.direccion_texto && data.direccion_texto.trim().length > 3);
    }
    return true;
  },
  {
    message: "Para servicios presenciales es obligatorio ingresar una dirección de atención",
    path: ["direccion_texto"],
  }
);

export type CreateSolicitudInput = z.infer<typeof createSolicitudSchema>;

export const programarCitaSchema = z.object({
  fecha_hora_inicio: z.string().min(1, "La fecha y hora de inicio es requerida"),
  fecha_hora_fin: z.string().min(1, "La fecha y hora estimada de finalización es requerida"),
  notas: z.string().max(1000, "Las notas no pueden exceder 1000 caracteres").optional(),
});

export type ProgramarCitaInput = z.infer<typeof programarCitaSchema>;

export const confirmarPinSchema = z.object({
  codigo_pin: z
    .string()
    .regex(/^\d{4}$/, "El código de seguridad debe tener exactamente 4 dígitos numéricos"),
});

export type ConfirmarPinInput = z.infer<typeof confirmarPinSchema>;

export const alertaSeguridadSchema = z.object({
  tipo_alerta: z.enum([
    "SOS_EMERGENCIA",
    "UBICACION_INSEGURA",
    "CONDUCTA_INAPROPIADA",
    "OTRO",
  ]),
  descripcion: z
    .string()
    .min(5, "Describa la situación de seguridad con al menos 5 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres"),
});

export type AlertaSeguridadInput = z.infer<typeof alertaSeguridadSchema>;

export const responderChequeoSchema = z.object({
  respuesta: z
    .string()
    .min(1, "Debe ingresar una respuesta al chequeo de seguridad")
    .max(500, "La respuesta no puede exceder 500 caracteres"),
});

export type ResponderChequeoInput = z.infer<typeof responderChequeoSchema>;

export const MetodoPagoEnum = z.enum([
  "TRANSFERENCIA_SIMULADA",
  "TARJETA_SIMULADA",
  "NEQUI_SIMULADO",
  "DAVIPLATA_SIMULADO",
]);

export const registroPagoSchema = z.object({
  monto: z.coerce.number().min(1000, "El valor mínimo de pago es de $1.000 COP"),
  metodo_pago: MetodoPagoEnum,
});

export type RegistroPagoInput = z.infer<typeof registroPagoSchema>;

export const calificacionSchema = z.object({
  puntuacion: z.coerce.number().int().min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas"),
  comentario: z
    .string()
    .min(5, "El comentario de reseña debe tener al menos 5 caracteres")
    .max(1000, "El comentario no puede exceder 1000 caracteres"),
});

export type CalificacionInput = z.infer<typeof calificacionSchema>;

export const publicarServicioSchema = z.object({
  subcategoria_id: z.coerce.number().positive("Seleccione una subcategoría válida"),
  titulo: z
    .string()
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(120, "El título no puede exceder 120 caracteres"),
  descripcion: z
    .string()
    .min(15, "La descripción del servicio debe tener al menos 15 caracteres")
    .max(3000, "La descripción no puede exceder 3000 caracteres"),
  precio_base: z.coerce.number().min(1000, "El precio base debe ser de al menos $1.000 COP"),
  tiempo_estimado_horas: z.coerce.number().min(1, "El tiempo estimado debe ser de al menos 1 hora"),
  revisiones_incluidas: z.coerce.number().min(0, "Las revisiones deben ser 0 o superior"),
  modalidades: z
    .array(ModalidadEnum)
    .min(1, "Debe seleccionar al menos una modalidad disponible (Presencial o Remota)"),
});

export type PublicarServicioInput = z.infer<typeof publicarServicioSchema>;
