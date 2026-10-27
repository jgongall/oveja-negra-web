import Link from "next/link";
import { Suspense } from "react";
import { money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product, Variant } from "@/lib/types";

async function Products() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*, product_variants(stock), categories(name)")
    .order("created_at", { ascending: false });
  const products = (data ?? []) as (Product & { product_variants: Pick<Variant, "stock">[]; categories: { name: string } | null })[];

  return (
    <table className="w-full text-sm">
      <thead className="text-left text-neutral-500">
        <tr><th className="py-2">Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr>
      </thead>
      <tbody className="divide-y">
        {products.map((p) => (
          <tr key={p.id}>
            <td className="py-2"><Link href={`/admin/productos/${p.id}`} className="hover:underline">{p.name}</Link></td>
            <td>{p.categories?.name ?? "—"}</td>
            <td>{money(p.price)}</td>
            <td>{p.product_variants.reduce((n, v) => n + v.stock, 0)}</td>
            <td>{p.active ? "Visible" : "Oculto"}{p.featured ? " · Destacado" : ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo" className="rounded bg-black px-4 py-2 text-sm text-white">Nuevo producto</Link>
      </div>
      <Suspense fallback={<p>Cargando…</p>}><Products /></Suspense>
    </div>
  );
}
