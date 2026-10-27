"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";

export function CartBadge() {
  const n = cartCount(useCart());
  return <Link href="/carrito" className="hover:underline">Carrito{n > 0 ? ` (${n})` : ""}</Link>;
}
