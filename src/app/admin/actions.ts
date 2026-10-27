"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS, SIZES, type OrderStatus } from "@/lib/types";

// Todas las acciones usan el cliente del admin: RLS (is_admin) vuelve a verificar el rol en la base.

export type AdminState = { error?: string; message?: string };

const slugify = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

// ------------------------------------------------------------------ pedidos

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  if (!(status in ORDER_STATUS)) throw new Error("estado inválido");
  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// ------------------------------------------------------------------ categorías

export async function saveCategory(_: AdminState, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  if (!name) return { error: "Falta el nombre." };
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name, slug: slugify(name), position: Number(form.get("position") ?? 0) || 0,
  });
  if (error) return { error: error.code === "23505" ? "Ya existe una categoría con ese nombre." : error.message };
  revalidatePath("/admin/categorias");
  return { message: "Categoría creada." };
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id); // los productos quedan sin categoría
  revalidatePath("/admin/categorias");
}

// ------------------------------------------------------------------ productos

const ProductInput = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(80),
  description: z.string().max(5000),
  category_id: z.coerce.number().int().positive().nullable(),
  pet: z.enum(["perro", "gato", "ambos"]),
  price: z.coerce.number().min(0),
  active: z.boolean(),
  featured: z.boolean(),
  variants: z.array(z.object({
    id: z.number().int().positive().optional(),
    size: z.enum(SIZES),
    color: z.string().trim().max(40),
    sku: z.string().trim().max(60),
    stock: z.coerce.number().int().min(0),
    price_override: z.coerce.number().min(0).nullable(),
  })).max(100),
});

export type ProductInputT = z.input<typeof ProductInput>;

/** Crea o actualiza un producto con sus variantes. Las variantes que no vienen se borran. */
export async function saveProduct(id: number | null, raw: ProductInputT): Promise<AdminState & { id?: number }> {
  await requireAdmin();
  const parsed = ProductInput.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const { variants, ...p } = parsed.data;
  const keys = variants.map((v) => `${v.size}|${v.color.toLowerCase()}`);
  if (new Set(keys).size !== keys.length) return { error: "Hay tallas/colores repetidos." };

  const supabase = await createClient();
  const row = { ...p, slug: slugify(p.slug || p.name), updated_at: new Date().toISOString() };
  const { data: saved, error } = id
    ? await supabase.from("products").update(row).eq("id", id).select("id").single()
    : await supabase.from("products").insert(row).select("id").single();
  if (error || !saved) {
    return { error: error?.code === "23505" ? "Ya existe un producto con esa URL (slug)." : error?.message ?? "Error" };
  }

  const keep = variants.filter((v) => v.id).map((v) => v.id!);
  let del = supabase.from("product_variants").delete().eq("product_id", saved.id);
  if (keep.length) del = del.not("id", "in", `(${keep.join(",")})`);
  const { error: delError } = await del;
  if (delError) return { error: "No se pudieron actualizar las tallas." };

  for (const v of variants) {
    const data = { product_id: saved.id, size: v.size, color: v.color, sku: v.sku || null, stock: v.stock,
      price_override: v.price_override };
    const { error: vError } = v.id
      ? await supabase.from("product_variants").update(data).eq("id", v.id).eq("product_id", saved.id)
      : await supabase.from("product_variants").insert(data);
    if (vError) return { error: vError.code === "23505" ? "SKU repetido." : vError.message, id: saved.id };
  }
  revalidatePath("/admin/productos");
  return { message: "Producto guardado.", id: saved.id };
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { data: images } = await supabase.from("product_images").select("path").eq("product_id", id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  if (images?.length) await supabase.storage.from("productos").remove(images.map((i) => i.path));
  redirect("/admin/productos");
}

// ------------------------------------------------------------------ fotos

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export async function uploadImage(productId: number, form: FormData): Promise<AdminState> {
  await requireAdmin();
  const file = form.get("file");
  if (!(file instanceof File) || !IMAGE_TYPES[file.type]) return { error: "Sube una imagen JPG, PNG o WebP." };
  if (file.size > 5 * 1024 * 1024) return { error: "La imagen supera 5 MB." };
  const supabase = await createClient();
  const path = `${productId}/${crypto.randomUUID()}.${IMAGE_TYPES[file.type]}`;
  const { error } = await supabase.storage.from("productos").upload(path, file, { contentType: file.type });
  if (error) return { error: error.message };
  const { count } = await supabase.from("product_images").select("*", { count: "exact", head: true }).eq("product_id", productId);
  await supabase.from("product_images").insert({ product_id: productId, path, alt: String(form.get("alt") ?? ""),
    position: count ?? 0 });
  revalidatePath(`/admin/productos/${productId}`);
  return { message: "Foto subida." };
}

export async function deleteImage(imageId: number) {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.from("product_images").delete().eq("id", imageId).select("path, product_id").single();
  if (data) {
    await supabase.storage.from("productos").remove([data.path]);
    revalidatePath(`/admin/productos/${data.product_id}`);
  }
}
