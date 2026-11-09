"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { authStorage } from "@/lib/auth-storage";
import { catalogService, CategoriaCatalogoItem, ModalidadCatalogoItem } from "@/services/catalog.service";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";

function normalizeText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default function ServiciosPage() {
  const authenticated = authStorage.isAuthenticated();
  const [items, setItems] = useState<ServicioDetalle[]>([]);
  const [categorias, setCategorias] = useState<CategoriaCatalogoItem[]>([]);
  const [modalidades, setModalidades] = useState<ModalidadCatalogoItem[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [modalidadId, setModalidadId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchTerm(params.get("q") ?? "");
    setCategorySlug(params.get("categoria") ?? "");
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicios, cats, mods] = await Promise.all([
        marketplaceService.buscarServicios({
          categoria_id: categoriaId ? Number(categoriaId) : undefined,
          modalidad_id: modalidadId ? Number(modalidadId) : undefined,
          limit: 100,
        }),
        catalogService.getCategorias(),
        catalogService.getModalidades(),
      ]);
      setItems(servicios);
      setCategorias(cats);
      setModalidades(mods);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, [categoriaId, modalidadId]);

  useEffect(() => { void load(); }, [load]);

  const filteredItems = useMemo(() => {
    const q = normalizeText(searchTerm);
    const slug = normalizeText(categorySlug);
    return items.filter((service) => {
      const matchesSearch = !q || [service.titulo, service.descripcion, service.categoria_nombre ?? "", service.subcategoria_nombre ?? ""]
        .some((value) => normalizeText(value).includes(q));
      const matchesCategoryLink = !slug || normalizeText(service.categoria_nombre ?? "").includes(slug) || normalizeText(service.subcategoria_nombre ?? "").includes(slug);
      return matchesSearch && matchesCategoryLink;
    });
  }, [items, searchTerm, categorySlug]);

  const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);

  const clearFilters = () => {
    setCategoriaId("");
    setModalidadId("");
    setSearchTerm("");
    setCategorySlug("");
    window.history.replaceState({}, "", "/servicios");
  };

  return <div className="min-h-screen bg-[#FAF8FF]">{authenticated ? <PrivateNavbar/> : <PublicNavbar/>}<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div><h1 className="text-3xl font-extrabold">Servicios disponibles</h1><p className="mt-1 text-sm text-[#64748B]">Explora ofertas activas publicadas por profesionales.</p></div>
    <div className="mt-6 grid max-w-4xl gap-3 md:grid-cols-3"><div className="relative md:col-span-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><input aria-label="Buscar servicios" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Buscar por servicio o categoría" className="h-11 w-full rounded-lg border pl-9 pr-3 text-sm"/></div><select value={categoriaId} onChange={(e)=>{setCategoriaId(e.target.value);setCategorySlug("")}} className="rounded-lg border p-3 text-sm"><option value="">Todas las categorías</option>{categorias.filter(c=>c.activa).map(c=><option key={c.categoria_id} value={c.categoria_id}>{c.nombre}</option>)}</select><select value={modalidadId} onChange={(e)=>setModalidadId(e.target.value)} className="rounded-lg border p-3 text-sm"><option value="">Todas las modalidades</option>{modalidades.map(m=><option key={m.modalidad_id} value={m.modalidad_id}>{m.nombre}</option>)}</select></div>
    {(searchTerm || categoriaId || modalidadId || categorySlug) && <button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-[#1D4ED8]">Limpiar filtros</button>}
    <div className="mt-6">{loading?<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><CardSkeleton/><CardSkeleton/><CardSkeleton/></div>:error?<ErrorAlert title="No pudimos cargar los servicios" message={error} onRetry={load}/>:filteredItems.length===0?<div className="rounded-xl border bg-white p-6"><h2 className="font-bold">No encontramos servicios con esos filtros</h2><p className="mt-1 text-sm text-[#64748B]">Prueba con otra búsqueda, categoría o modalidad.</p><button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-[#1D4ED8]">Ver todos los servicios</button></div>:<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filteredItems.map(s=><article key={s.servicio_id} className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-[#1D4ED8]">{s.subcategoria_nombre??s.categoria_nombre??"Servicio"}</p><h2 className="mt-1 text-lg font-bold">{s.titulo}</h2><p className="mt-2 line-clamp-3 text-sm text-[#64748B]">{s.descripcion}</p><p className="mt-3 text-sm">Prestado por: <strong>{s.trabajador_nombre??"Profesional FindJob"}</strong></p>{s.calificacion_promedio!=null&&<p className="mt-1 text-sm text-[#D97706]">★ {s.calificacion_promedio.toFixed(1)}</p>}<div className="mt-3 flex flex-wrap gap-1">{s.modalidades.map(m=><span key={m.modalidad_id} className="rounded bg-slate-100 px-2 py-1 text-xs">{m.nombre}</span>)}</div><div className="mt-5 flex items-center justify-between"><strong className="text-[#1D4ED8]">{money(s.precio_base)}</strong><Link href={`/servicios/${s.servicio_id}`} className="text-sm font-semibold text-[#1D4ED8]">Ver detalle</Link></div></article>)}</div>}</div>
  </main></div>;
}
