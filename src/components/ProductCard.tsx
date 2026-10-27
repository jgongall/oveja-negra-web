import Link from "next/link";
import { coverOf } from "@/lib/catalog";
import { imageUrl, money } from "@/lib/format";
import type { ProductWithDetails } from "@/lib/types";

export function ProductCard({ product: p }: { product: ProductWithDetails }) {
  const cover = coverOf(p);
  const stock = p.product_variants.reduce((n, v) => n + v.stock, 0);
  return (
    <Link href={`/producto/${p.slug}`} className="group block rounded-lg border p-3 hover:shadow">
      <div className="aspect-square overflow-hidden rounded bg-neutral-100">
        {cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl(cover.path)} alt={cover.alt || p.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="mt-2 font-medium group-hover:underline">{p.name}</div>
      <div className="text-sm text-neutral-600">{money(p.price)}{stock === 0 && " · Agotado"}</div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: ProductWithDetails[] }) {
  if (products.length === 0) return <p className="text-neutral-500">No hay productos para mostrar.</p>;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
