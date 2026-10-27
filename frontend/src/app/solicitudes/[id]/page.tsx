"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";

export default function DetalleSolicitudPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [solicitud, setSolicitud] = useState<SolicitudItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [canceling, setCanceling] = useState(false);

  const fetchSolicitud = async () => {
    try {
      setLoading(true);
      setError(null);
      // Evidencia 33 de 82: GET /solicitudes/{solicitud_id}
      const data = await marketplaceService.getSolicitudById(id);
      setSolicitud(data);
    } catch {
      setError("No fue posible cargar el detalle de la solicitud de servicio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSolicitud();
    }
  }, [id]);

  const handleConfirmarCancelacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCanceling(true);
      // Evidencia 34 de 82: PATCH /solicitudes/{solicitud_id}/cancelar
      await marketplaceService.cancelarSolicitud(id, motivoCancelacion);
      setSolicitud((prev) => (prev ? { ...prev, estado: "CANCELADA" } : null));
      setCancelModalOpen(false);
    } catch {
      alert("Error al cancelar la solicitud. Intente nuevamente.");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/solicitudes"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a mis solicitudes</span>
        </Link>

        {/* 1. LOADING STATE */}
        {loading && <CardSkeleton />}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert
              title="Error al cargar solicitud"
              message={error}
              onRetry={fetchSolicitud}
            />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && !solicitud && (
          <EmptyState
            title="Solicitud no encontrada"
            description="La solicitud consultada no existe o no se tienen permisos para acceder a ella."
            actionLabel="Ver mis solicitudes"
            onAction={() => router.push("/solicitudes")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && solicitud && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#434655]">
                    <span>SOL-#{solicitud.id}</span>
                    <span>•</span>
                    <span className="text-[#1D4ED8]">Evidencia 33 de 82</span>
                  </div>
                  <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                    {solicitud.servicio_titulo}
                  </h1>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    solicitud.estado === "ACEPTADA"
                      ? "bg-[#D1FAE5] text-[#00714E]"
                      : solicitud.estado === "PENDIENTE"
                      ? "bg-[#FEF3C7] text-[#92400E]"
                      : solicitud.estado === "CANCELADA"
                      ? "bg-[#F1F5F9] text-[#475569]"
                      : "bg-[#FEE2E2] text-[#991B1B]"
                  }`}
                >
                  {solicitud.estado}
                </span>
              </div>

              {/* Datos de los Participantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#434655] mb-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                    Profesional Asignado
                  </span>
                  <strong className="text-base text-[#0F172A]">
                    {solicitud.trabajador_nombre || "Profesional Certificado"}
                  </strong>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                    Cliente Contratante
                  </span>
                  <strong className="text-base text-[#0F172A]">
                    {solicitud.cliente_nombre || "Usuario FindJob"}
                  </strong>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                    Modalidad Acordada
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {solicitud.modalidad === "PRESENCIAL" ? "Presencial (Domicilio)" : "Remota"}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] block">
                    Fecha Tentativa
                  </span>
                  <span className="font-bold text-[#0F172A] flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-[#1D4ED8]" />
                    {solicitud.fecha_preferida || "Por convenir"}
                  </span>
                </div>
              </div>

              {/* Ubicación si es Presencial */}
              {solicitud.direccion_texto && (
                <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] mb-6 text-xs text-[#434655]">
                  <span className="font-bold text-[#0F172A] block mb-1">
                    Dirección Presencial Registrada:
                  </span>
                  <p className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-[#1D4ED8]" />
                    {solicitud.direccion_texto} {solicitud.ciudad_nombre ? `(${solicitud.ciudad_nombre})` : ""}
                  </p>
                </div>
              )}

              {/* Descripción */}
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Detalles del Requerimiento
                </h3>
                <p className="text-sm text-[#434655] leading-relaxed whitespace-pre-line p-4 rounded-lg bg-[#FAF8FF] border border-[#CBD5E1]/60">
                  {solicitud.descripcion || "Sin especificaciones adicionales."}
                </p>
              </div>

              {/* Acciones de Flujo */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
                <div className="flex items-center space-x-2">
                  {solicitud.estado === "ACEPTADA" && (
                    <Link
                      href={`/conversaciones?solicitud=${solicitud.id}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1D4ED8] text-xs font-bold text-white shadow-sm hover:bg-[#1E40AF]"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ir al Chat con el Profesional</span>
                    </Link>
                  )}
                  {solicitud.estado === "ACEPTADA" && (
                    <Link
                      href={`/solicitudes/${solicitud.id}/programar-cita`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[#1D4ED8] text-xs font-bold text-[#1D4ED8] hover:bg-[#F2F3FF]"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Programar Cita</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {solicitud.estado === "PENDIENTE" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCancelModalOpen(true)}
                    >
                      Cancelar Solicitud
                    </Button>
                  )}

                  {solicitud.cita_id && (
                    <Button
                      size="sm"
                      onClick={() => router.push(`/citas/${solicitud.cita_id}`)}
                      className="flex items-center space-x-1"
                    >
                      <span>Ir a la Cita & PIN</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal de Cancelación (Evidencia 34) */}
            {cancelModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 max-w-md w-full shadow-xl">
                  <div className="flex items-center space-x-2 text-[#BA1A1A] mb-3">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-bold">¿Cancelar esta solicitud?</h3>
                  </div>
                  <p className="text-xs text-[#434655] mb-4">
                    Esta acción notificará al profesional que ya no requieres el servicio y cambiará el estado a CANCELADA.
                  </p>
                  <form onSubmit={handleConfirmarCancelacion} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        Motivo de la cancelación (Opcional):
                      </label>
                      <textarea
                        value={motivoCancelacion}
                        onChange={(e) => setMotivoCancelacion(e.target.value)}
                        placeholder="Ej. Cambio de planes, requerimiento solucionado..."
                        className="w-full h-24 text-xs rounded-lg border border-[#CBD5E1] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelModalOpen(false)}
                        disabled={canceling}
                      >
                        Volver
                      </Button>
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={canceling}
                      >
                        {canceling ? "Cancelando..." : "Confirmar Cancelación"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
