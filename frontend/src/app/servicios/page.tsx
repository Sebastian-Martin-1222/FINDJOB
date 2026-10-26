"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api-client";
import { authStorage } from "@/lib/auth-storage";

interface ServicioItem {
  servicio_id: number;
  titulo: string;
  descripcion: string;
  precio_base: number;
  categoria_nombre?: string;
  trabajador_nombre?: string;
  calificacion_promedio?: number;
  ciudad?: string;
  modalidad?: string;
}

export default function ServiciosPage() {
  const isAuth = authStorage.isAuthenticated();

  const [servicios, setServicios] = useState<ServicioItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("TODAS");
  const [selectedModalidad, setSelectedModalidad] = useState("TODAS");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServicios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Endpoint real: GET /servicios (Evidencia 56 de 82)
      const data = await apiClient.get<ServicioItem[]>("/servicios", {
        requiresAuth: false,
      });
      setServicios(Array.isArray(data) ? data : []);
    } catch {
      // Si el backend aún no tiene catálogo poblado en Cloud SQL, entregamos fallback limpio
      setError("No fue posible cargar el catálogo de servicios en tiempo real.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const filteredServicios = servicios.filter((s) => {
    const matchesSearch =
      searchTerm === "" ||
      s.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "TODAS" || s.ciudad === selectedCity;
    const matchesModalidad =
      selectedModalidad === "TODAS" || s.modalidad === selectedModalidad;
    return matchesSearch && matchesCity && matchesModalidad;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      {isAuth ? <PrivateNavbar /> : <PublicNavbar />}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header & Hero del Buscador */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Explora servicios técnicos y profesionales en Colombia
          </h1>
          <p className="mt-2 text-sm text-[#434655] max-w-2xl leading-relaxed">
            Contrata profesionales calificados para tu hogar o empresa con garantía de seguridad presencial y tarifas transparentes en pesos colombianos.
          </p>

          {/* Barra de Búsqueda Predictiva y Filtros */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-12">
            <div className="relative sm:col-span-6">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="¿Qué servicio necesitas? ej. Plomero, Electricista, Redes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#CBD5E1] bg-white pl-10 pr-4 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="TODAS">Todas las ciudades</option>
                <option value="Bogotá D.C.">Bogotá D.C.</option>
                <option value="Medellín">Medellín</option>
                <option value="Cali">Cali</option>
                <option value="Barranquilla">Barranquilla</option>
                <option value="Bucaramanga">Bucaramanga</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedModalidad}
                onChange={(e) => setSelectedModalidad(e.target.value)}
                className="h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="TODAS">Todas las modalidades</option>
                <option value="Presencial">Presencial (Domicilio)</option>
                <option value="Remoto">Remoto (Virtual)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listado de Servicios (4 Estados de UI) */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172A]">
              Servicios disponibles{" "}
              {!isLoading && (
                <span className="text-sm font-normal text-[#434655]">
                  ({filteredServicios.length})
                </span>
              )}
            </h2>
          </div>

          <div className="mt-4">
            {/* Estado 1: Loading (Skeletons proporcionales) */}
            {isLoading && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            )}

            {/* Estado 2: Error (Alerta con reintento) */}
            {error && !isLoading && (
              <ErrorAlert
                title="Error de conexión con el catálogo"
                message={error}
                onRetry={fetchServicios}
              />
            )}

            {/* Estado 3: Empty State */}
            {!isLoading && !error && filteredServicios.length === 0 && (
              <EmptyState
                title="No se encontraron servicios disponibles"
                description="Prueba ajustando el término de búsqueda, cambiando la ciudad de cobertura o limpiando los filtros seleccionados."
                actionLabel="Restablecer filtros"
                onAction={() => {
                  setSearchTerm("");
                  setSelectedCity("TODAS");
                  setSelectedModalidad("TODAS");
                }}
              />
            )}

            {/* Estado 4: Success (Grid de tarjetas oficiales) */}
            {!isLoading && !error && filteredServicios.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredServicios.map((item) => (
                  <div
                    key={item.servicio_id}
                    className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
                  >
                    <div>
                      {/* Badge de Categoría y Modalidad */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-[#EAEDFF] px-2.5 py-0.5 text-xs font-bold text-[#1D4ED8]">
                          {item.categoria_nombre || "Servicio Técnico"}
                        </span>
                        <span className="text-xs text-[#434655]">
                          {item.modalidad || "Presencial"}
                        </span>
                      </div>

                      {/* Título y Descripción */}
                      <h3 className="mt-3 text-lg font-bold text-[#0F172A] leading-snug line-clamp-2">
                        {item.titulo}
                      </h3>
                      <p className="mt-2 text-xs text-[#434655] line-clamp-3 leading-relaxed">
                        {item.descripcion}
                      </p>

                      {/* Info Profesional */}
                      <div className="mt-4 flex items-center space-x-2 pt-3 border-t border-[#E2E8F0]">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F2F3FF] text-xs font-bold text-[#1D4ED8]">
                          {item.trabajador_nombre ? item.trabajador_nombre[0] : "P"}
                        </div>
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {item.trabajador_nombre || "Profesional Verificado"}
                        </span>
                        <div className="flex items-center text-xs text-[#D97706] ml-auto">
                          <Star className="h-3.5 w-3.5 fill-[#D97706] mr-0.5" />
                          <span className="font-bold">
                            {item.calificacion_promedio?.toFixed(1) || "5.0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Precio COP y Botón */}
                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-[#434655]">
                          Tarifa estimada
                        </span>
                        <span className="font-mono text-base font-extrabold text-[#059669]">
                          $ {item.precio_base.toLocaleString("es-CO")} COP
                        </span>
                      </div>

                      <Link
                        href={`/servicios/${item.servicio_id}`}
                        className="inline-flex items-center rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1E40AF] transition-colors"
                      >
                        Ver detalle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
