"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Briefcase, LogOut, Repeat, Menu, X, User } from "lucide-react";
import { authStorage } from "@/lib/auth-storage";
import { LogoutModal } from "@/components/auth/LogoutModal";
import { getAccessCapabilities, getDefaultPrivateRoute } from "@/lib/access-control";

export function PrivateNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = authStorage.getUser();
  const access = getAccessCapabilities(user);
  const isProviderArea = pathname.startsWith("/trabajador");
  const providerContext = isProviderArea || (!access.canContractServices && access.canProvideServices);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canSwitchWorkspace = access.canContractServices && access.canProvideServices;

  const switchWorkspace = () => {
    router.push(providerContext ? "/dashboard" : "/trabajador/dashboard");
  };

  const homeHref = providerContext && access.canProvideServices
    ? "/trabajador/dashboard"
    : getDefaultPrivateRoute(user);

  const contractLinks = access.canContractServices
    ? [
        { href: "/dashboard", label: "Mi panel", active: pathname === "/dashboard" },
        { href: "/solicitudes", label: "Mis solicitudes", active: pathname === "/solicitudes" },
        { href: "/servicios", label: "Explorar", active: pathname.startsWith("/servicios") },
      ]
    : [];

  const providerLinks = access.canProvideServices
    ? [
        { href: "/trabajador/dashboard", label: "Resumen", active: pathname === "/trabajador/dashboard" },
        { href: "/trabajador/solicitudes", label: "Solicitudes", active: pathname === "/trabajador/solicitudes" },
        { href: "/trabajador/servicios", label: "Mis servicios", active: pathname.startsWith("/trabajador/servicios") },
        { href: "/trabajador/perfil", label: "Perfil profesional", active: pathname === "/trabajador/perfil" },
      ]
    : [];

  const contextLinks = providerContext ? providerLinks : contractLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={homeHref} className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1D4ED8] text-white shadow-sm">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
              FindJob<span className="text-[#1D4ED8]">.co</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-5 text-sm font-semibold text-[#434655]">
            {contextLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-[#1D4ED8] ${item.active ? "text-[#1D4ED8]" : ""}`}
              >
                {item.label}
              </Link>
            ))}

            {(access.canContractServices || access.canProvideServices) && (
              <Link
                href="/conversaciones"
                className={`transition-colors hover:text-[#1D4ED8] ${pathname.startsWith("/conversaciones") ? "text-[#1D4ED8]" : ""}`}
              >
                Mensajes
              </Link>
            )}

            <Link
              href="/perfil"
              className={`transition-colors hover:text-[#1D4ED8] ${pathname === "/perfil" ? "text-[#1D4ED8]" : ""}`}
            >
              Mi cuenta
            </Link>

            {access.canAdminister && (
              <Link
                href="/admin/usuarios"
                className="rounded bg-[#0F172A] px-2.5 py-1 text-xs font-bold text-[#38BDF8] transition-colors hover:bg-slate-800"
              >
                Administración
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-3">
            {canSwitchWorkspace && (
              <button
                onClick={switchWorkspace}
                title={providerContext ? "Ir a contratación de servicios" : "Ir a gestión de servicios"}
                className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg border border-[#CBD5E1] bg-[#F2F3FF] px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition-colors hover:bg-[#EAEDFF]"
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>{providerContext ? "Contratar servicios" : "Gestionar servicios"}</span>
              </button>
            )}

            <div className="flex items-center space-x-2 border-l border-[#E2E8F0] pl-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEDFF] text-sm font-bold text-[#1D4ED8]">
                {user?.nombres ? user.nombres[0].toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <p className="font-bold leading-tight text-[#0F172A]">
                  {user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : "Usuario FindJob"}
                </p>
                <p className="font-medium text-[#64748B]">{user?.email ?? "Cuenta FindJob"}</p>
              </div>
            </div>

            <button
              onClick={() => setIsLogoutOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#BA1A1A] transition-colors hover:bg-[#FFDAD6]/30"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] text-[#0F172A]"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-2">
            {contextLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {(access.canContractServices || access.canProvideServices) && (
              <Link href="/conversaciones" className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]" onClick={() => setMobileMenuOpen(false)}>
                Mensajes
              </Link>
            )}
            <Link href="/perfil" className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]" onClick={() => setMobileMenuOpen(false)}>
              Mi cuenta
            </Link>
            {canSwitchWorkspace && (
              <button
                onClick={() => {
                  switchWorkspace();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#1D4ED8] hover:bg-[#F2F3FF]"
              >
                {providerContext ? "Contratar servicios" : "Gestionar servicios"}
              </button>
            )}
            {access.canAdminister && (
              <Link href="/admin/usuarios" className="block rounded-lg px-3 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F2F3FF]" onClick={() => setMobileMenuOpen(false)}>
                Administración
              </Link>
            )}
          </div>
        )}
      </header>

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </>
  );
}
