-- Oveja Negra: tienda de ropa para mascotas. Esquema inicial.
-- Catálogo público, clientes con Supabase Auth, pedidos y panel de administración.
-- Seguridad: RLS en todas las tablas. Los pedidos los crea el servidor (service role), nunca el navegador,
-- para que precios y stock se calculen siempre desde la base.

-- ------------------------------------------------------------------ perfiles y roles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  phone text not null default '' check (char_length(phone) <= 40),
  role text not null default 'cliente' check (role in ('cliente', 'admin')),
  created_at timestamptz not null default now()
);

-- Crea el perfil al registrarse.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ------------------------------------------------------------------ catálogo

create table public.categories (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 60),
  position int not null default 0
);

create table public.products (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '' check (char_length(description) <= 5000),
  category_id bigint references public.categories (id) on delete set null,
  pet text not null default 'ambos' check (pet in ('perro', 'gato', 'ambos')),
  price numeric(12, 2) not null check (price >= 0),
  active boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id) where active;
create index products_featured_idx on public.products (created_at desc) where active and featured;

-- Talla y color por variante; el stock vive aquí.
create table public.product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única')),
  color text not null default '' check (char_length(color) <= 40),
  sku text unique,
  stock int not null default 0 check (stock >= 0),
  price_override numeric(12, 2) check (price_override >= 0),
  unique (product_id, size, color)
);
create index product_variants_product_idx on public.product_variants (product_id);

create table public.product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products (id) on delete cascade,
  path text not null, -- ruta dentro del bucket "productos"
  alt text not null default '',
  position int not null default 0
);
create index product_images_product_idx on public.product_images (product_id, position);

-- ------------------------------------------------------------------ pedidos

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  email text not null,
  full_name text not null,
  phone text not null default '',
  shipping_address jsonb not null,
  total numeric(12, 2) not null check (total >= 0),
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);

-- Copia de nombre, talla, color y precio al momento de la compra (el catálogo puede cambiar después).
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id bigint references public.product_variants (id) on delete set null,
  product_name text not null,
  size text not null,
  color text not null default '',
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity int not null check (quantity between 1 and 99)
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_variant_idx on public.order_items (variant_id);

-- Marca un pedido como pagado y descuenta stock, una sola vez (el webhook puede repetirse).
-- Sólo la usa el servidor con la service role.
create function public.confirm_order_payment(p_order_id uuid, p_payment_id text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  updated int;
begin
  update public.orders set status = 'pagado', mp_payment_id = p_payment_id, paid_at = now()
  where id = p_order_id and status = 'pendiente';
  get diagnostics updated = row_count;
  if updated = 0 then
    return false;
  end if;
  -- greatest(): si se vendió más de lo que había (dos pagos casi simultáneos), el stock queda en 0 y no falla el pago.
  update public.product_variants v set stock = greatest(v.stock - i.quantity, 0)
  from public.order_items i
  where i.order_id = p_order_id and i.variant_id = v.id;
  return true;
end;
$$;
revoke execute on function public.confirm_order_payment(uuid, text) from public, anon, authenticated;

-- ------------------------------------------------------------------ RLS

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Perfiles: cada uno ve y edita el suyo; el rol no se puede cambiar desde el cliente.
create policy "perfil propio: leer" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "perfil propio: editar" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- Catálogo: lectura pública de lo activo; escritura sólo admin.
create policy "categorías: leer" on public.categories for select using (true);
create policy "categorías: admin" on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "productos: leer activos" on public.products for select using (active or public.is_admin());
create policy "productos: admin" on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "variantes: leer" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
create policy "variantes: admin" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

create policy "imágenes: leer" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
create policy "imágenes: admin" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- Pedidos: el cliente ve los suyos; el admin ve todos y cambia el estado. Nadie los crea desde el navegador.
create policy "pedidos: leer" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "pedidos: admin actualiza" on public.orders for update using (public.is_admin()) with check (public.is_admin());

create policy "ítems: leer" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- ------------------------------------------------------------------ fotos de productos (Storage)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('productos', 'productos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "fotos: admin sube" on storage.objects for insert to authenticated
  with check (bucket_id = 'productos' and public.is_admin());
create policy "fotos: admin edita" on storage.objects for update to authenticated
  using (bucket_id = 'productos' and public.is_admin());
create policy "fotos: admin borra" on storage.objects for delete to authenticated
  using (bucket_id = 'productos' and public.is_admin());

-- ------------------------------------------------------------------ datos iniciales

insert into public.categories (slug, name, position) values
  ('abrigos', 'Abrigos', 1), ('sweaters', 'Sweaters', 2), ('camisetas', 'Camisetas', 3),
  ('impermeables', 'Impermeables', 4), ('disfraces', 'Disfraces', 5), ('accesorios', 'Accesorios', 6);
