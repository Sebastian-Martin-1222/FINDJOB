"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { adminService, AdminAlertaItem } from "@/services/admin.service";

export default function AdminAlertasPage() {
  const [alertas, setAlertas] = useState<AdminAlertaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getAlertas();
      setAlertas(data);
    } catch {
      setError("No fue posible cargar las alertas de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertas();
  }, []);

  const handleResolver = async (id: number, nuevoEstado: "RESUELTA" | "EN_REVISION") => {
    try {
      setUpdatingId(id);
      await adminService.resolverAlerta(id, nuevoEstado);
      setAlertas((prev) =>
        prev.map((a) => (a.id === id ? { ...a, estado: nuevoEstado } : a))
      );
    } catch {
      alert("Error al actualizar la alerta.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-[#BA1A1A]" />
          <span>Monitor de Alertas de Seguridad Presencial</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Supervisión en vivo de incidentes reportados durante la ejecución de citas en sitio.
        </p>
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
        <ErrorAlert title="Error de alertas" message={error} onRetry={fetchAlertas} />
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && alertas.length === 0 && (
        <EmptyState
          title="Sin incidentes ni alertas registradas"
          description="Todos los servicios presenciales operan bajo condiciones seguras y con códigos PIN validados."
          actionLabel="Actualizar"
          onAction={fetchAlertas}
        />
      )}

      {/* 4. SUCCESS STATE: Tabla / Tarjetas de Alertas */}
      {!loading && !error && alertas.length > 0 && (
        <div className="space-y-4">
          {alertas.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-5 shadow-sm transition-all ${
                a.estado === "PENDIENTE"
                  ? "border-[#BA1A1A] bg-red-950/20"
                  : a.estado === "EN_REVISION"
                  ? "border-amber-700 bg-amber-950/20"
                  : "border-slate-800 bg-slate-900"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    ALERTA-#{a.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.estado === "RESUELTA"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : a.estado === "EN_REVISION"
                        ? "bg-amber-950 text-amber-400 border border-amber-800"
                        : "bg-red-950 text-red-400 border border-red-800 animate-pulse"
                    }`}
                  >
                    {a.estado}
                  </span>
                  <span className="text-xs font-bold text-white px-2 py-0.5 rounded bg-slate-800">
                    {a.tipo_alerta}
                  </span>
                </div>

                <span className="text-xs font-mono text-slate-400">
                  {new Date(a.fecha_registro).toLocaleString("es-CO")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 mb-3">
                <p>
                  Cita ID: <strong className="text-white">#{a.cita_id}</strong>
                </p>
                <p>
                  Partes involucradas: <strong className="text-white">{a.cliente_nombre}</strong> (Cliente) y{" "}
                  <strong className="text-white">{a.trabajador_nombre}</strong> (Profesional)
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 mb-4">
                <strong className="text-white block mb-0.5">Descripción reportada:</strong>
                <p>{a.descripcion}</p>
              </div>

              {/* Acciones de Moderación */}
              <div className="flex items-center justify-end space-x-2">
                {a.estado !== "EN_REVISION" && a.estado !== "RESUELTA" && (
                  <button
                    onClick={() => handleResolver(a.id, "EN_REVISION")}
                    disabled={updatingId === a.id}
                    className="px-3 py-1.5 rounded-lg border border-amber-700 bg-amber-950/40 text-amber-300 text-xs font-bold hover:bg-amber-900/60"
                  >
                    Tomar en Revisión
                  </button>
                )}
                {a.estado !== "RESUELTA" && (
                  <button
                    onClick={() => handleResolver(a.id, "RESUELTA")}
                    disabled={updatingId === a.id}
                    className="px-3 py-1.5 rounded-lg border border-emerald-700 bg-emerald-950/40 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60"
                  >
                    Marcar Resuelta
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
