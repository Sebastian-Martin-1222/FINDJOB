"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Clock,
  RotateCcw,
  CheckCircle,
  Eye,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";

export default function MisServiciosTrabajadorPage() {
  const router = useRouter();
  const [servicios, setServicios] = useState<ServicioDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtenemos los servicios del trabajador actual
      const data = await marketplaceService.getPerfilTrabajador(1);
      setServicios(data.servicios || []);
    } catch {
      setError("No fue posible cargar tus servicios publicados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
              Catálogo Profesional
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
              Mis Servicios Publicados
            </h1>
            <p className="text-sm text-[#434655] mt-1">
              Gestiona las ofertas profesionales que los clientes ven en el catálogo de FindJob.
            </p>
          </div>
          <Button
            onClick={() => router.push("/trabajador/servicios/nuevo")}
            className="flex items-center space-x-2 bg-[#059669] hover:bg-[#047857]"
          >
            <Plus className="h-4 w-4" />
            <span>Publicar Nuevo Servicio</span>
          </Button>
        </div>

        {/* 1. LOADING STATE */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto my-8">
            <ErrorAlert title="Error al cargar servicios" message={error} onRetry={fetchServicios} />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loading && !error && servicios.length === 0 && (
          <EmptyState
            title="Aún no has publicado ningún servicio"
            description="Crea tu primera oferta con precio base en COP, tiempo estimado y modalidades para recibir solicitudes de clientes."
            actionLabel="Crear primer servicio"
            onAction={() => router.push("/trabajador/servicios/nuevo")}
          />
        )}

        {/* 4. SUCCESS STATE */}
        {!loading && !error && servicios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicios.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm hover:border-[#059669] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#0039B5] bg-[#DBEAFE] px-2.5 py-0.5 rounded-full">
                      {s.subcategoria_nombre}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#059669]">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Activo</span>
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#0F172A] mb-2">{s.titulo}</h2>
                  <p className="text-xs text-[#434655] line-clamp-3 mb-4">{s.descripcion}</p>

                  <div className="space-y-1.5 text-xs text-[#434655] mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-[#1D4ED8]" />
                        Tiempo estimado:
                      </span>
                      <strong className="text-[#0F172A]">{s.tiempo_estimado_horas} horas</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center">
                        <RotateCcw className="h-3.5 w-3.5 mr-1 text-[#059669]" />
                        Revisiones incluidas:
                      </span>
                      <strong className="text-[#0F172A]">{s.revisiones_incluidas} ajustes</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#94A3B8] uppercase block">Precio base</span>
                    <span className="text-xl font-extrabold text-[#1D4ED8] font-mono">
                      {formatCOP(s.precio_base)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/servicios/${s.id}`}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-[#434655] hover:bg-[#F2F3FF]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Vista previa</span>
                    </Link>
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
