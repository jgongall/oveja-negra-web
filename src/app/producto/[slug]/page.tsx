import { notFound } from "next/navigation";
import { Suspense } from "react";
import { coverOf, getProduct } from "@/lib/catalog";
import { imageUrl, money } from "@/lib/format";
import { PETS } from "@/lib/types";
import { AddToCart } from "./AddToCart";

async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const images = [...p.product_images].sort((a, b) => a.position - b.position);
  const cover = coverOf(p);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        {images.length === 0 && <div className="aspect-square rounded bg-crema" />}
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.id} src={imageUrl(img.path)} alt={img.alt || p.name} className="w-full rounded" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="text-sm text-cafe/70">{p.categories?.name} · {PETS[p.pet]}</div>
        <h1 className="text-3xl font-bold">{p.name}</h1>
        <div className="text-xl">{money(p.price)}</div>
        <p className="whitespace-pre-line text-cafe/70">{p.description}</p>
        <AddToCart
          product={{ slug: p.slug, name: p.name, price: Number(p.price), image: cover?.path ?? null }}
          variants={p.product_variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock,
            price: Number(v.price_override ?? p.price) }))}
        />
      </div>
    </div>
  );
}

export default function ProductPage(props: PageProps<"/producto/[slug]">) {
  return <Suspense fallback={<p>Cargando…</p>}><Product params={props.params} /></Suspense>;
}
