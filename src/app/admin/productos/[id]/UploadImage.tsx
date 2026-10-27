"use client";

import { useActionState } from "react";
import { uploadImage, type AdminState } from "../../actions";

export function UploadImage({ productId }: { productId: number }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(
    (_, form) => uploadImage(productId, form), {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
      <input name="alt" placeholder="Descripción (accesibilidad)" className="rounded border px-3 py-1" />
      <button disabled={pending} className="rounded border px-3 py-1">{pending ? "Subiendo…" : "Subir foto"}</button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
