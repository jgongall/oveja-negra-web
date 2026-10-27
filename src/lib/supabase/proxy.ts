import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";

/** Renueva la sesión de Supabase en cada petición y exige sesión en /checkout, /pedido y /admin. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl, env.supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // No poner código entre createServerClient y getUser: getUser es lo que refresca el token.
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsLogin = ["/checkout", "/admin", "/pedido"].some((p) => path.startsWith(p));
  if (!user && needsLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/cuenta";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }
  return response;
}
