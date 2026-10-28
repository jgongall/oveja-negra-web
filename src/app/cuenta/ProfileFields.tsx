import type { Profile } from "@/lib/types";

const input = "w-full rounded border px-3 py-2";

/** Campos del perfil, compartidos por el registro y "Mis datos". */
export function ProfileFields({ profile }: { profile?: Profile | null }) {
  return (
    <>
      <input name="full_name" defaultValue={profile?.full_name} placeholder="Nombre completo" required maxLength={120}
        autoComplete="name" className={input} />
      <input name="age" type="number" min={0} max={120} defaultValue={profile?.age ?? ""} placeholder="Edad"
        className={input} />
      <input name="address" defaultValue={profile?.address} placeholder="Dirección" maxLength={200}
        autoComplete="street-address" className={input} />
      <div className="grid grid-cols-2 gap-3">
        <input name="city" defaultValue={profile?.city} placeholder="Ciudad" maxLength={80} className={input} />
        <input name="region" defaultValue={profile?.region} placeholder="Región" maxLength={80} className={input} />
      </div>
      <input name="phone" type="tel" defaultValue={profile?.phone} placeholder="Fono" maxLength={40}
        autoComplete="tel" className={input} />
    </>
  );
}
