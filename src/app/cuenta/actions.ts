"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string };

/** Sólo rutas internas (evita redirecciones abiertas). */
const safeNext = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/cuenta";
};

// Datos del perfil que el cliente completa (al registrarse y en "Mis datos"). El rango lo asigna el admin.
const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Falta el nombre completo.").max(120),
  age: z.union([z.literal("").transform(() => null), z.coerce.number().int().min(0).max(120)]),
  address: z.string().trim().max(200),
  city: z.string().trim().max(80),
  region: z.string().trim().max(80),
  phone: z.string().trim().max(40),
});

function parseProfile(form: FormData) {
  const result = profileSchema.safeParse(
    Object.fromEntries(["full_name", "age", "address", "city", "region", "phone"].map((k) => [k, String(form.get(k) ?? "")])));
  return result.success ? { data: result.data } : { error: result.error.issues[0].message };
}

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
  const profile = parseProfile(form);
  if ("error" in profile) return { error: profile.error };
  const supabase = await createClient();
  // El trigger handle_new_user copia esta metadata a profiles.
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email")), password,
    options: {
      data: profile.data,
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
  const profile = parseProfile(form);
  if ("error" in profile) return { error: profile.error };
  const { error } = await supabase.from("profiles").update(profile.data).eq("id", user.id);
  return error ? { error: error.message } : { message: "Datos guardados." };
}
