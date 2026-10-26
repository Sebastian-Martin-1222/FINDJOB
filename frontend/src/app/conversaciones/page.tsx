"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Paperclip,
  Check,
  CheckCheck,
  Search,
  ShieldCheck,
  FileText,
  X,
} from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import {
  chatService,
  ConversacionItem,
  MensajeItem,
} from "@/services/chat.service";
import { enviarMensajeSchema, adjuntoSchema } from "@/schemas/chat.schema";

function ConversacionesContent() {
  const searchParams = useSearchParams();
  const solicitudParam = searchParams.get("solicitud");

  const [conversaciones, setConversaciones] = useState<ConversacionItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<ConversacionItem | null>(null);
  const [mensajes, setMensajes] = useState<MensajeItem[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form input
  const [inputTexto, setInputTexto] = useState("");
  const [sending, setSending] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");

  // Attachment Modal
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [attachName, setAttachName] = useState("");
  const [attachUrl, setAttachUrl] = useState("");
  const [attachType, setAttachType] = useState("application/pdf");
  const [attaching, setAttaching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar lista de conversaciones
  const fetchConversaciones = async () => {
    try {
      setLoadingChats(true);
      setError(null);
      const data = await chatService.getConversaciones();
      setConversaciones(data);

      if (data.length > 0) {
        // Si viene con query param ?solicitud=X buscar coincidencia
        if (solicitudParam) {
          const match = data.find((c) => c.solicitud_id === Number(solicitudParam));
          setSelectedChat(match || data[0]);
        } else {
          setSelectedChat(data[0]);
        }
      }
    } catch {
      setError("No fue posible cargar tus conversaciones de chat.");
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchConversaciones();
  }, [solicitudParam]);

  // 2. Cargar mensajes del chat seleccionado
  useEffect(() => {
    async function fetchMensajes() {
      if (!selectedChat) return;
      try {
        setLoadingMessages(true);
        const data = await chatService.getMensajes(selectedChat.id);
        setMensajes(data);
      } catch {
        // error silencioso o fallback
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchMensajes();
  }, [selectedChat]);

  // Auto scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  // Enviar Mensaje
  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !inputTexto.trim()) return;

    const validation = enviarMensajeSchema.safeParse({ contenido: inputTexto });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setSending(true);
      const nuevo = await chatService.enviarMensaje(selectedChat.id, validation.data);
      setMensajes((prev) => [...prev, nuevo]);
      setInputTexto("");
    } catch {
      alert("Error al enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  // Enviar Adjunto
  const handleEnviarAdjunto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat) return;

    const payload = {
      nombre_archivo: attachName,
      tipo_mime: attachType,
      tamano_bytes: 1024 * 500, // 500 KB simulados
      storage_url: attachUrl,
    };

    const validation = adjuntoSchema.safeParse(payload);
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setAttaching(true);
      const nuevo = await chatService.adjuntarArchivo(selectedChat.id, validation.data);
      setMensajes((prev) => [...prev, nuevo]);
      setAttachModalOpen(false);
      setAttachName("");
      setAttachUrl("");
    } catch {
      alert("Error al adjuntar archivo.");
    } finally {
      setAttaching(false);
    }
  };

  const filteredChats = conversaciones.filter((c) =>
    c.otro_participante_nombre.toLowerCase().includes(filterQuery.toLowerCase()) ||
    c.servicio_titulo.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Header Breadcrumb */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
              Mensajería Privada
            </h1>
            <p className="text-xs text-[#434655]">
              Coordinación interna para solicitudes aceptadas en FindJob Colombia.
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-1 text-xs text-[#059669] font-bold bg-[#D1FAE5] px-3 py-1 rounded-full">
            <ShieldCheck className="h-4 w-4" />
            <span>Chat Seguro Cifrado</span>
          </div>
        </div>

        {/* 1. LOADING STATE */}
        {loadingChats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            <CardSkeleton />
            <div className="md:col-span-2">
              <CardSkeleton />
            </div>
          </div>
        )}

        {/* 2. ERROR STATE */}
        {!loadingChats && error && (
          <div className="max-w-2xl mx-auto my-12">
            <ErrorAlert title="Error de mensajería" message={error} onRetry={fetchConversaciones} />
          </div>
        )}

        {/* 3. EMPTY STATE */}
        {!loadingChats && !error && conversaciones.length === 0 && (
          <EmptyState
            title="Aún no tienes conversaciones activas"
            description="El chat se activa automáticamente cuando un profesional acepta tu solicitud de servicio o cuando aceptas una solicitud como trabajador."
            actionLabel="Explorar servicios"
            onAction={() => (window.location.href = "/servicios")}
          />
        )}

        {/* 4. SUCCESS STATE: Master-Detail Interface */}
        {!loadingChats && !error && conversaciones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 bg-white rounded-2xl border border-[#CBD5E1] shadow-sm overflow-hidden min-h-[600px]">
            {/* Panel Izquierdo: Lista de Conversaciones (md:col-span-4) */}
            <div className="md:col-span-4 border-r border-[#E2E8F0] flex flex-col">
              {/* Buscador de Chats */}
              <div className="p-3 border-b border-[#E2E8F0]">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Buscar por nombre o servicio..."
                    className="w-full rounded-lg bg-[#FAF8FF] border border-[#CBD5E1] pl-9 pr-3 py-1.5 text-xs text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none"
                  />
                </div>
              </div>

              {/* Lista Scrollable */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E2E8F0]/60">
                {filteredChats.map((c) => {
                  const isSelected = selectedChat?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChat(c)}
                      className={`w-full text-left p-3.5 transition-colors flex items-start space-x-3 ${
                        isSelected
                          ? "bg-[#F2F3FF] border-l-4 border-l-[#1D4ED8]"
                          : "hover:bg-[#FAF8FF]"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-[#1D4ED8] text-white flex-shrink-0 flex items-center justify-center font-bold text-sm">
                        {c.otro_participante_nombre[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#0F172A] truncate">
                            {c.otro_participante_nombre}
                          </p>
                          {c.mensajes_no_leidos > 0 && (
                            <span className="h-4 w-4 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold flex items-center justify-center">
                              {c.mensajes_no_leidos}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-medium text-[#1D4ED8] truncate mt-0.5">
                          {c.servicio_titulo}
                        </p>
                        <p className="text-[11px] text-[#434655] truncate mt-1">
                          {c.ultimo_mensaje || "Nueva conversación iniciada"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Panel Derecho: Hilo de Mensajes Activo (md:col-span-8) */}
            <div className="md:col-span-8 flex flex-col justify-between">
              {selectedChat ? (
                <>
                  {/* Header del Chat */}
                  <div className="p-4 border-b border-[#E2E8F0] bg-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-[#059669] text-white flex items-center justify-center font-bold text-sm">
                        {selectedChat.otro_participante_nombre[0]}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-sm font-extrabold text-[#0F172A]">
                            {selectedChat.otro_participante_nombre}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FAF8FF] border border-[#CBD5E1] text-[#434655]">
                            {selectedChat.otro_participante_rol}
                          </span>
                        </div>
                        <p className="text-xs text-[#434655] truncate">
                          Servicio: {selectedChat.servicio_titulo}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/solicitudes`}
                      className="text-xs font-bold text-[#1D4ED8] hover:underline"
                    >
                      Ver Solicitud #{selectedChat.solicitud_id}
                    </Link>
                  </div>

                  {/* Cuerpo del Hilo de Mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF8FF]/50 max-h-[480px]">
                    {loadingMessages ? (
                      <div className="space-y-3">
                        <div className="h-12 w-48 bg-slate-200 animate-pulse rounded-2xl" />
                        <div className="h-12 w-64 bg-blue-100 animate-pulse rounded-2xl ml-auto" />
                      </div>
                    ) : mensajes.length === 0 ? (
                      <div className="text-center py-16 text-xs text-[#434655]">
                        <MessageSquare className="h-8 w-8 mx-auto text-[#CBD5E1] mb-2" />
                        <p>No hay mensajes en esta conversación aún.</p>
                        <p>Escribe tu primer mensaje para coordinar detalles.</p>
                      </div>
                    ) : (
                      mensajes.map((msg) => {
                        const isMe = msg.remitente_nombre === "Yo" || msg.remitente_id === 1;
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`max-w-sm sm:max-w-md rounded-2xl p-3.5 text-xs shadow-sm ${
                                isMe
                                  ? "bg-[#1D4ED8] text-white rounded-br-xs"
                                  : "bg-white text-[#0F172A] border border-[#CBD5E1] rounded-bl-xs"
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.contenido}</p>

                              {/* Adjunto si existe */}
                              {msg.adjunto && (
                                <a
                                  href={msg.adjunto.url_descarga}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`mt-2 flex items-center space-x-2 p-2 rounded-lg border text-xs ${
                                    isMe
                                      ? "bg-[#1E40AF] border-[#60A5FA] text-white"
                                      : "bg-[#F2F3FF] border-[#CBD5E1] text-[#1D4ED8]"
                                  }`}
                                >
                                  <FileText className="h-4 w-4 flex-shrink-0" />
                                  <span className="truncate">{msg.adjunto.nombre_archivo}</span>
                                </a>
                              )}
                            </div>

                            <div className="flex items-center space-x-1 text-[10px] text-[#94A3B8] mt-1 px-1">
                              <span>
                                {new Date(msg.fecha_envio).toLocaleTimeString("es-CO", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && (
                                <span>
                                  {msg.leido ? (
                                    <CheckCheck className="h-3 w-3 text-[#059669]" />
                                  ) : (
                                    <Check className="h-3 w-3 text-[#94A3B8]" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de Envío */}
                  <div className="p-3 border-t border-[#E2E8F0] bg-white">
                    <form onSubmit={handleEnviar} className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setAttachModalOpen(true)}
                        className="p-2 rounded-lg text-[#434655] hover:bg-[#F2F3FF] transition-colors"
                        title="Adjuntar archivo o imagen"
                      >
                        <Paperclip className="h-4 w-4" />
                      </button>

                      <input
                        type="text"
                        value={inputTexto}
                        onChange={(e) => setInputTexto(e.target.value)}
                        placeholder="Escribe un mensaje de coordinación..."
                        className="flex-1 rounded-lg border border-[#CBD5E1] px-3.5 py-2 text-xs text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none"
                      />

                      <Button
                        type="submit"
                        size="sm"
                        disabled={sending || !inputTexto.trim()}
                        className="h-9 px-4 flex items-center space-x-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Enviar</span>
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#434655]">
                  Selecciona una conversación del panel izquierdo para comenzar.
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL ADJUNTAR ARCHIVO (CHAT_AdjuntarArchivo) */}
        {attachModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#CBD5E1]">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-4">
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  Adjuntar Archivo al Chat
                </h3>
                <button
                  onClick={() => setAttachModalOpen(false)}
                  className="p-1 rounded text-[#434655] hover:bg-[#F2F3FF]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleEnviarAdjunto} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Nombre del archivo *
                  </label>
                  <input
                    type="text"
                    value={attachName}
                    onChange={(e) => setAttachName(e.target.value)}
                    placeholder="Ej: requerimientos_arquitectura.pdf"
                    className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs focus:border-[#1D4ED8] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    Tipo de contenido *
                  </label>
                  <select
                    value={attachType}
                    onChange={(e) => setAttachType(e.target.value)}
                    className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs focus:border-[#1D4ED8] focus:outline-none"
                  >
                    <option value="application/pdf">Documento PDF</option>
                    <option value="image/jpeg">Imagen JPEG</option>
                    <option value="image/png">Imagen PNG</option>
                    <option value="image/webp">Imagen WEBP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0F172A] mb-1">
                    URL de referencia en Cloud Storage *
                  </label>
                  <input
                    type="url"
                    value={attachUrl}
                    onChange={(e) => setAttachUrl(e.target.value)}
                    placeholder="https://storage.googleapis.com/findjob-docs/archivo.pdf"
                    className="w-full rounded-lg border border-[#CBD5E1] p-2 text-xs focus:border-[#1D4ED8] focus:outline-none"
                    required
                  />
                  <p className="text-[10px] text-[#94A3B8] mt-1">
                    Los binarios se conservan en Google Cloud Storage; PostgreSQL almacena los metadatos.
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E2E8F0]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAttachModalOpen(false)}
                    disabled={attaching}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" disabled={attaching}>
                    {attaching ? "Adjuntando..." : "Adjuntar y Enviar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ConversacionesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center p-8">
          <div className="max-w-md w-full">
            <CardSkeleton />
          </div>
        </div>
      }
    >
      <ConversacionesContent />
    </Suspense>
  );
}
