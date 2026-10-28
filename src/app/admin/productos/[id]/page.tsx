import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getCategories, PRODUCT_SELECT } from "@/lib/catalog";
import { imageUrl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { ProductWithDetails } from "@/lib/types";
import { deleteImage, deleteProduct } from "../../actions";
import { ProductForm } from "../ProductForm";
import { UploadImage } from "./UploadImage";

async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const supabase = await createClient();
  const [{ data }, categories] = await Promise.all([
    supabase.from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle(), getCategories(),
  ]);
  if (!data) notFound();
  const p = data as ProductWithDetails;
  const images = [...p.product_images].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-8">
      <ProductForm product={p} categories={categories} />
      <section className="flex flex-col gap-3">
        <h2 className="font-semibold">Fotos</h2>
        <div className="flex flex-wrap gap-3">
          {images.map((img) => (
            <div key={img.id} className="flex w-32 flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(img.path)} alt={img.alt} className="h-32 w-32 rounded object-cover" />
              <form action={deleteImage.bind(null, img.id)}>
                <button className="text-xs text-red-600 hover:underline">Quitar</button>
              </form>
            </div>
          ))}
        </div>
        <UploadImage productId={p.id} />
      </section>
      <form action={deleteProduct.bind(null, p.id)} className="border-t pt-4">
        <button className="text-sm text-red-600 hover:underline">Eliminar producto</button>
        <p className="text-xs text-cafe/70">Los pedidos anteriores conservan nombre, talla y precio.</p>
      </form>
    </div>
  );
}

export default function EditProductPage(props: PageProps<"/admin/productos/[id]">) {
  return <Suspense fallback={<p>Cargando…</p>}><EditProduct params={props.params} /></Suspense>;
}
