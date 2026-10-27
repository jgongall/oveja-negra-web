# Oveja Negra

Tienda online de ropa para mascotas: Next.js 16 + Supabase (base de datos, autenticación y fotos) + Mercado Pago.

Proyecto Supabase: `nxsojfkeonfjmmpklgnr` ([panel](https://supabase.com/dashboard/project/nxsojfkeonfjmmpklgnr)).

> El diseño visual es provisional (Tailwind básico). Esta versión arma la estructura y el funcionamiento.

## Puesta en marcha

1. **Variables:** copia `.env.example` a `.env.local` y completa las claves de Supabase
   (*Project Settings → API Keys*): la *publishable key* y la *service role key* (secreta).
2. **Base de datos:** aplica `supabase/migrations/20261027000000_esquema_inicial.sql`, de una de estas dos formas:
   - Panel de Supabase → *SQL Editor*: pega el archivo y ejecútalo.
   - CLI: `npx supabase login`, `npx supabase link --project-ref nxsojfkeonfjmmpklgnr` y `npx supabase db push`.
3. **Instalar y arrancar:**
   ```bash
   npm install
   npm run dev          # http://localhost:3000
   ```
4. **Primer administrador:** regístrate en `/cuenta` y luego, en el *SQL Editor*:
   ```sql
   update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'tu@correo.com');
   ```
   El rol no se puede cambiar desde la web.

## Qué incluye

| Ruta | Qué hace |
| --- | --- |
| `/` | Portada con categorías y destacados |
| `/tienda?categoria=&mascota=&q=` | Catálogo con filtros por categoría, mascota (perro/gato) y búsqueda |
| `/producto/[slug]` | Ficha con fotos, tallas/colores, stock y "Agregar al carrito" |
| `/carrito` | Carrito (guardado en el navegador) |
| `/checkout` | Datos de envío → crea el pedido y redirige a Mercado Pago (requiere sesión) |
| `/pedido/[id]` | Estado del pedido y botón para reintentar el pago |
| `/cuenta` | Ingreso / registro, datos personales e historial de pedidos |
| `/admin` | Pedidos y cambio de estado (sólo administradores) |
| `/admin/productos` | Alta y edición de productos, tallas, stock y fotos |
| `/admin/categorias` | Categorías |
| `/api/mercadopago/webhook` | Aviso de pagos de Mercado Pago |

## Cómo funciona

- **Seguridad (RLS):** todas las tablas tienen Row Level Security. El catálogo activo es público; el cliente sólo ve
  sus pedidos; el administrador (`profiles.role = 'admin'`, función `is_admin()`) gestiona todo. El rol no es editable
  por el usuario (permisos de columna).
- **Pedidos:** el navegador nunca crea pedidos. La acción `placeOrder` (`src/app/checkout/actions.ts`) recalcula precios
  y verifica stock desde la base, y crea el pedido con la *service role*. El stock se descuenta recién cuando Mercado
  Pago confirma el pago (`confirm_order_payment`, idempotente).
- **Mercado Pago:** el webhook valida la firma `x-signature` (si `MP_WEBHOOK_SECRET` está configurado) y consulta el
  pago a la API de Mercado Pago antes de confirmar. En `localhost` no se envían `back_urls` ni `notification_url`
  (Mercado Pago los rechaza); para probar el webhook usa un túnel (p. ej. `ngrok`) y `NEXT_PUBLIC_SITE_URL` público.
  Sin `MP_ACCESS_TOKEN`, los pedidos quedan "pendientes".
- **Fotos:** bucket público `productos` en Supabase Storage; sólo los administradores suben o borran.

## Despliegue (Vercel)

1. Importa el repositorio en Vercel y define las variables de `.env.example`
   (`NEXT_PUBLIC_SITE_URL` = dominio de producción).
2. En Supabase → *Authentication → URL Configuration*: *Site URL* = dominio, y agrega `https://<dominio>/auth/confirm`
   a las *Redirect URLs*.
3. En Mercado Pago → *Webhooks*: URL `https://<dominio>/api/mercadopago/webhook`, evento *Pagos*; copia la clave
   secreta a `MP_WEBHOOK_SECRET`.
