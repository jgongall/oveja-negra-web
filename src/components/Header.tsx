import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { CartBadge } from "./CartBadge";

async function AccountLinks() {
  const session = await getSession();
  return (
    <>
      {session?.profile?.role === "admin" && <Link href="/admin" className="hover:underline">Admin</Link>}
      <Link href="/cuenta" className="hover:underline">{session ? "Mi cuenta" : "Ingresar"}</Link>
    </>
  );
}

export function Header() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4">
        <Link href="/" className="text-xl font-bold">Oveja Negra</Link>
        <Link href="/tienda" className="hover:underline">Tienda</Link>
        <span className="flex-1" />
        <Suspense fallback={null}><AccountLinks /></Suspense>
        <CartBadge />
      </nav>
    </header>
  );
}
