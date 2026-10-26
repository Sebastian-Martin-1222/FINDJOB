import { z } from "zod";

/**
 * Esquema de validación en cliente para inicio de sesión (OWASP).
 * Valida formato de correo y longitud segura antes de transmitir la solicitud.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido.")
    .max(254, "El correo electrónico no puede exceder 254 caracteres.")
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Ingresa un formato de correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede exceder 128 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Esquema de validación en cliente para registro de usuario.
 */
export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo electrónico es requerido.")
    .max(254, "El correo electrónico no puede exceder 254 caracteres.")
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "Ingresa un formato de correo electrónico válido."),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres.")
    .max(128, "La contraseña no puede exceder 128 caracteres."),
  nombres: z
    .string()
    .trim()
    .min(1, "El nombre es requerido.")
    .max(100, "El nombre no puede exceder 100 caracteres."),
  apellidos: z
    .string()
    .trim()
    .min(1, "Los apellidos son requeridos.")
    .max(100, "Los apellidos no pueden exceder 100 caracteres."),
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Ingresa un número telefónico válido (entre 7 y 15 dígitos).")
    .optional()
    .or(z.literal("")),
  rol: z.enum(["CLIENTE", "TRABAJADOR"], {
    message: "Selecciona un rol inicial válido (CLIENTE o TRABAJADOR).",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
