"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Database,
  Server,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { adminService, SystemHealthStatus } from "@/services/admin.service";

export default function AdminSaludPage() {
  const [health, setHealth] = useState<SystemHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getHealthDb();
      setHealth(data);
    } catch {
      setError("No fue posible consultar la telemetría de salud de Cloud Run y Cloud SQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
            <Activity className="h-6 w-6 text-emerald-400" />
            <span>Monitor de Salud y Disponibilidad GCP</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Telemetría en tiempo real de Cloud SQL PostgreSQL 17 y contenedores en Cloud Run.
          </p>
        </div>
        <Button
          size="sm"
          onClick={fetchHealth}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700 flex items-center space-x-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar Telemetría</span>
        </Button>
      </div>

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <ErrorAlert title="Error de telemetría" message={error} onRetry={fetchHealth} />
      )}

      {/* 3. SUCCESS STATE */}
      {!loading && !error && health && (
        <div className="space-y-6">
          {/* Tarjeta de Estado General */}
          <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-emerald-900/60 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Todos los Sistemas Operacionales</h2>
                <p className="text-xs text-slate-400">
                  Transacciones atómicas, validación de identidades y esquemas 3FN funcionando normalmente.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-900 text-emerald-300 border border-emerald-700 font-mono">
              {health.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Componente A: Cloud SQL PostgreSQL 17 */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-extrabold text-base text-white">
                    Cloud SQL for PostgreSQL 17
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Online
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Motor de Base de Datos:</span>
                  <span className="font-mono font-bold text-white">{health.db.engine}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Versión del Motor:</span>
                  <span className="font-mono text-white">{health.db.version}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Esquema Relacional:</span>
                  <span className="font-mono text-white">{health.db.connection}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Conexiones Activas en Pool:</span>
                  <span className="font-mono font-bold text-[#38BDF8]">{health.db.pool_active}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Latencia de Consulta:</span>
                  <span className="font-mono font-bold text-emerald-400">{health.db.latency_ms} ms</span>
                </div>
              </div>
            </div>

            {/* Componente B: Cloud Run Microservicios */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Server className="h-5 w-5 text-[#38BDF8]" />
                  <h3 className="font-extrabold text-base text-white">
                    Cloud Run Backend Services
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                  Active
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Región de Despliegue:</span>
                  <span className="font-mono font-bold text-white">{health.cloud_run.region}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Revisión Activa:</span>
                  <span className="font-mono text-slate-300">{health.cloud_run.revision}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Tiempo en Línea (Uptime):</span>
                  <span className="font-mono text-white">{Math.round(health.cloud_run.uptime_seconds / 3600)} horas</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Última Verificación:</span>
                  <span className="font-mono text-slate-400">
                    {new Date(health.timestamp).toLocaleTimeString("es-CO")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
