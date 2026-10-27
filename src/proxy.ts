import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Todo salvo estáticos, imágenes y el webhook de pagos.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/mercadopago|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
