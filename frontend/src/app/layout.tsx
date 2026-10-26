import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FindJob Colombia — Plataforma de Servicios y Profesionales",
  description:
    "Conectamos clientes con profesionales de oficios calificados y servicios técnicos para el hogar y empresas en Colombia de forma rápida, transparente y confiable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen bg-[#FAF8FF] font-sans text-[#0F172A] antialiased">
        {children}
      </body>
    </html>
  );
}
