"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Inbox, Star, UserRoundCheck } from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";
import { userService, PerfilTrabajadorPrivado } from "@/services/user.service";
import { ApiError } from "@/lib/api-client";

export default function TrabajadorDashboardPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [perfil, setPerfil] = useState<PerfilTrabajadorPrivado | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsProfile(false);

      const solicitudesPromise = marketplaceService.getSolicitudesRecibidas();
      const perfilPromise = userService.getPerfilTrabajador()
        .then((data) => ({ data, missing: false }))
        .catch((err) => {
          if (err instanceof ApiError && err.status === 404) {
            return { data: null, missing: true };
          }
          throw err;
        });

      const [sols, perfilResult] = await Promise.all([solicitudesPromise, perfilPromise]);
      setSolicitudes(sols);
      setPerfil(perfilResult.data);
      setNeedsProfile(perfilResult.missing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar tu resumen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pendientes = useMemo(() => solicitudes.filter((s) => s.estado_codigo === "PENDIENTE").length, [solicitudes]);
  const aceptadas = useMemo(() => solicitudes.filter((s) => s.estado_codigo === "ACEPTADA").length, [solicitudes]);

  return (
    <div className="min-h-screen bg-[#FAF8FF]">
      <PrivateNavbar />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-extrabold">Gestión de servicios</h1>
          <p className="mt-1 text-sm text-[#64748B]">Gestiona solicitudes, publicaciones y la información visible de tus servicios.</p>
        </div>

        {error && <ErrorAlert title="No pudimos cargar tu resumen" message={error} onRetry={load} />}

        {!loading && !error && needsProfile && (
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex gap-3">
              <UserRoundCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#1D4ED8]" />
              <div>
                <h2 className="font-bold text-[#0F172A]">Completa tu perfil profesional</h2>
                <p className="mt-1 text-sm text-slate-600">Antes de publicar servicios, agrega tu ciudad base, presentación profesional y experiencia.</p>
              </div>
            </div>
            <Link href="/trabajador/perfil" className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#1D4ED8] px-4 text-sm font-semibold text-white sm:mt-0">
              Completar perfil
            </Link>
          </section>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5"><Inbox className="h-5 w-5 text-[#1D4ED8]"/><p className="mt-3 text-sm text-[#64748B]">Solicitudes pendientes</p><p className="text-3xl font-extrabold">{loading ? "…" : pendientes}</p></div>
          <div className="rounded-xl border bg-white p-5"><Briefcase className="h-5 w-5 text-[#1D4ED8]"/><p className="mt-3 text-sm text-[#64748B]">Solicitudes aceptadas</p><p className="text-3xl font-extrabold">{loading ? "…" : aceptadas}</p></div>
          <div className="rounded-xl border bg-white p-5"><Star className="h-5 w-5 text-[#D97706]"/><p className="mt-3 text-sm text-[#64748B]">Calificación</p><p className="text-3xl font-extrabold">{loading ? "…" : perfil?.calificacion_promedio != null ? perfil.calificacion_promedio.toFixed(1) : "—"}</p><p className="text-xs text-[#64748B]">{perfil?.total_calificaciones ?? 0} reseñas</p></div>
        </div>

        <section>
          <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Solicitudes recientes</h2><Link href="/trabajador/solicitudes" className="text-sm font-semibold text-[#1D4ED8]">Ver todas</Link></div>
          <div className="mt-4">
            {!loading && solicitudes.length === 0 ? (
              <EmptyState title="Aún no tienes solicitudes" description="Cuando alguien solicite uno de tus servicios, aparecerá aquí para que puedas gestionarlo." />
            ) : (
              <div className="grid gap-3">{solicitudes.slice(0,5).map((s) => <Link key={s.solicitud_servicio_id} href={`/solicitudes/${s.solicitud_servicio_id}`} className="rounded-xl border bg-white p-4 hover:border-blue-400"><div className="flex justify-between gap-3"><strong>{s.servicio_titulo ?? `Solicitud #${s.solicitud_servicio_id}`}</strong><span className="text-xs font-semibold text-[#1D4ED8]">{s.estado_codigo}</span></div><p className="mt-1 text-sm text-[#64748B]">Solicitante: {s.cliente_nombre ?? "—"}</p></Link>)}</div>
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <Link href="/trabajador/perfil" className="rounded-xl border bg-white p-4 font-semibold hover:border-blue-400">Perfil profesional</Link>
          <Link href="/trabajador/servicios" className="rounded-xl border bg-white p-4 font-semibold hover:border-blue-400">Mis servicios</Link>
          <Link href="/trabajador/habilidades" className="rounded-xl border bg-white p-4 font-semibold hover:border-blue-400">Habilidades y cobertura</Link>
        </section>
      </main>
    </div>
  );
}
