"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Clock,
  RotateCcw,
  MapPin,
  Star,
  CheckCircle,
  ArrowLeft,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";
import { authStorage } from "@/lib/auth-storage";

export default function ServicioDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authStorage.isAuthenticated();

  const loadServicio = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketplaceService.getServicioById(id);
      setServicio(data);
    } catch {
      setError("No fue posible cargar el detalle del servicio solicitado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadServicio();
    }
  }, [id]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-sm text-[#434655]">
          <Link href="/servicios" className="hover:text-[#1D4ED8] flex items-center space-x-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Explorar Servicios</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#0F172A] truncate">
            {servicio?.titulo || "Detalle"}
          </span>
        </div>

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
          <div className="max-w-2xl mx-auto my-12">
            <ErrorAlert
              title="Error al cargar servicio"
              message={error}
              onRetry={loadServicio}
            />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && !servicio && (
          <EmptyState
            title="Servicio no encontrado"
            description="El servicio seleccionado no está disponible o ha sido dado de baja por el profesional."
            actionLabel="Ver catálogo disponible"
            onAction={() => router.push("/servicios")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && servicio && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Columna Principal: Información Detallada */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-[#DBEAFE] text-[#0039B5] text-xs font-bold uppercase tracking-wider">
                    {servicio.subcategoria_nombre}
                  </span>
                  <span className="text-xs text-[#434655]">
                    {servicio.categoria_nombre}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] leading-tight mb-4">
                  {servicio.titulo}
                </h1>

                {/* Perfil del Profesional Vinculado */}
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-[#F2F3FF] border border-[#CBD5E1]/50 mb-6">
                  <div className="h-12 w-12 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-lg">
                    {servicio.trabajador_nombre[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/trabajadores/${servicio.trabajador_id}`}
                      className="font-bold text-[#0F172A] hover:text-[#1D4ED8] truncate block"
                    >
                      {servicio.trabajador_nombre}
                    </Link>
                    <div className="flex items-center space-x-3 text-xs text-[#434655] mt-0.5">
                      <span className="flex items-center text-[#D97706] font-semibold">
                        <Star className="h-3.5 w-3.5 fill-current mr-1" />
                        {servicio.trabajador_rating.toFixed(1)} ({servicio.trabajador_total_calificaciones} calificaciones)
                      </span>
                      {servicio.trabajador_ciudad && (
                        <span className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-0.5" />
                          {servicio.trabajador_ciudad}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/trabajadores/${servicio.trabajador_id}`}
                    className="text-xs font-semibold text-[#1D4ED8] hover:underline whitespace-nowrap"
                  >
                    Ver Perfil
                  </Link>
                </div>

                {/* Descripción Completa */}
                <div className="prose max-w-none text-[#434655] text-sm sm:text-base leading-relaxed mb-6">
                  <h3 className="text-base font-bold text-[#0F172A] mb-2">
                    Descripción del Servicio
                  </h3>
                  <p className="whitespace-pre-line">{servicio.descripcion}</p>
                </div>

                {/* Beneficios & Garantía de Seguridad */}
                <div className="border-t border-[#E2E8F0] pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-[#434655]">
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="h-5 w-5 text-[#059669] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#0F172A]">Protocolo de Seguridad PIN</p>
                      <p>Para servicios presenciales, verificación obligatoria con PIN de 4 dígitos antes de iniciar.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-[#1D4ED8] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[#0F172A]">Comunicación Directa</p>
                      <p>Chat privado habilitado para coordinar requerimientos una vez aceptada la solicitud.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Lateral: Tarjeta de Contratación & Precio */}
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm">
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#434655] uppercase tracking-wide">
                    Precio Inicial Convenido
                  </span>
                  <div className="text-3xl font-extrabold text-[#1D4ED8] mt-1 font-mono">
                    {formatCOP(servicio.precio_base)}
                  </div>
                  <span className="text-xs text-[#434655]">Moneda legal: Pesos Colombianos (COP)</span>
                </div>

                {/* Especificaciones */}
                <div className="space-y-3 py-4 border-y border-[#E2E8F0] text-sm text-[#0F172A] mb-6">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-[#434655]">
                      <Clock className="h-4 w-4 mr-2 text-[#1D4ED8]" />
                      Tiempo Estimado:
                    </span>
                    <span className="font-bold">{servicio.tiempo_estimado_horas} horas</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-[#434655]">
                      <RotateCcw className="h-4 w-4 mr-2 text-[#059669]" />
                      Revisiones Incluidas:
                    </span>
                    <span className="font-bold">{servicio.revisiones_incluidas} ajustes</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="flex items-center text-[#434655]">
                      <Briefcase className="h-4 w-4 mr-2 text-[#D97706]" />
                      Modalidades:
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      {servicio.modalidades.map((m) => (
                        <span
                          key={m}
                          className={`text-xs px-2 py-0.5 rounded font-bold ${
                            m === "PRESENCIAL"
                              ? "bg-[#D1FAE5] text-[#00714E]"
                              : "bg-[#DBEAFE] text-[#0039B5]"
                          }`}
                        >
                          {m === "PRESENCIAL" ? "Presencial (En Sitio)" : "Remoto (Virtual)"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Solicitar Servicio */}
                <Button
                  onClick={() => router.push(`/servicios/${servicio.id}/solicitar`)}
                  className="w-full h-12 text-base font-bold shadow-md"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Solicitar este servicio
                </Button>

                <p className="text-center text-xs text-[#434655] mt-3">
                  No se cobrará ningún monto hasta que el servicio sea ejecutado y finalizado satisfactoriamente.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
