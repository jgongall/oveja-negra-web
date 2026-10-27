import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Usuario y perfil actuales (o null). Valida el token contra Supabase con getUser. */
export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, full_name, phone, role").eq("id", user.id)
    .single<Profile>();
  return { user, profile };
}

/** Para acciones y páginas de administración: lanza si no es admin (RLS también lo impide en la base). */
export async function requireAdmin() {
  const session = await getSession();
  if (session?.profile?.role !== "admin") throw new Error("Sólo para administradores");
  return session;
}
