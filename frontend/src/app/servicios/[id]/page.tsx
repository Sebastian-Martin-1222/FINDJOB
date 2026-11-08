"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities } from "@/lib/access-control";

export default function ServicioDetallePage(){
  const {id}=useParams<{id:string}>(); const [item,setItem]=useState<ServicioDetalle|null>(null); const [error,setError]=useState<string|null>(null); const authenticated=authStorage.isAuthenticated(); const user=authStorage.getUser(); const canRequest=!authenticated||getAccessCapabilities(user).canContractServices;
  const load=useCallback(async()=>{try{setError(null);setItem(await marketplaceService.getServicioById(id))}catch(e){setError(e instanceof Error?e.message:"No fue posible cargar el servicio.")}},[id]); useEffect(()=>{void load()},[load]);
  const money=(n:number)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
  const workerName=item?[item.trabajador_nombres,item.trabajador_apellidos].filter(Boolean).join(" "):"";
  return <div className="min-h-screen bg-[#FAF8FF]">{authenticated?<PrivateNavbar/>:<PublicNavbar/>}<main className="mx-auto max-w-4xl p-6">{error&&<ErrorAlert message={error} onRetry={load}/>} {!item?<p>Cargando…</p>:<div className="space-y-5"><section className="rounded-xl border bg-white p-6"><p className="text-xs font-bold uppercase text-blue-700">{item.categoria_nombre||"Servicio"}</p><h1 className="mt-1 text-3xl font-bold text-slate-900">{item.titulo}</h1><p className="mt-3 text-slate-700 whitespace-pre-line">{item.descripcion}</p><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm"><div><span className="text-slate-500">Precio base</span><p className="font-bold">{money(item.precio_base)}</p></div><div><span className="text-slate-500">Tiempo estimado</span><p className="font-bold">{item.tiempo_estimado_horas} h</p></div><div><span className="text-slate-500">Revisiones</span><p className="font-bold">{item.revisiones_incluidas}</p></div><div><span className="text-slate-500">Calificación</span><p className="font-bold">{item.calificacion_promedio==null?"Sin calificaciones":item.calificacion_promedio.toFixed(1)}</p></div></div><div className="mt-5 flex flex-wrap gap-2">{item.modalidades.map(m=><span key={m.modalidad_id} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{m.nombre}</span>)}</div></section><section className="rounded-xl border bg-white p-6"><h2 className="font-bold text-lg">Prestador del servicio</h2><p className="mt-1 text-slate-700">{workerName||"Perfil de servicio"}</p><div className="mt-4 flex gap-3"><Link className="inline-flex h-11 items-center rounded-lg border px-4 text-sm font-semibold" href={`/trabajadores/${item.perfil_trabajador_id}`}>Ver perfil</Link>{canRequest&&<Link className="inline-flex h-11 items-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white" href={`/servicios/${item.servicio_id}/solicitar`}>Solicitar servicio</Link>}</div></section></div>}</main></div>
}
