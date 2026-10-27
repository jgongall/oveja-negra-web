import { Suspense } from "react";
import { getCategories } from "@/lib/catalog";
import { deleteCategory } from "../actions";
import { CategoryForm } from "./CategoryForm";

async function Categories() {
  const categories = await getCategories();
  return (
    <ul className="divide-y">
      {categories.map((c) => (
        <li key={c.id} className="flex items-center justify-between py-2">
          <span>{c.name} <span className="text-xs text-neutral-500">/{c.slug} · orden {c.position}</span></span>
          <form action={deleteCategory.bind(null, c.id)}>
            <button className="text-sm text-red-600 hover:underline">Borrar</button>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriasPage() {
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Categorías</h1>
      <CategoryForm />
      <Suspense fallback={<p>Cargando…</p>}><Categories /></Suspense>
      <p className="text-xs text-neutral-500">Al borrar una categoría, sus productos quedan sin categoría.</p>
    </div>
  );
}
