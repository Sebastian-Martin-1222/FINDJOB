"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  CreditCard,
  KeyRound,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { marketplaceService, CitaDetalle } from "@/services/marketplace.service";

export default function MisCitasPage() {
  const router = useRouter();
  const [citas, setCitas] = useState<CitaDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      setError(null);
      // Evidencia 39 de 82: GET /citas/mis-citas
      const data = await marketplaceService.getMisCitas();
      setCitas(Array.isArray(data) ? data : []);
    } catch {
      setError("No fue posible cargar tus citas agendadas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "FINALIZADA":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#00714E]">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Finalizada
          </span>
        );
      case "CONFIRMADA":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DBEAFE] text-[#0039B5]">
            <ShieldCheck className="h-3.5 w-3.5 mr-1" />
            Confirmada (PIN Activo)
          </span>
        );
      case "EN_PROCESO":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E0E7FF] text-[#3730A3]">
            <Clock className="h-3.5 w-3.5 mr-1" />
            En Proceso
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FEF3C7] text-[#92400E]">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Programada
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-[#1D4ED8] uppercase tracking-wider">
              <span>Citas & Ejecución</span>
              <span>•</span>
              <span>Evidencia 39 de 82</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
              Mis Citas Técnicas
            </h1>
            <p className="text-sm text-[#434655] mt-1">
              Gestiona el cronograma de servicios presenciales y remotos acordados con profesionales.
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
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert
              title="Error al consultar citas"
              message={error}
              onRetry={fetchCitas}
            />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && citas.length === 0 && (
          <EmptyState
            title="Aún no tienes citas agendadas"
            description="Una vez aceptada tu solicitud de servicio, el profesional coordinará la fecha y hora de la cita presencial o remota."
            actionLabel="Ver mis solicitudes"
            onAction={() => router.push("/solicitudes")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && citas.length > 0 && (
          <div className="space-y-4">
            {citas.map((cita) => (
              <div
                key={cita.id}
                className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm hover:border-[#1D4ED8] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-xs font-mono font-bold text-[#434655]">
                        CITA-#{cita.id}
                      </span>
                      {getEstadoBadge(cita.estado)}
                      <span className="text-xs px-2 py-0.5 rounded font-bold bg-[#F2F3FF] text-[#1D4ED8]">
                        {cita.modalidad === "PRESENCIAL" ? "Presencial (Domicilio)" : "Remoto"}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-[#0F172A]">
                      {cita.servicio_titulo}
                    </h2>
                    <p className="text-xs text-[#434655]">
                      Profesional: <strong className="text-[#0F172A]">{cita.trabajador_nombre}</strong> • Cliente:{" "}
                      <strong className="text-[#0F172A]">{cita.cliente_nombre}</strong>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#434655] block">Monto acordado:</span>
                    <span className="text-lg font-extrabold text-[#059669] font-mono">
                      {formatCOP(cita.monto_acordado ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#434655] mb-5">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4 text-[#1D4ED8]" />
                    <span>
                      Inicio:{" "}
                      <strong>
                        {cita.fecha_inicio ? new Date(cita.fecha_inicio).toLocaleString("es-CO") : "Por confirmar"}
                      </strong>
                    </span>
                  </div>
                  {cita.direccion_texto && (
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-4 w-4 text-[#1D4ED8]" />
                      <span className="truncate">{cita.direccion_texto}</span>
                    </div>
                  )}
                  {cita.pin_seguridad && (
                    <div className="flex items-center space-x-1.5 bg-[#EAEDFF] text-[#1D4ED8] px-2.5 py-1 rounded-md font-mono font-bold text-xs">
                      <KeyRound className="h-4 w-4" />
                      <span>PIN de Seguridad: {cita.pin_seguridad}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E2E8F0]">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/citas/${cita.id}/editar`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#434655] hover:bg-slate-50"
                    >
                      <span>Editar Agenda</span>
                    </Link>
                    <Link
                      href={`/citas/${cita.id}/chequeos`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#1D4ED8] bg-[#F2F3FF] hover:bg-[#EAEDFF]"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Chequeos de Seguridad</span>
                    </Link>
                  </div>

                  <div className="flex items-center space-x-3">
                    {cita.estado === "FINALIZADA" && !cita.pago_realizado && (
                      <Link
                        href={`/citas/${cita.id}/pago`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#059669] text-xs font-bold text-white hover:bg-[#047857]"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                        <span>Pagar Servicio</span>
                      </Link>
                    )}
                    <Button
                      size="sm"
                      onClick={() => router.push(`/citas/${cita.id}`)}
                      className="flex items-center space-x-1"
                    >
                      <span>Ver Protocolo PIN</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
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
