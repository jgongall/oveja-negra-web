import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { CartBadge } from "./CartBadge";
import { Icon } from "./Icon";

async function AccountLinks() {
  const session = await getSession();
  return (
    <>
      {session?.profile?.role === "admin" && <Link href="/admin" className="hover:underline">Admin</Link>}
      <Link href="/cuenta" className="flex items-center gap-1 hover:underline">
        <Icon name="usuario" size={22} /><span className="hidden sm:inline">{session ? "Mi cuenta" : "Ingresar"}</span>
      </Link>
    </>
  );
}

export function Header() {
  return (
    <header className="border-b border-rosa bg-white">
      <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 text-cafe sm:gap-6">
        <Link href="/" className="shrink-0">
          <Image src="/marca/logo.jpg" alt="Oveja Negra" width={72} height={72} priority className="h-16 w-16 object-contain" />
        </Link>
        <Link href="/tienda" className="font-semibold hover:underline">Tienda</Link>
        <span className="flex-1" />
        <Link href="/tienda" aria-label="Buscar" className="hover:opacity-70"><Icon name="buscar" size={22} /></Link>
        <Suspense fallback={null}><AccountLinks /></Suspense>
        <CartBadge />
      </nav>
    </header>
  );
}
