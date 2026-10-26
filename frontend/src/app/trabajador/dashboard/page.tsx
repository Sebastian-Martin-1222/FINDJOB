"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wrench,
  Star,
  CheckCircle2,
  XCircle,
  Plus,
  Layers,
  MapPin,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api-client";
import { authStorage } from "@/lib/auth-storage";

interface SolicitudRecibida {
  solicitud_id: number;
  servicio_titulo: string;
  cliente_nombre: string;
  modalidad: string;
  fecha_propuesta: string;
  valor_acordado?: number | null;
  fecha_solicitud: string;
  estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA" | "CANCELADA";
}

export default function WorkerDashboardPage() {
  const user = authStorage.getUser();
  const [solicitudes, setSolicitudes] = useState<SolicitudRecibida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(true);

  const fetchWorkerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint real: GET /solicitudes/recibidas (Evidencia 35 de 82)
      const data = await apiClient.get<SolicitudRecibida[]>("/solicitudes/recibidas");
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch {
      setError("No fue posible cargar las solicitudes recibidas. Verifica tu conexión a internet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  const handleAceptar = async (solicitudId: number) => {
    try {
      // Endpoint real: PATCH /solicitudes/{solicitud_id}/aceptar (Evidencia 36 de 82)
      await apiClient.patch(`/solicitudes/${solicitudId}/aceptar`);
      setSolicitudes((prev) =>
        prev.map((s) => (s.solicitud_id === solicitudId ? { ...s, estado: "ACEPTADA" } : s))
      );
    } catch {
      alert("No se pudo aceptar la solicitud. Intenta de nuevo.");
    }
  };

  const handleRechazar = async (solicitudId: number) => {
    try {
      // Endpoint real: PATCH /solicitudes/{solicitud_id}/rechazar (Evidencia 37 de 82)
      await apiClient.patch(`/solicitudes/${solicitudId}/rechazar`);
      setSolicitudes((prev) =>
        prev.map((s) => (s.solicitud_id === solicitudId ? { ...s, estado: "RECHAZADA" } : s))
      );
    } catch {
      alert("No se pudo rechazar la solicitud. Intenta de nuevo.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <PrivateNavbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header del Trabajador con Estado de Disponibilidad */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1D4ED8] text-white font-extrabold text-xl shadow-sm">
              {user?.nombres ? user.nombres[0] : "P"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-[#0F172A]">
                  {user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : "Panel Profesional"}
                </h1>
                <span className="inline-flex items-center rounded-full bg-[#D1FAE5] px-2 py-0.5 text-xs font-bold text-[#00714E]">
                  ✓ Verificado
                </span>
              </div>
              <p className="text-xs text-[#434655] mt-0.5">
                Prestador de Servicios Calificados en Colombia
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`inline-flex items-center space-x-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                isAvailable
                  ? "border-[#059669] bg-[#D1FAE5]/50 text-[#00714E]"
                  : "border-slate-300 bg-slate-100 text-slate-600"
              }`}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isAvailable ? "bg-[#059669] animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>{isAvailable ? "Disponible para servicios" : "En pausa temporal"}</span>
            </button>

            <Link
              href="/servicios/nuevo"
              className="inline-flex items-center rounded-lg bg-[#1D4ED8] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1E40AF]"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Publicar servicio
            </Link>
          </div>
        </div>

        {/* KPIs del Trabajador */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold text-[#434655]">Solicitudes Recibidas</span>
            <p className="mt-2 text-2xl font-extrabold text-[#0F172A]">
              {isLoading ? "..." : solicitudes.filter((s) => s.estado === "PENDIENTE").length}
            </p>
            <span className="text-[11px] text-[#D97706] font-medium">Pendientes por responder</span>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold text-[#434655]">Citas Aceptadas</span>
            <p className="mt-2 text-2xl font-extrabold text-[#059669]">
              {isLoading ? "..." : solicitudes.filter((s) => s.estado === "ACEPTADA").length}
            </p>
            <span className="text-[11px] text-[#059669] font-medium">Listas para ejecución</span>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold text-[#434655]">Reputación Profesional</span>
            <div className="mt-2 flex items-center space-x-1">
              <Star className="h-5 w-5 fill-[#D97706] text-[#D97706]" />
              <span className="text-2xl font-extrabold text-[#0F172A]">4.9</span>
              <span className="text-xs text-[#434655]">/ 5.0</span>
            </div>
            <span className="text-[11px] text-[#434655]">100% de cumplimiento</span>
          </div>

          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <span className="text-xs font-semibold text-[#434655]">Seguridad en Cita</span>
            <p className="mt-2 text-xl font-bold text-[#00714E]">PIN 4 Dígitos</p>
            <span className="text-[11px] text-[#434655]">Protección domiciliaria activa</span>
          </div>
        </div>

        {/* Sección: Solicitudes Recibidas (Ref. TRAB_SOL_Recibidas) */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A]">Solicitudes de clientes recibidas</h2>
            <span className="text-xs text-[#434655]">
              {solicitudes.length} solicitudes registradas
            </span>
          </div>

          <div className="mt-4">
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}

            {error && !isLoading && (
              <ErrorAlert
                title="Error al cargar solicitudes"
                message={error}
                onRetry={fetchWorkerData}
              />
            )}

            {!isLoading && !error && solicitudes.length === 0 && (
              <EmptyState
                title="Aún no tienes solicitudes recibidas"
                description="Cuando los clientes encuentren tus servicios y soliciten una cita técnica, aparecerán aquí para tu confirmación."
                actionLabel="Optimizar mis habilidades y coberturas"
                onAction={() => window.location.assign("/trabajador/habilidades")}
              />
            )}

            {!isLoading && !error && solicitudes.length > 0 && (
              <div className="space-y-3">
                {solicitudes.map((sol) => (
                  <div
                    key={sol.solicitud_id}
                    className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:shadow transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-[#0F172A]">
                            {sol.servicio_titulo}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              sol.estado === "PENDIENTE"
                                ? "bg-[#FEF3C7] text-[#8D4B00]"
                                : sol.estado === "ACEPTADA"
                                ? "bg-[#D1FAE5] text-[#00714E]"
                                : "bg-[#FFDAD6] text-[#93000A]"
                            }`}
                          >
                            {sol.estado}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#434655]">
                          Cliente: <span className="font-semibold">{sol.cliente_nombre}</span> • Modalidad:{" "}
                          <span className="font-semibold">{sol.modalidad}</span> • Fecha propuesta:{" "}
                          <span className="font-semibold">{sol.fecha_propuesta}</span>
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        {sol.valor_acordado && (
                          <span className="font-mono text-sm font-extrabold text-[#059669]">
                            $ {sol.valor_acordado.toLocaleString("es-CO")} COP
                          </span>
                        )}

                        {sol.estado === "PENDIENTE" && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAceptar(sol.solicitud_id)}
                              className="inline-flex items-center rounded-lg bg-[#059669] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#047857]"
                            >
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Aceptar
                            </button>
                            <button
                              onClick={() => handleRechazar(sol.solicitud_id)}
                              className="inline-flex items-center rounded-lg border border-[#BA1A1A] bg-white px-3 py-1.5 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFDAD6]/30"
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Rechazar
                            </button>
                          </div>
                        )}

                        <Link
                          href={`/solicitudes/${sol.solicitud_id}`}
                          className="rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-slate-50"
                        >
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Acciones Rápidas del Trabajador */}
        <section className="mt-10">
          <h2 className="text-lg font-bold text-[#0F172A]">Gestión de Perfil Profesional</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/trabajador/servicios"
              className="flex items-center space-x-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DBEAFE] text-[#1D4ED8]">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-[#0F172A]">Mis Servicios</span>
                <span className="text-xs text-[#434655]">Publicar y modificar tarifas</span>
              </div>
            </Link>

            <Link
              href="/trabajador/habilidades"
              className="flex items-center space-x-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#D97706]">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-[#0F172A]">Habilidades Técnicas</span>
                <span className="text-xs text-[#434655]">Vincular competencias validadas</span>
              </div>
            </Link>

            <Link
              href="/trabajador/coberturas"
              className="flex items-center space-x-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm hover:border-[#1D4ED8] hover:bg-[#F2F3FF] transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D1FAE5] text-[#059669]">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-[#0F172A]">Ciudades de Cobertura</span>
                <span className="text-xs text-[#434655]">Bogotá, Medellín, Cali, etc.</span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
