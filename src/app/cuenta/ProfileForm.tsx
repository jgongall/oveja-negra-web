"use client";

import { useActionState } from "react";
import { CUSTOMER_TIERS, type Profile } from "@/lib/types";
import { updateProfile, type FormState } from "./actions";
import { ProfileFields } from "./ProfileFields";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(updateProfile, {});
  return (
    <form action={action} className="flex max-w-sm flex-col gap-3">
      {profile && <p className="text-sm">Rango de cliente: <strong>{CUSTOMER_TIERS[profile.customer_tier]}</strong></p>}
      <ProfileFields profile={profile} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="text-sm text-green-700">{state.message}</p>}
      <button disabled={pending} className="self-start rounded border px-4 py-2">Guardar</button>
    </form>
  );
}
