"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type FormState } from "./actions";

const input = "w-full rounded border px-3 py-2";

export function AuthForms({ next }: { next: string }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-bold">{mode === "in" ? "Ingresar" : "Crear cuenta"}</h1>
      {/* key: cambiar de modo reinicia el estado del formulario */}
      <AuthForm key={mode} mode={mode} next={next} />
      <button className="text-sm underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
      </button>
    </div>
  );
}

function AuthForm({ mode, next }: { mode: "in" | "up"; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "in" ? signIn : signUp, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      {mode === "up" && <input name="full_name" placeholder="Nombre" required className={input} />}
      <input name="email" type="email" placeholder="Correo" required autoComplete="email" className={input} />
      <input name="password" type="password" placeholder="Contraseña" required minLength={mode === "up" ? 8 : undefined}
        autoComplete={mode === "in" ? "current-password" : "new-password"} className={input} />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="text-sm text-green-700">{state.message}</p>}
      <button disabled={pending} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
        {mode === "in" ? "Ingresar" : "Crear cuenta"}
      </button>
    </form>
  );
}
