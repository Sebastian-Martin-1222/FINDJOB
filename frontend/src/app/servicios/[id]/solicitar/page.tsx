"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { PrivateNavbar } from "@/components/navigation/PrivateNavbar";
import { PublicNavbar } from "@/components/navigation/PublicNavbar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { marketplaceService, ServicioDetalle } from "@/services/marketplace.service";
import { createSolicitudSchema } from "@/schemas/marketplace.schema";
import { authStorage } from "@/lib/auth-storage";

export default function SolicitarServicioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [servicio, setServicio] = useState<ServicioDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [modalidad, setModalidad] = useState<"PRESENCIAL" | "REMOTA">("REMOTA");
  const [fechaPreferida, setFechaPreferida] = useState("");
  const [direccionTexto, setDireccionTexto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isAuthenticated = authStorage.isAuthenticated();

  useEffect(() => {
    async function fetchServicio() {
      try {
        setLoading(true);
        const data = await marketplaceService.getServicioById(id);
        setServicio(data);
        if (data.modalidades.length > 0) {
          setModalidad(data.modalidades[0]);
        }
      } catch {
        setError("No se pudo cargar la información del servicio para solicitar.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchServicio();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setError(null);

    // Validador de rol y autenticación
    if (!isAuthenticated) {
      router.push(`/login?redirect=/servicios/${id}/solicitar`);
      return;
    }

    const payload = {
      servicio_id: Number(id),
      modalidad,
      fecha_preferida: fechaPreferida,
      direccion_texto: modalidad === "PRESENCIAL" ? direccionTexto : undefined,
      descripcion,
    };

    const validation = createSolicitudSchema.safeParse(payload);
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
      await marketplaceService.createSolicitud(validation.data);
      setSuccess(true);
      setTimeout(() => {
        router.push("/solicitudes");
      }, 2000);
    } catch {
      setError("Ocurrió un error al enviar la solicitud. Por favor intenta de nuevo.");
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
    <div className="min-h-screen bg-[#FAF8FF] text-[#0F172A] flex flex-col font-sans">
      {isAuthenticated ? <PrivateNavbar /> : <PublicNavbar />}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href={`/servicios/${id}`}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-[#434655] hover:text-[#1D4ED8] mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al servicio</span>
        </Link>

        {/* 1. LOADING STATE */}
        {loading && <CardSkeleton />}

        {/* 2. ERROR STATE INICIAL */}
        {!loading && error && !servicio && (
          <ErrorAlert
            title="Error al cargar servicio"
            message={error}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* 3. SUCCESS / SUBMITTED STATE */}
        {success && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] p-8 text-center shadow-sm">
            <div className="h-16 w-16 bg-[#D1FAE5] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">
              ¡Solicitud Enviada con Éxito!
            </h2>
            <p className="text-sm text-[#434655] max-w-md mx-auto mb-6">
              El profesional ha recibido tu requerimiento. Te redirigiremos a tu panel de solicitudes para hacer seguimiento.
            </p>
            <Button onClick={() => router.push("/solicitudes")}>
              Ver mis solicitudes
            </Button>
          </div>
        )}

        {/* 4. FORMULARIO PRINCIPAL */}
        {!loading && servicio && !success && (
          <div className="bg-white rounded-xl border border-[#CBD5E1] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#E2E8F0] pb-6 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                Contratación Directa
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-1">
                Solicitar Servicio
              </h1>
              <p className="text-sm text-[#434655] mt-1">
                Servicio: <strong className="text-[#0F172A]">{servicio.titulo}</strong> — Profesional: <strong className="text-[#0F172A]">{servicio.trabajador_nombre}</strong>
              </p>
              <div className="mt-2 text-sm font-bold text-[#1D4ED8] font-mono">
                Precio base: {formatCOP(servicio.precio_base)} COP
              </div>
            </div>

            {error && (
              <div className="mb-6">
                <ErrorAlert title="No se pudo enviar" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de Modalidad */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-2">
                  ¿Cómo requieres recibir este servicio? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicio.modalidades.map((mod) => (
                    <button
                      type="button"
                      key={mod}
                      onClick={() => setModalidad(mod)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        modalidad === mod
                          ? "border-[#1D4ED8] bg-[#F2F3FF] shadow-sm"
                          : "border-[#CBD5E1] hover:bg-[#FAF8FF]"
                      }`}
                    >
                      <p className="font-bold text-sm text-[#0F172A]">
                        {mod === "PRESENCIAL" ? "Presencial (En Sitio)" : "Remoto (Virtual)"}
                      </p>
                      <p className="text-xs text-[#434655] mt-1">
                        {mod === "PRESENCIAL"
                          ? "El profesional asiste a tu dirección con verificación de seguridad PIN."
                          : "Coordinación a través de plataformas virtuales y chat seguro."}
                      </p>
                    </button>
                  ))}
                </div>
                {formErrors.modalidad && (
                  <p className="text-xs text-[#BA1A1A] mt-1.5">{formErrors.modalidad}</p>
                )}
              </div>

              {/* Dirección requerida si es Presencial */}
              {modalidad === "PRESENCIAL" && (
                <div>
                  <Input
                    label="Dirección completa de atención *"
                    placeholder="Ej: Calle 72 # 11-86, Apto 402, Chapinero"
                    value={direccionTexto}
                    onChange={(e) => setDireccionTexto(e.target.value)}
                    error={formErrors.direccion_texto}
                    required
                  />
                  <p className="text-xs text-[#434655] mt-1">
                    Indica calle, número, barrio y detalles relevantes de acceso.
                  </p>
                </div>
              )}

              {/* Fecha Tentativa Preferida */}
              <div>
                <Input
                  label="Fecha preferida para el servicio *"
                  type="date"
                  value={fechaPreferida}
                  onChange={(e) => setFechaPreferida(e.target.value)}
                  error={formErrors.fecha_preferida}
                  required
                />
              </div>

              {/* Descripción del requerimiento */}
              <div>
                <label className="block text-sm font-bold text-[#0F172A] mb-1.5">
                  Describe tu requerimiento o proyecto *
                </label>
                <textarea
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Explica qué necesitas resolver, requerimientos específicos y expectativas..."
                  className="w-full rounded-lg border border-[#CBD5E1] p-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#1D4ED8] focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  required
                />
                {formErrors.descripcion && (
                  <p className="text-xs text-[#BA1A1A] mt-1.5">{formErrors.descripcion}</p>
                )}
              </div>

              {/* Notice OWASP / Seguridad */}
              <div className="rounded-lg bg-[#FAF8FF] border border-[#CBD5E1] p-4 text-xs text-[#434655] flex items-start space-x-2">
                <ShieldCheck className="h-5 w-5 text-[#059669] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#0F172A]">Compromiso de Confianza FindJob</p>
                  <p>
                    Tus datos de contacto están protegidos. El chat interno y los detalles de ubicación se habilitarán solo tras la aceptación mutua.
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Enviando..." : "Confirmar y Enviar Solicitud"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
