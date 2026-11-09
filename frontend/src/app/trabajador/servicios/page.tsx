"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";

export default function MisServiciosTrabajadorPage(){
  const [items,setItems]=useState<ServicioDetalle[]>([]);const[error,setError]=useState<string|null>(null);const[loading,setLoading]=useState(true);
  const load=useCallback(async()=>{try{setLoading(true);setError(null);setItems(await marketplaceService.getMisServiciosTrabajador())}catch(e){setError(e instanceof Error?e.message:"No fue posible cargar tus servicios.")}finally{setLoading(false)}},[]);useEffect(()=>{void load()},[load]);
  const money=(n:number)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar/><main className="mx-auto max-w-5xl p-6 space-y-5"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Mis servicios</h1><p className="text-sm text-slate-600">Ofertas publicadas desde tu perfil profesional.</p></div><Link className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" href="/trabajador/servicios/nuevo">Nuevo servicio</Link></div>{error&&<ErrorAlert message={error} onRetry={load}/>} {loading?<p>Cargando…</p>:items.length===0?<div className="rounded-xl border bg-white p-6"><h2 className="font-bold">Aún no has publicado servicios</h2><p className="mt-1 text-sm text-slate-600">Cuando publiques tu primer servicio aparecerá aquí para que puedas gestionarlo.</p><Link className="mt-4 inline-flex rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" href="/trabajador/servicios/nuevo">Publicar mi primer servicio</Link></div>:<div className="grid gap-4 md:grid-cols-2">{items.map(s=><article key={s.servicio_id} className="rounded-xl border bg-white p-5"><div className="flex justify-between"><h2 className="font-bold">{s.titulo}</h2><span className="text-xs text-emerald-700">Activo</span></div><p className="mt-2 line-clamp-2 text-sm text-slate-600">{s.descripcion}</p><p className="mt-3 font-bold text-blue-700">{money(s.precio_base)}</p><div className="mt-3 flex flex-wrap gap-1">{s.modalidades.map(m=><span key={m.modalidad_id} className="rounded-full bg-slate-100 px-2 py-1 text-xs">{m.nombre}</span>)}</div></article>)}</div>}</main></div>
}
