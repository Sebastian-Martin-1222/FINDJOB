"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle2, UserCheck, Wrench } from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { authService } from "@/services/auth.service";
import { registerSchema } from "@/schemas/auth.schema";
import { focusFirstInvalidField, getZodErrors, getZodFieldError } from "@/lib/zod-form";
import { getDefaultPrivateRoute } from "@/lib/access-control";

export default function RegisterPage() {
  const router = useRouter();

  // Estados del formulario y UI (4 estados obligatorios)
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState<"CLIENTE" | "TRABAJADOR">("CLIENTE");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const values = () => ({ nombres, apellidos, email, telefono: telefono.trim() ? telefono.trim() : undefined, password, confirmPassword, rol });
  const validateField = (field: string, nextValues = values()) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const message = getZodFieldError(registerSchema, nextValues, field);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (message) next[field] = message; else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const values = { nombres, apellidos, email, telefono: telefono.trim() ? telefono.trim() : undefined, password, confirmPassword, rol };
    const errors = getZodErrors(registerSchema, values);
    if (Object.keys(errors).length > 0) {
      setTouched({ nombres: true, apellidos: true, email: true, telefono: true, password: true, confirmPassword: true, rol: true });
      setFieldErrors(errors);
      requestAnimationFrame(() => focusFirstInvalidField(errors));
      return;
    }
    const validation = registerSchema.safeParse(values);
    if (!validation.success) return;

    // 2. Transmisión a endpoint real: POST /auth/register
    setIsLoading(true);
    try {
      const payload = {
        nombres: validation.data.nombres,
        apellidos: validation.data.apellidos,
        email: validation.data.email,
        telefono: validation.data.telefono,
        password: validation.data.password,
        rol: validation.data.rol,
      };
      const res = await authService.register(payload);

      setIsSuccess(true);
      setTimeout(() => {
        router.push(getDefaultPrivateRoute(res.usuario));
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No fue posible crear la cuenta. Verifica que el correo no esté ya registrado e intenta nuevamente.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      {/* Navegación Pública Marketplace (Patrón 1) */}
      <PublicNavbar />

      {/* Contenedor Central */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-xl">
          {/* Card Principal de Registro (Ref. AUTH_Registro) */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            {/* Header del Card */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8] text-white shadow-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
                Crea tu cuenta gratis
              </h1>
              <p className="mt-1.5 text-sm text-[#434655]">
                Únete a FindJob y conecta con servicios y oportunidades en Colombia.
              </p>
            </div>

            {/* Estado Success */}
            {isSuccess && (
              <div
                role="status"
                className="mt-6 flex items-center space-x-3 rounded-lg border border-[#D1FAE5] bg-[#D1FAE5]/40 p-4 text-[#00714E]"
              >
                <CheckCircle2 className="h-5 w-5 text-[#059669] flex-shrink-0" />
                <p className="text-sm font-semibold">
                  ¡Cuenta creada exitosamente! Redirigiendo a tu panel...
                </p>
              </div>
            )}

            {/* Estado Error */}
            {errorMessage && !isSuccess && (
              <div className="mt-6">
                <ErrorAlert
                  title="Error al registrar la cuenta"
                  message={errorMessage}
                  onRetry={() => setErrorMessage(null)}
                />
              </div>
            )}

            {/* Formulario (Estado Reposo / Loading) */}
            {!isSuccess && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
                {/* Selector de Rol Inicial (Cards mutuamente excluyentes) */}
                <div>
                  <label className="block text-sm font-bold text-[#0F172A]">
                    ¿Cómo quieres empezar en FindJob?
                  </label>
                  <p className="text-xs text-[#434655] mt-0.5">
                    Selecciona una opción para tu cuenta:
                  </p>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Opción 1: CLIENTE */}
                    <button
                      type="button"
                      onClick={() => setRol("CLIENTE")}
                      disabled={isLoading}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                        rol === "CLIENTE"
                          ? "border-[#1D4ED8] bg-[#F2F3FF] ring-2 ring-[#1D4ED8]"
                          : "border-[#CBD5E1] bg-white hover:border-slate-400"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <UserCheck
                          className={`h-5 w-5 ${
                            rol === "CLIENTE" ? "text-[#1D4ED8]" : "text-[#434655]"
                          }`}
                        />
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            rol === "CLIENTE"
                              ? "border-[#1D4ED8] bg-[#1D4ED8]"
                              : "border-slate-300"
                          }`}
                        >
                          {rol === "CLIENTE" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <span className="mt-2 block text-sm font-bold text-[#0F172A]">
                        Quiero contratar servicios
                      </span>
                      <span className="mt-1 block text-xs text-[#434655]">
                        Encuentra profesionales y solicita servicios.
                      </span>
                    </button>

                    {/* Opción 2: TRABAJADOR */}
                    <button
                      type="button"
                      onClick={() => setRol("TRABAJADOR")}
                      disabled={isLoading}
                      className={`relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${
                        rol === "TRABAJADOR"
                          ? "border-[#1D4ED8] bg-[#F2F3FF] ring-2 ring-[#1D4ED8]"
                          : "border-[#CBD5E1] bg-white hover:border-slate-400"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <Wrench
                          className={`h-5 w-5 ${
                            rol === "TRABAJADOR" ? "text-[#1D4ED8]" : "text-[#434655]"
                          }`}
                        />
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            rol === "TRABAJADOR"
                              ? "border-[#1D4ED8] bg-[#1D4ED8]"
                              : "border-slate-300"
                          }`}
                        >
                          {rol === "TRABAJADOR" && (
                            <div className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <span className="mt-2 block text-sm font-bold text-[#0F172A]">
                        Quiero ofrecer mis servicios
                      </span>
                      <span className="mt-1 block text-xs text-[#434655]">
                        Publica servicios y recibe nuevas solicitudes.
                      </span>
                    </button>
                  </div>
                  {fieldErrors.rol && (
                    <p className="mt-1 text-xs font-semibold text-[#BA1A1A]">
                      {fieldErrors.rol}
                    </p>
                  )}
                </div>

                {/* Nombres y Apellidos */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    id="nombres"
                    name="nombres"
                    label="Nombres"
                    placeholder="ej. Carolina"
                    value={nombres}
                    onChange={(e) => { const value=e.target.value; setNombres(value); if(touched.nombres) validateField("nombres", { ...values(), nombres:value }); }}
                    onBlur={() => validateField("nombres")}
                    error={fieldErrors.nombres}
                    disabled={isLoading}
                    required
                  />

                  <Input
                    id="apellidos"
                    name="apellidos"
                    label="Apellidos"
                    placeholder="ej. Gómez Salazar"
                    value={apellidos}
                    onChange={(e) => { const value=e.target.value; setApellidos(value); if(touched.apellidos) validateField("apellidos", { ...values(), apellidos:value }); }}
                    onBlur={() => validateField("apellidos")}
                    error={fieldErrors.apellidos}
                    disabled={isLoading}
                    required
                  />
                </div>

                {/* Correo Electrónico */}
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="ej. carolina.gomez@correo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { const value=e.target.value; setEmail(value); if(touched.email) validateField("email", { ...values(), email:value }); }}
                  onBlur={() => validateField("email")}
                  error={fieldErrors.email}
                  disabled={isLoading}
                  required
                />

                {/* Teléfono (Opcional) */}
                <Input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  label="Teléfono (Opcional)"
                  placeholder="ej. +57 310 123 4567"
                  helperText="Opcional. Celular colombiano o internacional estándar."
                  value={telefono}
                  onChange={(e) => { const value=e.target.value; setTelefono(value); if(touched.telefono) validateField("telefono", { ...values(), telefono:value.trim()?value.trim():undefined }); }}
                  onBlur={() => validateField("telefono")}
                  error={fieldErrors.telefono}
                  disabled={isLoading}
                />

                {/* Contraseña */}
                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  helperText="Mínimo 8 caracteres."
                  value={password}
                  onChange={(e) => { const value=e.target.value; setPassword(value); const next={ ...values(), password:value }; if(touched.password) validateField("password", next); if(touched.confirmPassword) validateField("confirmPassword", next); }}
                  onBlur={() => validateField("password")}
                  error={fieldErrors.password}
                  disabled={isLoading}
                  required
                />

                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  label="Repite la contraseña"
                  placeholder="••••••••"
                  helperText="Escríbela nuevamente para confirmar que la recuerdas correctamente."
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    if (touched.confirmPassword) validateField("confirmPassword", { ...values(), confirmPassword: value });
                  }}
                  onBlur={() => validateField("confirmPassword")}
                  error={fieldErrors.confirmPassword}
                  disabled={isLoading}
                  required
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    disabled={isLoading}
                    className="w-full text-base font-semibold"
                  >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta gratis"}
                  </Button>
                </div>
              </form>
            )}

            {/* Footer / Enlace a Login */}
            <div className="mt-6 border-t border-[#E2E8F0] pt-6 text-center text-sm text-[#434655]">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline"
              >
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
