"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, DollarSign, Plus, X } from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  adminService,
  AdminPagoItem,
  AdminPoliticaComisionItem,
} from "@/services/admin.service";
import { crearPoliticaComisionSchema } from "@/schemas/admin.schema";

export default function AdminPagosPage() {
  const [pagos, setPagos] = useState<AdminPagoItem[]>([]);
  const [politicas, setPoliticas] = useState<AdminPoliticaComisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Nueva Política
  const [modalOpen, setModalOpen] = useState(false);
  const [porcentaje, setPorcentaje] = useState("12.0");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pagosData, politicasData] = await Promise.all([
        adminService.getPagos(),
        adminService.getPoliticasComision(),
      ]);
      setPagos(pagosData);
      setPoliticas(politicasData);
    } catch {
      setError("No fue posible cargar el módulo financiero de pagos y comisiones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCrearPolitica = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = crearPoliticaComisionSchema.safeParse({
      porcentaje: Number(porcentaje),
      descripcion,
    });

    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setSubmitting(true);
      await adminService.crearPoliticaComision(validation.data);
      setPoliticas((prev) => [
        ...prev,
        {
          id: Date.now(),
          porcentaje: Number(porcentaje),
          descripcion,
          vigente_desde: new Date().toISOString().slice(0, 10),
          activa: true,
        },
      ]);
      setModalOpen(false);
      setDescripcion("");
    } catch {
      alert("Error al registrar política de comisión.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Auditoría Financiera y Políticas de Comisión
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registro inmutable de transacciones COP y gestión de tarifas operativas del marketplace.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setModalOpen(true)}
          className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-xs flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Política de Comisión</span>
        </Button>
      </div>

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <ErrorAlert title="Error financiero" message={error} onRetry={fetchData} />
      )}

      {/* 3. SUCCESS STATE */}
      {!loading && !error && (
        <div className="space-y-8">
          {/* Sección A: Historial de Políticas de Comisión */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-white mb-3 flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-[#38BDF8]" />
              <span>Políticas de Comisión del Marketplace</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Porcentaje</th>
                    <th className="py-2.5 px-3">Descripción / Justificación</th>
                    <th className="py-2.5 px-3">Vigencia Desde</th>
                    <th className="py-2.5 px-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {politicas.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-3 font-bold text-white font-mono text-sm">
                        {p.porcentaje.toFixed(1)}%
                      </td>
                      <td className="py-3 px-3">{p.descripcion}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{p.vigente_desde}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {p.activa ? "Vigente" : "Histórica"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sección B: Transacciones y Pagos Auditados */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
            <h2 className="text-base font-extrabold text-white mb-3 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-[#059669]" />
              <span>Transacciones Registradas en Cloud SQL</span>
            </h2>

            {pagos.length === 0 ? (
              <p className="text-xs text-slate-400">No hay pagos registrados aún en el sistema.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Referencia</th>
                      <th className="py-2.5 px-3">Cita ID</th>
                      <th className="py-2.5 px-3">Partes</th>
                      <th className="py-2.5 px-3">Monto Total</th>
                      <th className="py-2.5 px-3">Comisión (12%)</th>
                      <th className="py-2.5 px-3">Neto Trabajador</th>
                      <th className="py-2.5 px-3">Método</th>
                      <th className="py-2.5 px-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pagos.map((p) => (
                      <tr key={p.id}>
                        <td className="py-3 px-3 font-mono font-bold text-[#38BDF8]">
                          {p.referencia}
                        </td>
                        <td className="py-3 px-3 font-mono">#{p.cita_id}</td>
                        <td className="py-3 px-3">
                          <span className="text-white font-semibold">{p.cliente_nombre}</span> →{" "}
                          <span>{p.trabajador_nombre}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-white">
                          {formatCOP(p.monto)}
                        </td>
                        <td className="py-3 px-3 font-mono text-emerald-400">
                          {formatCOP(p.comision_plataforma)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {formatCOP(p.monto_trabajador)}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {p.metodo_pago.replace("_SIMULADO", "")}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {new Date(p.fecha_creacion).toLocaleDateString("es-CO")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL CREAR POLÍTICA DE COMISIÓN */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white">Nueva Política de Comisión</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearPolitica} className="space-y-4">
              <Input
                label="Porcentaje de Comisión (%) *"
                type="number"
                step="0.1"
                placeholder="Ej: 12.0"
                value={porcentaje}
                onChange={(e) => setPorcentaje(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Justificación / Descripción de la vigencia *
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Política estándar para servicios verificados en Colombia..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:border-[#38BDF8] focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Creando..." : "Guardar Política"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
