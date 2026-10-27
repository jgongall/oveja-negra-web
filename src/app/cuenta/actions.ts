"use server";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string };

/** Sólo rutas internas (evita redirecciones abiertas). */
const safeNext = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/cuenta";
};

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email")), password: String(form.get("password")),
  });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const password = String(form.get("password"));
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email")), password,
    options: {
      data: { full_name: String(form.get("full_name") ?? "").slice(0, 120) },
      emailRedirectTo: `${env.siteUrl}/auth/confirm`,
    },
  });
  if (error) return { error: error.message };
  if (!data.session) return { message: "Te enviamos un correo para confirmar tu cuenta." };
  redirect(safeNext(form.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(_: FormState, form: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesión vencida." };
  const { error } = await supabase.from("profiles").update({
    full_name: String(form.get("full_name") ?? "").slice(0, 120),
    phone: String(form.get("phone") ?? "").slice(0, 40),
  }).eq("id", user.id);
  return error ? { error: error.message } : { message: "Datos guardados." };
}
