import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { CartBadge } from "./CartBadge";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

const links = [
  { href: "/tienda?mascota=perro", label: "Perros" },
  { href: "/tienda?mascota=gato", label: "Gatos" },
  { href: "/tienda", label: "Novedades" },
  { href: "#contacto", label: "Contacto" },
];

const roundButton = "flex h-8 w-8 items-center justify-center rounded-full border-2 border-cafe bg-rosa hover:bg-rosa-claro";

async function AccountLinks() {
  const session = await getSession();
  return (
    <>
      {session?.profile?.role === "admin" && <Link href="/admin" className="hover:underline">Admin</Link>}
      <Link href="/cuenta" aria-label={session ? "Mi cuenta" : "Ingresar"} className={roundButton}>
        <Icon name="usuario" size={18} />
      </Link>
    </>
  );
}

export function Header() {
  return (
    <header className="relative border-b-4 border-cafe bg-oliva">
      <nav className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 text-sm sm:gap-4 font-bold text-white">
        <Logo />
        <span className="flex-1" />
        <div className="hidden gap-5 sm:flex">
          {links.map((l) => <Link key={l.label} href={l.href} className="hover:underline">{l.label}</Link>)}
        </div>
        <Suspense fallback={null}><AccountLinks /></Suspense>
        <CartBadge className={roundButton} />
        {/* Menú en celular: <details> se abre y cierra sin JavaScript. */}
        <details className="group sm:hidden">
          <summary aria-label="Menú" className={`${roundButton} cursor-pointer list-none text-lg leading-none text-cafe`}>☰</summary>
          <div className="absolute inset-x-0 top-full z-20 flex flex-col border-b-4 border-cafe bg-oliva px-4 pb-3">
            {links.map((l) => <Link key={l.label} href={l.href} className="border-t border-white/30 py-3">{l.label}</Link>)}
          </div>
        </details>
      </nav>
    </header>
  );
}
