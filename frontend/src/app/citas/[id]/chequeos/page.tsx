"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService, ChequeoSeguridadItem } from "@/services/marketplace.service";

export default function ChequeosPage(){
  const {id}=useParams<{id:string}>(); const [items,setItems]=useState<ChequeoSeguridadItem[]>([]); const [error,setError]=useState<string|null>(null); const [busy,setBusy]=useState<string|null>(null);
  const load=useCallback(async()=>{try{setError(null);setItems(await marketplaceService.getChequeosCita(id))}catch(e){setError(e instanceof Error?e.message:"No fue posible cargar los chequeos.")}},[id]); useEffect(()=>{void load()},[load]);
  const pending=useMemo(()=>items.flatMap(ch=>ch.preguntas.filter(p=>!ch.respuestas.some(r=>r.pregunta_seguridad_id===p.pregunta_seguridad_id)).map(p=>({ch,p}))),[items]);
  async function answer(chId:number,pId:number,ok:boolean){const key=`${chId}-${pId}`;try{setBusy(key);setError(null);await marketplaceService.responderChequeo(chId,{pregunta_seguridad_id:pId,respuesta_ok:ok,comentario:""});await load()}catch(e){setError(e instanceof Error?e.message:"No fue posible registrar la respuesta.")}finally{setBusy(null)}}
  return <div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar/><main className="mx-auto max-w-3xl p-6 space-y-5"><div><h1 className="text-2xl font-bold">Chequeos de seguridad</h1><p className="text-sm text-slate-600">Solo aplican a citas presenciales.</p></div>{error&&<ErrorAlert message={error} onRetry={load}/>} {items.length===0?<div className="rounded-xl border bg-white p-5 text-slate-500">No hay chequeos generados para esta cita.</div>:<>{pending.map(({ch,p})=><article key={`${ch.chequeo_seguridad_id}-${p.pregunta_seguridad_id}`} className="rounded-xl border bg-white p-5"><p className="font-semibold">{p.texto}</p><div className="mt-3 flex gap-2"><Button size="sm" disabled={busy!==null} onClick={()=>answer(ch.chequeo_seguridad_id,p.pregunta_seguridad_id,true)}>Sí, todo bien</Button><Button size="sm" variant="danger" disabled={busy!==null} onClick={()=>answer(ch.chequeo_seguridad_id,p.pregunta_seguridad_id,false)}>No</Button></div></article>)}{items.flatMap(ch=>ch.respuestas).map((r,i)=><article key={`${r.chequeo_seguridad_id}-${r.pregunta_seguridad_id}-${i}`} className="rounded-xl border bg-white p-4 text-sm"><strong>{r.pregunta_texto||`Pregunta #${r.pregunta_seguridad_id}`}</strong><p className={r.respuesta_ok?"text-emerald-700":"text-red-700"}>{r.respuesta_ok?"Respuesta positiva":"Respuesta negativa"}</p><p className="text-xs text-slate-500">{new Date(r.respondido_en).toLocaleString("es-CO")}</p></article>)}</>}</main></div>
}
