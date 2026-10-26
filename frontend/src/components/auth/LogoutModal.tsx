"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/auth.service";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      onClose();
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FFDAD6] text-[#BA1A1A]">
            <LogOut className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#0F172A]">¿Cerrar sesión?</h3>
            <p className="mt-1.5 text-sm text-[#434655] leading-relaxed">
              Se revocará tu sesión activa en este dispositivo. Tendrás que volver a ingresar tus credenciales para acceder a tus solicitudes y servicios.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            isLoading={isLoading}
          >
            Sí, cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
