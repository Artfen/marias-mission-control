import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Maria's Mission Control",
  description: "Study schedule dashboard for Guardia Civil Escala de Cabos y Guardias",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#0d0d14] text-white">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
          {children}
        </main>
      </body>
    </html>
  );
}
