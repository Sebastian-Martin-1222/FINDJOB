"use client";
import { useCallback, useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { AlertaSeguridadItem } from "@/services/marketplace.service";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";

export default function AdminAlertasPage() {
  const [items, setItems] = useState<AlertaSeguridadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await adminService.getAlertas()); }
    catch (e) { setError(e instanceof Error ? e.message : "No fue posible cargar las alertas."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <section className="space-y-5">
    <div><h1 className="text-2xl font-bold">Alertas de seguridad</h1><p className="text-sm text-slate-400">Registro real de alertas generadas durante citas presenciales.</p></div>
    {error && <ErrorAlert message={error} onRetry={load} />}
    {loading ? <p className="text-slate-400">Cargando…</p> : items.length === 0 ? <p className="rounded-xl border border-slate-800 p-5 text-slate-400">No hay alertas registradas.</p> : (
      <div className="space-y-3">{items.map(a => <article key={a.alerta_seguridad_id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold">{a.tipo_alerta_codigo || `Tipo ${a.tipo_alerta_id}`}</h2><p className="text-xs text-slate-400">Cita #{a.cita_id} · {new Date(a.creada_en).toLocaleString("es-CO")}</p></div><span className="text-xs text-slate-300">{a.usuario_nombre || `Usuario #${a.usuario_id}`}</span></div>
        {a.descripcion && <p className="mt-3 text-sm text-slate-300">{a.descripcion}</p>}
      </article>)}</div>
    )}
    <Button variant="outline" onClick={load}>Actualizar</Button>
  </section>;
}
