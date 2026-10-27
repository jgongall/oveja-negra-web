"use client";

import { useActionState } from "react";
import { updateProfile, type FormState } from "./actions";

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      <input name="full_name" defaultValue={fullName} placeholder="Nombre" className="rounded border px-3 py-2" />
      <input name="phone" defaultValue={phone} placeholder="Teléfono" className="rounded border px-3 py-2" />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="text-sm text-green-700">{state.message}</p>}
      <button disabled={pending} className="self-start rounded border px-4 py-2">Guardar</button>
    </form>
  );
}
