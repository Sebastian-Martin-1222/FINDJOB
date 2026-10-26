"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  CheckCircle2,
  Star,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import {
  marketplaceService,
  CitaDetalle,
  PagoDetalle,
} from "@/services/marketplace.service";
import {
  registroPagoSchema,
  calificacionSchema,
} from "@/schemas/marketplace.schema";

export default function PagoYCalificacionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [pago, setPago] = useState<PagoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Pago State
  const [metodoPago, setMetodoPago] = useState<
    "TRANSFERENCIA_SIMULADA" | "TARJETA_SIMULADA" | "NEQUI_SIMULADO" | "DAVIPLATA_SIMULADO"
  >("NEQUI_SIMULADO");
  const [paying, setPaying] = useState(false);

  // Form Calificación State
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const [calificando, setCalificando] = useState(false);
  const [calificacionExitosa, setCalificacionExitosa] = useState(false);
  const [califError, setCalifError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const citaData = await marketplaceService.getCitaById(id);
      setCita(citaData);
      const pagoData = await marketplaceService.getPagoCita(id);
      setPago(pagoData);
    } catch {
      setError("No se pudo cargar la información financiera de la cita.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleProcesarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cita) return;

    const validation = registroPagoSchema.safeParse({
      monto: cita.monto_acordado,
      metodo_pago: metodoPago,
    });

    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setPaying(true);
      const resPago = await marketplaceService.registrarPago(id, validation.data);
      setPago(resPago);
      setCita((prev) => (prev ? { ...prev, pago_realizado: true } : null));
    } catch {
      alert("Error al procesar el pago.");
    } finally {
      setPaying(false);
    }
  };

  const handleEnviarCalificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalifError(null);

    const validation = calificacionSchema.safeParse({
      puntuacion,
      comentario,
    });

    if (!validation.success) {
      setCalifError(validation.error.issues[0]?.message || "Datos de calificación inválidos");
      return;
    }

    try {
      setCalificando(true);
      await marketplaceService.calificarCita(id, validation.data);
      setCalificacionExitosa(true);
      setCita((prev) => (prev ? { ...prev, calificacion_realizada: true } : null));
    } catch {
      setCalifError("Error al registrar la calificación. Por favor intenta de nuevo.");
    } finally {
      setCalificando(false);
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
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
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert title="Error de pago" message={error} onRetry={fetchData} />
          </div>
        )}

        {/* 3. SUCCESS / ACTIVE FLOW */}
        {!loading && !error && cita && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Columna Izquierda: Pasarela de Pago & Liquidación */}
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#E2E8F0] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Liquidación de Servicio
                </span>
                <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                  {pago ? "Comprobante de Pago" : "Realizar Pago"}
                </h1>
                <p className="text-xs text-[#434655] mt-1">
                  Cita #{cita.id} — {cita.servicio_titulo}
                </p>
              </div>

              {/* Desglose de Tarifas en COP */}
              <div className="space-y-3 py-2 text-sm">
                <div className="flex justify-between text-[#434655]">
                  <span>Monto acordado del servicio:</span>
                  <span className="font-bold text-[#0F172A] font-mono">
                    {formatCOP(cita.monto_acordado)}
                  </span>
                </div>
                <div className="flex justify-between text-[#434655]">
                  <span>Comisión operativa de plataforma (12%):</span>
                  <span className="font-mono text-[#059669]">
                    {formatCOP(Math.round(cita.monto_acordado * 0.12))}
                  </span>
                </div>
                <div className="flex justify-between text-[#434655]">
                  <span>Neto transferido al profesional:</span>
                  <span className="font-mono text-[#434655]">
                    {formatCOP(Math.round(cita.monto_acordado * 0.88))}
                  </span>
                </div>
                <div className="border-t border-[#E2E8F0] pt-3 flex justify-between text-base font-extrabold text-[#1D4ED8]">
                  <span>Total a Pagar (COP):</span>
                  <span className="font-mono">{formatCOP(cita.monto_acordado)}</span>
                </div>
              </div>

              {/* Si ya está pagado: Mostrar recibo */}
              {pago ? (
                <div className="rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] p-5 text-sm space-y-3">
                  <div className="flex items-center space-x-2 text-[#059669] font-bold">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Pago Exitoso Registrado</span>
                  </div>
                  <div className="text-xs text-[#434655] space-y-1">
                    <p>
                      <strong>Referencia:</strong> {pago.referencia}
                    </p>
                    <p>
                      <strong>Método:</strong> {pago.metodo_pago.replace("_", " ")}
                    </p>
                    <p>
                      <strong>Fecha de transacción:</strong>{" "}
                      {new Date(pago.fecha_creacion).toLocaleString("es-CO")}
                    </p>
                  </div>
                </div>
              ) : (
                /* Formulario de Pago */
                <form onSubmit={handleProcesarPago} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-2">
                      Selecciona Método de Pago Simulado:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "NEQUI_SIMULADO", label: "Nequi" },
                        { id: "DAVIPLATA_SIMULADO", label: "DaviPlata" },
                        { id: "TRANSFERENCIA_SIMULADA", label: "PSE / Bancolombia" },
                        { id: "TARJETA_SIMULADA", label: "Tarjeta Débito/Crédito" },
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() =>
                            setMetodoPago(
                              m.id as
                                | "TRANSFERENCIA_SIMULADA"
                                | "TARJETA_SIMULADA"
                                | "NEQUI_SIMULADO"
                                | "DAVIPLATA_SIMULADO"
                            )
                          }
                          className={`p-3 rounded-lg border text-left text-xs font-bold transition-all ${
                            metodoPago === m.id
                              ? "border-[#1D4ED8] bg-[#F2F3FF] text-[#1D4ED8]"
                              : "border-[#CBD5E1] text-[#434655] hover:bg-[#FAF8FF]"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#FAF8FF] border border-[#CBD5E1] p-3 text-xs text-[#434655] flex items-start space-x-2">
                    <ShieldCheck className="h-5 w-5 text-[#059669] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#0F172A]">Simulador Académico Seguro</p>
                      <p>El pago no requiere tarjeta real; registra la transacción en Cloud SQL.</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={paying} className="w-full h-11 text-sm font-bold">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {paying ? "Procesando Transacción..." : `Pagar ${formatCOP(cita.monto_acordado)}`}
                  </Button>
                </form>
              )}
            </div>

            {/* Columna Derecha: Calificación y Reseña Post-Servicio */}
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-[#E2E8F0] pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  Reputación y Experiencia
                </span>
                <h2 className="text-xl font-extrabold text-[#0F172A] mt-1">
                  Calificar al Profesional
                </h2>
                <p className="text-xs text-[#434655] mt-1">
                  Tu reseña construye la confianza en la comunidad de FindJob Colombia.
                </p>
              </div>

              {calificacionExitosa || cita.calificacion_realizada ? (
                <div className="text-center py-8">
                  <div className="h-14 w-14 bg-[#FEF3C7] text-[#D97706] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="h-7 w-7 fill-current" />
                  </div>
                  <h3 className="font-extrabold text-lg text-[#0F172A]">¡Calificación Guardada!</h3>
                  <p className="text-xs text-[#434655] mt-1">
                    Gracias por contribuir a la transparencia del marketplace.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 text-xs"
                    onClick={() => router.push("/solicitudes")}
                  >
                    Volver al Panel
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleEnviarCalificacion} className="space-y-4">
                  {califError && <p className="text-xs text-[#BA1A1A]">{califError}</p>}

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-2">
                      Puntuación (1 a 5 estrellas) *
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setPuntuacion(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= puntuacion
                                ? "text-[#D97706] fill-[#D97706]"
                                : "text-[#CBD5E1]"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-sm font-bold text-[#0F172A] ml-2">
                        {puntuacion} de 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0F172A] uppercase mb-1.5">
                      Comentario sobre el trabajo realizado *
                    </label>
                    <textarea
                      rows={4}
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Describe la puntualidad, calidad técnica, cumplimiento del protocolo..."
                      className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1D4ED8] focus:outline-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={calificando}
                    className="w-full bg-[#D97706] hover:bg-[#B45309] text-white"
                  >
                    {calificando ? "Registrando Reseña..." : "Enviar Calificación"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
