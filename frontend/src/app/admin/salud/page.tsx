"use client";
import { useCallback, useEffect, useState } from "react";
import { adminService, SystemHealthStatus } from "@/services/admin.service";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";

export default function AdminSaludPage() {
  const [api, setApi] = useState<{status:string;service:string;version:string}|null>(null);
  const [db, setDb] = useState<SystemHealthStatus|null>(null);
  const [error, setError] = useState<string|null>(null);
  const load = useCallback(async () => {
    try { setError(null); const [a,d] = await Promise.all([adminService.getHealthSystem(), adminService.getHealthDb()]); setApi(a); setDb(d); }
    catch(e){ setError(e instanceof Error ? e.message : "No fue posible consultar la salud del sistema."); }
  }, []);
  useEffect(()=>{ void load(); },[load]);
  return <section className="space-y-5"><div><h1 className="text-2xl font-bold">Salud del sistema</h1><p className="text-sm text-slate-400">Solo se muestran datos que exponen los endpoints de salud.</p></div>
    {error && <ErrorAlert message={error} onRetry={load}/>}<div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-bold">API</h2><p className="mt-2 text-sm text-slate-300">Estado: {api?.status ?? "Sin datos"}</p><p className="text-sm text-slate-400">Servicio: {api?.service ?? "—"}</p><p className="text-sm text-slate-400">Versión: {api?.version ?? "—"}</p></div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5"><h2 className="font-bold">Base de datos</h2><p className="mt-2 text-sm text-slate-300">Estado: {db?.status ?? "Sin datos"}</p><p className="text-sm text-slate-400">Motor: {db?.database ?? "—"}</p><p className="text-sm text-slate-400">Conexión: {db?.connection ?? "—"}</p></div>
    </div><Button variant="outline" onClick={load}>Actualizar</Button></section>;
}
