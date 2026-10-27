// Tipos de las tablas (a mano; se pueden generar con `npx supabase gen types typescript`).

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Única"] as const;
export type Size = (typeof SIZES)[number];
export const PETS = { perro: "Perro", gato: "Gato", ambos: "Perro y gato" } as const;
export type Pet = keyof typeof PETS;
export const ORDER_STATUS = {
  pendiente: "Pendiente de pago", pagado: "Pagado", enviado: "Enviado", entregado: "Entregado", cancelado: "Cancelado",
} as const;
export type OrderStatus = keyof typeof ORDER_STATUS;

export type Category = { id: number; slug: string; name: string; position: number };

export type Variant = {
  id: number; product_id: number; size: Size; color: string; sku: string | null; stock: number;
  price_override: number | null;
};

export type ProductImage = { id: number; product_id: number; path: string; alt: string; position: number };

export type Product = {
  id: number; slug: string; name: string; description: string; category_id: number | null; pet: Pet;
  price: number; active: boolean; featured: boolean; created_at: string; updated_at: string;
};

export type ProductWithDetails = Product & {
  product_variants: Variant[]; product_images: ProductImage[]; categories: Pick<Category, "slug" | "name"> | null;
};

export type ShippingAddress = { street: string; city: string; region: string; postal_code: string; notes: string };

export type Order = {
  id: string; user_id: string | null; status: OrderStatus; email: string; full_name: string; phone: string;
  shipping_address: ShippingAddress; total: number; mp_preference_id: string | null; mp_payment_id: string | null;
  created_at: string; paid_at: string | null;
};

export type OrderItem = {
  id: number; order_id: string; variant_id: number | null; product_name: string; size: string; color: string;
  unit_price: number; quantity: number;
};

export type Profile = { id: string; full_name: string; phone: string; role: "cliente" | "admin" };
