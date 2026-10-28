"use client";

import { useState } from "react";
import { cart } from "@/lib/cart";
import { money } from "@/lib/format";
import { SIZES } from "@/lib/types";

type V = { id: number; size: string; color: string; stock: number; price: number };

export function AddToCart({ product, variants }: {
  product: { slug: string; name: string; price: number; image: string | null }; variants: V[];
}) {
  const sorted = [...variants].sort((a, b) => SIZES.indexOf(a.size as never) - SIZES.indexOf(b.size as never));
  const [selected, setSelected] = useState<V | undefined>(sorted.find((v) => v.stock > 0));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (variants.length === 0) return <p className="text-cafe/70">Sin tallas disponibles por ahora.</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {sorted.map((v) => (
          <button key={v.id} type="button" disabled={v.stock === 0} onClick={() => { setSelected(v); setQty(1); }}
            className={`rounded border px-3 py-1 text-sm disabled:opacity-40 ${selected?.id === v.id ? "bg-cafe hover:bg-cafe-oscuro text-white" : ""}`}>
            {v.size}{v.color ? ` · ${v.color}` : ""}
          </button>
        ))}
      </div>
      {selected && (
        <>
          <div className="text-sm text-cafe/70">{money(selected.price)} · {selected.stock} disponibles</div>
          <div className="flex items-center gap-2">
            <input type="number" min={1} max={Math.min(99, selected.stock)} value={qty}
              onChange={(e) => setQty(Math.max(1, Math.min(selected.stock, Number(e.target.value) || 1)))}
              className="w-20 rounded border px-2 py-1" aria-label="Cantidad" />
            <button className="rounded bg-cafe hover:bg-cafe-oscuro px-4 py-2 text-white" onClick={() => {
              cart.add({ variantId: selected.id, slug: product.slug, name: product.name, size: selected.size,
                color: selected.color, price: selected.price, image: product.image, quantity: qty });
              setAdded(true);
            }}>Agregar al carrito</button>
          </div>
          {added && <p className="text-sm text-green-700">Agregado al carrito.</p>}
        </>
      )}
    </div>
  );
}
