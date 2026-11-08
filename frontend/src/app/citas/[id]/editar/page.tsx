"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService, CitaDetalle } from "@/services/marketplace.service";
import { authStorage } from "@/lib/auth-storage";
import { getAccessCapabilities, getDefaultPrivateRoute } from "@/lib/access-control";

const toLocal = (iso: string) => {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

export default function EditarCitaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const user = authStorage.getUser();
  const canEdit = getAccessCapabilities(user).canProvideServices;

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [enlace, setEnlace] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canEdit) {
      router.replace(getDefaultPrivateRoute(user));
      return;
    }

    void (async () => {
      try {
        setError(null);
        const current = await marketplaceService.getCitaById(id);
        setCita(current);
        setInicio(toLocal(current.fecha_inicio));
        setFin(current.fecha_fin ? toLocal(current.fecha_fin) : "");
        setPlataforma(current.plataforma_remota || "");
        setEnlace(current.enlace_reunion || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No fue posible cargar la cita.");
      }
    })();
  }, [canEdit, id, router, user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!cita) return;

    try {
      setSaving(true);
      setError(null);

      const payload = cita.modalidad_codigo === "PRESENCIAL"
        ? {
            fecha_inicio: new Date(inicio).toISOString(),
            fecha_fin: fin ? new Date(fin).toISOString() : null,
          }
        : {
            fecha_inicio: new Date(inicio).toISOString(),
            fecha_fin: fin ? new Date(fin).toISOString() : null,
            plataforma_remota: plataforma || null,
            enlace_reunion: enlace || null,
          };

      await marketplaceService.actualizarCita(id, payload);
      router.push(`/citas/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar la cita.");
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) return null;

  return (
    <div className="min-h-screen bg-[#FAF8FF]">
      <PrivateNavbar />
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Editar cita</h1>
        {error && <div className="mt-4"><ErrorAlert message={error} /></div>}

        {cita && (
          <form onSubmit={submit} className="mt-5 space-y-4 rounded-xl border bg-white p-6">
            <Input label="Inicio" type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
            <Input label="Fin (opcional)" type="datetime-local" value={fin} onChange={(e) => setFin(e.target.value)} />

            {cita.modalidad_codigo === "PRESENCIAL" ? (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Dirección registrada</p>
                <p className="mt-1">{cita.direccion_texto || "Dirección definida en la solicitud."}</p>
                <p className="mt-2 text-xs text-slate-500">La dirección no puede cambiarse desde esta pantalla.</p>
              </div>
            ) : (
              <>
                <Input label="Plataforma" value={plataforma} onChange={(e) => setPlataforma(e.target.value)} />
                <Input label="Enlace de reunión" type="url" value={enlace} onChange={(e) => setEnlace(e.target.value)} />
              </>
            )}

            <div className="flex gap-3">
              <Button type="submit" isLoading={saving}>Guardar</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
