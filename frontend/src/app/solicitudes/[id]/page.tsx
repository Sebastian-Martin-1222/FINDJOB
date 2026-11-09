"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities } from "@/lib/access-control";

export default function DetalleSolicitudPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [solicitud, setSolicitud] = useState<SolicitudItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [responding, setResponding] = useState<"aceptar" | "rechazar" | null>(null);
  const [respondError, setRespondError] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const currentUser = authStorage.getUser();
  const access = getAccessCapabilities(currentUser);

  const fetchSolicitud = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchSolicitud();
    }
  }, [id, fetchSolicitud]);

  const handleConfirmarCancelacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCanceling(true);
      setCancelError(null);
      // Evidencia 34 de 82: PATCH /solicitudes/{solicitud_id}/cancelar (sin body)
      await marketplaceService.cancelarSolicitud(id);
      setSolicitud((prev) => (prev ? { ...prev, estado: "CANCELADA", estado_codigo: "CANCELADA" } : null));
      setCancelModalOpen(false);
    } catch {
      setCancelError("Error al cancelar la solicitud. Intente nuevamente.");
    } finally {
      setCanceling(false);
    }
  };

  const handleResponder = async (aceptar: boolean) => {
    try {
      setResponding(aceptar ? "aceptar" : "rechazar");
      setRespondError(null);
      // PATCH /solicitudes/{solicitud_id}/aceptar | /rechazar (solo el trabajador dueño del servicio)
      if (aceptar) {
        await marketplaceService.aceptarSolicitud(id);
      } else {
        await marketplaceService.rechazarSolicitud(id);
      }
      setRejectModalOpen(false);
      await fetchSolicitud();
    } catch (err) {
      setRespondError(
        err instanceof Error && err.message
          ? err.message
          : "No fue posible responder la solicitud. Intente nuevamente."
      );
    } finally {
      setResponding(null);
    }
  };

  const solicitudId = solicitud ? (solicitud.solicitud_servicio_id ?? solicitud.id) : null;
  const estadoCodigo = solicitud ? (solicitud.estado_codigo || solicitud.estado || "") : "";
  // Quien ve la solicitud es el cliente si es quien la creó; de lo contrario, es el trabajador que la recibió.
  const isCliente = Boolean(solicitud && currentUser && solicitud.cliente_usuario_id === currentUser.usuario_id);
  const isTrabajador = Boolean(solicitud && currentUser && !isCliente && access.canProvideServices);
  const backHref = isTrabajador ? "/trabajador/solicitudes" : "/solicitudes";
  const backLabel = isTrabajador ? "Volver a solicitudes recibidas" : "Volver a mis solicitudes";

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar forceProviderContext={isTrabajador} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={backHref}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{backLabel}</span>
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
            description="La solicitud solicitada no existe o no tiene permisos para visualizarla."
            actionLabel="Ver solicitudes"
            onAction={() => router.push(backHref)}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && solicitud && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-bold text-[#0F172A]">
                      Solicitud #{solicitudId}
                    </h1>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                        estadoCodigo === "ACEPTADA"
                          ? "bg-[#D1FAE5] text-[#00714E]"
                          : estadoCodigo === "PENDIENTE"
                          ? "bg-[#FEF3C7] text-[#92400E]"
                          : "bg-[#FFE4E6] text-[#9F1239]"
                      }`}
                    >
                      {estadoCodigo}
                    </span>
                  </div>
                  <p className="text-xs text-[#434655] mt-1">
                    Publicada:{" "}
                    {new Date(solicitud.creada_en || solicitud.fecha_creacion || Date.now()).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-[#434655]">Modalidad</p>
                  <p className="text-sm font-bold text-[#1D4ED8]">
                    {solicitud.modalidad_nombre || solicitud.modalidad_codigo || "Modalidad no disponible"}
                  </p>
                </div>
              </div>

              {/* Contenido de Requerimiento */}
              <div className="py-6 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#434655] mb-1">
                    Servicio Solicitado
                  </h3>
                  <p className="text-base font-semibold text-[#0F172A]">
                    {solicitud.servicio_titulo || "Servicio profesional FindJob"}
                  </p>
                </div>

                {isTrabajador && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#434655] mb-1">
                      Solicitante
                    </h3>
                    <p className="text-base font-semibold text-[#0F172A]">
                      {solicitud.cliente_nombre || `Cliente #${solicitud.cliente_usuario_id}`}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#434655] mb-1">
                    Descripción del Requerimiento
                  </h3>
                  <div className="bg-[#FAF8FF] p-4 rounded-lg border border-[#E2E8F0] text-sm text-[#0F172A] whitespace-pre-wrap">
                    {solicitud.descripcion_necesidad || solicitud.descripcion}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start space-x-3 text-xs text-[#434655]">
                    <Calendar className="h-4 w-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">Fecha Propuesta:</span>
                      <span>
                        {new Date(solicitud.fecha_propuesta || solicitud.fecha_preferida || Date.now()).toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 text-xs text-[#434655]">
                    <MapPin className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#0F172A] block">Ubicación / Modalidad:</span>
                      <span>
                        {solicitud.modalidad_codigo === "REMOTO" || solicitud.modalidad_codigo === "REMOTA"
                          ? `Remoto (${solicitud.plataforma_remota || "Plataforma por acordar"})`
                          : solicitud.direccion_texto || "Dirección no disponible"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              {respondError && !rejectModalOpen && (
                <div className="pt-4">
                  <ErrorAlert title="No se pudo responder" message={respondError} />
                </div>
              )}
              <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {estadoCodigo === "ACEPTADA" && (
                    <Link
                      href="/conversaciones"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-[#1D4ED8] text-xs font-bold text-white hover:bg-[#1E40AF]"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Ir al Chat</span>
                    </Link>
                  )}
                  {estadoCodigo === "ACEPTADA" && !solicitud.cita_id && (
                    <Link
                      href={`/solicitudes/${solicitudId}/programar-cita`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg border border-[#1D4ED8] text-xs font-bold text-[#1D4ED8] hover:bg-[#F2F3FF]"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Programar Cita</span>
                    </Link>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {isTrabajador && estadoCodigo === "PENDIENTE" && (
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setRespondError(null);
                          setRejectModalOpen(true);
                        }}
                        disabled={responding !== null}
                        className="flex items-center space-x-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Rechazar</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleResponder(true)}
                        disabled={responding !== null}
                        className="flex items-center space-x-1"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{responding === "aceptar" ? "Aceptando..." : "Aceptar solicitud"}</span>
                      </Button>
                    </>
                  )}

                  {isCliente && estadoCodigo === "PENDIENTE" && (
                    <Button
                      variant="danger"
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
                      <span>Ir a la Cita</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal de Rechazo (trabajador) */}
            {rejectModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 max-w-md w-full shadow-xl">
                  <div className="flex items-center space-x-2 text-[#BA1A1A] mb-3">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-bold">¿Rechazar esta solicitud?</h3>
                  </div>
                  <p className="text-xs text-[#434655] mb-4">
                    El cliente verá que no puedes atender este servicio y la solicitud pasará a estado RECHAZADA.
                  </p>

                  {respondError && (
                    <div className="mb-4">
                      <ErrorAlert title="Error" message={respondError} />
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRejectModalOpen(false)}
                      disabled={responding !== null}
                    >
                      Volver
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => handleResponder(false)}
                      disabled={responding !== null}
                    >
                      {responding === "rechazar" ? "Rechazando..." : "Confirmar rechazo"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Cancelación (Evidencia 34) */}
            {cancelModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 max-w-md w-full shadow-xl">
                  <div className="flex items-center space-x-2 text-[#BA1A1A] mb-3">
                    <AlertTriangle className="h-6 w-6" />
                    <h3 className="text-lg font-bold">¿Cancelar esta solicitud?</h3>
                  </div>
                  <p className="text-xs text-[#434655] mb-4">
                    Esta acción notificará que ya no requieres el servicio y actualizará el estado a CANCELADA en el sistema.
                  </p>

                  {cancelError && (
                    <div className="mb-4">
                      <ErrorAlert title="Error" message={cancelError} />
                    </div>
                  )}

                  <form onSubmit={handleConfirmarCancelacion} className="space-y-4">
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
                        variant="danger"
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
