"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Users,
  ArrowRight,
  Droplets,
  Zap,
  Key,
  Wrench,
  Sparkles,
} from "lucide-react";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/servicios?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push("/servicios");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#E2E8F0] bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center space-x-2 rounded-full bg-[#EAEDFF] px-3.5 py-1 text-xs font-bold text-[#1D4ED8] mb-6">
              <Sparkles className="h-4 w-4" />
              <span>Marketplace de servicios en Colombia</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight max-w-4xl mx-auto leading-tight">
              Encuentra profesionales para tu hogar y empresa con{" "}
              <span className="text-[#1D4ED8]">gestión dentro de FindJob</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#434655] max-w-2xl mx-auto leading-relaxed">
              Conectamos personas con profesionales y centralizamos solicitudes, citas, mensajería, pagos, calificaciones y controles de seguridad para servicios presenciales.
            </p>

            {/* Buscador Central */}
            <form
              onSubmit={handleSearch}
              className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-[#CBD5E1] bg-white p-2 shadow-md"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="¿Qué servicio necesitas hoy? ej. Arreglo de fuga, cableado estructurado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 w-full pl-11 pr-4 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-lg bg-[#1D4ED8] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] transition-colors"
              >
                Buscar servicios
              </button>
            </form>

            {/* Badges de Confianza */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#434655]">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-[#059669]" />
                <span>Protocolo de Validación PIN</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                <span>Precios en Pesos Colombianos (COP)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Users className="h-4 w-4 text-[#1D4ED8]" />
                <span>Perfiles y calificaciones de servicio</span>
              </span>
            </div>
          </div>
        </section>

        {/* Categorías Principales */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F172A]">Categorías destacadas</h2>
              <p className="mt-1 text-sm text-[#434655]">
                Encuentra profesionales calificados por área técnica
              </p>
            </div>
            <Link
              href="/servicios"
              className="inline-flex items-center text-sm font-bold text-[#1D4ED8] hover:underline"
            >
              <span>Ver todas las categorías</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/servicios?categoria=plomeria"
              className="group rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#1D4ED8] group-hover:scale-105 transition-transform">
                <Droplets className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0F172A]">Plomería y Gas</h3>
              <p className="mt-1 text-xs text-[#434655]">
                Detección de fugas, mantenimiento de calentadores e instalación de tuberías.
              </p>
            </Link>

            <Link
              href="/servicios?categoria=electricidad"
              className="group rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#D97706] group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0F172A]">Instalaciones Eléctricas</h3>
              <p className="mt-1 text-xs text-[#434655]">
                Cuadros de control, iluminación LED, certificación RETIE y acometidas.
              </p>
            </Link>

            <Link
              href="/servicios?categoria=cerrajeria"
              className="group rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D1FAE5] text-[#059669] group-hover:scale-105 transition-transform">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0F172A]">Cerrajería de Seguridad</h3>
              <p className="mt-1 text-xs text-[#434655]">
                Cerraduras digitales, puertas blindadas y aperturas de emergencia.
              </p>
            </Link>

            <Link
              href="/servicios?categoria=tecnologia"
              className="group rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm hover:border-[#1D4ED8] hover:shadow-md transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAEDFF] text-[#1D4ED8] group-hover:scale-105 transition-transform">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#0F172A]">Redes y Soporte IT</h3>
              <p className="mt-1 text-xs text-[#434655]">
                Cableado estructurado, fibra óptica, cámaras CCTV y configuración de routers.
              </p>
            </Link>
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="border-y border-[#E2E8F0] bg-[#F2F3FF] py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">Cómo funciona</span>
              <h2 className="mt-2 text-2xl font-extrabold text-[#0F172A]">De la búsqueda a la gestión del servicio en pocos pasos</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border bg-white p-6"><p className="text-sm font-bold text-[#1D4ED8]">1. Explora o publica</p><p className="mt-2 text-sm text-[#434655]">Busca un servicio disponible o crea tu perfil profesional para empezar a ofrecer el tuyo.</p></div>
              <div className="rounded-xl border bg-white p-6"><p className="text-sm font-bold text-[#1D4ED8]">2. Coordina</p><p className="mt-2 text-sm text-[#434655]">Gestiona la solicitud, acuerda la modalidad y programa la cita desde FindJob.</p></div>
              <div className="rounded-xl border bg-white p-6"><p className="text-sm font-bold text-[#1D4ED8]">3. Finaliza y califica</p><p className="mt-2 text-sm text-[#434655]">Consulta el estado del servicio, registra el pago cuando corresponda y deja una calificación.</p></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
