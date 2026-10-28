import Link from "next/link";
import { Suspense } from "react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { Icon, type IconName } from "@/components/Icon";
import { ProductCardView, ProductGrid } from "@/components/ProductCard";
import { getProducts } from "@/lib/catalog";

// Ilustraciones de muestra (public/marca/productos) mientras la tienda no tiene productos destacados.
const samples = [
  { name: "Polerón tejido oliva", pet: "Perros", image: "poleron-tejido" },
  { name: "Suéter cuello alto", pet: "Gatos", image: "sueter-cuello-alto" },
  { name: "Chaleco acolchado", pet: "Perros", image: "chaleco-acolchado" },
  { name: "Bandana rosa pastel", pet: "Gatos", image: "bandana-rosa" },
  { name: "Impermeable con capucha", pet: "Perros", image: "impermeable" },
  { name: "Collar con cascabel", pet: "Gatos", image: "collar-cascabel" },
];

const perks: { icon: IconName; title: string; text: string }[] = [
  { icon: "tallas", title: "Tallas para todos", text: "Desde gatitos hasta perros grandes." },
  { icon: "huella", title: "Telas suaves", text: "Cómodas para jugar y dormir." },
  { icon: "envio", title: "Envíos", text: "A todo Chile." },
];

const filters = [
  { key: "", label: "Todos" }, { key: "perro", label: "Perros" }, { key: "gato", label: "Gatos" },
];

async function Favorites({ searchParams }: { searchParams: Promise<{ mascota?: string }> }) {
  const { mascota = "" } = await searchParams;
  const products = await getProducts({ featured: true, pet: mascota });
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-script text-lg text-cafe">hecho con cariño</p>
          <h2 className="text-3xl font-extrabold text-oliva-oscuro">Nuestros favoritos</h2>
        </div>
        <div className="flex gap-2">
          {filters.map((f) => (
            <Link key={f.label} href={f.key ? `/?mascota=${f.key}` : "/"} scroll={false}
              className={`flex items-center gap-1 rounded-full border-2 border-cafe px-3 py-1 text-xs font-bold text-cafe ${mascota === f.key ? "bg-rosa" : "bg-white hover:bg-rosa-claro"}`}>
              <Icon name="huella" size={14} /> {f.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="mt-6">
        {products.length > 0 ? <ProductGrid products={products} /> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {samples.filter((s) => !mascota || s.pet === (mascota === "perro" ? "Perros" : "Gatos")).map((s) => (
              <ProductCardView key={s.image} href="/tienda" name={s.name} pet={s.pet} sizes={["XS", "S", "M", "L"]}
                image={`/marca/productos/${s.image}.svg`} price="Próximamente" />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function Home(props: PageProps<"/">) {
  return (
    // La portada ocupa todo el ancho: sale del contenedor de <main> (margen negativo de medio viewport).
    <div className="relative left-1/2 -my-8 w-screen -translate-x-1/2">
      <HeroCarousel />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Suspense fallback={<p>Cargando…</p>}>
          <Favorites searchParams={props.searchParams as Promise<{ mascota?: string }>} />
        </Suspense>
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {perks.map((p) => (
            <div key={p.title} className="flex items-center gap-3 rounded-2xl border-2 border-cafe bg-oliva-claro p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-cafe bg-rosa">
                <Icon name={p.icon} size={20} />
              </span>
              <div>
                <div className="text-sm font-extrabold text-oliva-oscuro">{p.title}</div>
                <div className="text-xs text-cafe">{p.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
