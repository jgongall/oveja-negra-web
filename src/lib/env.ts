/** Variables públicas (se incrustan al compilar). */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

/** Variables secretas: sólo en el servidor. */
export function serverEnv() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
  return {
    serviceRoleKey,
    mpAccessToken: process.env.MP_ACCESS_TOKEN ?? "",
    mpWebhookSecret: process.env.MP_WEBHOOK_SECRET ?? "",
  };
}
