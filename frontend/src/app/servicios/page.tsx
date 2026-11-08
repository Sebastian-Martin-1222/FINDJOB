"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { authStorage } from "@/lib/auth-storage";
import { catalogService, CategoriaCatalogoItem, ModalidadCatalogoItem } from "@/services/catalog.service";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";

export default function ServiciosPage() {
  const authenticated = authStorage.isAuthenticated();
  const [items, setItems] = useState<ServicioDetalle[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCatalogoItem[]>([]);
  const [modalidades, setModalidades] = useState<ModalidadCatalogoItem[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [modalidadId, setModalidadId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const [servicios, cats, mods] = await Promise.all([
        marketplaceService.buscarServicios({ categoria_id: categoriaId ? Number(categoriaId) : undefined, modalidad_id: modalidadId ? Number(modalidadId) : undefined, limit: 100 }),
        catalogService.getCategorias(), catalogService.getModalidades(),
      ]);
      setItems(servicios); setCategorias(cats); setModalidades(mods);
    } catch (err) { setError(err instanceof Error ? err.message : "No fue posible cargar el catálogo."); }
    finally { setLoading(false); }
  }, [categoriaId, modalidadId]);
  useEffect(() => { void load(); }, [load]);
  const money=(v:number)=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(v);

  return <div className="min-h-screen bg-[#FAF8FF]">{authenticated?<PrivateNavbar/>:<PublicNavbar/>}<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div><h1 className="text-3xl font-extrabold">Servicios disponibles</h1><p className="mt-1 text-sm text-[#64748B]">Explora ofertas activas publicadas por profesionales.</p></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 max-w-2xl"><select value={categoriaId} onChange={(e)=>setCategoriaId(e.target.value)} className="rounded-lg border p-3 text-sm"><option value="">Todas las categorías</option>{categorias.filter(c=>c.activa).map(c=><option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>)}</select><select value={modalidadId} onChange={(e)=>setModalidadId(e.target.value)} className="rounded-lg border p-3 text-sm"><option value="">Todas las modalidades</option>{modalidades.map(m=><option key={m.modalidad_id} value={m.modalidad_id}>{m.nombre}</option>)}</select></div>
    <div className="mt-6">{loading?<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"><CardSkeleton/><CardSkeleton/><CardSkeleton/></div>:error?<ErrorAlert title="Error de catálogo" message={error} onRetry={load}/>:items.length===0?<p className="rounded-xl border bg-white p-6 text-sm text-[#64748B]">No hay servicios que coincidan con los filtros.</p>:<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{items.map(s=><article key={s.servicio_id} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-[#1D4ED8]">{s.subcategoria_nombre??s.categoria_nombre??"Servicio"}</p><h2 className="mt-1 text-lg font-bold">{s.titulo}</h2><p className="mt-2 text-sm text-[#64748B] line-clamp-3">{s.descripcion}</p><p className="mt-3 text-sm">Prestador: <strong>{s.trabajador_nombre??"Perfil de servicio"}</strong></p>{s.calificacion_promedio!=null&&<p className="mt-1 text-sm text-[#D97706]">★ {s.calificacion_promedio.toFixed(1)}</p>}<div className="mt-3 flex flex-wrap gap-1">{s.modalidades.map(m=><span key={m.modalidad_id} className="rounded bg-slate-100 px-2 py-1 text-xs">{m.nombre}</span>)}</div><div className="mt-5 flex items-center justify-between"><strong className="text-[#1D4ED8]">{money(s.precio_base)}</strong><Link href={`/servicios/${s.servicio_id}`} className="text-sm font-semibold text-[#1D4ED8]">Ver detalle</Link></div></article>)}</div>}</div>
  </main></div>;
}
