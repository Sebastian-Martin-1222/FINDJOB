"use client";

import React, { useCallback, useEffect, useState } from "react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { userService, PerfilTrabajadorPrivado } from "@/services/user.service";
import { catalogService, CiudadCatalogoItem } from "@/services/catalog.service";
import { perfilTrabajadorSchema } from "@/schemas/user.schema";
import { ApiError } from "@/lib/api-client";

export default function WorkerProfile() {
  const [perfil, setPerfil] = useState<PerfilTrabajadorPrivado | null>(null);
  const [ciudades, setCiudades] = useState<CiudadCatalogoItem[]>([]);
  const [ciudad, setCiudad] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const cities = await catalogService.getCiudades();
      setCiudades(cities);
      try {
        const p = await userService.getPerfilTrabajador();
        setPerfil(p);
        setCiudad(String(p.ciudad_id ?? ""));
        setTitulo(p.titulo_profesional ?? "");
        setDescripcion(p.descripcion_profesional ?? "");
        setExperiencia(p.experiencia_resumen ?? "");
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) throw e;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar el perfil profesional.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    const v = perfilTrabajadorSchema.safeParse({ ciudad_id: ciudad, titulo_profesional: titulo, descripcion_profesional: descripcion, experiencia_resumen: experiencia });
    if (!v.success) { setError(v.error.issues[0]?.message ?? "Revisa los campos obligatorios."); return; }
    try {
      setSaving(true);
      setError(null);
      const p = perfil ? await userService.actualizarPerfilTrabajador(v.data) : await userService.crearPerfilTrabajador(v.data);
      setPerfil(p);
      setSuccess(perfil ? "Perfil profesional actualizado correctamente." : "Perfil profesional creado. Ya puedes publicar tus servicios.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible guardar el perfil profesional.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar/><main className="mx-auto max-w-3xl p-6"><h1 className="text-3xl font-extrabold">Perfil profesional</h1><p className="mt-1 text-sm text-slate-600">Esta información ayuda a las personas a conocer tu experiencia antes de solicitar un servicio.</p>{error&&<div className="mt-4"><ErrorAlert message={error}/></div>}{success&&<div role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</div>}<form onSubmit={save} className="mt-6 space-y-4 rounded-xl border bg-white p-6"><div><label className="text-sm font-semibold" htmlFor="ciudad_base">Ciudad base <span className="text-red-700">*</span></label><select id="ciudad_base" value={ciudad} onChange={e=>setCiudad(e.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="">Selecciona una ciudad</option>{ciudades.map(c=><option key={c.ciudad_id} value={c.ciudad_id}>{c.nombre}</option>)}</select><p className="mt-1 text-xs text-slate-500">Indica desde qué ciudad prestas principalmente tus servicios.</p></div><Input id="titulo_profesional" label="Título o especialidad" value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej. Técnico electricista residencial" required/><div><label className="text-sm font-semibold" htmlFor="descripcion_profesional">Presentación profesional <span className="text-red-700">*</span></label><textarea id="descripcion_profesional" value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border p-3 text-sm" placeholder="Cuenta qué servicios ofreces y qué te diferencia."/><p className="mt-1 text-xs text-slate-500">Evita compartir datos sensibles; esta información será visible en tu perfil.</p></div><div><label className="text-sm font-semibold" htmlFor="experiencia_resumen">Experiencia (opcional)</label><textarea id="experiencia_resumen" value={experiencia} onChange={e=>setExperiencia(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border p-3 text-sm" placeholder="Ej. 4 años de experiencia en instalaciones residenciales y comerciales."/></div><div className="flex flex-wrap items-center gap-3 border-t pt-4"><Button type="submit" disabled={saving}>{saving?"Guardando…":perfil?"Guardar cambios":"Crear perfil"}</Button>{perfil&&<a href="/trabajador/servicios" className="text-sm font-semibold text-blue-700">Ir a mis servicios →</a>}</div></form></main></div>;
}
