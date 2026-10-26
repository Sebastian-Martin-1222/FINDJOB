"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/Button";

export default function RenovarSesionPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const attemptRenew = async () => {
    setStatus("loading");
    setErrorMsg("");
    try {
      await authService.refreshToken();
      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch {
      setStatus("error");
      setErrorMsg("Tu sesión ha caducado o no es válida. Por favor, ingresa tus credenciales nuevamente.");
    }
  };

  useEffect(() => {
    attemptRenew();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8FF] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F2F3FF] text-[#1D4ED8]">
              <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#1D4ED8] border-t-transparent" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Estamos reanudando tu sesión</h2>
            <p className="text-sm text-[#434655]">
              Validando credenciales seguras con el servidor de FindJob Colombia...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#D1FAE5] text-[#059669]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-[#00714E]">Sesión reanudada con éxito</h2>
            <p className="text-sm text-[#434655]">Redirigiendo a tu espacio de trabajo...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFDAD6] text-[#BA1A1A]">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Sesión no disponible</h2>
            <p className="text-sm text-[#434655]">{errorMsg}</p>
            <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                size="md"
                onClick={attemptRenew}
              >
                Reintentar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push("/login")}
              >
                Iniciar sesión
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
