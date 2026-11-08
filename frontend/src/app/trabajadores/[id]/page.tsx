"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { CalificacionItem, marketplaceService, ServicioDetalle, TrabajadorPerfilPublico } from "@/services/marketplace.service";
import { authStorage } from "@/lib/auth-storage";

export default function PerfilTrabajadorPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const perfilId = Number(String(params?.id ?? ""));
  const [perfil, setPerfil] = useState<TrabajadorPerfilPublico | null>(null);
  const [calificaciones, setCalificaciones] = useState<CalificacionItem[]>([]);
  const [servicios, setServicios] = useState<ServicioDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authStorage.isAuthenticated();

  const fetchData = useCallback(async () => {
    if (!Number.isFinite(perfilId) || perfilId <= 0) {
      setError("El identificador del profesional no es válido.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true); setError(null);
      const [perfilData, califsData, catalogo] = await Promise.all([
        marketplaceService.getPerfilTrabajador(perfilId),
        marketplaceService.getCalificacionesTrabajador(perfilId),
        marketplaceService.buscarServicios({ limit: 100 }),
      ]);
      setPerfil(perfilData);
      setCalificaciones(califsData);
      setServicios(catalogo.filter((servicio) => servicio.perfil_trabajador_id === perfilId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el perfil profesional.");
    } finally { setLoading(false); }
  }, [perfilId]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const formatCOP = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
  const nombre = [perfil?.nombres, perfil?.apellidos].filter(Boolean).join(" ") || "Profesional FindJob";

  return <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
    {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/servicios" className="inline-flex items-center gap-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
      {loading && <CardSkeleton />}
      {!loading && error && <ErrorAlert title="Error de perfil" message={error} onRetry={fetchData} />}
      {!loading && !error && !perfil && <EmptyState title="Perfil no encontrado" description="No encontramos el perfil solicitado." actionLabel="Ver catálogo" onAction={() => router.push("/servicios")} />}
      {!loading && !error && perfil && <div className="space-y-8">
        <section className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-2xl font-extrabold">{nombre.charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-extrabold">{nombre}</h1>
              {perfil.titulo_profesional && <p className="mt-1 text-sm font-semibold text-[#1D4ED8]">{perfil.titulo_profesional}</p>}
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#434655]">
                {perfil.calificacion_promedio != null && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-[#D97706] fill-current" />{perfil.calificacion_promedio.toFixed(1)} ({perfil.total_calificaciones} reseñas)</span>}
                {perfil.ciudad_nombre && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{perfil.ciudad_nombre}</span>}
              </div>
            </div>
          </div>
          {(perfil.descripcion_profesional || perfil.experiencia_resumen) && <div className="mt-6 pt-6 border-t border-[#E2E8F0] space-y-3 text-sm text-[#434655]">
            {perfil.descripcion_profesional && <p>{perfil.descripcion_profesional}</p>}
            {perfil.experiencia_resumen && <p><strong>Experiencia:</strong> {perfil.experiencia_resumen}</p>}
          </div>}
          <div className="mt-6 pt-6 border-t border-[#E2E8F0] grid md:grid-cols-2 gap-6">
            <div><h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Habilidades</h2><div className="flex flex-wrap gap-2">
              {perfil.habilidades.length ? perfil.habilidades.map((h) => <span key={h.habilidad_id} className="px-2.5 py-1 rounded-md bg-[#F2F3FF] text-xs font-semibold text-[#1D4ED8]">{h.nombre}</span>) : <span className="text-sm text-[#64748B]">Sin habilidades públicas registradas.</span>}
            </div></div>
            <div><h2 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Cobertura presencial</h2><div className="flex flex-wrap gap-2">
              {perfil.coberturas.length ? perfil.coberturas.map((c) => <span key={c.ciudad_id} className="px-2.5 py-1 rounded-md bg-[#ECFDF5] text-xs font-semibold text-[#047857]">{c.nombre}</span>) : <span className="text-sm text-[#64748B]">Sin coberturas públicas registradas.</span>}
            </div></div>
          </div>
        </section>
        <section><h2 className="text-xl font-extrabold mb-4">Servicios publicados</h2>
          {servicios.length === 0 ? <p className="text-sm text-[#64748B]">Este profesional no tiene servicios activos publicados.</p> : <div className="grid md:grid-cols-2 gap-5">
            {servicios.map((servicio) => <article key={servicio.servicio_id} className="bg-white rounded-xl border border-[#CBD5E1] p-5 shadow-sm">
              <p className="text-xs font-semibold text-[#1D4ED8]">{servicio.subcategoria_nombre ?? servicio.categoria_nombre ?? "Servicio"}</p><h3 className="mt-1 font-bold text-lg">{servicio.titulo}</h3><p className="mt-2 text-sm text-[#434655] line-clamp-3">{servicio.descripcion}</p>
              <div className="mt-4 flex flex-wrap gap-2">{servicio.modalidades.map((m) => <span key={m.modalidad_id} className="text-xs px-2 py-1 rounded bg-[#F8FAFC] border border-[#CBD5E1]">{m.nombre}</span>)}</div>
              <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between gap-3"><strong className="text-[#1D4ED8]">{formatCOP(servicio.precio_base)}</strong><Button size="sm" onClick={() => router.push(`/servicios/${servicio.servicio_id}`)}>Ver servicio</Button></div>
            </article>)}
          </div>}
        </section>
        <section className="bg-white rounded-xl border border-[#CBD5E1] p-6 shadow-sm"><h2 className="text-xl font-extrabold mb-4">Reseñas ({calificaciones.length})</h2>
          {calificaciones.length === 0 ? <p className="text-sm text-[#64748B]">Aún no hay reseñas públicas.</p> : <div className="divide-y divide-[#E2E8F0]">{calificaciones.map((c) => <article key={c.calificacion_id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><strong className="text-sm">{c.cliente_nombre ?? "Cliente"}</strong><span className="flex items-center gap-1 text-sm text-[#D97706]"><Star className="h-4 w-4 fill-current" />{c.puntuacion}/5</span></div>{c.servicio_titulo && <p className="mt-1 text-xs text-[#64748B]">{c.servicio_titulo}</p>}{c.comentario && <p className="mt-2 text-sm text-[#434655]">{c.comentario}</p>}<time className="mt-2 block text-xs text-[#94A3B8]">{new Date(c.creada_en).toLocaleDateString("es-CO")}</time></article>)}</div>}
        </section>
      </div>}
    </main>
  </div>;
}
