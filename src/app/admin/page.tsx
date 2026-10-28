import Link from "next/link";
import { Suspense } from "react";
import { dateTime, money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS, type Order, type OrderStatus } from "@/lib/types";
import { OrderStatusSelect } from "./OrderStatusSelect";

async function Orders({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (estado && estado in ORDER_STATUS) query = query.eq("status", estado);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <>
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className={!estado ? "font-semibold underline" : "hover:underline"}>Todos</Link>
        {Object.entries(ORDER_STATUS).map(([k, label]) => (
          <Link key={k} href={`/admin?estado=${k}`} className={estado === k ? "font-semibold underline" : "hover:underline"}>{label}</Link>
        ))}
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]">
        <thead className="text-left text-cafe/70">
          <tr><th className="py-2">Fecha</th><th>Cliente</th><th>Ciudad</th><th>Total</th><th>Estado</th></tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((o) => (
            <tr key={o.id}>
              <td className="py-2"><Link href={`/pedido/${o.id}`} className="hover:underline">{dateTime(o.created_at)}</Link></td>
              <td>{o.full_name}<div className="text-xs text-cafe/70">{o.email} · {o.phone}</div></td>
              <td>{o.shipping_address.city}</td>
              <td>{money(o.total)}</td>
              <td><OrderStatusSelect orderId={o.id} status={o.status as OrderStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table></div>
      {orders.length === 0 && <p className="text-cafe/70">No hay pedidos.</p>}
    </>
  );
}

export default function AdminOrdersPage(props: PageProps<"/admin">) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>
      <Suspense fallback={<p>Cargando…</p>}>
        <Orders searchParams={props.searchParams as Promise<{ estado?: string }>} />
      </Suspense>
    </div>
  );
}
