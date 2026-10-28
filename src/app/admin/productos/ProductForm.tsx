"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PETS, SIZES, type Category, type ProductWithDetails, type Size } from "@/lib/types";
import { saveProduct, type ProductInputT } from "../actions";

type VariantRow = { key: string; id?: number; size: Size; color: string; sku: string; stock: string; price_override: string };

const input = "rounded border px-3 py-2";
let seq = 0;
const newRow = (): VariantRow => ({ key: `n${seq++}`, size: "M", color: "", sku: "", stock: "0", price_override: "" });

export function ProductForm({ product: p, categories }: { product?: ProductWithDetails; categories: Category[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ error?: string; message?: string }>({});
  const [rows, setRows] = useState<VariantRow[]>(() => p?.product_variants.map((v) => ({
    key: String(v.id), id: v.id, size: v.size, color: v.color, sku: v.sku ?? "", stock: String(v.stock),
    price_override: v.price_override == null ? "" : String(v.price_override),
  })) ?? [newRow()]);

  const update = (key: string, patch: Partial<VariantRow>) =>
    setRows(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  function submit(form: FormData) {
    const data: ProductInputT = {
      name: String(form.get("name")), slug: String(form.get("slug") ?? ""),
      description: String(form.get("description") ?? ""),
      category_id: form.get("category_id") ? Number(form.get("category_id")) : null,
      pet: form.get("pet") as "perro" | "gato" | "ambos", price: Number(form.get("price")),
      active: form.get("active") === "on", featured: form.get("featured") === "on",
      variants: rows.map((r) => ({ id: r.id, size: r.size, color: r.color, sku: r.sku, stock: Number(r.stock),
        price_override: r.price_override === "" ? null : Number(r.price_override) })),
    };
    start(async () => {
      const result = await saveProduct(p?.id ?? null, data);
      setMsg(result);
      if (result.id && !p) router.push(`/admin/productos/${result.id}`); // al crear, seguir con las fotos
      else router.refresh();
    });
  }

  return (
    <form action={submit} className="flex max-w-3xl flex-col gap-3">
      <input name="name" defaultValue={p?.name} placeholder="Nombre" required maxLength={120} className={input} />
      <input name="slug" defaultValue={p?.slug} placeholder="URL (se genera del nombre si se deja vacía)" className={input} />
      <textarea name="description" defaultValue={p?.description} placeholder="Descripción" rows={5} className={input} />
      <div className="grid grid-cols-3 gap-3">
        <select name="category_id" defaultValue={p?.category_id ?? ""} className={input}>
          <option value="">Sin categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="pet" defaultValue={p?.pet ?? "ambos"} className={input}>
          {Object.entries(PETS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
        <input name="price" type="number" min={0} step="any" defaultValue={p?.price} placeholder="Precio" required className={input} />
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} /> Visible en la tienda</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Destacado</label>
      </div>

      <h2 className="mt-4 font-semibold">Tallas, colores y stock</h2>
      <div className="grid grid-cols-[90px_1fr_1fr_90px_120px_auto] gap-2 text-xs text-cafe/70">
        <span>Talla</span><span>Color</span><span>SKU</span><span>Stock</span><span>Precio distinto</span><span />
      </div>
      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-[90px_1fr_1fr_90px_120px_auto] gap-2">
          <select value={r.size} onChange={(e) => update(r.key, { size: e.target.value as Size })} className={input}>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <input value={r.color} onChange={(e) => update(r.key, { color: e.target.value })} placeholder="Color" className={input} />
          <input value={r.sku} onChange={(e) => update(r.key, { sku: e.target.value })} placeholder="SKU" className={input} />
          <input value={r.stock} onChange={(e) => update(r.key, { stock: e.target.value })} type="number" min={0} className={input} />
          <input value={r.price_override} onChange={(e) => update(r.key, { price_override: e.target.value })} type="number" min={0}
            step="any" placeholder="—" className={input} />
          <button type="button" onClick={() => setRows(rows.filter((x) => x.key !== r.key))} className="text-sm text-red-600">Quitar</button>
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, newRow()])} className="self-start text-sm underline">Agregar talla</button>

      {msg.error && <p className="text-sm text-red-600">{msg.error}</p>}
      {msg.message && <p className="text-sm text-green-700">{msg.message}</p>}
      <button disabled={pending} className="self-start rounded bg-cafe hover:bg-cafe-oscuro px-6 py-2 text-white disabled:opacity-50">
        {pending ? "Guardando…" : p ? "Guardar cambios" : "Crear producto"}
      </button>
      {!p && <p className="text-xs text-cafe/70">Las fotos se agregan después de crear el producto.</p>}
    </form>
  );
}
