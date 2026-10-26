"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Clock,
  Calendar,
  PlusCircle,
  Wrench,
  Zap,
  Droplets,
  Key,
  ShieldCheck,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api-client";
import { authStorage } from "@/lib/auth-storage";

interface SolicitudItem {
  solicitud_id: number;
  servicio_titulo: string;
  trabajador_nombre: string;
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA";
  fecha_solicitud: string;
  precio_acordado?: number | null;
}

export default function ClientDashboardPage() {
  const user = authStorage.getUser();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint real: GET /solicitudes/mis-solicitudes
      const data = await apiClient.get<SolicitudItem[]>("/solicitudes/mis-solicitudes");
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch {
      // Manejo seguro de error sin exponer stack traces
      setError("No se pudieron cargar tus solicitudes. Por favor verifica tu conexión.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "ACEPTADA":
        return (
          <span className="inline-flex items-center rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-bold text-[#00714E]">
            Aceptada
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold text-[#8D4B00]">
            Pendiente
          </span>
        );
      case "RECHAZADA":
      case "CANCELADA":
        return (
          <span className="inline-flex items-center rounded-full bg-[#FFDAD6] px-2.5 py-0.5 text-xs font-bold text-[#93000A]">
            {estado === "CANCELADA" ? "Cancelada" : "Rechazada"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <PrivateNavbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header de Bienvenida */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Bienvenido{user?.nombres ? `, ${user.nombres}` : ""} 👋
            </h1>
            <p className="mt-1 text-sm text-[#434655]">
              Gestiona tus solicitudes de servicio y conecta con profesionales certificados.
            </p>
          </div>
          <Link
            href="/servicios"
            className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E40AF]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Solicitar nuevo servicio
          </Link>
        </div>

        {/* Tarjetas de Resumen KPI */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#434655]">Solicitudes Activas</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#1D4ED8]">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#0F172A]">
              {isLoading ? "..." : solicitudes.filter((s) => s.estado === "PENDIENTE").length}
            </p>
            <span className="text-xs text-[#059669] font-medium">En espera de respuesta</span>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#434655]">Citas Programadas</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D1FAE5] text-[#059669]">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-[#0F172A]">
              {isLoading ? "..." : solicitudes.filter((s) => s.estado === "ACEPTADA").length}
            </p>
            <span className="text-xs text-[#059669] font-medium">Protocolo PIN habilitado</span>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#434655]">Seguridad de Cuenta</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAEDFF] text-[#1D4ED8]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xl font-bold text-[#00714E]">100% Protegido</p>
            <span className="text-xs text-[#434655]">Cifrado y verificación PIN</span>
          </div>
        </div>

        {/* Sección de Solicitudes Recientes (4 Estados UI) */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A]">Tus solicitudes de servicio</h2>
            <Link
              href="/servicios"
              className="text-xs font-semibold text-[#1D4ED8] hover:underline"
            >
              Explorar catálogo completo →
            </Link>
          </div>

          <div className="mt-4">
            {/* Estado 1: Loading (Skeletons) */}
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            )}

            {/* Estado 2: Error (Alerta con reintento) */}
            {error && !isLoading && (
              <ErrorAlert
                title="Error al consultar solicitudes"
                message={error}
                onRetry={fetchDashboardData}
              />
            )}

            {/* Estado 3: Empty State */}
            {!isLoading && !error && solicitudes.length === 0 && (
              <EmptyState
                title="Aún no tienes solicitudes de servicio"
                description="Encuentra profesionales calificados en plomería, electricidad, cerrajería o redes para tu hogar o negocio."
                actionLabel="Explorar servicios disponibles"
                onAction={() => window.location.assign("/servicios")}
              />
            )}

            {/* Estado 4: Success (Datos reales) */}
            {!isLoading && !error && solicitudes.length > 0 && (
              <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
                <ul className="divide-y divide-[#E2E8F0]">
                  {solicitudes.map((sol) => (
                    <li
                      key={sol.solicitud_id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-[#F2F3FF] transition-colors gap-3"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#0F172A]">
                            {sol.servicio_titulo}
                          </span>
                          {getStatusBadge(sol.estado)}
                        </div>
                        <p className="mt-1 text-xs text-[#434655]">
                          Profesional asignado:{" "}
                          <span className="font-semibold text-[#0F172A]">
                            {sol.trabajador_nombre}
                          </span>{" "}
                          • Solicitado el {sol.fecha_solicitud}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {sol.precio_acordado && (
                          <span className="font-mono text-sm font-bold text-[#059669]">
                            $ {sol.precio_acordado.toLocaleString("es-CO")} COP
                          </span>
                        )}
                        <Link
                          href={`/solicitudes/${sol.solicitud_id}`}
                          className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Sección de Categorías Rápidas */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-[#0F172A]">Categorías populares en Colombia</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Link
              href="/servicios?categoria=plomeria"
              className="flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#1D4ED8]">
                <Droplets className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm font-bold text-[#0F172A]">Plomería & Gas</span>
              <span className="text-xs text-[#434655]">Fugas e instalaciones</span>
            </Link>

            <Link
              href="/servicios?categoria=electricidad"
              className="flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
                <Zap className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm font-bold text-[#0F172A]">Electricidad</span>
              <span className="text-xs text-[#434655]">Redes y cuadros</span>
            </Link>

            <Link
              href="/servicios?categoria=cerrajeria"
              className="flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1FAE5] text-[#059669]">
                <Key className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm font-bold text-[#0F172A]">Cerrajería</span>
              <span className="text-xs text-[#434655]">Aperturas y cambio de clave</span>
            </Link>

            <Link
              href="/servicios?categoria=tecnologia"
              className="flex flex-col items-center rounded-xl border border-[#E2E8F0] bg-white p-4 text-center shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAEDFF] text-[#1D4ED8]">
                <Wrench className="h-5 w-5" />
              </div>
              <span className="mt-2 text-sm font-bold text-[#0F172A]">Redes y Soporte</span>
              <span className="text-xs text-[#434655]">Cableado y servidores</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
