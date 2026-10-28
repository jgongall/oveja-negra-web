import Link from "next/link";
import { coverOf } from "@/lib/catalog";
import { imageUrl, money } from "@/lib/format";
import { PETS, SIZES, type ProductWithDetails } from "@/lib/types";
import { Icon } from "./Icon";

/** Tarjeta de producto; también se usa con datos de muestra (sin link de compra) mientras no hay catálogo. */
export function ProductCardView({ href, name, pet, image, sizes, price, soldOut }: {
  href: string; name: string; pet: string; image: string | null; sizes: string[]; price: string; soldOut?: boolean;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border-2 border-cafe bg-white shadow-[0_3px_0_var(--color-cafe)]">
      <Link href={href} className="relative flex aspect-[4/3] items-center justify-center border-b-2 border-cafe bg-oliva-claro">
        <span className="absolute top-2 left-2 rounded-full bg-rosa px-2 py-0.5 text-[10px] font-extrabold text-cafe">{pet}</span>
        {image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={image} alt={name} className="h-full w-full object-contain p-3" />
          : <Icon name="huella" size={56} />}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link href={href} className="text-sm font-extrabold text-cafe hover:underline">{name}</Link>
        <div className="flex flex-wrap gap-1">
          {sizes.map((s) => (
            <span key={s} className="rounded border border-cafe px-1.5 text-[10px] font-bold text-cafe">{s}</span>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-extrabold text-cafe">{soldOut ? "Agotado" : price}</span>
          <Link href={href} className="rounded-full border-2 border-cafe bg-oliva-oscuro px-4 py-1.5 text-center text-xs font-bold text-white hover:bg-oliva">
            Agregar
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ProductCard({ product: p }: { product: ProductWithDetails }) {
  const cover = coverOf(p);
  const sizes = SIZES.filter((s) => p.product_variants.some((v) => v.size === s));
  return (
    <ProductCardView href={`/producto/${p.slug}`} name={p.name} pet={PETS[p.pet]} sizes={sizes}
      image={cover ? imageUrl(cover.path) : null} price={money(p.price)}
      soldOut={p.product_variants.every((v) => v.stock === 0)} />
  );
}

export function ProductGrid({ products }: { products: ProductWithDetails[] }) {
  if (products.length === 0) return <p className="text-cafe/70">No hay productos para mostrar.</p>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
