import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JF Equipos ERP',
  description: 'Sistema de control y gestión para JF Equipos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}