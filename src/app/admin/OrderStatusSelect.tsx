"use client";

import { useTransition } from "react";
import { ORDER_STATUS, type OrderStatus } from "@/lib/types";
import { setOrderStatus } from "./actions";

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  return (
    <select defaultValue={status} disabled={pending} className="rounded border px-2 py-1"
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        // Marcar "pagado" a mano no descuenta stock: eso lo hace la confirmación de Mercado Pago.
        if (next === "pagado" && !confirm("¿Marcar como pagado a mano? No descuenta stock.")) {
          e.target.value = status;
          return;
        }
        start(() => setOrderStatus(orderId, next));
      }}>
      {Object.entries(ORDER_STATUS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
    </select>
  );
}
