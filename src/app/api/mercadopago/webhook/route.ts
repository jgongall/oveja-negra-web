import { NextResponse, type NextRequest } from "next/server";
import { getPayment, validSignature } from "@/lib/mercadopago";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Aviso de Mercado Pago. Se valida la firma, se consulta el pago a la API de Mercado Pago (no se confía en el
 * cuerpo) y, si está aprobado, se confirma el pedido una sola vez (confirm_order_payment descuenta stock).
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const type = request.nextUrl.searchParams.get("type") ?? body.type;
  const dataId = request.nextUrl.searchParams.get("data.id") ?? body.data?.id;
  if (type !== "payment" || !dataId) return NextResponse.json({ ignored: true });
  if (!validSignature(request.headers, String(dataId))) return NextResponse.json({ error: "firma inválida" }, { status: 401 });

  const payment = await getPayment(String(dataId));
  const orderId = payment?.external_reference;
  if (!payment || !orderId) return NextResponse.json({ ignored: true });

  const supabase = createServiceClient();
  if (payment.status === "approved") {
    const { error } = await supabase.rpc("confirm_order_payment", { p_order_id: orderId, p_payment_id: String(payment.id) });
    if (error) return NextResponse.json({ error: "no se pudo confirmar" }, { status: 500 }); // MP reintenta
  }
  // Rechazado o cancelado: el pedido sigue pendiente y el cliente puede reintentar desde su página.
  return NextResponse.json({ ok: true });
}
