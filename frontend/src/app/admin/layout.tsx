"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Users, Layers, ShieldAlert, CreditCard, Activity, Briefcase, ArrowLeft, Wrench, ClipboardCheck, ListChecks } from "lucide-react";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities, getDefaultPrivateRoute } from "@/lib/access-control";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = authStorage.getUser();
  const access = getAccessCapabilities(user);
  const isAdmin = access.canAdminister;

  const navItems = [
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
    { href: "/admin/categorias", label: "Categorías", icon: Layers },
    { href: "/admin/habilidades", label: "Habilidades", icon: Wrench },
    { href: "/admin/seguridad", label: "Preguntas", icon: ClipboardCheck },
    { href: "/admin/alertas", label: "Alertas", icon: ShieldAlert },
    { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
    { href: "/admin/operaciones", label: "Operaciones", icon: ListChecks },
    { href: "/admin/salud", label: "Salud", icon: Activity },
  ];

  useEffect(() => {
    if (!isAdmin) {
      router.replace(getDefaultPrivateRoute(user));
    }
  }, [isAdmin, router, user]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#0B1120] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        <Link href="/admin/usuarios" className="flex items-center gap-2 font-extrabold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8]"><Briefcase className="h-4 w-4" /></span>
          FindJob <span className="text-[#38BDF8]">Gestión</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:inline">Operador: <strong className="text-white">{user?.nombres}</strong></span>
          <Link href={getDefaultPrivateRoute(user)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800"><ArrowLeft className="h-3.5 w-3.5" /> Portal</Link>
        </div>
      </header>
      <nav className="border-b border-slate-800 px-4 sm:px-8 flex overflow-x-auto gap-1 py-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap ${pathname.startsWith(href) ? "bg-[#1D4ED8] text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
