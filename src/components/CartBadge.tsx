"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import { Icon } from "./Icon";

export function CartBadge({ className }: { className?: string }) {
  const n = cartCount(useCart());
  return (
    <Link href="/carrito" aria-label={`Carrito (${n})`} className={`relative ${className ?? ""}`}>
      <Icon name="carrito" size={18} />
      {n > 0 && (
        <span className="absolute -top-2 -right-2 rounded-full bg-cafe px-1.5 text-xs font-bold text-white">{n}</span>
      )}
    </Link>
  );
}
