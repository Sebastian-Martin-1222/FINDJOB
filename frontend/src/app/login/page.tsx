"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { authService } from "@/services/auth.service";
import { loginSchema } from "@/schemas/auth.schema";

export default function LoginPage() {
  const router = useRouter();

  // Estados del formulario y UI (4 estados obligatorios)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // 1. Validación de esquema en cliente con Zod (OWASP)
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === "email") errors.email = err.message;
        if (err.path[0] === "password") errors.password = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Transmisión a endpoint real: POST /auth/login
    setIsLoading(true);
    try {
      await authService.login({
        email: validation.data.email,
        password: validation.data.password,
      });

      // Estado Success
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Correo electrónico o contraseña incorrectos. Verifica tus datos e intenta nuevamente.";
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
        <div className="w-full max-w-md">
          {/* Card Principal de Autenticación (Ref. AUTH_Login) */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
            {/* Header del Card */}
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1D4ED8] text-white shadow-sm">
                <Briefcase className="h-6 w-6" />
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0F172A]">
                Inicia sesión en FindJob
              </h1>
              <p className="mt-1.5 text-sm text-[#434655]">
                Ingresa tus credenciales para acceder a tu cuenta.
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
                  ¡Sesión iniciada con éxito! Redirigiendo...
                </p>
              </div>
            )}

            {/* Estado Error (Alert con opción de reintento) */}
            {errorMessage && !isSuccess && (
              <div className="mt-6">
                <ErrorAlert
                  title="Fallo de autenticación"
                  message={errorMessage}
                  onRetry={() => {
                    setErrorMessage(null);
                  }}
                />
              </div>
            )}

            {/* Formulario (Estado Reposo / Loading) */}
            {!isSuccess && (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  label="Correo electrónico"
                  placeholder="ej. carlos.restrepo@correo.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={fieldErrors.email}
                  disabled={isLoading}
                  required
                />

                <Input
                  id="password"
                  name="password"
                  type="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={fieldErrors.password}
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
                    {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                  </Button>
                </div>
              </form>
            )}

            {/* Footer / Enlace a Registro */}
            <div className="mt-6 border-t border-[#E2E8F0] pt-6 text-center text-sm text-[#434655]">
              ¿Aún no tienes una cuenta?{" "}
              <Link
                href="/registro"
                className="font-semibold text-[#1D4ED8] hover:text-[#1E40AF] hover:underline"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
