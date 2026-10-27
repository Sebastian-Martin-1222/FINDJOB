"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";
import { programarCitaSchema } from "@/schemas/marketplace.schema";

export default function ProgramarCitaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [solicitud, setSolicitud] = useState<SolicitudItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [notas, setNotas] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const data = await marketplaceService.getSolicitudById(id);
        setSolicitud(data);
        if (data.fecha_preferida) {
          setFechaInicio(`${data.fecha_preferida}T09:00`);
          setFechaFin(`${data.fecha_preferida}T11:00`);
        }
      } catch {
        setError("No se pudo cargar la solicitud de referencia.");
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
    setFormErrors({});

    const validation = programarCitaSchema.safeParse({
      fecha_hora_inicio: fechaInicio,
      fecha_hora_fin: fechaFin,
      notas: notas || undefined,
    });

    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        errMap[field] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    try {
      setSubmitting(true);
      // Evidencia 38 de 82: POST /solicitudes/{solicitud_id}/cita
      const resCita = await marketplaceService.programarCita(id, validation.data);
      router.push(`/citas/${resCita.id}`);
    } catch {
      alert("Error al programar la cita. Verifique las fechas seleccionadas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/solicitudes/${id}`}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al detalle de la solicitud</span>
        </Link>

        {/* 1. LOADING STATE */}
        {loading && <CardSkeleton />}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="my-8">
            <ErrorAlert title="Error de solicitud" message={error} />
          </div>
        )}

        {/* 3. SUCCESS / FORM STATE */}
        {!loading && !error && solicitud && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#E2E8F0] pb-4 mb-6">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                <span>Citas & Ejecución</span>
                <span>•</span>
                <span>Evidencia 38 de 82</span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                Programar Cita de Servicio
              </h1>
              <p className="text-xs text-[#434655] mt-1">
                Servicio: <strong>{solicitud.servicio_titulo}</strong> • Modalidad:{" "}
                <strong>{solicitud.modalidad === "PRESENCIAL" ? "Presencial" : "Remota"}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Fecha y Hora de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                  {formErrors.fecha_hora_inicio && (
                    <p className="text-xs text-[#BA1A1A] mt-1">{formErrors.fecha_hora_inicio}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Fecha y Hora Estimada de Fin *
                  </label>
                  <input
                    type="datetime-local"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    className="w-full h-11 px-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                  {formErrors.fecha_hora_fin && (
                    <p className="text-xs text-[#BA1A1A] mt-1">{formErrors.fecha_hora_fin}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Notas de Coordinación / Instrucciones de Acceso:
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. Llevar herramientas de diagnóstico, timbre número 502, código de portería..."
                  className="w-full h-24 p-3 text-xs rounded-lg border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
                {formErrors.notas && (
                  <p className="text-xs text-[#BA1A1A] mt-1">{formErrors.notas}</p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-[#EAEDFF] text-[#1D4ED8] flex items-start space-x-3 text-xs">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Protocolo de Cita Segura FindJob</p>
                  <p className="mt-0.5 text-[#434655]">
                    Al programar la cita, el sistema generará automáticamente un código PIN de seguridad de 4 dígitos para que el cliente lo valide al momento de iniciar la labor en sitio.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/solicitudes/${id}`)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Programando..." : "Confirmar y Generar Cita"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
