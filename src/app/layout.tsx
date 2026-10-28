import type { Metadata } from "next";
import { Dancing_Script, Nunito } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
// Letra manuscrita del logo, para "Oveja Negra" y frases cortas.
const script = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });

export const metadata: Metadata = {
  title: { default: "Oveja Negra", template: "%s · Oveja Negra" },
  description: "Ropa para perritos y gatitos: impermeables, camisas, polars y disfraces.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${nunito.variable} ${script.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <Header />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 text-cafe-oscuro">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
