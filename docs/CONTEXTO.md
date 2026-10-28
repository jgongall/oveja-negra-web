# Contexto del proyecto (estado al 27-10-2026)

Resumen para retomar el trabajo en una sesión nueva. Complementa `CLAUDE.md` (arquitectura) y `README.md` (puesta en marcha).

## Origen y decisiones del usuario

- Tienda online de **ropa para mascotas** llamada **Oveja Negra**, montada sobre Supabase
  (proyecto `nxsojfkeonfjmmpklgnr`, panel: https://supabase.com/dashboard/project/nxsojfkeonfjmmpklgnr).
- Creada desde el workspace de Hotopia (`F:\hotopia`, otro proyecto sin relación de código). Usuario: Jorge Gallerstein.
- Decisiones tomadas por el usuario:
  - Stack: **Next.js + Supabase** (despliegue previsto en Vercel).
  - Pagos: **Mercado Pago** (Checkout Pro).
  - Primera versión: **catálogo y carrito, cuentas de clientes y panel de administración**.
  - **"El diseño lo vemos después, arma la estructura"**: el estilo actual es Tailwind básico y provisional.
  - Carpeta: `F:\ovejaNegraWeb`, repositorio git propio.
  - Ropa para **perritos y gatitos**. Categorías: **Impermeables, Camisas, Polars, Disfraces**. Tallas **XS–XXXL**.
  - Perfil del cliente: nombre completo, edad, rango de cliente (básico, habitual, súper), dirección, ciudad,
    región y fono; se piden al registrarse.
- Decisiones tomadas por Claude sin consultar (confirmar o cambiar con el usuario):
  - Campo `pet` en productos (perro, gato, ambos) para filtrar.
  - El rango de cliente lo asigna el admin (función SQL `set_customer_tier`); nuevo cliente = básico. Aún no hay
    pantalla de admin para cambiarlo. Edad opcional; el checkout precarga la dirección del perfil.
  - Moneda **CLP** (`NEXT_PUBLIC_CURRENCY`).
  - Comprar exige cuenta (sin compra como invitado).
  - El stock se descuenta al confirmarse el pago, no al crear el pedido (no hay reserva de stock).

## Qué está hecho (commit `ae36762`, rama `main`)

- Proyecto Next.js 16.4 (React 19, Tailwind 4, `cacheComponents`), dependencias `@supabase/ssr`,
  `@supabase/supabase-js`, `mercadopago`, `zod`, `server-only`.
- Esquema SQL completo con RLS, bucket de Storage y funciones: `supabase/migrations/20261027000000_esquema_inicial.sql`.
- Tienda: portada, `/tienda` con filtros, `/producto/[slug]`, `/carrito`, `/checkout`, `/pedido/[id]`.
- Cuentas: `/cuenta` (registro, ingreso, datos, pedidos), `/auth/confirm` (enlace del correo de Supabase).
- Pagos: preferencia de Mercado Pago, reintento de pago, webhook con validación de `x-signature`.
- Admin: `/admin` (pedidos y estados), `/admin/productos` (variantes, stock, fotos), `/admin/categorias`.
- `/admin/catalogo`: importación masiva desde CSV (una fila por variante, upsert por slug y talla+color, todo o nada;
  plantilla en `public/plantilla-catalogo.csv`). Las fotos se siguen subiendo por producto.
- Verificado: `tsc`, `eslint` y `npm run build` pasan (build hecho con claves de relleno).

## Qué falta / no verificado

- Supabase: migración aplicada (28-10-2026) y admin creado (jorge.g.gallerstein@gmail.com). Registro probado.
  Falta probar: importar catálogo, fotos, compra. Aún no hay productos.
- `createClient()` llama a `connection()` (supabase-js usa `Date.now()`; sin esto, error "blocking route" en prerender).
- Mercado Pago sin credenciales: los pedidos quedan "pendientes". Para probar el webhook en local hace falta un túnel.
- Identidad visual aplicada con los assets del usuario (`public/marca`: logo, íconos, carrusel, patrón; favicon en
  `src/app/icon.svg`). Paleta en `globals.css` (café, rosa, oliva, crema). Portada según el mockup del usuario
  (header oliva, carrusel, "Nuestros favoritos" con filtro, beneficios, pie oliva). Si no hay destacados, muestra
  tarjetas de muestra con `public/marca/productos/*.svg`. Falta: favoritos (corazones del mockup), resto de páginas al estilo nuevo.
  Contacto del pie: `NEXT_PUBLIC_INSTAGRAM_URL`, `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTACT_EMAIL` (vacías).
- Ideas no implementadas: compra como invitado, reserva de stock al crear el pedido, costo de envío, cupones,
  correos de confirmación de pedido, tipos generados con `npx supabase gen types`, tests.
- Hay una carpeta vacía `F:\oveja-negra-web` sobrante (create-next-app no acepta mayúsculas); el usuario debe borrarla.

## Próximo paso sugerido

Pedir al usuario las claves de Supabase, aplicar la migración, levantar `npm run dev` y probar de punta a punta:
registro → admin → crear producto con fotos → comprar → pedido pendiente.
