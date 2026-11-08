"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService, CitaDetalle } from "@/services/marketplace.service";

export default function CitasPage(){
  const [items,setItems]=useState<CitaDetalle[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);setItems(await marketplaceService.getMisCitas())}catch(e){setError(e instanceof Error?e.message:"No fue posible cargar las citas.")}finally{setLoading(false)}},[]);
  useEffect(()=>{void load()},[load]);
  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar/><main className="mx-auto max-w-5xl p-6 space-y-5"><div><h1 className="text-2xl font-bold text-slate-900">Mis citas</h1><p className="text-sm text-slate-600">Citas asociadas a tus solicitudes o servicios.</p></div>{error&&<ErrorAlert message={error} onRetry={load}/>} {loading?<p>Cargando…</p>:items.length===0?<div className="rounded-xl border bg-white p-6 text-slate-500">No tienes citas registradas.</div>:<div className="grid gap-4 md:grid-cols-2">{items.map(c=><Link key={c.cita_id} href={`/citas/${c.cita_id}`} className="rounded-xl border bg-white p-5 shadow-sm hover:border-blue-400"><div className="flex justify-between gap-3"><h2 className="font-bold text-slate-900">{c.servicio_titulo||`Cita #${c.cita_id}`}</h2><span className="text-xs font-semibold text-blue-700">{c.estado_codigo}</span></div><p className="mt-2 text-sm text-slate-600">{c.modalidad_codigo||"Modalidad no disponible"}</p><p className="text-sm text-slate-600">{new Date(c.fecha_inicio).toLocaleString("es-CO")}</p>{c.direccion_texto&&<p className="mt-1 text-xs text-slate-500">{c.direccion_texto}</p>}</Link>)}</div>}</main></div>
}
