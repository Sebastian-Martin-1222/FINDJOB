"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Briefcase,
  Star,
  MapPin,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  marketplaceService,
  TrabajadorPerfilPublico,
} from "@/services/marketplace.service";
import { authStorage } from "@/lib/auth-storage";

export default function PerfilTrabajadorPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [perfil, setPerfil] = useState<TrabajadorPerfilPublico | null>(null);
  const [calificaciones, setCalificaciones] = useState<
    { id: number; puntuacion: number; comentario: string; fecha: string; cliente_nombre: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authStorage.isAuthenticated();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [perfilData, califsData] = await Promise.all([
        marketplaceService.getPerfilTrabajador(id),
        marketplaceService.getCalificacionesTrabajador(id),
      ]);
      setPerfil(perfilData);
      setCalificaciones(califsData);
    } catch {
      setError("No fue posible cargar el perfil profesional.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
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
        <Link
          href="/servicios"
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al catálogo</span>
        </Link>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="space-y-6">
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert title="Error de perfil" message={error} onRetry={fetchData} />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && !perfil && (
          <EmptyState
            title="Perfil no encontrado"
            description="El perfil profesional solicitado no existe o no tiene servicios públicos activos."
            actionLabel="Ver catálogo"
            onAction={() => router.push("/servicios")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && perfil && (
          <div className="space-y-8">
            {/* Header del Perfil */}
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-3xl font-extrabold shadow-sm">
                    {perfil.nombres?.[0] || "P"}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                        {perfil.nombres || "Profesional"} {perfil.apellidos || ""}
                      </h1>
                      <CheckCircle className="h-5 w-5 text-[#059669]" />
                    </div>
                    <p className="text-sm font-semibold text-[#1D4ED8] mt-0.5">
                      {perfil.titulo_profesional || "Especialista Certificado"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#434655] mt-2">
                      <span className="flex items-center text-[#D97706] font-bold">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        {(perfil.promedio_calificacion ?? 5.0).toFixed(1)} ({perfil.total_calificaciones ?? 0} reseñas)
                      </span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-[#434655]" />
                        {perfil.ciudad_nombre || "Colombia"}
                      </span>
                      <span className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-1 text-[#434655]" />
                        {perfil.anos_experiencia ?? 1} años de trayectoria
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[#00714E] text-xs font-bold uppercase tracking-wider">
                    Verificado FindJob
                  </span>
                </div>
              </div>

              {/* Bio / Reseña Profesional */}
              <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Acerca de mi experiencia
                </h2>
                <p className="text-sm sm:text-base text-[#434655] leading-relaxed">
                  {perfil.descripcion_perfil || "Profesional verificado en FindJob Colombia."}
                </p>
              </div>

              {/* Habilidades & Coberturas */}
              <div className="mt-6 pt-6 border-t border-[#E2E8F0] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                    Habilidades Profesionales
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(perfil.habilidades || []).map((h) => (
                      <span
                        key={h.id}
                        className="px-2.5 py-1 rounded-md bg-[#F2F3FF] border border-[#CBD5E1] text-xs font-semibold text-[#1D4ED8]"
                      >
                        {h.nombre}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                    Cobertura Geográfica Presencial
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(perfil.coberturas || []).map((c) => (
                      <span
                        key={c.ciudad_id}
                        className="px-2.5 py-1 rounded-md bg-[#D1FAE5] border border-[#A7F3D0] text-xs font-semibold text-[#00714E] flex items-center"
                      >
                        <MapPin className="h-3 w-3 mr-1" />
                        {c.ciudad_nombre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Servicios Publicados por el Profesional */}
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                Servicios Disponibles de este Profesional
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(perfil.servicios || []).map((s) => (
                  <div
                    key={s.id}
                    className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm hover:border-[#1D4ED8] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#0039B5] bg-[#DBEAFE] px-2 py-0.5 rounded">
                          {s.subcategoria_nombre}
                        </span>
                        <div className="flex items-center space-x-1">
                          {(s.modalidades || []).map((m) => (
                            <span
                              key={m}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF8FF] border border-[#CBD5E1]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-[#0F172A] mb-2">
                        {s.titulo}
                      </h3>
                      <p className="text-xs text-[#434655] line-clamp-3 mb-4">
                        {s.descripcion}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#94A3B8] uppercase block">Precio base</span>
                        <span className="text-lg font-extrabold text-[#1D4ED8] font-mono">
                          {formatCOP(s.precio_base ?? 0)}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/servicios/${s.id}`)}
                      >
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calificaciones y Reseñas de Clientes */}
            <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-extrabold text-[#0F172A] mb-4">
                Calificaciones Recientes ({(calificaciones || []).length})
              </h2>

              {(calificaciones || []).length === 0 ? (
                <p className="text-xs text-[#434655]">
                  Este profesional aún no tiene reseñas públicas.
                </p>
              ) : (
                <div className="space-y-4 divide-y divide-[#E2E8F0]">
                  {(calificaciones || []).map((c) => (
                    <div key={c.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-[#0F172A]">
                          {c.cliente_nombre || "Cliente"}
                        </span>
                        <div className="flex items-center text-[#D97706]">
                          {[...Array(Math.max(1, Math.min(5, c.puntuacion || 5)))].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#434655] italic">&ldquo;{c.comentario}&rdquo;</p>
                      <span className="text-[10px] text-[#94A3B8] block mt-1">
                        Publicado el {c.fecha}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
