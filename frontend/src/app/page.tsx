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
              <span>Marketplace Oficial de Servicios en Colombia</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight max-w-4xl mx-auto leading-tight">
              Profesionales calificados para tu hogar y empresa con{" "}
              <span className="text-[#1D4ED8]">seguridad garantizada</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#434655] max-w-2xl mx-auto leading-relaxed">
              Conectamos clientes con técnicos y especialistas en plomería, electricidad, cerrajería, tecnología y redes con validación de identidad y código PIN domiciliario.
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
                <span>Comunidades Técnicas Activas</span>
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

        {/* CTA Comunidades Técnicas */}
        <section className="py-12 bg-[#F2F3FF] border-y border-[#E2E8F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                Espacio de Colaboración
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-[#0F172A]">
                Comunidades y Foros Técnicos de FindJob
              </h2>
              <p className="mt-1 text-sm text-[#434655] max-w-xl">
                Participa en debates, comparte buenas prácticas de oficios calificados, califica soluciones y resuelve dudas técnicas en hilos de conversación en tiempo real.
              </p>
            </div>
            <Link
              href="/comunidades"
              className="inline-flex items-center rounded-lg bg-[#1D4ED8] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#1E40AF] transition-colors flex-shrink-0"
            >
              <Users className="mr-2 h-4 w-4" />
              Ingresar a las Comunidades
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
