"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MessageSquare,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";

export default function MisSolicitudesPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceService.getMisSolicitudes();
      setSolicitudes(data);
    } catch {
      setError("No fue posible cargar tus solicitudes de servicio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleCancelar = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta solicitud?")) return;
    try {
      setCancelingId(id);
      await marketplaceService.cancelarSolicitud(id, "Cancelada por el cliente");
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: "CANCELADA" } : s))
      );
    } catch {
      alert("No se pudo cancelar la solicitud en este momento.");
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "ACEPTADA":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#00714E]">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Aceptada</span>
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">
            <Clock className="h-3.5 w-3.5" />
            <span>Pendiente de respuesta</span>
          </span>
        );
      case "RECHAZADA":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B]">
            <XCircle className="h-3.5 w-3.5" />
            <span>Rechazada</span>
          </span>
        );
      case "CANCELADA":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F1F5F9] text-[#475569]">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Cancelada</span>
          </span>
        );
      default:
        return <span>{estado}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
              Panel de Contratación
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
              Mis Solicitudes de Servicio
            </h1>
            <p className="text-sm text-[#434655] mt-1">
              Supervisa el estado de tus requerimientos y coordina con los profesionales contratados.
            </p>
          </div>
          <Button onClick={() => router.push("/servicios")}>
            Explorar más servicios
          </Button>
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert
              title="Error al cargar solicitudes"
              message={error}
              onRetry={fetchSolicitudes}
            />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && solicitudes.length === 0 && (
          <EmptyState
            title="Aún no has solicitado servicios"
            description="Explora las categorías disponibles, encuentra a los mejores profesionales en tu ciudad y envía tu primera solicitud."
            actionLabel="Buscar Servicios"
            onAction={() => router.push("/servicios")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && solicitudes.length > 0 && (
          <div className="space-y-4">
            {solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm transition-all hover:border-[#1D4ED8]/60"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-xs font-mono font-bold text-[#434655]">
                        SOL-#{sol.id}
                      </span>
                      {getStatusBadge(sol.estado)}
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          sol.modalidad === "PRESENCIAL"
                            ? "bg-[#D1FAE5] text-[#00714E]"
                            : "bg-[#DBEAFE] text-[#0039B5]"
                        }`}
                      >
                        {sol.modalidad === "PRESENCIAL" ? "Presencial" : "Remoto"}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      {sol.servicio_titulo}
                    </h2>
                    <p className="text-xs text-[#434655]">
                      Profesional asignado:{" "}
                      <strong className="text-[#0F172A]">{sol.trabajador_nombre}</strong>
                    </p>
                  </div>

                  <div className="text-left md:text-right text-xs text-[#434655]">
                    <div className="flex items-center md:justify-end space-x-1 font-semibold text-[#0F172A]">
                      <Calendar className="h-3.5 w-3.5 text-[#1D4ED8]" />
                      <span>Fecha tentativa: {sol.fecha_preferida || "Por acordar"}</span>
                    </div>
                    <p className="mt-1">
                      Enviada el: {sol.fecha_creacion ? new Date(sol.fecha_creacion).toLocaleDateString("es-CO") : "Reciente"}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-[#434655] mb-4">
                  <p className="font-semibold text-xs text-[#0F172A] mb-1">
                    Descripción del requerimiento:
                  </p>
                  <p className="line-clamp-2">{sol.descripcion || "Sin descripción adicional."}</p>
                  {sol.direccion_texto && (
                    <p className="flex items-center text-xs text-[#434655] mt-2">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-[#1D4ED8]" />
                      {sol.direccion_texto} {sol.ciudad_nombre ? `(${sol.ciudad_nombre})` : ""}
                    </p>
                  )}
                </div>

                {/* Acciones por Estado */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    {sol.estado === "ACEPTADA" && (
                      <Link
                        href={`/conversaciones?solicitud=${sol.id}`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#1D4ED8] bg-[#F2F3FF] hover:bg-[#EAEDFF]"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Abrir Chat con Profesional</span>
                      </Link>
                    )}
                    <Link
                      href={`/solicitudes/${sol.id}`}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#0F172A] bg-white hover:bg-slate-50"
                    >
                      <span>Ver Detalle</span>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-3">
                    {sol.estado === "PENDIENTE" && (
                      <button
                        onClick={() => handleCancelar(sol.id)}
                        disabled={cancelingId === sol.id}
                        className="text-xs font-bold text-[#BA1A1A] hover:underline"
                      >
                        {cancelingId === sol.id ? "Cancelando..." : "Cancelar Solicitud"}
                      </button>
                    )}

                    {sol.cita_id && (
                      <Button
                        size="sm"
                        onClick={() => router.push(`/citas/${sol.cita_id}`)}
                        className="flex items-center space-x-1"
                      >
                        <span>Ver Cita & PIN</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
