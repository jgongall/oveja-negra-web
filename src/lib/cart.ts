"use client";

import { useSyncExternalStore } from "react";

/** Línea del carrito. Nombre, precio y foto son sólo para mostrar: el checkout recalcula todo en el servidor. */
export type CartLine = {
  variantId: number; slug: string; name: string; size: string; color: string; price: number;
  image: string | null; quantity: number;
};

const KEY = "oveja-carrito";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(lines: CartLine[]) {
  cache = lines;
  try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; cb(); } }; // otras pestañas
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cart = {
  add(line: CartLine) {
    const lines = read();
    const found = lines.find((l) => l.variantId === line.variantId);
    write(found
      ? lines.map((l) => (l === found ? { ...l, quantity: Math.min(99, l.quantity + line.quantity) } : l))
      : [...lines, line]);
  },
  setQuantity(variantId: number, quantity: number) {
    write(read().map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(1, Math.min(99, quantity)) } : l)));
  },
  remove(variantId: number) {
    write(read().filter((l) => l.variantId !== variantId));
  },
  clear() {
    write([]);
  },
};

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.price * l.quantity, 0);
