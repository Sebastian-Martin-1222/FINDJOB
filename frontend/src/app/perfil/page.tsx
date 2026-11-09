"use client";

import React, { useCallback, useEffect, useState } from "react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { userService, DireccionItem } from "@/services/user.service";
import { catalogService, CiudadCatalogoItem } from "@/services/catalog.service";
import { authStorage, AuthUser } from "@/lib/auth-storage";
import { editarPerfilSchema, direccionSchema } from "@/schemas/user.schema";
import { getAccessCapabilities } from "@/lib/access-control";

export default function PerfilPage() {
  const sessionUser = authStorage.getUser();
  const canManageAddresses = getAccessCapabilities(sessionUser).canContractServices;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [dirs, setDirs] = useState<DireccionItem[]>([]);
  const [ciudades, setCiudades] = useState<CiudadCatalogoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [alias, setAlias] = useState("");
  const [linea, setLinea] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      const currentUser = await userService.getMe();
      setUser(currentUser);
      setNombres(currentUser.nombres);
      setApellidos(currentUser.apellidos);
      setTelefono(currentUser.telefono ?? "");

      if (canManageAddresses) {
        const [addresses, cities] = await Promise.all([
          userService.getDirecciones(),
          catalogService.getCiudades(),
        ]);
        setDirs(addresses);
        setCiudades(cities);
      } else {
        setDirs([]);
        setCiudades([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible cargar el perfil.");
    }
  }, [canManageAddresses]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = editarPerfilSchema.safeParse({ nombres, apellidos, telefono });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revisa los datos.");
      return;
    }

    try {
      setSaving(true);
      const updated = await userService.updateMe(validation.data);
      setUser(updated);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible guardar.");
    } finally {
      setSaving(false);
    }
  };

  const addDir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageAddresses) return;

    const validation = direccionSchema.safeParse({
      ciudad_id: ciudad,
      alias,
      linea_direccion: linea,
    });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Revisa la dirección.");
      return;
    }

    try {
      await userService.createDireccion(validation.data);
      setAlias("");
      setLinea("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible agregar la dirección.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF]">
      <PrivateNavbar />
      <main className="mx-auto max-w-5xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Mi cuenta</h1>
          <p className="text-sm text-slate-600">Administra tus datos personales y, si aplica, tus direcciones registradas.</p>
        </div>

        {error && <ErrorAlert message={error} />}

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-bold text-lg">Datos personales</h2>
          <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input id="nombres" label="Nombres" value={nombres} onChange={(e) => setNombres(e.target.value)} />
            <Input id="apellidos" label="Apellidos" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
            <Input id="telefono" label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <div className="self-end">
              <Button type="submit" disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
            </div>
          </form>
          {user && <p className="mt-4 text-xs text-slate-500">Correo: {user.email}</p>}
        </section>

        {canManageAddresses && (
          <section className="rounded-xl border bg-white p-6">
            <h2 className="font-bold text-lg">Direcciones</h2>
            <form onSubmit={addDir} className="mt-4 grid gap-3 sm:grid-cols-3">
              <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} className="rounded-lg border p-3 text-sm">
                <option value="">Ciudad</option>
                {ciudades.map((item) => <option key={item.ciudad_id} value={item.ciudad_id}>{item.nombre}</option>)}
              </select>
              <Input id="alias" label="Alias" value={alias} onChange={(e) => setAlias(e.target.value)} placeholder="Casa" />
              <Input id="linea_direccion" label="Dirección" value={linea} onChange={(e) => setLinea(e.target.value)} />
              <div className="sm:col-span-3"><Button type="submit">Agregar dirección</Button></div>
            </form>

            <div className="mt-5 space-y-2">
              {dirs.map((item) => (
                <div key={item.direccion_id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <strong className="text-sm">{item.alias}</strong>
                    <p className="text-sm text-slate-600">{item.linea_direccion}{item.ciudad_nombre ? ` · ${item.ciudad_nombre}` : ""}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => { await userService.deleteDireccion(item.direccion_id); await load(); }}>
                    Eliminar
                  </Button>
                </div>
              ))}
              {dirs.length === 0 && <p className="text-sm text-slate-500">No tienes direcciones registradas.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
