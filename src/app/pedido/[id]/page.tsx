import { notFound } from "next/navigation";
import { Suspense } from "react";
import { dateTime, money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS, type Order, type OrderItem } from "@/lib/types";
import { PayButton } from "./PayButton";

async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  // RLS: sólo el dueño (o un admin) puede leerlo.
  const { data } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const order = data as Order & { order_items: OrderItem[] };
  const a = order.shipping_address;

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Pedido</h1>
        <p className="text-sm text-cafe/70">#{order.id.slice(0, 8)} · {dateTime(order.created_at)}</p>
      </div>
      <div className="rounded border p-4">
        <div className="font-semibold">{ORDER_STATUS[order.status]}</div>
        {order.status === "pendiente" && (
          <>
            <p className="mt-1 text-sm text-cafe/70">
              Si ya pagaste, la confirmación de Mercado Pago puede tardar unos minutos.
            </p>
            <PayButton orderId={order.id} />
          </>
        )}
      </div>
      <ul className="divide-y">
        {order.order_items.map((i) => (
          <li key={i.id} className="flex justify-between py-2">
            <span>{i.quantity} × {i.product_name} ({i.size}{i.color ? `, ${i.color}` : ""})</span>
            <span>{money(i.unit_price * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between py-2 font-semibold"><span>Total</span><span>{money(order.total)}</span></li>
      </ul>
      <div className="text-sm">
        <div className="font-semibold">Envío</div>
        <div>{order.full_name} · {order.phone}</div>
        <div>{a.street}, {a.city}{a.region ? `, ${a.region}` : ""} {a.postal_code}</div>
        {a.notes && <div className="text-cafe/70">{a.notes}</div>}
      </div>
    </div>
  );
}

export default function PedidoPage(props: PageProps<"/pedido/[id]">) {
  return <Suspense fallback={<p>Cargando…</p>}><OrderDetail params={props.params} /></Suspense>;
}
