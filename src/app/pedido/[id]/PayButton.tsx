"use client";

import { useState, useTransition } from "react";
import { retryPayment } from "./actions";

export function PayButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="mt-3">
      <button disabled={pending} className="rounded bg-cafe hover:bg-cafe-oscuro px-4 py-2 text-white disabled:opacity-50"
        onClick={() => start(async () => {
          const r = await retryPayment(orderId);
          if (r.url) window.location.href = r.url;
          else setError(r.error ?? "");
        })}>
        Pagar con Mercado Pago
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
