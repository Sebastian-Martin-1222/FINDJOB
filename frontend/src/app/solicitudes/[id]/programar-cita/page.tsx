"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { marketplaceService, SolicitudItem } from "@/services/marketplace.service";
import { programarCitaSchema } from "@/schemas/marketplace.schema";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities, getDefaultPrivateRoute } from "@/lib/access-control";

export default function ProgramarCitaPage() {
  const params = useParams(); const router = useRouter(); const id = String(params?.id ?? "");
  const user = authStorage.getUser();
  const canSchedule = getAccessCapabilities(user).canProvideServices;
  const [solicitud,setSolicitud]=useState<SolicitudItem|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState<string|null>(null);
  const [fechaInicio,setFechaInicio]=useState(""); const [fechaFin,setFechaFin]=useState(""); const [plataforma,setPlataforma]=useState(""); const [enlace,setEnlace]=useState("");
  const [formErrors,setFormErrors]=useState<Record<string,string>>({}); const [submitting,setSubmitting]=useState(false);

  const load=useCallback(async()=>{try{setLoading(true);setError(null);const data=await marketplaceService.getSolicitudById(id);setSolicitud(data);if(data.fecha_propuesta){const base=data.fecha_propuesta.slice(0,16);setFechaInicio(base);const dt=new Date(data.fecha_propuesta);if(!Number.isNaN(dt.getTime())){dt.setHours(dt.getHours()+2);setFechaFin(dt.toISOString().slice(0,16));}}if(data.plataforma_remota)setPlataforma(data.plataforma_remota);}catch(err){setError(err instanceof Error?err.message:"No se pudo cargar la solicitud.");}finally{setLoading(false);}},[id]);
  useEffect(()=>{if(!canSchedule){router.replace(getDefaultPrivateRoute(user));return;} if(id)void load();},[canSchedule,id,load,router,user]);

  const handleSubmit=async(e:React.FormEvent)=>{e.preventDefault();setFormErrors({});setError(null);if(!solicitud)return;
    const presencial=solicitud.modalidad_codigo==="PRESENCIAL";
    const payload={direccion_id:presencial?solicitud.direccion_id:null,fecha_inicio:fechaInicio,fecha_fin:fechaFin||null,plataforma_remota:presencial?null:(plataforma.trim()||null),enlace_reunion:presencial?null:(enlace.trim()||null)};
    const validation=programarCitaSchema.safeParse(payload);if(!validation.success){const errors:Record<string,string>={};validation.error.issues.forEach(i=>{errors[String(i.path[0]??"general")]=i.message;});setFormErrors(errors);return;}
    if(fechaFin&&new Date(fechaFin)<=new Date(fechaInicio)){setFormErrors({fecha_fin:"La fecha de fin debe ser posterior al inicio."});return;}
    try{setSubmitting(true);const cita=await marketplaceService.programarCita(id,validation.data);router.push(`/citas/${cita.cita_id}`);}catch(err){setError(err instanceof Error?err.message:"No fue posible programar la cita.");}finally{setSubmitting(false);}
  };

  if(!canSchedule)return null;

  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar/><main className="mx-auto max-w-3xl p-6"><Link href={`/solicitudes/${id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#64748B]"><ArrowLeft className="h-4 w-4"/>Volver a la solicitud</Link>
    {loading&&<div className="mt-6"><CardSkeleton/></div>}{!loading&&error&&!solicitud&&<div className="mt-6"><ErrorAlert title="Error" message={error} onRetry={load}/></div>}
    {!loading&&solicitud&&<section className="mt-6 rounded-xl border bg-white p-6 shadow-sm"><h1 className="text-2xl font-extrabold">Programar cita</h1><p className="mt-1 text-sm text-[#64748B]">{solicitud.servicio_titulo??`Solicitud #${solicitud.solicitud_servicio_id}`} · {solicitud.modalidad_nombre??solicitud.modalidad_codigo}</p>{error&&<div className="mt-4"><ErrorAlert title="No se pudo programar" message={error}/></div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Input id="fecha_inicio" label="Inicio *" type="datetime-local" value={fechaInicio} onChange={e=>setFechaInicio(e.target.value)} error={formErrors.fecha_inicio} required/><Input id="fecha_fin" label="Fin estimado" type="datetime-local" value={fechaFin} onChange={e=>setFechaFin(e.target.value)} error={formErrors.fecha_fin}/></div>
        {solicitud.modalidad_codigo==="PRESENCIAL"?<div className="rounded-lg bg-[#F8FAFC] p-4 text-sm"><strong>Dirección:</strong> {solicitud.direccion_texto??"Dirección registrada por el solicitante"}</div>:<div className="grid gap-4 sm:grid-cols-2"><Input id="plataforma" label="Plataforma remota" value={plataforma} onChange={e=>setPlataforma(e.target.value)} error={formErrors.plataforma_remota}/><Input id="enlace" label="Enlace de reunión" type="url" value={enlace} onChange={e=>setEnlace(e.target.value)} error={formErrors.enlace_reunion}/></div>}
        <div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="outline" onClick={()=>router.push(`/solicitudes/${id}`)} disabled={submitting}>Cancelar</Button><Button type="submit" disabled={submitting}>{submitting?"Programando…":"Programar cita"}</Button></div>
      </form></section>}
  </main></div>;
}
