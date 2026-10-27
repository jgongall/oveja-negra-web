import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { env, serverEnv } from "@/lib/env";

function client() {
  const { mpAccessToken } = serverEnv();
  return mpAccessToken ? new MercadoPagoConfig({ accessToken: mpAccessToken }) : null;
}

export const paymentsEnabled = () => Boolean(serverEnv().mpAccessToken);

/** Crea el checkout de Mercado Pago para un pedido. Devuelve la URL a la que se redirige al cliente. */
export async function createCheckout(order: { id: string; email: string },
  items: { title: string; quantity: number; unit_price: number }[]) {
  const mp = client();
  if (!mp) return null;
  // Mercado Pago rechaza back_urls/notification_url en localhost: en dev se omiten.
  const publicUrl = !env.siteUrl.includes("localhost");
  const pref = await new Preference(mp).create({
    body: {
      items: items.map((i, n) => ({ id: String(n + 1), ...i, currency_id: process.env.NEXT_PUBLIC_CURRENCY ?? "CLP" })),
      payer: { email: order.email },
      external_reference: order.id,
      ...(publicUrl && {
        back_urls: {
          success: `${env.siteUrl}/pedido/${order.id}`,
          pending: `${env.siteUrl}/pedido/${order.id}`,
          failure: `${env.siteUrl}/pedido/${order.id}`,
        },
        auto_return: "approved",
        notification_url: `${env.siteUrl}/api/mercadopago/webhook`,
      }),
    },
  });
  return { preferenceId: pref.id!, url: pref.init_point! };
}

/** Consulta el pago a Mercado Pago (no se confía en el cuerpo del webhook). */
export async function getPayment(id: string) {
  const mp = client();
  if (!mp) return null;
  return new Payment(mp).get({ id });
}

/**
 * Valida la cabecera x-signature del webhook (HMAC-SHA256 con la clave secreta del panel de Mercado Pago).
 * Plantilla: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 */
export function validSignature(headers: Headers, dataId: string) {
  const secret = serverEnv().mpWebhookSecret;
  if (!secret) return true; // sin clave configurada no se valida (sólo para desarrollo)
  const parts = Object.fromEntries((headers.get("x-signature") ?? "").split(",").map((p) => p.trim().split("=", 2)));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${headers.get("x-request-id") ?? ""};ts:${parts.ts};`;
  const expected = Buffer.from(createHmac("sha256", secret).update(manifest).digest("hex"));
  const got = Buffer.from(parts.v1);
  return expected.length === got.length && timingSafeEqual(expected, got);
}
