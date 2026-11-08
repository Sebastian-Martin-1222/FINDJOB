"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Inbox, Star } from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";
import { userService, PerfilTrabajadorPrivado } from "@/services/user.service";

export default function TrabajadorDashboardPage() {
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [perfil, setPerfil] = useState<PerfilTrabajadorPrivado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [sols, perfilData] = await Promise.all([marketplaceService.getSolicitudesRecibidas(), userService.getPerfilTrabajador()]);
      setSolicitudes(sols); setPerfil(perfilData);
    } catch (err) { setError(err instanceof Error ? err.message : "No fue posible cargar el panel profesional."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const pendientes = useMemo(() => solicitudes.filter((s) => s.estado_codigo === "PENDIENTE").length, [solicitudes]);
  const aceptadas = useMemo(() => solicitudes.filter((s) => s.estado_codigo === "ACEPTADA").length, [solicitudes]);

  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
    <div><h1 className="text-3xl font-extrabold">Gestión de servicios</h1><p className="mt-1 text-sm text-[#64748B]">Gestiona solicitudes, publicaciones y la información de tus servicios.</p></div>
    {error && <ErrorAlert title="No se pudo cargar el panel" message={error} onRetry={load} />}
    <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-white p-5"><Inbox className="h-5 w-5 text-[#1D4ED8]"/><p className="mt-3 text-sm text-[#64748B]">Solicitudes pendientes</p><p className="text-3xl font-extrabold">{loading ? "…" : pendientes}</p></div><div className="rounded-xl border bg-white p-5"><Briefcase className="h-5 w-5 text-[#1D4ED8]"/><p className="mt-3 text-sm text-[#64748B]">Solicitudes aceptadas</p><p className="text-3xl font-extrabold">{loading ? "…" : aceptadas}</p></div><div className="rounded-xl border bg-white p-5"><Star className="h-5 w-5 text-[#D97706]"/><p className="mt-3 text-sm text-[#64748B]">Calificación</p><p className="text-3xl font-extrabold">{loading ? "…" : perfil?.calificacion_promedio != null ? perfil.calificacion_promedio.toFixed(1) : "—"}</p><p className="text-xs text-[#64748B]">{perfil?.total_calificaciones ?? 0} reseñas</p></div></div>
    <section><div className="flex justify-between items-center"><h2 className="text-lg font-bold">Solicitudes recientes</h2><Link href="/trabajador/solicitudes" className="text-sm font-semibold text-[#1D4ED8]">Ver todas</Link></div><div className="mt-4">{!loading && solicitudes.length === 0 ? <EmptyState title="No tienes solicitudes recibidas" description="Cuando un cliente solicite uno de tus servicios aparecerá aquí." /> : <div className="grid gap-3">{solicitudes.slice(0,5).map((s) => <Link key={s.solicitud_servicio_id} href={`/solicitudes/${s.solicitud_servicio_id}`} className="rounded-xl border bg-white p-4 hover:border-blue-400"><div className="flex justify-between gap-3"><strong>{s.servicio_titulo ?? `Solicitud #${s.solicitud_servicio_id}`}</strong><span className="text-xs font-semibold text-[#1D4ED8]">{s.estado_codigo}</span></div><p className="mt-1 text-sm text-[#64748B]">Solicitante: {s.cliente_nombre ?? "—"}</p></Link>)}</div>}</div></section>
    <section className="grid gap-3 sm:grid-cols-3"><Link href="/trabajador/perfil" className="rounded-xl border bg-white p-4 font-semibold hover:border-blue-400">Perfil de servicios</Link><Link href="/trabajador/servicios" className="rounded-xl border bg-white p-4 font-semibold hover:border-blue-400">Mis servicios</Link><Link href="/trabajador/habilidades" className="rounded-xl border bg-white p-4 font-semibold hover:border-blue-400">Habilidades y cobertura</Link></section>
  </main></div>;
}
