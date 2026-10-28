"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import { Icon } from "./Icon";

export function CartBadge() {
  const n = cartCount(useCart());
  return (
    <Link href="/carrito" aria-label={`Carrito (${n})`} className="relative hover:opacity-70">
      <Icon name="carrito" size={24} />
      {n > 0 && (
        <span className="absolute -top-2 -right-2 rounded-full bg-rosa px-1.5 text-xs font-bold text-cafe">{n}</span>
      )}
    </Link>
  );
}
