"use client";

import React, { useState } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { createPostSchema } from "@/schemas/forum.schema";
import { communityService, COMMUNITIES_LIST, PostItem } from "@/services/community.service";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: PostItem) => void;
  defaultCommunity?: string;
}

export function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
  defaultCommunity = "plomeria",
}: CreatePostModalProps) {
  const [titulo, setTitulo] = useState("");
  const [comunidadSlug, setComunidadSlug] = useState(defaultCommunity);
  const [contenido, setContenido] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Validación defensiva con Zod
    const validation = createPostSchema.safeParse({
      titulo,
      comunidad_slug: comunidadSlug,
      contenido_markdown: contenido,
      tags,
    });

    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        errs[String(err.path[0])] = err.message;
      });
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const created = communityService.createPost(validation.data);
      onPostCreated(created);
      onClose();
      // Reset
      setTitulo("");
      setContenido("");
      setTagsInput("");
    } catch {
      setErrorMessage("No fue posible publicar el hilo. Verifica los datos e intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#CBD5E1] bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAEDFF] text-[#1D4ED8]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Crear nuevo hilo de debate</h3>
              <p className="text-xs text-[#434655]">
                Comparte una pregunta técnica, caso de éxito o consulta de normativa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4">
            <ErrorAlert
              title="Error al crear publicación"
              message={errorMessage}
              onRetry={() => setErrorMessage(null)}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          {/* Comunidad */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A]">
              Comunidad Técnica
            </label>
            <select
              value={comunidadSlug}
              onChange={(e) => setComunidadSlug(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            >
              {COMMUNITIES_LIST.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <Input
            id="titulo"
            label="Título de la publicación"
            placeholder="ej. ¿Cuál es la forma correcta de purgar tubería antes de la prueba hidrostática?"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            error={fieldErrors.titulo}
            disabled={isLoading}
            required
          />

          {/* Contenido Markdown */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A]">
              Descripción o consulta técnica
            </label>
            <textarea
              rows={5}
              placeholder="Escribe los detalles de tu consulta, contexto de obra, ciudad o materiales involucrados..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              disabled={isLoading}
              className={`mt-1.5 w-full rounded-lg border p-3.5 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors.contenido_markdown
                  ? "border-[#BA1A1A] focus:ring-[#BA1A1A]"
                  : "border-[#CBD5E1] focus:ring-[#1D4ED8]"
              }`}
            />
            {fieldErrors.contenido_markdown && (
              <p className="mt-1 text-xs text-[#BA1A1A] font-semibold">
                {fieldErrors.contenido_markdown}
              </p>
            )}
          </div>

          {/* Tags */}
          <Input
            id="tags"
            label="Etiquetas (separadas por comas)"
            placeholder="ej. NTC, Presión, CPVC, Fugas"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            error={fieldErrors.tags}
            disabled={isLoading}
          />

          <div className="pt-2 flex justify-end gap-2.5 border-t border-[#E2E8F0]">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
            >
              <Send className="mr-1.5 h-4 w-4" />
              Publicar hilo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
