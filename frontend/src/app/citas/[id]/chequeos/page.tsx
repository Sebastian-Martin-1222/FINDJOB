"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  marketplaceService,
  ChequeoSeguridadItem,
  CitaDetalle,
} from "@/services/marketplace.service";

export default function ChequeosSeguridadPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [chequeos, setChequeos] = useState<ChequeoSeguridadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Response State
  const [selectedChequeo, setSelectedChequeo] = useState<ChequeoSeguridadItem | null>(null);
  const [respuestaValor, setRespuestaValor] = useState<"Sí" | "No">("Sí");
  const [comentario, setComentario] = useState("");
  const [incluirUbicacion, setIncluirUbicacion] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Evidencia 46 de 82: GET /citas/{cita_id}/chequeos-seguridad
      const [citaData, chequeosData] = await Promise.all([
        marketplaceService.getCitaById(id),
        marketplaceService.getChequeosSeguridad(id),
      ]);
      setCita(citaData);
      setChequeos(Array.isArray(chequeosData) ? chequeosData : []);
    } catch {
      setError("No fue posible cargar los chequeos de seguridad de esta cita.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChequeo) return;

    try {
      setSubmitting(true);
      const textRespuesta = `${respuestaValor}${comentario ? ` - ${comentario}` : ""}${
        incluirUbicacion ? " [Ubicación adjunta]" : ""
      }`;
      // Evidencia 47 de 82: POST /chequeos-seguridad/{chequeo_id}/respuestas
      await marketplaceService.responderChequeo(selectedChequeo.id, textRespuesta);
      setSuccessBanner(true);
      setChequeos((prev) =>
        prev.map((c) =>
          c.id === selectedChequeo.id ? { ...c, respondida: true, respuesta: textRespuesta } : c
        )
      );
      setTimeout(() => {
        setSuccessBanner(false);
        setSelectedChequeo(null);
        setComentario("");
      }, 2000);
    } catch {
      alert("Error al registrar la respuesta del chequeo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <ErrorAlert title="Error de seguridad" message={error} onRetry={fetchData} />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && chequeos.length === 0 && (
          <EmptyState
            title="Sin chequeos de seguridad asignados"
            description="Esta cita no tiene protocolos o preguntas de control presencial pendientes."
            actionLabel="Volver a la cita"
            onAction={() => router.push(`/citas/${id}`)}
          />
        )}

        {/* 4. SUCCESS / CHECKLIST STATE */}
        {!loading && !error && chequeos.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
              <div className="border-b border-[#E2E8F0] pb-4 mb-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
                  <span>Confirmación & Seguridad</span>
                  <span>•</span>
                  <span>Evidencias 46 y 47 de 82</span>
                </div>
                <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                  Chequeos de Seguridad Presencial
                </h1>
                <p className="text-xs text-[#434655] mt-1">
                  Cita #{id} — {cita?.servicio_titulo}
                </p>
              </div>

              {successBanner && (
                <div className="mb-6 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#059669] flex items-center space-x-2 text-xs font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Respuesta registrada. Tu respuesta fue guardada correctamente.</span>
                </div>
              )}

              {/* Lista de Chequeos */}
              <div className="space-y-4">
                {chequeos.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-5 rounded-xl border border-[#CBD5E1] bg-[#FAF8FF] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3">
                      {ch.respondida ? (
                        <CheckCircle2 className="h-5 w-5 text-[#059669] mt-0.5 flex-shrink-0" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-[#1D4ED8] mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <span className="text-[10px] font-bold uppercase text-[#94A3B8] block">
                          Pregunta de chequeo
                        </span>
                        <p className="font-bold text-sm text-[#0F172A] mt-0.5">{ch.pregunta}</p>
                        {ch.respondida && (
                          <div className="mt-2 text-xs text-[#059669] bg-[#DCFCE7] px-2.5 py-1 rounded inline-block">
                            <strong>Respuesta enviada:</strong> {ch.respuesta}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {ch.respondida ? (
                        <span className="text-xs font-bold text-[#059669] bg-white px-3 py-1.5 rounded-lg border border-[#BBF7D0]">
                          Respondido ✓
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedChequeo(ch);
                            setRespuestaValor("Sí");
                          }}
                        >
                          Responder Chequeo
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal para Responder Chequeo (Evidencia 47) */}
            {selectedChequeo && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 max-w-lg w-full shadow-xl">
                  <div className="flex items-center space-x-2 text-[#1D4ED8] mb-3">
                    <ShieldCheck className="h-6 w-6" />
                    <h3 className="text-lg font-bold">Responder Chequeo de Seguridad</h3>
                  </div>
                  <p className="text-xs text-[#434655] mb-4">
                    Registra tu respuesta para la pregunta asignada a esta cita presencial.
                  </p>

                  <div className="p-4 rounded-lg bg-[#FAF8FF] border border-[#CBD5E1] text-xs font-bold text-[#0F172A] mb-4">
                    {selectedChequeo.pregunta}
                  </div>

                  <form onSubmit={handleResponder} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-2">
                        Respuesta *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRespuestaValor("Sí")}
                          className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 ${
                            respuestaValor === "Sí"
                              ? "border-[#1D4ED8] bg-[#EAEDFF] text-[#1D4ED8]"
                              : "border-[#CBD5E1] bg-white text-[#434655]"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Sí</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRespuestaValor("No")}
                          className={`p-3 rounded-lg border text-xs font-bold flex items-center justify-center space-x-2 ${
                            respuestaValor === "No"
                              ? "border-[#BA1A1A] bg-[#FFF5F5] text-[#BA1A1A]"
                              : "border-[#CBD5E1] bg-white text-[#434655]"
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>No</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0F172A] mb-1">
                        Comentario (Opcional):
                      </label>
                      <textarea
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Ingresa observaciones o comentarios adicionales..."
                        maxLength={500}
                        className="w-full h-20 text-xs rounded-lg border border-[#CBD5E1] p-2.5 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                      />
                      <span className="text-[10px] text-[#94A3B8]">Máximo 500 caracteres.</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="checkbox"
                        id="ubicacionCheck"
                        checked={incluirUbicacion}
                        onChange={(e) => setIncluirUbicacion(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                      />
                      <label htmlFor="ubicacionCheck" className="text-xs text-[#434655]">
                        Incluir mi ubicación actual al registrar respuesta
                      </label>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-[#E2E8F0]">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedChequeo(null)}
                        disabled={submitting}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" size="sm" disabled={submitting}>
                        {submitting ? "Guardando..." : "Guardar respuesta"}
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
