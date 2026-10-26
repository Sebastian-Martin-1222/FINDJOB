"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Play,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  ArrowLeft,
  X,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  marketplaceService,
  CitaDetalle,
  ChequeoSeguridadItem,
} from "@/services/marketplace.service";
import { confirmarPinSchema, alertaSeguridadSchema } from "@/schemas/marketplace.schema";

export default function CitaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [chequeos, setChequeos] = useState<ChequeoSeguridadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PIN Verification State
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [verifyingPin, setVerifyingPin] = useState(false);

  // Security Alert Modal State
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [tipoAlerta, setTipoAlerta] = useState<"SOS_EMERGENCIA" | "UBICACION_INSEGURA" | "CONDUCTA_INAPROPIADA" | "OTRO">("SOS_EMERGENCIA");
  const [alertaDesc, setAlertaDesc] = useState("");
  const [alertaSubmitting, setAlertaSubmitting] = useState(false);
  const [alertaSent, setAlertaSent] = useState(false);

  // Status Action Submitting
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [citaData, chequeosData] = await Promise.all([
        marketplaceService.getCitaById(id),
        marketplaceService.getChequeosSeguridad(id),
      ]);
      setCita(citaData);
      setChequeos(chequeosData);
    } catch {
      setError("No se pudo cargar la información de la cita.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const validation = confirmarPinSchema.safeParse({ codigo_pin: pinInput });
    if (!validation.success) {
      setPinError(validation.error.issues[0]?.message || "PIN inválido");
      return;
    }

    try {
      setVerifyingPin(true);
      await marketplaceService.confirmarCitaPin(id, pinInput);
      setCita((prev) => (prev ? { ...prev, pin_confirmado: true, estado: "CONFIRMADA" } : null));
    } catch {
      setPinError("El código PIN ingresado es incorrecto.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const handleIniciarTrabajo = async () => {
    try {
      setActionLoading(true);
      await marketplaceService.iniciarCita(id);
      setCita((prev) => (prev ? { ...prev, estado: "EN_PROCESO" } : null));
    } catch {
      alert("Error al iniciar el servicio.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizarTrabajo = async () => {
    try {
      setActionLoading(true);
      await marketplaceService.finalizarCita(id);
      setCita((prev) => (prev ? { ...prev, estado: "FINALIZADA" } : null));
    } catch {
      alert("Error al finalizar el servicio.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnviarAlerta = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = alertaSeguridadSchema.safeParse({
      tipo_alerta: tipoAlerta,
      descripcion: alertaDesc,
    });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setAlertaSubmitting(true);
      await marketplaceService.crearAlertaSeguridad(id, validation.data);
      setAlertaSent(true);
      setTimeout(() => {
        setAlertModalOpen(false);
        setAlertaSent(false);
      }, 2500);
    } catch {
      alert("Error al registrar alerta.");
    } finally {
      setAlertaSubmitting(false);
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/solicitudes"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a mis solicitudes</span>
        </Link>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div>
              <CardSkeleton />
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert title="Error al cargar cita" message={error} onRetry={fetchData} />
          </div>
        )}

        {/* 3. SUCCESS STATE */}
        {!loading && !error && cita && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna Izquierda: Información de Cita y Protocolo */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tarjeta de Encabezado */}
              <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#434655]">
                      CITA-#{cita.id}
                    </span>
                    <h1 className="text-2xl font-extrabold text-[#0F172A] mt-1">
                      {cita.servicio_titulo}
                    </h1>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      cita.estado === "FINALIZADA"
                        ? "bg-[#D1FAE5] text-[#00714E]"
                        : cita.estado === "EN_PROCESO"
                        ? "bg-[#DBEAFE] text-[#0039B5]"
                        : cita.estado === "CONFIRMADA"
                        ? "bg-[#E0F2FE] text-[#0369A1]"
                        : "bg-[#FEF3C7] text-[#92400E]"
                    }`}
                  >
                    {cita.estado}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#434655] mb-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Profesional
                    </p>
                    <p className="font-bold text-[#0F172A] text-base">{cita.trabajador_nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Cliente
                    </p>
                    <p className="font-bold text-[#0F172A] text-base">{cita.cliente_nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Fecha y Hora
                    </p>
                    <p className="font-bold text-[#0F172A] flex items-center mt-0.5">
                      <Calendar className="h-4 w-4 mr-1 text-[#1D4ED8]" />
                      {new Date(cita.fecha_inicio).toLocaleString("es-CO")}
                    </p>
                  </div>
                  {cita.direccion_texto && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                        Ubicación Presencial
                      </p>
                      <p className="font-bold text-[#0F172A] flex items-center mt-0.5">
                        <MapPin className="h-4 w-4 mr-1 text-[#059669]" />
                        {cita.direccion_texto}
                      </p>
                    </div>
                  )}
                </div>

                {cita.notas && (
                  <div className="p-4 rounded-lg bg-[#FAF8FF] border border-[#CBD5E1] text-xs text-[#434655]">
                    <span className="font-bold text-[#0F172A]">Notas preparatorias:</span> {cita.notas}
                  </div>
                )}
              </div>

              {/* Protocolo de Seguridad Presencial (PIN de 4 Dígitos) */}
              {cita.modalidad === "PRESENCIAL" && (
                <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-[#0F172A]">
                        Protocolo de Seguridad Presencial FindJob
                      </h2>
                      <p className="text-xs text-[#434655]">
                        Verificación obligatoria de llegada mediante PIN de 4 dígitos.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8FF] border border-[#CBD5E1] mb-6">
                    {cita.pin_confirmado ? (
                      <div className="flex items-center space-x-2 text-[#059669] font-bold text-sm">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>¡Código PIN verificado exitosamente! El servicio presencial está validado.</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cita.pin_seguridad && (
                          <div className="text-center p-4 rounded-lg bg-[#DBEAFE] border border-[#93C5FD]">
                            <p className="text-xs font-bold uppercase text-[#0039B5]">
                              Código PIN de Seguridad (Proporciónalo al profesional al llegar):
                            </p>
                            <div className="text-3xl font-extrabold tracking-widest text-[#1D4ED8] font-mono mt-1">
                              {cita.pin_seguridad}
                            </div>
                          </div>
                        )}

                        <form onSubmit={handleVerifyPin} className="max-w-sm mx-auto space-y-3">
                          <Input
                            label="Ingresar PIN de 4 dígitos para confirmar *"
                            placeholder="Ej: 8492"
                            maxLength={4}
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            error={pinError || undefined}
                            className="text-center font-mono text-xl tracking-widest"
                          />
                          <Button
                            type="submit"
                            disabled={verifyingPin}
                            className="w-full flex items-center justify-center space-x-2"
                          >
                            <KeyRound className="h-4 w-4" />
                            <span>{verifyingPin ? "Verificando..." : "Confirmar Llegada (PIN)"}</span>
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Chequeos de Seguridad */}
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] mb-3">
                      Chequeos de Verificación de Entorno
                    </h3>
                    <div className="space-y-2">
                      {chequeos.map((ch) => (
                        <div
                          key={ch.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#E2E8F0] text-xs"
                        >
                          <span className="text-[#0F172A] font-medium">{ch.pregunta}</span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              ch.respondida
                                ? "bg-[#D1FAE5] text-[#00714E]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                            }`}
                          >
                            {ch.respondida ? "Verificado" : "Pendiente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Control de Ejecución, Pago y Alertas */}
            <div className="space-y-6">
              {/* Tarjeta de Control de Servicio */}
              <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-[#0F172A]">
                  Control de Ejecución
                </h3>

                <div className="border-b border-[#E2E8F0] pb-3 text-xs text-[#434655]">
                  <p className="font-semibold text-[#0F172A]">Valor Convenido:</p>
                  <p className="text-2xl font-extrabold text-[#1D4ED8] font-mono mt-0.5">
                    {formatCOP(cita.monto_acordado)} COP
                  </p>
                </div>

                {/* Acciones de Flujo de Trabajo */}
                {cita.estado === "CONFIRMADA" && (
                  <Button
                    onClick={handleIniciarTrabajo}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-[#059669] hover:bg-[#047857]"
                  >
                    <Play className="h-4 w-4" />
                    <span>Iniciar Servicio</span>
                  </Button>
                )}

                {cita.estado === "EN_PROCESO" && (
                  <Button
                    onClick={handleFinalizarTrabajo}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-[#1D4ED8] hover:bg-[#1E40AF]"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Finalizar Trabajo</span>
                  </Button>
                )}

                {cita.estado === "FINALIZADA" && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push(`/citas/${cita.id}/pago`)}
                      className="w-full flex items-center justify-center space-x-2 bg-[#1D4ED8]"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>{cita.pago_realizado ? "Ver Recibo de Pago" : "Registrar Pago"}</span>
                    </Button>
                  </div>
                )}

                <Link
                  href={`/conversaciones?solicitud=${cita.solicitud_id}`}
                  className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#1D4ED8] bg-[#F2F3FF] hover:bg-[#EAEDFF]"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Abrir Chat de Coordinación</span>
                </Link>
              </div>

              {/* Botón de Alerta de Seguridad (SOS) */}
              <div className="bg-[#FFF8F7] rounded-xl border border-[#FFDAD6] p-6 shadow-sm">
                <div className="flex items-center space-x-3 text-[#BA1A1A] mb-2">
                  <ShieldAlert className="h-6 w-6" />
                  <h3 className="font-extrabold text-sm">¿Situación Insegura?</h3>
                </div>
                <p className="text-xs text-[#434655] mb-4">
                  Si durante el servicio presencial detectas irregularidades o peligro, emite una alerta inmediata para intervención de soporte.
                </p>
                <button
                  type="button"
                  onClick={() => setAlertModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#BA1A1A] text-white text-xs font-bold hover:bg-[#93000A] transition-colors flex items-center justify-center space-x-2 shadow-sm"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Reportar Alerta de Seguridad</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL REPORTAR ALERTA DE SEGURIDAD */}
        {alertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#FFDAD6] animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4 mb-4">
                <div className="flex items-center space-x-2 text-[#BA1A1A]">
                  <ShieldAlert className="h-6 w-6" />
                  <h3 className="text-lg font-extrabold">Reportar Alerta de Seguridad</h3>
                </div>
                <button
                  onClick={() => setAlertModalOpen(false)}
                  className="p-1 rounded-lg text-[#434655] hover:bg-[#F2F3FF]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {alertaSent ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-12 w-12 text-[#059669] mx-auto mb-2" />
                  <p className="font-bold text-base text-[#0F172A]">Alerta Notificada con Éxito</p>
                  <p className="text-xs text-[#434655] mt-1">El equipo de auditoría y soporte ha registrado el incidente.</p>
                </div>
              ) : (
                <form onSubmit={handleEnviarAlerta} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-1.5">
                      Tipo de Incidencia *
                    </label>
                    <select
                      value={tipoAlerta}
                      onChange={(e) =>
                        setTipoAlerta(
                          e.target.value as "SOS_EMERGENCIA" | "UBICACION_INSEGURA" | "CONDUCTA_INAPROPIADA" | "OTRO"
                        )
                      }
                      className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-sm font-medium focus:border-[#BA1A1A] focus:outline-none"
                    >
                      <option value="SOS_EMERGENCIA">SOS / Emergencia en Sitio</option>
                      <option value="UBICACION_INSEGURA">Ubicación Insegura o No Coincidente</option>
                      <option value="CONDUCTA_INAPROPIADA">Conducta Inapropiada / Agresión</option>
                      <option value="OTRO">Otro Riesgo de Seguridad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0F172A] mb-1.5">
                      Describe la situación *
                    </label>
                    <textarea
                      rows={4}
                      value={alertaDesc}
                      onChange={(e) => setAlertaDesc(e.target.value)}
                      placeholder="Explica qué está sucediendo para actuar de inmediato..."
                      className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#BA1A1A] focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAlertModalOpen(false)}
                      disabled={alertaSubmitting}
                    >
                      Cancelar
                    </Button>
                    <button
                      type="submit"
                      disabled={alertaSubmitting}
                      className="px-4 py-2 rounded-lg bg-[#BA1A1A] text-white text-xs font-bold hover:bg-[#93000A]"
                    >
                      {alertaSubmitting ? "Emitiendo..." : "Emitir Alerta Urgente"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
