import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category, ProductWithDetails } from "@/lib/types";

export const PRODUCT_SELECT = "*, product_variants(*), product_images(*), categories(slug, name)";

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("position");
  return (data ?? []) as Category[];
}

export async function getProducts(opts: { category?: string; pet?: string; q?: string; featured?: boolean } = {}) {
  const supabase = await createClient();
  // Con filtro de categoría, !inner descarta los productos de otras categorías.
  const select = opts.category ? PRODUCT_SELECT.replace("categories(", "categories!inner(") : PRODUCT_SELECT;
  let query = supabase.from("products").select(select).eq("active", true).order("created_at", { ascending: false });
  if (opts.category) query = query.eq("categories.slug", opts.category);
  if (opts.pet === "perro" || opts.pet === "gato") query = query.in("pet", [opts.pet, "ambos"]);
  if (opts.featured) query = query.eq("featured", true).limit(8);
  if (opts.q) query = query.ilike("name", `%${opts.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as ProductWithDetails[];
}

export async function getProduct(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  return data as ProductWithDetails | null;
}

/** Primera foto por posición. */
export const coverOf = (p: ProductWithDetails) =>
  [...p.product_images].sort((a, b) => a.position - b.position)[0] ?? null;
