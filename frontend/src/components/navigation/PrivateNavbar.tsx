"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Briefcase,
  LogOut,
  Repeat,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { authStorage } from "@/lib/auth-storage";
import { LogoutModal } from "@/components/auth/LogoutModal";

export function PrivateNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = authStorage.getUser();

  const isWorkerPath = pathname.startsWith("/trabajador");
  const isWorkerRole = user?.roles?.includes("TRABAJADOR") ?? false;
  const isWorkerMode = isWorkerPath || isWorkerRole;

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleRoleMode = () => {
    if (isWorkerMode) {
      router.push("/dashboard");
    } else {
      router.push("/trabajador/dashboard");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Mode Badge */}
          <div className="flex items-center space-x-3">
            <Link
              href={isWorkerMode ? "/trabajador/dashboard" : "/dashboard"}
              className="flex items-center space-x-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D4ED8] text-white shadow-sm">
                <Briefcase className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
                FindJob<span className="text-[#1D4ED8]">.co</span>
              </span>
            </Link>

            <span
              className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                isWorkerMode
                  ? "bg-[#D1FAE5] text-[#00714E]"
                  : "bg-[#DBEAFE] text-[#0039B5]"
              }`}
            >
              {isWorkerMode ? "Panel Profesional" : "Espacio Cliente"}
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-semibold text-[#434655]">
            {!isWorkerMode ? (
              <>
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-[#1D4ED8] ${
                    pathname === "/dashboard" ? "text-[#1D4ED8]" : ""
                  }`}
                >
                  Mi Panel
                </Link>
                <Link
                  href="/servicios"
                  className={`transition-colors hover:text-[#1D4ED8] ${
                    pathname === "/servicios" ? "text-[#1D4ED8]" : ""
                  }`}
                >
                  Explorar Servicios
                </Link>
                <Link
                  href="/comunidades"
                  className={`transition-colors hover:text-[#1D4ED8] ${
                    pathname.startsWith("/comunidades") ? "text-[#1D4ED8]" : ""
                  }`}
                >
                  Comunidades
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/trabajador/dashboard"
                  className={`transition-colors hover:text-[#1D4ED8] ${
                    pathname === "/trabajador/dashboard" ? "text-[#1D4ED8]" : ""
                  }`}
                >
                  Resumen
                </Link>
                <Link
                  href="/trabajador/servicios"
                  className={`transition-colors hover:text-[#1D4ED8] ${
                    pathname === "/trabajador/servicios" ? "text-[#1D4ED8]" : ""
                  }`}
                >
                  Mis Servicios
                </Link>
                <Link
                  href="/comunidades"
                  className={`transition-colors hover:text-[#1D4ED8] ${
                    pathname.startsWith("/comunidades") ? "text-[#1D4ED8]" : ""
                  }`}
                >
                  Foros Técnicos
                </Link>
              </>
            )}
          </nav>

          {/* Right Area: Role Switcher & User Profile */}
          <div className="flex items-center space-x-3">
            {/* Role Mode Switcher */}
            <button
              onClick={toggleRoleMode}
              title="Cambiar entre modo cliente y modo profesional"
              className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg border border-[#CBD5E1] bg-[#F2F3FF] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition-colors hover:bg-[#EAEDFF]"
            >
              <Repeat className="h-3.5 w-3.5" />
              <span>{isWorkerMode ? "Modo Cliente" : "Modo Profesional"}</span>
            </button>

            {/* User Avatar with Verification Badge */}
            <div className="flex items-center space-x-2 pl-2 border-l border-[#E2E8F0]">
              <div className="relative">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEDFF] text-sm font-bold text-[#1D4ED8]">
                  {user?.nombres ? user.nombres[0] : "U"}
                </div>
                <CheckCircle className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-white text-[#059669]" />
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold text-[#0F172A] leading-tight">
                  {user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : "Usuario FindJob"}
                </p>
                <p className="text-[#434655] capitalize">
                  {user?.roles?.[0]?.toLowerCase() || "Verificado"}
                </p>
              </div>
            </div>

            {/* Logout Trigger */}
            <button
              onClick={() => setIsLogoutOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/30"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#0F172A]"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-2">
            <Link
              href={isWorkerMode ? "/trabajador/dashboard" : "/dashboard"}
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mi Panel
            </Link>
            <Link
              href="/servicios"
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorar Servicios
            </Link>
            <Link
              href="/comunidades"
              className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Comunidades y Foros
            </Link>
            <button
              onClick={() => {
                toggleRoleMode();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-[#1D4ED8] hover:bg-[#F2F3FF]"
            >
              Cambiar a {isWorkerMode ? "Modo Cliente" : "Modo Profesional"}
            </button>
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal (AUTH_CerrarSesion) */}
      <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
    </>
  );
}
