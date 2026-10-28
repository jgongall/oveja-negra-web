"use client";

import { useActionState } from "react";
import { saveCategory, type AdminState } from "../actions";

export function CategoryForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveCategory, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="name" placeholder="Nueva categoría" required className="rounded border px-3 py-2" />
      <input name="position" type="number" placeholder="Orden" className="w-24 rounded border px-3 py-2" />
      <button disabled={pending} className="rounded bg-cafe hover:bg-cafe-oscuro px-4 py-2 text-white">Agregar</button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
