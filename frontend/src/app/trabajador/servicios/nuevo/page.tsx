"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { catalogService, ModalidadCatalogoItem, SubcategoriaCatalogoItem } from "@/services/catalog.service";
import { marketplaceService } from "@/services/marketplace.service";
import { userService } from "@/services/user.service";
import { publicarServicioSchema } from "@/schemas/marketplace.schema";
import { ApiError } from "@/lib/api-client";

export default function NewService() {
  const router = useRouter();
  const [subcats, setSubcats] = useState<SubcategoriaCatalogoItem[]>([]);
  const [mods, setMods] = useState<ModalidadCatalogoItem[]>([]);
  const [subcat, setSubcat] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [horas, setHoras] = useState("");
  const [revisiones, setRevisiones] = useState("0");
  const [selectedMods, setSelectedMods] = useState<number[]>([]);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        try {
          await userService.getPerfilTrabajador();
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) { setNeedsProfile(true); return; }
          throw e;
        }
        const [cats, modalidades] = await Promise.all([catalogService.getCategorias(), catalogService.getModalidades()]);
        const all = (await Promise.all(cats.filter(c => c.activa).map(c => catalogService.getSubcategorias(c.categoria_id)))).flat().filter(s => s.activa);
        setSubcats(all);
        setMods(modalidades);
        if (all[0]) setSubcat(String(all[0].subcategoria_id));
        if (modalidades[0]) setSelectedMods([modalidades[0].modalidad_id]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No fue posible preparar el formulario.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = publicarServicioSchema.safeParse({ subcategoria_id: subcat, titulo, descripcion, precio_base: precio, tiempo_estimado_horas: horas, revisiones_incluidas: revisiones, modalidades_ids: selectedMods });
    if (!v.success) { setError(v.error.issues[0]?.message ?? "Revisa los campos del servicio."); return; }
    try {
      setSaving(true);
      setError(null);
      await marketplaceService.publicarServicio(v.data);
      router.push("/trabajador/servicios");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible publicar el servicio.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar/><main className="mx-auto max-w-3xl p-6"><div className="text-sm text-slate-500"><Link href="/trabajador/servicios" className="text-blue-700">Mis servicios</Link> / Nuevo</div><h1 className="mt-3 text-3xl font-extrabold">Publicar servicio</h1><p className="mt-1 text-sm text-slate-600">Define qué ofreces, el precio base y cómo puedes prestar el servicio.</p>{error&&<div className="mt-4"><ErrorAlert message={error}/></div>}{!loading&&needsProfile?<div className="mt-6"><EmptyState title="Primero completa tu perfil profesional" description="Necesitamos tu información profesional antes de que puedas publicar un servicio." actionLabel="Completar perfil" onAction={()=>router.push("/trabajador/perfil")}/></div>:!loading&&!error?<form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border bg-white p-6"><div><label className="text-sm font-semibold">Subcategoría</label><select value={subcat} onChange={e=>setSubcat(e.target.value)} className="mt-1 w-full rounded-lg border p-3">{subcats.map(s=><option key={s.subcategoria_id} value={s.subcategoria_id}>{s.nombre}</option>)}</select></div><Input id="titulo" label="Título del servicio" value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej. Instalación de tomacorrientes"/><div><label className="text-sm font-semibold">Descripción</label><textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border p-3" placeholder="Explica qué incluye el servicio y qué debe saber la persona antes de solicitarlo."/></div><div className="grid gap-4 sm:grid-cols-3"><Input id="precio_base" type="number" label="Precio base (COP)" value={precio} onChange={e=>setPrecio(e.target.value)}/><Input id="tiempo_estimado_horas" type="number" label="Duración estimada (h)" value={horas} onChange={e=>setHoras(e.target.value)}/><Input id="revisiones_incluidas" type="number" label="Revisiones incluidas" value={revisiones} onChange={e=>setRevisiones(e.target.value)}/></div><div><p className="text-sm font-semibold">Modalidades</p><p className="mt-1 text-xs text-slate-500">Selecciona al menos una forma de prestación.</p><div className="mt-2 flex flex-wrap gap-2">{mods.map(m=><label key={m.modalidad_id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={selectedMods.includes(m.modalidad_id)} onChange={()=>setSelectedMods(prev=>prev.includes(m.modalidad_id)?prev.filter(x=>x!==m.modalidad_id):[...prev,m.modalidad_id])}/>{m.nombre}</label>)}</div></div><div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="outline" onClick={()=>router.push("/trabajador/servicios")}>Cancelar</Button><Button type="submit" disabled={saving}>{saving?"Publicando…":"Publicar servicio"}</Button></div></form>:loading?<p className="mt-6 text-sm text-slate-500">Preparando formulario…</p>:null}</main></div>;
}
