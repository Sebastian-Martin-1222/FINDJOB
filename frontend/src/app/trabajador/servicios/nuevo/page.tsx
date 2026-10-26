"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService } from "@/services/marketplace.service";
import { publicarServicioSchema } from "@/schemas/marketplace.schema";

const SUBCATEGORIAS_CATALOG = [
  { id: 1, nombre: "Desarrollo web y backend", categoria: "Tecnología y Software" },
  { id: 2, nombre: "Diseño gráfico y digital", categoria: "Diseño y Creatividad" },
  { id: 3, nombre: "Electricidad y cableado", categoria: "Mantenimiento del Hogar" },
  { id: 4, nombre: "Plomería e instalaciones", categoria: "Mantenimiento del Hogar" },
  { id: 5, nombre: "Mantenimiento de computadores", categoria: "Tecnología y Software" },
  { id: 6, nombre: "Pintura y acabados", categoria: "Mantenimiento del Hogar" },
];

export default function PublicarServicioPage() {
  const router = useRouter();

  const [subcategoriaId, setSubcategoriaId] = useState<number>(1);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [tiempoHoras, setTiempoHoras] = useState("");
  const [revisiones, setRevisiones] = useState("1");
  const [modalidades, setModalidades] = useState<("REMOTA" | "PRESENCIAL")[]>(["REMOTA"]);

  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleModalidad = (mod: "REMOTA" | "PRESENCIAL") => {
    if (modalidades.includes(mod)) {
      if (modalidades.length === 1) return; // Mínimo una
      setModalidades(modalidades.filter((m) => m !== mod));
    } else {
      setModalidades([...modalidades, mod]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    const payload = {
      subcategoria_id: Number(subcategoriaId),
      titulo,
      descripcion,
      precio_base: Number(precioBase),
      tiempo_estimado_horas: Number(tiempoHoras),
      revisiones_incluidas: Number(revisiones),
      modalidades,
    };

    const validation = publicarServicioSchema.safeParse(payload);
    if (!validation.success) {
      const errMap: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() || "general";
        errMap[key] = issue.message;
      });
      setFormErrors(errMap);
      return;
    }

    try {
      setSubmitting(true);
      await marketplaceService.publicarServicio(validation.data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/trabajador/servicios");
      }, 2000);
    } catch {
      setError("No fue posible publicar el servicio. Por favor revisa los datos ingresados.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      <PrivateNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-sm text-[#434655]">
          <Link href="/trabajador/dashboard" className="hover:text-[#1D4ED8]">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/trabajador/servicios" className="hover:text-[#1D4ED8]">
            Mis servicios
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#0F172A]">Publicar servicio</span>
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] p-8 text-center shadow-sm">
            <div className="h-16 w-16 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">
              ¡Servicio Publicado con Éxito!
            </h2>
            <p className="text-sm text-[#434655] max-w-md mx-auto mb-6">
              Tu servicio ya está disponible en el catálogo de FindJob para que los clientes envíen solicitudes.
            </p>
            <Button onClick={() => router.push("/trabajador/servicios")}>
              Ver mis servicios
            </Button>
          </div>
        )}

        {/* Formulario Principal (SERV_Publicar) */}
        {!success && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#E2E8F0] pb-4 mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                Publicar servicio
              </h1>
              <p className="text-sm text-[#434655] mt-1">
                Crea un servicio para ofrecerlo a los clientes de FindJob.
              </p>
            </div>

            {error && (
              <div className="mb-6">
                <ErrorAlert title="Error de publicación" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Subcategoría */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1.5">
                  Subcategoría *
                </label>
                <select
                  value={subcategoriaId}
                  onChange={(e) => setSubcategoriaId(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] focus:border-[#1D4ED8] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                >
                  {SUBCATEGORIAS_CATALOG.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.nombre} ({sub.categoria})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#434655] mt-1">
                  La categoría se asignará automáticamente a partir de la subcategoría seleccionada.
                </p>
              </div>

              {/* 2. Título del servicio */}
              <div>
                <Input
                  label="Título del servicio *"
                  placeholder="Ej: Desarrollo de API REST y arquitectura de base de datos"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  error={formErrors.titulo}
                  required
                />
                <p className="text-xs text-[#434655] mt-1">
                  Describe de forma clara y directa el trabajo que realizarás.
                </p>
              </div>

              {/* 3. Descripción */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1.5">
                  Descripción detallada *
                </label>
                <textarea
                  rows={5}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Explica en qué consiste el servicio, las actividades que realizarás y qué entregables recibirá el cliente..."
                  className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1D4ED8] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  required
                />
                {formErrors.descripcion && (
                  <p className="text-xs text-[#BA1A1A] mt-1">{formErrors.descripcion}</p>
                )}
              </div>

              {/* 4. Precio base COP */}
              <div>
                <Input
                  label="Precio base (COP) *"
                  type="number"
                  placeholder="Ej: 180000"
                  value={precioBase}
                  onChange={(e) => setPrecioBase(e.target.value)}
                  error={formErrors.precio_base}
                  required
                />
                <p className="text-xs text-[#434655] mt-1">
                  Debe ser mayor a $0 COP. Corresponde al valor inicial convenido del servicio.
                </p>
              </div>

              {/* 5. Tiempo estimado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Tiempo estimado (horas) *"
                    type="number"
                    placeholder="Ej: 12"
                    value={tiempoHoras}
                    onChange={(e) => setTiempoHoras(e.target.value)}
                    error={formErrors.tiempo_estimado_horas}
                    required
                  />
                  <p className="text-xs text-[#434655] mt-1">
                    El tiempo estimado de trabajo debe ser de al menos 1 hora.
                  </p>
                </div>

                <div>
                  <Input
                    label="Revisiones incluidas *"
                    type="number"
                    placeholder="Ej: 2"
                    value={revisiones}
                    onChange={(e) => setRevisiones(e.target.value)}
                    error={formErrors.revisiones_incluidas}
                    required
                  />
                  <p className="text-xs text-[#434655] mt-1">
                    Número de ajustes incluidos en el precio base (0 o mayor).
                  </p>
                </div>
              </div>

              {/* 6. Modalidades */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1">
                  Modalidades de prestación *
                </label>
                <p className="text-xs text-[#434655] mb-3">
                  Selecciona al menos una modalidad disponible para este servicio.
                </p>

                <div className="space-y-2">
                  <label className="flex items-start space-x-3 p-3 rounded-lg border border-[#CBD5E1] cursor-pointer hover:bg-[#FAF8FF]">
                    <input
                      type="checkbox"
                      checked={modalidades.includes("REMOTA")}
                      onChange={() => toggleModalidad("REMOTA")}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">Remoto</p>
                      <p className="text-xs text-[#434655]">
                        El servicio se realiza a distancia mediante plataformas virtuales y chat seguro.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3 p-3 rounded-lg border border-[#CBD5E1] cursor-pointer hover:bg-[#FAF8FF]">
                    <input
                      type="checkbox"
                      checked={modalidades.includes("PRESENCIAL")}
                      onChange={() => toggleModalidad("PRESENCIAL")}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#0F172A]">Presencial</p>
                      <p className="text-xs text-[#434655]">
                        El servicio requiere asistencia en la ubicación del cliente con protocolo PIN.
                      </p>
                    </div>
                  </label>
                </div>
                {formErrors.modalidades && (
                  <p className="text-xs text-[#BA1A1A] mt-1.5">{formErrors.modalidades}</p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/trabajador/servicios")}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="bg-[#1D4ED8]">
                  {submitting ? "Publicando..." : "Publicar servicio"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
