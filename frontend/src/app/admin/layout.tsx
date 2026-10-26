"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Layers,
  ShieldAlert,
  CreditCard,
  Activity,
  Briefcase,
  ArrowLeft,
  Server,
  Database,
} from "lucide-react";
import { authStorage } from "@/lib/auth-storage";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = authStorage.getUser();

  const navItems = [
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/categorias", label: "Categorías", icon: Layers },
    { href: "/admin/alertas", label: "Alertas Seguridad", icon: ShieldAlert },
    { href: "/admin/pagos", label: "Pagos & Comisión", icon: CreditCard },
    { href: "/admin/salud", label: "Salud del Sistema", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {/* High-Density System Bar (GCP Cloud Run & Cloud SQL Telemetry) */}
      <header className="border-b border-slate-800 bg-[#0B1120] px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link href="/admin/usuarios" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] text-white font-bold">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-extrabold tracking-tight text-white text-base">
              FindJob <span className="text-[#38BDF8]">Admin System</span>
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-[#38BDF8] border border-slate-700">
            High-Density Audit Bar
          </span>
        </div>

        {/* Telemetry Chips */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Database className="h-3.5 w-3.5 text-[#059669]" />
            <span>Cloud SQL PostgreSQL 17 (3FN)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1.5">
            <Server className="h-3.5 w-3.5 text-[#38BDF8]" />
            <span>Cloud Run (us-central1)</span>
          </div>
        </div>

        {/* User Info & Back to Marketplace */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Operador: <strong className="text-white">{user?.nombres || "Admin"}</strong>
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Salir al Portal</span>
          </Link>
        </div>
      </header>

      {/* Admin Subnav */}
      <nav className="border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur px-4 sm:px-8 flex overflow-x-auto space-x-1 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-[#1D4ED8] text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
