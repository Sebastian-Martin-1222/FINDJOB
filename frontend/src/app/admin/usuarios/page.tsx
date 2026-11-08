"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminService, AdminUsuarioItem } from "@/services/admin.service";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { getFunctionalAccessLabel } from "@/lib/access-control";

interface RoleCatalogItem {
  rol_id: number;
  codigo: string;
  nombre?: string;
}

function isRoleCatalogItem(value: Record<string, unknown>): value is Record<string, unknown> & RoleCatalogItem {
  return typeof value.rol_id === "number" && typeof value.codigo === "string";
}

export default function AdminUsuariosPage() {
  const [items, setItems] = useState<AdminUsuarioItem[]>([]);
  const [roles, setRoles] = useState<RoleCatalogItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [users, rawRoles] = await Promise.all([
        adminService.getUsuarios(),
        adminService.getCatalogoInterno("roles"),
      ]);
      setItems(users);
      setRoles(rawRoles.filter(isRoleCatalogItem));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible cargar usuarios.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const roleIdByCode = useMemo(
    () => new Map(roles.map((role) => [role.codigo, role.rol_id])),
    [roles]
  );

  async function toggle(user: AdminUsuarioItem) {
    try {
      setBusy(user.usuario_id);
      await adminService.cambiarEstadoUsuario(user.usuario_id, !user.activo);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar el usuario.");
    } finally {
      setBusy(null);
    }
  }

  async function toggleRole(user: AdminUsuarioItem, roleCode: string) {
    const current = new Set(user.roles);
    if (current.has(roleCode)) current.delete(roleCode);
    else current.add(roleCode);

    if (!current.size) {
      setError("El usuario debe conservar al menos un acceso funcional.");
      return;
    }

    const roleIds = Array.from(current).map((code) => roleIdByCode.get(code));
    if (roleIds.some((id) => id === undefined)) {
      setError("No fue posible resolver el catálogo de accesos del servidor.");
      return;
    }

    try {
      setBusy(user.usuario_id);
      await adminService.actualizarRolesUsuario(user.usuario_id, roleIds as number[]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar los accesos.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="text-sm text-slate-400">Estado de la cuenta y accesos funcionales asignados.</p>
      </div>

      {error && <ErrorAlert message={error} onRetry={load} />}

      <div className="space-y-3">
        {items.map((user) => (
          <article key={user.usuario_id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-bold">{user.nombres} {user.apellidos}</h2>
                <p className="text-sm text-slate-400">{user.email}</p>
                <p className="text-xs text-slate-500">
                  Creado {new Date(user.creado_en).toLocaleDateString("es-CO")}
                </p>
              </div>
              <Button
                size="sm"
                variant={user.activo ? "danger" : "secondary"}
                disabled={busy === user.usuario_id}
                onClick={() => void toggle(user)}
              >
                {user.activo ? "Desactivar" : "Activar"}
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {roles.map((role) => (
                <button
                  key={role.rol_id}
                  type="button"
                  disabled={busy === user.usuario_id}
                  onClick={() => void toggleRole(user, role.codigo)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    user.roles.includes(role.codigo)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                  title={getFunctionalAccessLabel(role.codigo)}
                >
                  {getFunctionalAccessLabel(role.codigo)}
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
