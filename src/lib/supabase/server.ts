import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env, serverEnv } from "@/lib/env";

/** Cliente del usuario actual (respeta RLS). Para componentes de servidor, acciones y rutas. */
export async function createClient() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // En componentes de servidor no se pueden escribir cookies; el proxy ya renueva la sesión.
        }
      },
    },
  });
}

/** Cliente con service role: salta RLS. Sólo para el checkout y el webhook de pagos, nunca con datos sin validar. */
export function createServiceClient() {
  return createAdminClient(env.supabaseUrl, serverEnv().serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
