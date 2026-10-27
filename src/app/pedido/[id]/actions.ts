"use server";

import { createCheckout } from "@/lib/mercadopago";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";

/** Reintenta el pago de un pedido propio que sigue pendiente. */
export async function retryPayment(orderId: string): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", orderId).maybeSingle();
  const order = data as (Order & { order_items: OrderItem[] }) | null;
  if (!order || order.status !== "pendiente") return { error: "El pedido no está pendiente de pago." };
  try {
    const checkout = await createCheckout(order, order.order_items.map((i) => ({
      title: `${i.product_name} (${i.size}${i.color ? `, ${i.color}` : ""})`, quantity: i.quantity,
      unit_price: Number(i.unit_price),
    })));
    if (!checkout) return { error: "Los pagos todavía no están configurados." };
    await createServiceClient().from("orders").update({ mp_preference_id: checkout.preferenceId }).eq("id", order.id);
    return { url: checkout.url };
  } catch {
    return { error: "No se pudo conectar con Mercado Pago." };
  }
}
