"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Search, Send } from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { chatService, ConversacionItem, MensajeItem } from "@/services/chat.service";
import { enviarMensajeSchema } from "@/schemas/chat.schema";
import { authStorage } from "@/lib/auth-storage";

function ConversacionesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const solicitudParam = searchParams.get("solicitud");
  const currentUser = authStorage.getUser();
  const [conversaciones, setConversaciones] = useState<ConversacionItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ConversacionItem | null>(null);
  const [mensajes, setMensajes] = useState<MensajeItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [inputTexto, setInputTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversaciones = useCallback(async () => {
    try {
      setLoadingChats(true); setError(null);
      const data = await chatService.getConversaciones(); setConversaciones(data);
      if (data.length) {
        const match = solicitudParam ? data.find((c) => c.solicitud_servicio_id === Number(solicitudParam)) : undefined;
        setSelectedChat((current) => match ?? data.find((c) => c.conversacion_id === current?.conversacion_id) ?? data[0]);
      } else setSelectedChat(null);
    } catch (err) { setError(err instanceof Error ? err.message : "No fue posible cargar tus conversaciones."); }
    finally { setLoadingChats(false); }
  }, [solicitudParam]);

  useEffect(() => { void fetchConversaciones(); }, [fetchConversaciones]);
  useEffect(() => {
    if (!selectedChat) { setMensajes([]); return; }
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingMessages(true); setMessageError(null);
        const data = await chatService.getMensajes(selectedChat.conversacion_id);
        if (cancelled) return;
        setMensajes(data);
        const unread = data.filter((m) => !m.leido && m.remitente_usuario_id !== currentUser?.usuario_id);
        await Promise.allSettled(unread.map((m) => chatService.marcarLeido(m.mensaje_id)));
        if (unread.length) void fetchConversaciones();
      } catch (err) { if (!cancelled) setMessageError(err instanceof Error ? err.message : "No fue posible cargar los mensajes."); }
      finally { if (!cancelled) setLoadingMessages(false); }
    };
    void load(); return () => { cancelled = true; };
  }, [selectedChat, currentUser?.usuario_id, fetchConversaciones]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensajes]);

  const filteredChats = useMemo(() => {
    const query = filterQuery.trim().toLowerCase();
    if (!query) return conversaciones;
    return conversaciones.filter((c) => (c.otro_participante_nombre ?? "").toLowerCase().includes(query) || (c.servicio_titulo ?? "").toLowerCase().includes(query));
  }, [conversaciones, filterQuery]);

  const handleEnviar = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selectedChat) return;
    const validation = enviarMensajeSchema.safeParse({ contenido: inputTexto });
    if (!validation.success) { setMessageError(validation.error.issues[0]?.message ?? "Revisa el mensaje."); return; }
    try {
      setSending(true); setMessageError(null);
      const nuevo = await chatService.enviarMensaje(selectedChat.conversacion_id, validation.data);
      setMensajes((prev) => [...prev, nuevo]); setInputTexto(""); void fetchConversaciones();
    } catch (err) { setMessageError(err instanceof Error ? err.message : "No fue posible enviar el mensaje."); }
    finally { setSending(false); }
  };

  return <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans"><PrivateNavbar /><main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
    <div className="mb-4"><h1 className="text-2xl font-extrabold">Mensajería</h1><p className="text-sm text-[#64748B]">Conversaciones habilitadas a partir de solicitudes aceptadas.</p></div>
    {loadingChats && <CardSkeleton />}
    {!loadingChats && error && <ErrorAlert title="Error de mensajería" message={error} onRetry={fetchConversaciones} />}
    {!loadingChats && !error && conversaciones.length === 0 && <EmptyState title="Aún no tienes conversaciones" description="El chat se habilita cuando una solicitud es aceptada." actionLabel="Explorar servicios" onAction={() => router.push("/servicios")} />}
    {!loadingChats && !error && conversaciones.length > 0 && <div className="grid md:grid-cols-12 bg-white border border-[#CBD5E1] rounded-xl overflow-hidden min-h-[620px]">
      <aside className="md:col-span-4 border-r border-[#E2E8F0]"><div className="p-3 border-b border-[#E2E8F0] relative"><Search className="absolute left-6 top-5 h-4 w-4 text-[#94A3B8]" /><input value={filterQuery} onChange={(e) => setFilterQuery(e.target.value)} placeholder="Buscar conversación" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] text-sm" /></div><div className="divide-y divide-[#E2E8F0]">{filteredChats.map((c) => <button key={c.conversacion_id} type="button" onClick={() => setSelectedChat(c)} className={`w-full text-left p-4 ${selectedChat?.conversacion_id === c.conversacion_id ? "bg-[#F2F3FF]" : "hover:bg-[#F8FAFC]"}`}><div className="flex items-center justify-between gap-2"><strong className="text-sm truncate">{c.otro_participante_nombre ?? "Participante"}</strong>{c.mensajes_no_leidos > 0 && <span className="rounded-full bg-[#1D4ED8] text-white text-xs px-2 py-0.5">{c.mensajes_no_leidos}</span>}</div>{c.servicio_titulo && <p className="text-xs text-[#1D4ED8] mt-1 truncate">{c.servicio_titulo}</p>}{c.ultimo_mensaje?.contenido && <p className="text-xs text-[#64748B] mt-2 truncate">{c.ultimo_mensaje.contenido}</p>}</button>)}</div></aside>
      <section className="md:col-span-8 flex flex-col min-h-[620px]">{selectedChat ? <><header className="p-4 border-b border-[#E2E8F0]"><h2 className="font-bold">{selectedChat.otro_participante_nombre ?? "Conversación"}</h2><p className="text-xs text-[#64748B]">{selectedChat.servicio_titulo ?? `Solicitud #${selectedChat.solicitud_servicio_id}`}</p></header><div className="flex-1 overflow-y-auto p-4 space-y-3">{loadingMessages && <CardSkeleton />}{messageError && <ErrorAlert title="Mensajería" message={messageError} />}{!loadingMessages && !messageError && mensajes.length === 0 && <div className="h-full flex items-center justify-center text-center text-[#64748B]"><div><MessageSquare className="h-10 w-10 mx-auto mb-2" /><p className="text-sm">Aún no hay mensajes. Inicia la conversación.</p></div></div>}{mensajes.map((m) => { const mine = m.remitente_usuario_id === currentUser?.usuario_id; return <div key={m.mensaje_id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] rounded-xl px-4 py-2 ${mine ? "bg-[#1D4ED8] text-white" : "bg-[#F1F5F9] text-[#0F172A]"}`}>{!mine && m.remitente_nombre && <p className="text-[11px] font-bold mb-1">{m.remitente_nombre}</p>}{m.contenido && <p className="text-sm whitespace-pre-wrap break-words">{m.contenido}</p>}<p className={`text-[10px] mt-1 ${mine ? "text-blue-100" : "text-[#64748B]"}`}>{new Date(m.enviado_en).toLocaleString("es-CO")}</p></div></div>; })}<div ref={messagesEndRef} /></div><div className="p-4 border-t border-[#E2E8F0]"><form onSubmit={handleEnviar} className="flex gap-2"><label htmlFor="chat-message" className="sr-only">Mensaje</label><textarea id="chat-message" rows={2} value={inputTexto} onChange={(e) => { setInputTexto(e.target.value); if (messageError) setMessageError(null); }} placeholder="Escribe un mensaje..." className="flex-1 rounded-lg border border-[#CBD5E1] p-3 text-sm resize-none" disabled={sending || Boolean(selectedChat.cerrada_en)} /><Button type="submit" disabled={sending || !inputTexto.trim() || Boolean(selectedChat.cerrada_en)}><Send className="h-4 w-4" /></Button></form><p className="mt-2 text-xs text-[#64748B]">Los adjuntos están deshabilitados hasta contar con un flujo de almacenamiento binario respaldado por el backend.</p></div></> : <div className="flex-1 flex items-center justify-center text-[#64748B]">Selecciona una conversación.</div>}</section>
    </div>}
  </main></div>;
}

export default function ConversacionesPage() { return <Suspense fallback={<div className="min-h-screen bg-[#FAF8FF]"><PrivateNavbar /><main className="max-w-7xl mx-auto p-6"><CardSkeleton /></main></div>}><ConversacionesContent /></Suspense>; }
