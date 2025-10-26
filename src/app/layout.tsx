import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel Admin - Gestão de Usuários",
  description: "Painel administrativo para gerenciamento de usuários e organizações",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="light">
      <body
        className="antialiased bg-white text-gray-900"
      >
        {children}
      </body>
    </html>
  );
}
