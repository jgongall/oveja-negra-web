import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Finalizar compra" };

async function Checkout() {
  const session = await getSession(); // el proxy ya exige sesión en /checkout
  return <CheckoutForm fullName={session?.profile?.full_name ?? ""} phone={session?.profile?.phone ?? ""} />;
}

export default function CheckoutPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Finalizar compra</h1>
      <Suspense fallback={<p>Cargando…</p>}><Checkout /></Suspense>
    </>
  );
}
