"use server";

import { z } from "zod";
import { variantPrice } from "@/lib/format";
import { createCheckout } from "@/lib/mercadopago";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const Input = z.object({
  lines: z.array(z.object({ variantId: z.number().int().positive(), quantity: z.number().int().min(1).max(99) }))
    .min(1).max(50),
  full_name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(6).max(40),
  street: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().max(80),
  postal_code: z.string().trim().max(20),
  notes: z.string().trim().max(500),
});

export type CheckoutResult = { error: string } | { orderId: string; payUrl: string | null };

/**
 * Crea el pedido. Precios y stock salen de la base, nunca del carrito del navegador.
 * El stock se descuenta recién al confirmarse el pago (confirm_order_payment).
 */
export async function placeOrder(raw: unknown): Promise<CheckoutResult> {
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { error: "Revisa los datos de envío." };
  const data = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Inicia sesión para comprar." };

  const ids = [...new Set(data.lines.map((l) => l.variantId))];
  const { data: variants } = await supabase.from("product_variants")
    .select("id, size, color, stock, price_override, products!inner(name, price, active)").in("id", ids);

  type Row = { id: number; size: string; color: string; stock: number; price_override: number | null;
    products: { name: string; price: number; active: boolean } };
  const byId = new Map((variants as unknown as Row[] ?? []).map((v) => [v.id, v]));

  const items = [];
  for (const line of data.lines) {
    const v = byId.get(line.variantId);
    if (!v || !v.products.active) return { error: "Un producto del carrito ya no está disponible." };
    if (v.stock < line.quantity) {
      return { error: `No hay stock suficiente de ${v.products.name} (talla ${v.size}): quedan ${v.stock}.` };
    }
    items.push({ variant_id: v.id, product_name: v.products.name, size: v.size, color: v.color,
      unit_price: variantPrice(v.products.price, v.price_override), quantity: line.quantity });
  }
  const total = items.reduce((n, i) => n + i.unit_price * i.quantity, 0);

  // Los pedidos no se pueden crear con la clave pública (RLS): se usa la service role, ya con datos validados.
  const admin = createServiceClient();
  const { data: order, error } = await admin.from("orders").insert({
    user_id: user.id, email: user.email, full_name: data.full_name, phone: data.phone, total,
    shipping_address: { street: data.street, city: data.city, region: data.region, postal_code: data.postal_code,
      notes: data.notes },
  }).select("id").single();
  if (error || !order) return { error: "No se pudo crear el pedido. Intenta de nuevo." };

  const { error: itemsError } = await admin.from("order_items").insert(items.map((i) => ({ ...i, order_id: order.id })));
  if (itemsError) {
    await admin.from("orders").delete().eq("id", order.id);
    return { error: "No se pudo crear el pedido. Intenta de nuevo." };
  }

  try {
    const checkout = await createCheckout({ id: order.id, email: user.email },
      items.map((i) => ({ title: `${i.product_name} (${i.size}${i.color ? `, ${i.color}` : ""})`,
        quantity: i.quantity, unit_price: i.unit_price })));
    if (checkout) await admin.from("orders").update({ mp_preference_id: checkout.preferenceId }).eq("id", order.id);
    return { orderId: order.id, payUrl: checkout?.url ?? null };
  } catch {
    // El pedido queda pendiente; se puede reintentar el pago desde su página.
    return { orderId: order.id, payUrl: null };
  }
}
