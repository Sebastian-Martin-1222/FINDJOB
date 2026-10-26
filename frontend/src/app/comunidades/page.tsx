"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Flame,
  Clock,
  Award,
  Plus,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Droplets,
  Zap,
  Key,
  Wrench,
  Hammer,
} from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { authStorage } from "@/lib/auth-storage";
import {
  communityService,
  COMMUNITIES_LIST,
  PostItem,
} from "@/services/community.service";

export default function ComunidadesPage() {
  const isAuth = authStorage.isAuthenticated();

  const [selectedCommunity, setSelectedCommunity] = useState<string>("todas");
  const [sortBy, setSortBy] = useState<"hot" | "new" | "top">("hot");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPosts = () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = communityService.getPosts(selectedCommunity, sortBy);
      setPosts(data);
    } catch {
      setError("No fue posible cargar las conversaciones de la comunidad.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedCommunity, sortBy]);

  const handleVote = (hiloId: number, delta: number) => {
    communityService.votePost(hiloId, delta);
    setPosts((prev) =>
      prev.map((p) => {
        if (p.hilo_id === hiloId) {
          return {
            ...p,
            upvotes: delta > 0 ? p.upvotes + 1 : p.upvotes,
            downvotes: delta < 0 ? p.downvotes + 1 : p.downvotes,
          };
        }
        return p;
      })
    );
  };

  const getCommunityIcon = (slug: string) => {
    switch (slug) {
      case "plomeria":
        return <Droplets className="h-4 w-4 text-[#1D4ED8]" />;
      case "electricidad":
        return <Zap className="h-4 w-4 text-[#D97706]" />;
      case "cerrajeria":
        return <Key className="h-4 w-4 text-[#059669]" />;
      case "redes-ti":
        return <Wrench className="h-4 w-4 text-[#1D4ED8]" />;
      case "carpinteria":
        return <Hammer className="h-4 w-4 text-[#8D4B00]" />;
      default:
        return <Users className="h-4 w-4 text-[#434655]" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      {isAuth ? <PrivateNavbar /> : <PublicNavbar />}

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner de Comunidades */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-[#EAEDFF] px-2.5 py-0.5 text-xs font-bold text-[#1D4ED8]">
                Plataforma de Foros Técnicos y Comunidades
              </span>
              <span className="text-xs text-[#059669] font-bold">
                ✓ Algoritmo Hot Ranking Decay
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Comunidades de Oficios y Servicios en Colombia
            </h1>
            <p className="mt-1 text-sm text-[#434655] max-w-2xl leading-relaxed">
              Resuelve dudas técnicas, comparte normativas y debate soluciones con profesionales del sector.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] transition-colors flex-shrink-0"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva publicación
          </button>
        </div>

        {/* Layout en dos columnas: Comunidades + Feed */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna Izquierda: Directorio de Comunidades */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#434655] mb-3">
                Canales Técnicos
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCommunity("todas")}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    selectedCommunity === "todas"
                      ? "bg-[#EAEDFF] text-[#1D4ED8]"
                      : "text-[#0F172A] hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Todas las comunidades</span>
                  </span>
                </button>

                {COMMUNITIES_LIST.map((comm) => (
                  <button
                    key={comm.slug}
                    onClick={() => setSelectedCommunity(comm.slug)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      selectedCommunity === comm.slug
                        ? "bg-[#EAEDFF] text-[#1D4ED8] font-bold"
                        : "text-[#0F172A] hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      {getCommunityIcon(comm.slug)}
                      <span className="truncate">{comm.nombre}</span>
                    </span>
                    <span className="text-[10px] text-[#434655] font-mono">
                      {comm.hilos_count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guía de Buenas Prácticas */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F2F3FF] p-4 text-xs text-[#434655]">
              <p className="font-bold text-[#0F172A] mb-1">Reglas del Foro</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Respeto mutuo y profesionalismo.</li>
                <li>Menciona normativa colombiana (NTC, RETIE).</li>
                <li>Sanitización estricta contra XSS.</li>
              </ul>
            </div>
          </aside>

          {/* Columna Derecha: Feed de Publicaciones */}
          <div className="lg:col-span-3 space-y-4">
            {/* Barra de Filtros (Hot Ranking, New, Top) */}
            <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-2.5 shadow-sm">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setSortBy("hot")}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    sortBy === "hot"
                      ? "bg-[#FEF3C7] text-[#8D4B00]"
                      : "text-[#434655] hover:bg-slate-100"
                  }`}
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Tendencia (Hot)</span>
                </button>

                <button
                  onClick={() => setSortBy("new")}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    sortBy === "new"
                      ? "bg-[#EAEDFF] text-[#1D4ED8]"
                      : "text-[#434655] hover:bg-slate-100"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Recientes</span>
                </button>

                <button
                  onClick={() => setSortBy("top")}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    sortBy === "top"
                      ? "bg-[#D1FAE5] text-[#00714E]"
                      : "text-[#434655] hover:bg-slate-100"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Más Votados</span>
                </button>
              </div>

              <span className="hidden sm:inline-block text-xs text-[#434655]">
                {posts.length} debates activos
              </span>
            </div>

            {/* Estados de UI: Loading */}
            {isLoading && (
              <div className="space-y-4">
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-36 w-full rounded-xl" />
                <Skeleton className="h-36 w-full rounded-xl" />
              </div>
            )}

            {/* Estados de UI: Error */}
            {error && !isLoading && (
              <ErrorAlert
                title="Error al cargar el foro"
                message={error}
                onRetry={loadPosts}
              />
            )}

            {/* Estados de UI: Empty */}
            {!isLoading && !error && posts.length === 0 && (
              <EmptyState
                title="No hay publicaciones en esta comunidad"
                description="Sé el primer profesional en abrir un debate o formular una pregunta técnica para tus colegas."
                actionLabel="Crear la primera publicación"
                onAction={() => setIsModalOpen(true)}
              />
            )}

            {/* Estados de UI: Success (Feed de Hilos) */}
            {!isLoading && !error && posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post) => (
                  <article
                    key={post.hilo_id}
                    className="flex flex-col sm:flex-row items-start rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all gap-4"
                  >
                    {/* Botones de Votación / Karma */}
                    <div className="flex sm:flex-col items-center justify-center rounded-lg bg-[#FAF8FF] p-2 border border-[#E2E8F0] space-x-2 sm:space-x-0 sm:space-y-1">
                      <button
                        onClick={() => handleVote(post.hilo_id, 1)}
                        className="rounded p-1 text-[#434655] hover:bg-white hover:text-[#059669] transition-colors"
                        title="Votar a favor"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <span className="font-mono text-xs font-bold text-[#0F172A]">
                        {post.upvotes - post.downvotes}
                      </span>
                      <button
                        onClick={() => handleVote(post.hilo_id, -1)}
                        className="rounded p-1 text-[#434655] hover:bg-white hover:text-[#BA1A1A] transition-colors"
                        title="Votar en contra"
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Contenido del Hilo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center space-x-1 rounded-full bg-[#EAEDFF] px-2.5 py-0.5 font-bold text-[#1D4ED8]">
                          {getCommunityIcon(post.comunidad_slug)}
                          <span>{post.comunidad_nombre}</span>
                        </span>
                        <span className="text-[#434655]">•</span>
                        <span className="font-semibold text-[#0F172A]">{post.autor_nombre}</span>
                        <span className="text-slate-400">({post.autor_rol})</span>
                        <span className="text-[#434655]">•</span>
                        <span className="text-slate-400">{post.fecha_creacion}</span>
                      </div>

                      <Link
                        href={`/comunidades/${post.comunidad_slug}/hilos/${post.hilo_id}`}
                        className="block mt-2"
                      >
                        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] hover:text-[#1D4ED8] transition-colors leading-snug">
                          {post.titulo}
                        </h2>
                      </Link>

                      {/* Snippet Sanitizado contra XSS */}
                      <p
                        className="mt-2 text-xs text-[#434655] line-clamp-2 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.contenido_sanitizado }}
                      />

                      {/* Tags y Comentarios */}
                      <div className="mt-4 flex flex-wrap items-center justify-between pt-3 border-t border-[#E2E8F0] gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-[#F2F3FF] px-2 py-0.5 text-[10px] font-semibold text-[#434655]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/comunidades/${post.comunidad_slug}/hilos/${post.hilo_id}`}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-[#1D4ED8] hover:underline"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{post.comentarios_count} respuestas</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Creación */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultCommunity={selectedCommunity !== "todas" ? selectedCommunity : "plomeria"}
        onPostCreated={(newPost) => {
          setPosts([newPost, ...posts]);
        }}
      />
    </div>
  );
}
