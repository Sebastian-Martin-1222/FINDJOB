"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Video,
  Link2,
  CheckCircle2,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { marketplaceService, CitaDetalle } from "@/services/marketplace.service";

export default function EditarCitaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [plataformaRemota, setPlataformaRemota] = useState("Google Meet");
  const [enlaceReunion, setEnlaceReunion] = useState("https://meet.google.com/abc-defg-hij");
  const [notas, setNotas] = useState("");
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await marketplaceService.getCitaById(id);
        setCita(data);
        if (data.fecha_inicio) {
          setFechaInicio(data.fecha_inicio.slice(0, 16));
        }
        if (data.fecha_fin) {
          setFechaFin(data.fecha_fin.slice(0, 16));
        }
        if (data.notas) {
          setNotas(data.notas);
        }
      } catch {
        setError("No se pudo cargar la cita para editar.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Evidencia 41 de 82: PATCH /citas/{cita_id}
      await marketplaceService.actualizarCita(id, {
        fecha_hora_inicio: fechaInicio,
        fecha_hora_fin: fechaFin,
        notas,
      });
      setGuardadoExitoso(true);
      setTimeout(() => {
        router.push(`/citas/${id}`);
      }, 1500);
    } catch {
      alert("Error al actualizar los datos de la cita.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/citas/${id}`}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al detalle de la cita</span>
        </Link>

        {/* 1. LOADING STATE */}
        {loading && <CardSkeleton />}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="my-8">
            <ErrorAlert title="Error de cita" message={error} />
          </div>
        )}

        {/* 3. SUCCESS / EDIT STATE */}
        {!loading && !error && cita && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#E2E8F0] pb-4 mb-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                <span>Citas & Ejecución</span>
                <span>•</span>
                <span>Evidencia 41 de 82</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">Editar Cita</h1>
              <p className="text-xs text-[#434655] mt-1">
                Modifica los datos de fecha, hora y conexión acordados para la prestación del servicio.
              </p>
              <div className="mt-3 inline-block px-3 py-1 rounded bg-[#F2F3FF] text-xs font-semibold text-[#1D4ED8]">
                Servicio: {cita.servicio_titulo} ({cita.modalidad})
              </div>
            </div>

            {guardadoExitoso && (
              <div className="mb-6 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#059669] flex items-center space-x-2 text-xs font-bold">
                <CheckCircle2 className="h-5 w-5" />
                <span>Cita actualizada. Los cambios fueron guardados correctamente.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Fecha y Hora de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                    className="w-full h-11 px-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Fecha y Hora de Finalización
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    required
                    className="w-full h-11 px-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              {cita.modalidad === "REMOTA" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Plataforma Remota
                    </label>
                    <input
                      type="text"
                      value={plataformaRemota}
                      onChange={(e) => setPlataformaRemota(e.target.value)}
                      placeholder="Google Meet, Zoom, Teams..."
                      className="w-full h-11 px-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] mb-1">
                      Enlace de Reunión
                    </label>
                    <input
                      type="url"
                      value={enlaceReunion}
                      onChange={(e) => setEnlaceReunion(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full h-11 px-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Notas de Coordinación / Alcance:
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full h-24 p-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/citas/${id}`)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
