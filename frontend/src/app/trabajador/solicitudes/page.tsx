"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  MessageSquare,
  PlusCircle,
  X,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";
import { programarCitaSchema } from "@/schemas/marketplace.schema";

export default function SolicitudesRecibidasPage() {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Programar Cita
  const [selectedSol, setSelectedSol] = useState<SolicitudItem | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [notas, setNotas] = useState("");
  const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceService.getSolicitudesRecibidas();
      setSolicitudes(data);
    } catch {
      setError("No fue posible cargar las solicitudes recibidas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const handleAceptar = async (id: number) => {
    try {
      await marketplaceService.aceptarSolicitud(id);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: "ACEPTADA" } : s))
      );
    } catch {
      alert("Error al aceptar la solicitud.");
    }
  };

  const handleRechazar = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas rechazar esta solicitud?")) return;
    try {
      await marketplaceService.rechazarSolicitud(id);
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: "RECHAZADA" } : s))
      );
    } catch {
      alert("Error al rechazar la solicitud.");
    }
  };

  const handleProgramarCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSol) return;
    setModalErrors({});

    const payload = {
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      notas: notas || undefined,
    };

    const validation = programarCitaSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() || "general";
        errMap[key] = issue.message;
      });
      setModalErrors(errMap);
      return;
    }

    try {
      setModalSubmitting(true);
      const nuevaCita = await marketplaceService.programarCita(selectedSol.id, validation.data);
      setSelectedSol(null);
      router.push(`/citas/${nuevaCita.id}`);
    } catch {
      setModalErrors({ general: "No se pudo programar la cita. Intente nuevamente." });
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
            Gestión Profesional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
            Solicitudes de Clientes Recibidas
          </h1>
          <p className="text-sm text-[#434655] mt-1">
            Revisa requerimientos de clientes, acepta nuevos proyectos y programa citas de atención.
          </p>
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="space-y-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert
              title="Error al cargar solicitudes recibidas"
              message={error}
              onRetry={fetchSolicitudes}
            />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && solicitudes.length === 0 && (
          <EmptyState
            title="No tienes solicitudes pendientes"
            description="Tus servicios publicados están activos en el catálogo. Cuando los clientes envíen solicitudes, aparecerán aquí para tu gestión."
            actionLabel="Ver mis servicios"
            onAction={() => router.push("/trabajador/servicios")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && solicitudes.length > 0 && (
          <div className="space-y-4">
            {solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm hover:border-[#059669]/60 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-mono font-bold text-[#434655]">
                        SOL-#{sol.id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                          sol.estado === "ACEPTADA"
                            ? "bg-[#D1FAE5] text-[#00714E]"
                            : sol.estado === "PENDIENTE"
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : "bg-[#FEE2E2] text-[#991B1B]"
                        }`}
                      >
                        {sol.estado}
                      </span>
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
                      Cliente solicitante: <strong className="text-[#0F172A]">{sol.cliente_nombre}</strong>
                    </p>
                  </div>

                  <div className="text-left md:text-right text-xs text-[#434655]">
                    <div className="flex items-center md:justify-end space-x-1 font-semibold text-[#0F172A]">
                      <Calendar className="h-3.5 w-3.5 text-[#059669]" />
                      <span>Fecha solicitada: {sol.fecha_preferida}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[#434655] mb-4">
                  <p className="font-semibold text-xs text-[#0F172A] mb-1">Requerimiento del cliente:</p>
                  <p>{sol.descripcion}</p>
                  {sol.direccion_texto && (
                    <p className="flex items-center text-xs text-[#434655] mt-2">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-[#059669]" />
                      Dirección de visita: {sol.direccion_texto} {sol.ciudad_nombre ? `(${sol.ciudad_nombre})` : ""}
                    </p>
                  )}
                </div>

                {/* Acciones del Profesional */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-2">
                    {sol.estado === "ACEPTADA" && (
                      <button
                        onClick={() => router.push(`/conversaciones?solicitud=${sol.id}`)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#1D4ED8] bg-[#F2F3FF] hover:bg-[#EAEDFF]"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat con Cliente</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {sol.estado === "PENDIENTE" && (
                      <>
                        <button
                          onClick={() => handleRechazar(sol.id)}
                          className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#BA1A1A] hover:bg-[#FEE2E2]/30"
                        >
                          Rechazar
                        </button>
                        <Button size="sm" onClick={() => handleAceptar(sol.id)}>
                          Aceptar Solicitud
                        </Button>
                      </>
                    )}

                    {sol.estado === "ACEPTADA" && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedSol(sol)}
                        className="flex items-center space-x-1.5 bg-[#059669] hover:bg-[#047857]"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Programar Cita</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL PROGRAMAR CITA (CITA_Programar) */}
        {selectedSol && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0F172A]">
                    Programar Cita de Trabajo
                  </h3>
                  <p className="text-xs text-[#434655]">
                    Solicitud #{selectedSol.id} — Cliente: {selectedSol.cliente_nombre}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSol(null)}
                  className="p-1 rounded-lg text-[#434655] hover:bg-[#F2F3FF]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalErrors.general && (
                <div className="mb-4">
                  <ErrorAlert title="Error" message={modalErrors.general} />
                </div>
              )}

              <form onSubmit={handleProgramarCita} className="space-y-4">
                <Input
                  label="Fecha y hora de inicio *"
                  type="datetime-local"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  error={modalErrors.fecha_hora_inicio}
                  required
                />

                <Input
                  label="Fecha y hora estimada de finalización *"
                  type="datetime-local"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  error={modalErrors.fecha_hora_fin}
                  required
                />

                <div>
                  <label className="block text-sm font-bold text-[#0F172A] mb-1.5">
                    Notas preparatorias o requerimientos
                  </label>
                  <textarea
                    rows={3}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Ej: Acceso necesario a breakers eléctricos, llaves de paso..."
                    className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1D4ED8] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                  {modalErrors.notas && (
                    <p className="text-xs text-[#BA1A1A] mt-1">{modalErrors.notas}</p>
                  )}
                </div>

                <div className="rounded-lg bg-[#FAF8FF] border border-[#CBD5E1] p-3 text-xs text-[#434655]">
                  <p className="font-bold text-[#0F172A]">Protocolo de Seguridad Presencial</p>
                  <p>
                    Al programar una cita presencial, se emitirá un código PIN de 4 dígitos que el cliente deberá confirmar antes de iniciar el trabajo.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedSol(null)}
                    disabled={modalSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={modalSubmitting}>
                    {modalSubmitting ? "Programando..." : "Confirmar Programación"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
