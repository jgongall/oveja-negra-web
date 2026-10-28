import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { ProductGrid } from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/catalog";

const slides = [
  { src: "/marca/carrusel/gato-sueter.svg", alt: "Gato negro con suéter rosa", title: "Abrigaditos y regalones",
    text: "Polars y camisas para los días fríos.", href: "/tienda?categoria=polars" },
  { src: "/marca/carrusel/paquete-envio.svg", alt: "Paquete de envío", title: "Enviamos a todo Chile",
    text: "Compra online y recíbelo en tu casa.", href: "/tienda" },
];

const perks: { icon: IconName; title: string; text: string }[] = [
  { icon: "envio", title: "Envíos", text: "A todo el país" },
  { icon: "tallas", title: "Tallas XS a XXXL", text: "Para cada perrito y gatito" },
  { icon: "regalo", title: "Ideal para regalar", text: "Hecho con cariño" },
];

/** Carrusel simple con scroll-snap (sin JavaScript): se desliza con el dedo o la barra. */
function Carousel() {
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
      {slides.map((s) => (
        <Link key={s.src} href={s.href}
          className="patron-huellas flex w-full shrink-0 snap-center items-center gap-6 rounded-2xl p-6 sm:p-10">
          <Image src={s.src} alt={s.alt} width={240} height={240} className="h-32 w-32 sm:h-60 sm:w-60" />
          <div>
            <h2 className="text-2xl font-extrabold text-cafe sm:text-4xl">{s.title}</h2>
            <p className="mt-2 text-cafe/80">{s.text}</p>
            <span className="mt-4 inline-block rounded-full bg-cafe px-5 py-2 text-sm font-semibold text-white">Ver más</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function Featured() {
  const [products, categories] = await Promise.all([getProducts({ featured: true }), getCategories()]);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Link href="/tienda?mascota=perro" className="flex items-center gap-1 rounded-full bg-rosa px-4 py-1 text-sm font-semibold text-cafe">
          <Icon name="perro" size={18} /> Perritos
        </Link>
        <Link href="/tienda?mascota=gato" className="flex items-center gap-1 rounded-full bg-rosa px-4 py-1 text-sm font-semibold text-cafe">
          <Icon name="gato" size={18} /> Gatitos
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/tienda?categoria=${c.slug}`}
            className="rounded-full border border-cafe/30 px-4 py-1 text-sm text-cafe hover:bg-crema">
            {c.name}
          </Link>
        ))}
      </div>
      <h2 className="mt-4 flex items-center gap-2 text-xl font-bold text-cafe"><Icon name="estrella" /> Destacados</h2>
      <ProductGrid products={products} />
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <Carousel />
      <div className="grid gap-4 sm:grid-cols-3">
        {perks.map((p) => (
          <div key={p.icon} className="flex items-center gap-3 rounded-xl bg-rosa-claro p-4 text-cafe">
            <Icon name={p.icon} size={36} />
            <div><div className="font-bold">{p.title}</div><div className="text-sm">{p.text}</div></div>
          </div>
        ))}
      </div>
      <Suspense fallback={<p>Cargando…</p>}><Featured /></Suspense>
    </div>
  );
}
