import React from "react";
import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D4ED8] text-white shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              FindJob<span className="text-[#1D4ED8]">.co</span>
            </span>
          </Link>
          <div className="hidden sm:flex items-center space-x-1 rounded-full bg-[#F2F3FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
            <MapPin className="h-3.5 w-3.5" />
            <span>Bogotá D.C., Chapinero</span>
          </div>
        </div>

        {/* Public navigation links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-[#434655]">
          <Link
            href="/servicios"
            className="transition-colors hover:text-[#1D4ED8]"
          >
            Explorar servicios
          </Link>
          <Link
            href="/como-funciona"
            className="transition-colors hover:text-[#1D4ED8]"
          >
            Cómo funciona
          </Link>
          <Link
            href="/trabajador/registro"
            className="transition-colors hover:text-[#1D4ED8]"
          >
            Ofrecer mis servicios
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white px-4 text-sm font-semibold text-[#0F172A] shadow-sm transition-colors hover:bg-[#F2F3FF]"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1D4ED8] px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1E40AF]"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}
