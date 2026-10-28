import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductGrid } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog";
import { PETS } from "@/lib/types";

export const metadata: Metadata = { title: "Tienda" };

type Params = { categoria?: string; mascota?: string; q?: string };

async function Catalog({ searchParams }: { searchParams: Promise<Params> }) {
  const { categoria, mascota, q } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(), getProducts({ category: categoria, pet: mascota, q: q?.trim() || undefined }),
  ]);
  const link = (change: Params) => {
    const next = new URLSearchParams(Object.entries({ categoria, mascota, q, ...change }).filter(([, v]) => v) as [string, string][]);
    return `/tienda${next.size ? `?${next}` : ""}`;
  };
  const chip = (on: boolean) => `rounded-full border px-3 py-1 text-sm ${on ? "bg-cafe hover:bg-cafe-oscuro text-white" : "hover:bg-crema"}`;

  return (
    <div className="flex flex-col gap-4">
      <form className="flex gap-2" action="/tienda">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        {mascota && <input type="hidden" name="mascota" value={mascota} />}
        <input name="q" defaultValue={q} placeholder="Buscar productos" className="flex-1 rounded border px-3 py-2" />
        <button className="rounded border px-4">Buscar</button>
      </form>
      <div className="flex flex-wrap gap-2">
        <Link href={link({ categoria: undefined })} className={chip(!categoria)}>Todas</Link>
        {categories.map((c) => <Link key={c.id} href={link({ categoria: c.slug })} className={chip(categoria === c.slug)}>{c.name}</Link>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={link({ mascota: undefined })} className={chip(!mascota)}>Todas las mascotas</Link>
        {(["perro", "gato"] as const).map((p) => <Link key={p} href={link({ mascota: p })} className={chip(mascota === p)}>{PETS[p]}</Link>)}
      </div>
      <ProductGrid products={products} />
    </div>
  );
}

export default function TiendaPage(props: PageProps<"/tienda">) {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Tienda</h1>
      <Suspense fallback={<p>Cargando…</p>}><Catalog searchParams={props.searchParams as Promise<Params>} /></Suspense>
    </>
  );
}
