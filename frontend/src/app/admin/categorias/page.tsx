"use client";

import React, { useEffect, useState } from "react";
import { Plus, X, FolderTree } from "lucide-react";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminService, AdminCategoriaItem } from "@/services/admin.service";
import { crearCategoriaSchema, crearSubcategoriaSchema } from "@/schemas/admin.schema";

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<AdminCategoriaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Nueva Categoría
  const [modalCatOpen, setModalCatOpen] = useState(false);
  const [nombreCat, setNombreCat] = useState("");
  const [descCat, setDescCat] = useState("");
  const [submittingCat, setSubmittingCat] = useState(false);

  // Modal Nueva Subcategoría
  const [modalSubOpen, setModalSubOpen] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<number>(1);
  const [nombreSub, setNombreSub] = useState("");
  const [descSub, setDescSub] = useState("");
  const [submittingSub, setSubmittingSub] = useState(false);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getCategorias();
      setCategorias(data);
    } catch {
      setError("No fue posible cargar el catálogo de categorías.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = crearCategoriaSchema.safeParse({ nombre: nombreCat, descripcion: descCat });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setSubmittingCat(true);
      await adminService.crearCategoria(validation.data);
      setCategorias((prev) => [
        ...prev,
        {
          id: Date.now(),
          nombre: nombreCat,
          descripcion: descCat,
          activa: true,
          total_servicios: 0,
          subcategorias: [],
        },
      ]);
      setModalCatOpen(false);
      setNombreCat("");
      setDescCat("");
    } catch {
      alert("Error al crear la categoría.");
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleCrearSubcategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = crearSubcategoriaSchema.safeParse({
      categoria_id: selectedCatId,
      nombre: nombreSub,
      descripcion: descSub,
    });
    if (!validation.success) {
      alert(validation.error.issues[0]?.message);
      return;
    }

    try {
      setSubmittingSub(true);
      await adminService.crearSubcategoria(validation.data);
      setCategorias((prev) =>
        prev.map((c) =>
          c.id === selectedCatId
            ? {
                ...c,
                subcategorias: [
                  ...c.subcategorias,
                  { id: Date.now(), nombre: nombreSub, activa: true },
                ],
              }
            : c
        )
      );
      setModalSubOpen(false);
      setNombreSub("");
      setDescSub("");
    } catch {
      alert("Error al crear la subcategoría.");
    } finally {
      setSubmittingSub(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Catálogos del Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra categorías primarias y subcategorías para la clasificación de servicios.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setModalSubOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-xs border border-slate-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Nueva Subcategoría</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setModalCatOpen(true)}
            className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-xs"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Nueva Categoría</span>
          </Button>
        </div>
      </div>

      {/* 1. LOADING STATE */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!loading && error && (
        <ErrorAlert title="Error de catálogos" message={error} onRetry={fetchCategorias} />
      )}

      {/* 3. EMPTY STATE */}
      {!loading && !error && categorias.length === 0 && (
        <EmptyState
          title="No existen categorías configuradas"
          description="Crea la primera categoría para organizar las ofertas del marketplace."
          actionLabel="Crear Categoría"
          onAction={() => setModalCatOpen(true)}
        />
      )}

      {/* 4. SUCCESS STATE: Grid de Categorías y Subcategorías */}
      {!loading && !error && categorias.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-extrabold text-white">{cat.nombre}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Activa
                    </span>
                  </div>
                  {cat.descripcion && (
                    <p className="text-xs text-slate-400 mt-1">{cat.descripcion}</p>
                  )}
                </div>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {cat.total_servicios} servicios
                </span>
              </div>

              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                  <FolderTree className="h-3.5 w-3.5 mr-1 text-[#38BDF8]" />
                  Subcategorías ({cat.subcategorias.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {cat.subcategorias.map((sub) => (
                    <span
                      key={sub.id}
                      className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-1.5"
                    >
                      <span>{sub.nombre}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR CATEGORÍA */}
      {modalCatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white">Crear Nueva Categoría</h3>
              <button
                onClick={() => setModalCatOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearCategoria} className="space-y-4">
              <Input
                label="Nombre de la Categoría *"
                placeholder="Ej: Asistencia Legal y Contable"
                value={nombreCat}
                onChange={(e) => setNombreCat(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={descCat}
                  onChange={(e) => setDescCat(e.target.value)}
                  placeholder="Explica qué clase de servicios agrupa..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2.5 text-xs text-white placeholder-slate-500 focus:border-[#38BDF8] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalCatOpen(false)}
                  disabled={submittingCat}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={submittingCat}>
                  {submittingCat ? "Creando..." : "Crear Categoría"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR SUBCATEGORÍA */}
      {modalSubOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-white">Crear Subcategoría</h3>
              <button
                onClick={() => setModalSubOpen(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCrearSubcategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Categoría Padre *
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => setSelectedCatId(Number(e.target.value))}
                  className="w-full rounded-lg bg-slate-950 border border-slate-700 p-2 text-xs text-white focus:border-[#38BDF8] focus:outline-none"
                >
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Nombre de la Subcategoría *"
                placeholder="Ej: Asesoría Tributaria DIAN"
                value={nombreSub}
                onChange={(e) => setNombreSub(e.target.value)}
                required
              />

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalSubOpen(false)}
                  disabled={submittingSub}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={submittingSub}>
                  {submittingSub ? "Creando..." : "Crear Subcategoría"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
