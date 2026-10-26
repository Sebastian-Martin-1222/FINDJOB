"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Send,
} from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { authStorage } from "@/lib/auth-storage";
import {
  communityService,
  PostItem,
  CommentNode,
} from "@/services/community.service";
import { createCommentSchema } from "@/schemas/forum.schema";

export default function ThreadDetailPage() {
  const params = useParams();
  const isAuth = authStorage.isAuthenticated();

  const hiloId = Number(params.id);

  const [post, setPost] = useState<PostItem | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario de respuesta principal
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Respuesta a comentario específico (ltree)
  const [replyingToPath, setReplyingToPath] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const loadThreadData = () => {
    setIsLoading(true);
    setError(null);
    try {
      const p = communityService.getPostById(hiloId);
      if (!p) {
        setError("El hilo de conversación solicitado no fue encontrado.");
        return;
      }
      setPost(p);
      const c = communityService.getCommentsTree(hiloId);
      setComments(c);
    } catch {
      setError("Error al recuperar los detalles de la conversación.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThreadData();
  }, [hiloId]);

  const handleVote = (delta: number) => {
    if (!post) return;
    communityService.votePost(hiloId, delta);
    setPost({
      ...post,
      upvotes: delta > 0 ? post.upvotes + 1 : post.upvotes,
      downvotes: delta < 0 ? post.downvotes + 1 : post.downvotes,
    });
  };

  const handleCreateComment = (parentPath: string = "") => {
    const text = parentPath ? replyText : newCommentText;
    setCommentError(null);

    const validation = createCommentSchema.safeParse({
      hilo_id: hiloId,
      parent_path: parentPath,
      contenido: text,
    });

    if (!validation.success) {
      setCommentError(validation.error.issues[0]?.message || "Comentario inválido.");
      return;
    }

    setSubmittingComment(true);
    try {
      communityService.createComment(validation.data);
      // Recargar árbol de comentarios
      setComments(communityService.getCommentsTree(hiloId));
      if (parentPath) {
        setReplyingToPath(null);
        setReplyText("");
      } else {
        setNewCommentText("");
      }
      if (post) {
        setPost({ ...post, comentarios_count: post.comentarios_count + 1 });
      }
    } catch {
      setCommentError("No se pudo enviar el comentario. Intenta de nuevo.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Renderizado recursivo de árbol de comentarios anidados (ltree)
  const renderCommentNode = (node: CommentNode, depth: number = 0) => {
    return (
      <div
        key={node.comentario_id}
        className={`relative mt-4 ${
          depth > 0 ? "ml-4 sm:ml-8 border-l-2 border-[#E2E8F0] pl-4 sm:pl-6" : ""
        }`}
      >
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-[#0F172A]">{node.autor_nombre}</span>
              <span className="text-slate-400">({node.autor_rol})</span>
              <span className="text-[#434655]">•</span>
              <span className="text-slate-400">{node.fecha_creacion}</span>
              <span className="font-mono text-[10px] text-[#1D4ED8] bg-[#EAEDFF] px-1.5 py-0.2 rounded">
                path: {node.path}
              </span>
            </div>
            <span className="text-xs font-semibold text-[#059669]">
              +{node.upvotes} votos
            </span>
          </div>

          {/* Contenido sanitizado contra XSS */}
          <div
            className="mt-2 text-sm text-[#0F172A] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: node.contenido_sanitizado }}
          />

          {/* Botón de responder inline */}
          <div className="mt-3 flex items-center justify-end">
            <button
              onClick={() => {
                setReplyingToPath(replyingToPath === node.path ? null : node.path);
                setReplyText("");
              }}
              className="inline-flex items-center space-x-1 text-xs font-bold text-[#1D4ED8] hover:underline"
            >
              <CornerDownRight className="h-3 w-3" />
              <span>{replyingToPath === node.path ? "Cancelar" : "Responder"}</span>
            </button>
          </div>

          {/* Formulario Inline para sub-respuesta anidada */}
          {replyingToPath === node.path && (
            <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
              <textarea
                rows={2}
                placeholder={`Responder a ${node.autor_nombre}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReplyingToPath(null)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleCreateComment(node.path)}
                  isLoading={submittingComment}
                >
                  Responder
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Respuestas anidadas hijas */}
        {node.replies && node.replies.length > 0 && (
          <div className="space-y-2">
            {node.replies.map((child) => renderCommentNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      {isAuth ? <PrivateNavbar /> : <PublicNavbar />}

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Enlace Volver */}
        <Link
          href="/comunidades"
          className="inline-flex items-center text-xs font-bold text-[#1D4ED8] hover:underline mb-6"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Volver a las Comunidades
        </Link>

        {/* Estados de UI: Loading */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        )}

        {/* Estados de UI: Error */}
        {error && !isLoading && (
          <ErrorAlert
            title="Conversación no disponible"
            message={error}
            onRetry={loadThreadData}
          />
        )}

        {/* Estados de UI: Success (Post + Comments Tree) */}
        {!isLoading && !error && post && (
          <div className="space-y-8">
            {/* Tarjeta Principal del Hilo */}
            <article className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center space-x-2 text-xs text-[#434655]">
                <span className="rounded-full bg-[#EAEDFF] px-2.5 py-0.5 font-bold text-[#1D4ED8]">
                  {post.comunidad_nombre}
                </span>
                <span>•</span>
                <span className="font-semibold text-[#0F172A]">{post.autor_nombre}</span>
                <span className="text-slate-400">({post.autor_rol})</span>
                <span>•</span>
                <span>{post.fecha_creacion}</span>
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight leading-snug">
                {post.titulo}
              </h1>

              {/* Contenido Sanitizado con DOMPurify */}
              <div
                className="mt-5 prose prose-slate max-w-none text-sm text-[#0F172A] leading-relaxed border-y border-[#E2E8F0] py-5"
                dangerouslySetInnerHTML={{ __html: post.contenido_sanitizado }}
              />

              {/* Tags y Votación */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-[#F2F3FF] px-2.5 py-1 text-xs font-semibold text-[#434655]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-[#FAF8FF] px-3 py-1 space-x-2">
                    <button
                      onClick={() => handleVote(1)}
                      className="text-[#434655] hover:text-[#059669]"
                      title="Votar a favor"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-xs font-bold text-[#0F172A]">
                      {post.upvotes - post.downvotes}
                    </span>
                    <button
                      onClick={() => handleVote(-1)}
                      className="text-[#434655] hover:text-[#BA1A1A]"
                      title="Votar en contra"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-[#434655]">
                    Hot Score: <strong>{post.hot_score}</strong>
                  </span>
                </div>
              </div>
            </article>

            {/* Sección de Comentarios Anidados (ltree) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0F172A]">
                  Respuestas Técnicas ({post.comentarios_count})
                </h2>
                <span className="text-xs text-[#059669] font-bold">
                  ✓ Estructura de árbol jerárquica ltree
                </span>
              </div>

              {/* Caja de Respuesta Principal */}
              <div className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-sm">
                <h3 className="text-sm font-bold text-[#0F172A] mb-2">
                  Aportar solución o comentario técnico
                </h3>
                {commentError && (
                  <p className="mb-2 text-xs text-[#BA1A1A] font-semibold">{commentError}</p>
                )}
                <textarea
                  rows={3}
                  placeholder="Escribe una respuesta fundamentada con buenas prácticas, marcas o normativa..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => handleCreateComment("")}
                    isLoading={submittingComment}
                  >
                    <Send className="mr-1.5 h-4 w-4" />
                    Publicar comentario
                  </Button>
                </div>
              </div>

              {/* Lista de Comentarios (Árbol) */}
              {comments.length === 0 ? (
                <EmptyState
                  title="Aún no hay respuestas en este debate"
                  description="Sé el primer colega en responder a esta consulta técnica."
                />
              ) : (
                <div className="space-y-4">
                  {comments.map((rootNode) => renderCommentNode(rootNode, 0))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
