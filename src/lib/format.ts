import { env } from "@/lib/env";

export const money = (n: number) =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency: process.env.NEXT_PUBLIC_CURRENCY ?? "CLP" }).format(n);

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("es", { dateStyle: "medium", timeStyle: "short" });

/** URL pública de una foto del bucket "productos". */
export const imageUrl = (path: string) => `${env.supabaseUrl}/storage/v1/object/public/productos/${path}`;

export const variantPrice = (productPrice: number, override: number | null) => Number(override ?? productPrice);
