import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog";

async function Featured() {
  const [products, categories] = await Promise.all([getProducts({ featured: true }), getCategories()]);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Link key={c.id} href={`/tienda?categoria=${c.slug}`} className="rounded-full border px-4 py-1 text-sm hover:bg-neutral-100">
            {c.name}
          </Link>
        ))}
      </div>
      <h2 className="mt-8 mb-4 text-xl font-semibold">Destacados</h2>
      <ProductGrid products={products} />
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-3xl font-bold">Ropa para tu mascota</h1>
        <p className="mt-2 text-neutral-600">Abrigos, sweaters y accesorios para perros y gatos.</p>
        <Link href="/tienda" className="mt-4 inline-block rounded bg-black px-4 py-2 text-white">Ver la tienda</Link>
      </section>
      <Suspense fallback={<p>Cargando…</p>}><Featured /></Suspense>
    </div>
  );
}
