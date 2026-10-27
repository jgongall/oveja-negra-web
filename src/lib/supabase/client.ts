import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

/** Cliente para componentes de navegador (sesión en cookies, compartida con el servidor). */
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseKey);
}
