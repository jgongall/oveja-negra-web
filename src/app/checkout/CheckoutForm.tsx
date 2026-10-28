"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cart, cartTotal, useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { placeOrder } from "./actions";

const input = "w-full rounded border px-3 py-2";

/** Los datos de envío vienen del perfil; se pueden cambiar sólo para este pedido. */
export function CheckoutForm({ profile }: { profile: Profile | null }) {
  const lines = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (lines.length === 0) return <p>Tu carrito está vacío. <Link href="/tienda" className="underline">Ir a la tienda</Link></p>;

  function submit(form: FormData) {
    setError("");
    start(async () => {
      const result = await placeOrder({
        lines: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        ...Object.fromEntries(["full_name", "phone", "street", "city", "region", "postal_code", "notes"]
          .map((k) => [k, String(form.get(k) ?? "")])),
      });
      if ("error" in result) return setError(result.error);
      cart.clear();
      if (result.payUrl) window.location.href = result.payUrl;
      else router.push(`/pedido/${result.orderId}`);
    });
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <form action={submit} className="flex flex-col gap-3">
        <h2 className="font-semibold">Datos de envío</h2>
        <input name="full_name" defaultValue={profile?.full_name} placeholder="Nombre completo" required className={input} />
        <input name="phone" defaultValue={profile?.phone} placeholder="Fono" required minLength={6} className={input} />
        <input name="street" defaultValue={profile?.address} placeholder="Dirección" required className={input} />
        <div className="grid grid-cols-2 gap-3">
          <input name="city" defaultValue={profile?.city} placeholder="Ciudad / comuna" required className={input} />
          <input name="region" defaultValue={profile?.region} placeholder="Región" className={input} />
        </div>
        <input name="postal_code" placeholder="Código postal (opcional)" className={input} />
        <textarea name="notes" placeholder="Notas para la entrega (opcional)" maxLength={500} className={input} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={pending} className="rounded bg-cafe hover:bg-cafe-oscuro px-4 py-2 text-white disabled:opacity-50">
          {pending ? "Procesando…" : "Ir a pagar"}
        </button>
      </form>
      <aside className="flex flex-col gap-2 rounded border p-4">
        <h2 className="font-semibold">Resumen</h2>
        {lines.map((l) => (
          <div key={l.variantId} className="flex justify-between text-sm">
            <span>{l.quantity} × {l.name} ({l.size})</span><span>{money(l.price * l.quantity)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{money(cartTotal(lines))}</span></div>
        <p className="text-xs text-cafe/70">El total final se confirma con los precios vigentes.</p>
      </aside>
    </div>
  );
}
