import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { dateTime, money } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS, type Order } from "@/lib/types";
import { signOut } from "./actions";
import { AuthForms } from "./AuthForms";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Mi cuenta" };

async function Account({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  if (!session) return <AuthForms next={(await searchParams).next ?? "/cuenta"} />;

  const supabase = await createClient();
  const { data } = await supabase.from("orders").select("*").eq("user_id", session.user.id)
    .order("created_at", { ascending: false });
  const orders = (data ?? []) as Order[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi cuenta</h1>
        <form action={signOut}><button className="text-sm underline">Cerrar sesión</button></form>
      </div>
      <section>
        <h2 className="mb-2 font-semibold">Mis datos</h2>
        <p className="mb-3 text-sm text-cafe/70">{session.user.email}</p>
        <ProfileForm profile={session.profile} />
      </section>
      <section>
        <h2 className="mb-2 font-semibold">Mis pedidos</h2>
        {orders.length === 0 && <p className="text-cafe/70">Todavía no tienes pedidos.</p>}
        <ul className="divide-y">
          {orders.map((o) => (
            <li key={o.id} className="flex justify-between py-2">
              <Link href={`/pedido/${o.id}`} className="hover:underline">{dateTime(o.created_at)}</Link>
              <span>{ORDER_STATUS[o.status]} · {money(o.total)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function CuentaPage(props: PageProps<"/cuenta">) {
  return (
    <Suspense fallback={<p>Cargando…</p>}>
      <Account searchParams={props.searchParams as Promise<{ next?: string }>} />
    </Suspense>
  );
}
