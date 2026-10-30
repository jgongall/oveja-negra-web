# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Oveja Negra: tienda de ropa para mascotas. Next.js 16 (App Router, React 19, Tailwind 4) + Supabase (Postgres, Auth,
Storage; proyecto `nxsojfkeonfjmmpklgnr`) + Mercado Pago. UI, comentarios y documentación en español.
Identidad visual: assets del usuario en `public/marca` y colores de marca en `globals.css` (usar `text-cafe`, `bg-rosa`, etc.).

## Comandos

```bash
npm run dev                          # http://localhost:3000 (requiere .env.local, ver .env.example)
npx tsc --noEmit && npm run lint     # verificación
npm run build                        # detecta errores de prerender (cacheComponents)
npx next typegen                     # regenera PageProps/LayoutProps tras crear rutas
npx supabase db push                 # aplica supabase/migrations (tras `supabase link --project-ref nxsojfkeonfjmmpklgnr`)
```

No hay tests automatizados.

@AGENTS.md

## Arquitectura

- **Esquema:** `supabase/migrations/*.sql` es la fuente de verdad (tablas, RLS, Storage, funciones). Todo cambio de
  esquema va en una migración nueva: la inicial **ya está aplicada** en Supabase, no editarla. `src/lib/types.ts` son
  tipos escritos a mano que deben seguir al SQL (tallas en `SIZES`, rangos en `CUSTOMER_TIERS`).
- **Clientes Supabase** (`src/lib/supabase/`): `client.ts` (navegador), `server.ts` → `createClient()` (usuario actual,
  respeta RLS) y `createServiceClient()` (service role, salta RLS: **sólo** en checkout y webhook, con datos ya
  validados), `proxy.ts` (renueva la sesión; `src/proxy.ts` es el "middleware" de Next 16 y exige sesión en
  `/checkout`, `/pedido` y `/admin`). Usa siempre `auth.getUser()` (valida el token), no `getSession()` de supabase-js.
- **Roles y perfil:** `profiles.role` (`cliente`|`admin`) + función SQL `is_admin()` usada por las políticas RLS. El
  usuario sólo puede editar las columnas con `grant update` (nombre, edad, dirección, ciudad, región, fono); `role` y
  `customer_tier` no. El rango se cambia sólo con la función `set_customer_tier` (verifica `is_admin()`): no dar
  `grant update` sobre esa columna, porque la política "perfil propio: editar" dejaría al cliente subirse el rango.
  El registro manda los datos como metadata de `signUp` y el trigger `handle_new_user` crea el perfil. Validación
  compartida en `parseProfile` (`app/cuenta/actions.ts`). En el servidor, `requireAdmin()` de `lib/auth.ts` antes de
  cada acción de admin (RLS lo vuelve a verificar).
- **Importar catálogo** (`/admin/catalogo`, `importCatalog` en `app/admin/actions.ts`): CSV (`lib/csv.ts`, separador
  `,` o `;`) con una fila por variante; agrupa por slug del nombre y hace upsert de `products` (por `slug`) y
  `product_variants` (por `product_id,size,color`). Valida todo antes de escribir; no borra lo que no viene.
- **Compra:** carrito en `localStorage` (`lib/cart.ts`, `useSyncExternalStore`); sus precios son sólo para mostrar.
  `placeOrder` (`app/checkout/actions.ts`) valida con zod, recalcula precio/stock desde la base, inserta `orders` +
  `order_items` con la service role y crea la preferencia de Mercado Pago (`lib/mercadopago.ts`, `external_reference` =
  id del pedido). El webhook valida `x-signature`, consulta el pago a MP y llama a `confirm_order_payment` (SQL,
  idempotente, descuenta stock; ejecutable sólo por service role). Marcar "pagado" a mano desde el admin no descuenta stock.
- **Fotos:** bucket público `productos`, ruta `<product_id>/<uuid>.<ext>`; URL con `imageUrl()` de `lib/format.ts`.
- **Layout:** `<main>` del layout raíz centra el contenido (`max-w-6xl`); la portada se sale de ese contenedor con
  `left-1/2 w-screen -translate-x-1/2` para ir a todo el ancho. Íconos de marca con `<Icon name=…>`
  (`public/marca/iconos`), fuentes Nunito (`font-sans`) y Dancing Script (`font-script`).

## Trampas

- **Next.js 16:** ver `AGENTS.md`; la doc está en `node_modules/next/dist/docs/`. `middleware` ahora es `proxy`.
- **`cacheComponents: true`:** todo lo que lea cookies, `params` o `searchParams` va en un componente async dentro de
  `<Suspense>` (patrón usado en cada `page.tsx`); si no, el build falla con "blocking route".
- Las páginas no pueden exportar nada más que lo permitido por Next: utilidades compartidas van en `src/lib` o `src/components`.
- `createClient()` llama a `await connection()` antes de todo: supabase-js usa `Date.now()` y, sin eso, Next lo
  rechaza en el prerender ("unstable value `Date.now()`"). No quitarlo.
- Mover carpetas de `src/app` con el dev server o VS Code abiertos falla en Windows ("Permission denied") y deja tipos
  viejos en `.next/types`: detener el servidor, borrar `.next` y correr `npx next typegen`.
- Supabase devuelve `numeric` como string o number según el caso: convertir con `Number()` antes de calcular.
- Mercado Pago rechaza `back_urls`/`notification_url` en localhost; `createCheckout` los omite en dev.

## Estado del proyecto

@docs/CONTEXTO.md (historial, decisiones del usuario, pendientes). Actualízalo al terminar cada bloque de trabajo.
