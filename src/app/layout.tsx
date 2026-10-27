import type { Metadata } from "next";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Oveja Negra", template: "%s · Oveja Negra" },
  description: "Ropa y accesorios para perros y gatos.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-neutral-500">Oveja Negra · Ropa para mascotas</footer>
      </body>
    </html>
  );
}
