"use client";

import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { adminService, AdminUsuarioItem } from "@/services/admin.service";
import { cambiarEstadoUsuarioSchema, actualizarRolesUsuarioSchema } from "@/schemas/admin.schema";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<AdminUsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODOS");

  // Modal Estado
  const [selectedUserEstado, setSelectedUserEstado] = useState<AdminUsuarioItem | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<"ACTIVO" | "SUSPENDIDO" | "INACTIVO">("ACTIVO");
  const [motivoEstado, setMotivoEstado] = useState("");
  const [submittingEstado, setSubmittingEstado] = useState(false);

  // Modal Roles
  const [selectedUserRoles, setSelectedUserRoles] = useState<AdminUsuarioItem | null>(null);
  const [selectedRolesList, setSelectedRolesList] = useState<("CLIENTE" | "TRABAJADOR" | "ADMIN")[]>([]);
  const [submittingRoles, setSubmittingRoles] = useState(false);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsuarios();
      setUsuarios(data);
    } catch {
      setError("No fue posible cargar el listado administrativo de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleGuardarEstado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEstado) return;

    const validation = cambiarEstadoUsuarioSchema.safeParse({
      estado: nuevoEstado,
      motivo: motivoEstado || undefined,
    });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setSubmittingEstado(true);
      await adminService.cambiarEstadoUsuario(selectedUserEstado.id, validation.data);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === selectedUserEstado.id ? { ...u, estado: nuevoEstado } : u))
      );
      setSelectedUserEstado(null);
      setMotivoEstado("");
    } catch {
      alert("Error al actualizar estado del usuario.");
    } finally {
      setSubmittingEstado(false);
    }
  };

  const toggleRoleSelection = (role: "CLIENTE" | "TRABAJADOR" | "ADMIN") => {
    if (selectedRolesList.includes(role)) {
      if (selectedRolesList.length === 1) return; // Mínimo un rol
      setSelectedRolesList(selectedRolesList.filter((r) => r !== role));
    } else {
      setSelectedRolesList([...selectedRolesList, role]);
    }
  };

  const handleGuardarRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserRoles) return;

    const validation = actualizarRolesUsuarioSchema.safeParse({ roles: selectedRolesList });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setSubmittingRoles(true);
      await adminService.actualizarRolesUsuario(selectedUserRoles.id, validation.data);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === selectedUserRoles.id ? { ...u, roles: selectedRolesList } : u))
      );
      setSelectedUserRoles(null);
    } catch {
      alert("Error al actualizar roles del usuario.");
    } finally {
      setSubmittingRoles(false);
    }
  };

  const filtered = usuarios.filter((u) => {
    const matchesQuery =
      u.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEstado = filterEstado === "TODOS" || u.estado === filterEstado;
    return matchesQuery && matchesEstado;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Gestión de Usuarios y Roles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administración centralizada de cuentas de negocio y control de privilegios de acceso.
          </p>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o correo electrónico..."
            className="w-full rounded-lg bg-slate-900 border border-slate-700 pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-[#38BDF8] focus:outline-none"
          />
        </div>

        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-slate-300 focus:border-[#38BDF8] focus:outline-none"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="SUSPENDIDO">Suspendidos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <ErrorAlert title="Error de auditoría" message={error} onRetry={fetchUsuarios} />
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="No se encontraron usuarios"
          description="Ninguna cuenta coincide con los criterios de búsqueda aplicados."
          actionLabel="Restablecer filtros"
          onAction={() => {
            setSearchQuery("");
            setFilterEstado("TODOS");
          }}
        />
      )}

      {/* 4. SUCCESS STATE: Tabla de Usuarios */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Usuario / Identidad</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Roles Asignados</th>
                  <th className="py-3 px-4">Estado Cuenta</th>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">
                        {u.nombres} {u.apellidos}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        UID: {u.uid_externo}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{u.email}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              r === "ADMIN"
                                ? "bg-purple-900/60 text-purple-300 border border-purple-700"
                                : r === "TRABAJADOR"
                                ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700"
                                : "bg-blue-900/60 text-blue-300 border border-blue-700"
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.estado === "ACTIVO"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : u.estado === "SUSPENDIDO"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {u.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {new Date(u.fecha_registro).toLocaleDateString("es-CO")}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUserRoles(u);
                          setSelectedRolesList(u.roles);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-[11px] font-semibold border border-slate-700"
                      >
                        Roles
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserEstado(u);
                          setNuevoEstado(u.estado);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700 text-[11px] font-semibold border border-slate-700"
                      >
                        Estado
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR ESTADO DE USUARIO (ADMIN_USR_Estado) */}
      {selectedUserEstado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white">
                Cambiar Estado de Cuenta
              </h3>
              <button
                onClick={() => setSelectedUserEstado(null)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEstado} className="space-y-4">
              <p className="text-xs text-slate-400">
                Usuario: <strong className="text-white">{selectedUserEstado.nombres} {selectedUserEstado.apellidos}</strong> ({selectedUserEstado.email})
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Nuevo Estado de Cuenta *
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value as "ACTIVO" | "SUSPENDIDO" | "INACTIVO")}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                >
                  <option value="ACTIVO">ACTIVO — Cuenta habilitada para operar</option>
                  <option value="SUSPENDIDO">SUSPENDIDO — Bloqueo preventivo de operaciones</option>
                  <option value="INACTIVO">INACTIVO — Desactivación definitiva</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Motivo o Justificación del Cambio
                </label>
                <textarea
                  rows={3}
                  value={motivoEstado}
                  onChange={(e) => setMotivoEstado(e.target.value)}
                  placeholder="Explica la causa de la sanción o reactivación..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserEstado(null)}
                  disabled={submittingEstado}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={submittingEstado}>
                  {submittingEstado ? "Guardando..." : "Aplicar Estado"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIONAR ROLES (ADMIN_USR_Roles) */}
      {selectedUserRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white">
                Gestionar Roles de Usuario
              </h3>
              <button
                onClick={() => setSelectedUserRoles(null)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarRoles} className="space-y-4">
              <p className="text-xs text-slate-400">
                Usuario: <strong className="text-white">{selectedUserRoles.nombres} {selectedUserRoles.apellidos}</strong>
              </p>

              <div className="space-y-2">
                {(["CLIENTE", "TRABAJADOR", "ADMIN"] as const).map((r) => (
                  <label
                    key={r}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-slate-800 bg-slate-950 cursor-pointer hover:bg-slate-800/60"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRolesList.includes(r)}
                      onChange={() => toggleRoleSelection(r)}
                      className="h-4 w-4 rounded border-slate-700 text-[#1D4ED8]"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{r}</p>
                      <p className="text-[10px] text-slate-400">
                        {r === "ADMIN"
                          ? "Acceso a auditoría, catálogos y moderación de seguridad."
                          : r === "TRABAJADOR"
                          ? "Habilitado para publicar servicios y recibir citas."
                          : "Habilitado para solicitar y calificar servicios."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserRoles(null)}
                  disabled={submittingRoles}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={submittingRoles}>
                  {submittingRoles ? "Guardando..." : "Actualizar Roles"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
