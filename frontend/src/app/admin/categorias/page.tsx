"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { adminService, AdminCategoriaItem } from "@/services/admin.service";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminCategoriasPage(){
  const [items,setItems]=useState<AdminCategoriaItem[]>([]); const [error,setError]=useState<string|null>(null); const [loading,setLoading]=useState(true);
  const [nombre,setNombre]=useState(""); const [descripcion,setDescripcion]=useState("");
  const load=useCallback(async()=>{try{setLoading(true);setError(null);setItems(await adminService.getCategorias());}catch(e){setError(e instanceof Error?e.message:"No fue posible cargar categorías.");}finally{setLoading(false)}},[]);
  useEffect(()=>{void load()},[load]);
  async function crear(e:FormEvent){e.preventDefault(); try{setError(null); await adminService.crearCategoria({nombre,descripcion,activa:true}); setNombre(""); setDescripcion(""); await load();}catch(err){setError(err instanceof Error?err.message:"No fue posible crear la categoría.")}}
  return <section className="space-y-6"><div><h1 className="text-2xl font-bold">Categorías</h1><p className="text-sm text-slate-400">Gestiona categorías y consulta sus subcategorías reales.</p></div>{error&&<ErrorAlert message={error} onRetry={load}/>}<form onSubmit={crear} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-[1fr_2fr_auto]"><Input label="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required/><Input label="Descripción" value={descripcion} onChange={e=>setDescripcion(e.target.value)}/><div className="self-end"><Button type="submit">Crear</Button></div></form>{loading?<p className="text-slate-400">Cargando…</p>:<div className="space-y-4">{items.map(cat=><article key={cat.categoria_id} className="rounded-xl border border-slate-800 bg-slate-900 p-4"><div className="flex justify-between gap-4"><div><h2 className="font-bold">{cat.nombre}</h2><p className="text-sm text-slate-400">{cat.descripcion||"Sin descripción"}</p></div><span className="text-xs text-slate-400">{cat.activa?"Activa":"Inactiva"}</span></div><div className="mt-3 flex flex-wrap gap-2">{cat.subcategorias.length?cat.subcategorias.map(s=><span key={s.subcategoria_id} className="rounded-full bg-slate-800 px-3 py-1 text-xs">{s.nombre}</span>):<span className="text-xs text-slate-500">Sin subcategorías</span>}</div></article>)}</div>}</section>
}
