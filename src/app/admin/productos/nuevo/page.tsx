import { Suspense } from "react";
import { getCategories } from "@/lib/catalog";
import { ProductForm } from "../ProductForm";

async function NewProduct() {
  return <ProductForm categories={await getCategories()} />;
}

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <Suspense fallback={<p>Cargando…</p>}><NewProduct /></Suspense>
    </div>
  );
}
