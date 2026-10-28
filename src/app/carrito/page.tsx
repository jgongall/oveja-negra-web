"use client";

import Link from "next/link";
import { cart, cartTotal, useCart } from "@/lib/cart";
import { imageUrl, money } from "@/lib/format";

export default function CarritoPage() {
  const lines = useCart();
  if (lines.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Carrito</h1>
        <p>Tu carrito está vacío. <Link href="/tienda" className="underline">Ir a la tienda</Link></p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Carrito</h1>
      {lines.map((l) => (
        <div key={l.variantId} className="flex items-center gap-4 border-b pb-4">
          <div className="h-20 w-20 overflow-hidden rounded bg-crema">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {l.image && <img src={imageUrl(l.image)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1">
            <Link href={`/producto/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>
            <div className="text-sm text-cafe/70">Talla {l.size}{l.color ? ` · ${l.color}` : ""} · {money(l.price)}</div>
          </div>
          <input type="number" min={1} max={99} value={l.quantity} aria-label="Cantidad"
            onChange={(e) => cart.setQuantity(l.variantId, Number(e.target.value) || 1)} className="w-16 rounded border px-2 py-1" />
          <div className="w-28 text-right">{money(l.price * l.quantity)}</div>
          <button onClick={() => cart.remove(l.variantId)} className="text-sm text-red-600 hover:underline">Quitar</button>
        </div>
      ))}
      <div className="flex items-center justify-end gap-6">
        <div className="text-lg">Total: <b>{money(cartTotal(lines))}</b></div>
        <Link href="/checkout" className="rounded bg-cafe hover:bg-cafe-oscuro px-6 py-2 text-white">Continuar</Link>
      </div>
      <p className="text-right text-xs text-cafe/70">Precios y stock se confirman al pagar.</p>
    </div>
  );
}
