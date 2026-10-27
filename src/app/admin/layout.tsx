import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";

async function Guard({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.profile?.role !== "admin") {
    return <p>Esta sección es sólo para administradores.</p>;
  }
  return <>{children}</>;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-col gap-6">
      <nav className="flex gap-4 border-b pb-3 text-sm">
        <span className="font-semibold">Administración</span>
        <Link href="/admin" className="hover:underline">Pedidos</Link>
        <Link href="/admin/productos" className="hover:underline">Productos</Link>
        <Link href="/admin/categorias" className="hover:underline">Categorías</Link>
      </nav>
      <Suspense fallback={<p>Cargando…</p>}><Guard>{children}</Guard></Suspense>
    </div>
  );
}
