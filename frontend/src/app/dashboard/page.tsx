"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities, getDefaultPrivateRoute } from "@/lib/access-control";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";

export default function ClientDashboardPage() {
  const router = useRouter();
  const user = authStorage.getUser();
  const canUseDashboard = getAccessCapabilities(user).canContractServices;
  const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setSolicitudes(await marketplaceService.getMisSolicitudes()); }
    catch (err) { setError(err instanceof Error ? err.message : "No fue posible cargar tus solicitudes."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    if (!canUseDashboard) {
      router.replace(getDefaultPrivateRoute(user));
      return;
    }
    void load();
  }, [canUseDashboard, load, router, user]);

  const pendientes = useMemo(() => solicitudes.filter((s) => s.estado_codigo === "PENDIENTE").length, [solicitudes]);
  const aceptadas = useMemo(() => solicitudes.filter((s) => s.estado_codigo === "ACEPTADA").length, [solicitudes]);
  const conCita = useMemo(() => solicitudes.filter((s) => Boolean(s.cita_id)).length, [solicitudes]);

  if (!canUseDashboard) return null;

  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 className="text-3xl font-extrabold text-[#0F172A]">Bienvenido{user?.nombres ? `, ${user.nombres}` : ""}</h1><p className="mt-1 text-sm text-[#64748B]">Consulta tus solicitudes y continúa tus servicios activos.</p></div><Link href="/servicios" className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-4 py-2.5 text-sm font-semibold text-white"><PlusCircle className="mr-2 h-4 w-4" />Explorar servicios</Link></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"><div className="flex justify-between"><span className="text-sm font-semibold text-[#64748B]">Pendientes</span><Clock className="h-5 w-5 text-[#1D4ED8]" /></div><p className="mt-3 text-3xl font-extrabold">{loading ? "…" : pendientes}</p></div><div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"><div className="flex justify-between"><span className="text-sm font-semibold text-[#64748B]">Aceptadas</span><Calendar className="h-5 w-5 text-[#1D4ED8]" /></div><p className="mt-3 text-3xl font-extrabold">{loading ? "…" : aceptadas}</p></div><div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm"><div className="flex justify-between"><span className="text-sm font-semibold text-[#64748B]">Con cita</span><Calendar className="h-5 w-5 text-[#1D4ED8]" /></div><p className="mt-3 text-3xl font-extrabold">{loading ? "…" : conCita}</p></div></div>
    <section className="mt-10"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Solicitudes recientes</h2><Link href="/solicitudes" className="text-sm font-semibold text-[#1D4ED8]">Ver todas</Link></div><div className="mt-4">
      {loading && <div className="space-y-3"><Skeleton className="h-20 w-full"/><Skeleton className="h-20 w-full"/></div>}
      {!loading && error && <ErrorAlert title="No se pudieron cargar las solicitudes" message={error} onRetry={load} />}
      {!loading && !error && solicitudes.length === 0 && <EmptyState title="Aún no tienes solicitudes" description="Explora el catálogo y solicita el servicio que necesitas." actionLabel="Explorar servicios" onAction={() => router.push("/servicios")} />}
      {!loading && !error && solicitudes.length > 0 && <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white"><ul className="divide-y divide-[#E2E8F0]">{solicitudes.slice(0,6).map((s) => <li key={s.solicitud_servicio_id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong>{s.servicio_titulo ?? `Solicitud #${s.solicitud_servicio_id}`}</strong><span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-xs font-semibold">{s.estado_codigo}</span></div><p className="mt-1 text-xs text-[#64748B]">{s.trabajador_nombre ?? "Prestador por confirmar"} · {new Date(s.creada_en).toLocaleDateString("es-CO")}</p></div><Link href={`/solicitudes/${s.solicitud_servicio_id}`} className="text-sm font-semibold text-[#1D4ED8]">Ver detalle</Link></li>)}</ul></div>}
    </div></section>
  </main></div>;
}
