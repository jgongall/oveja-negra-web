"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { badge: "Envíos", title: "Llegamos hasta su camita", text: "Pide hoy y recíbelo en casa, en todo Chile.",
    src: "/marca/carrusel/paquete-envio.svg", alt: "Caja de envío con moño rosa", href: "/tienda", bg: "bg-rosa-claro" },
  { badge: "Nueva colección", title: "Abrigaditos y regalones", text: "Polars y camisas para los días fríos.",
    src: "/marca/carrusel/gato-sueter.svg", alt: "Gato negro con suéter rosa", href: "/tienda?categoria=polars",
    bg: "bg-oliva-claro" },
];

const arrow = "flex h-8 w-8 items-center justify-center rounded-full border-2 border-cafe bg-rosa font-bold text-cafe";

/** Carrusel de la portada: flechas, puntos y avance automático cada 6 s. */
export function HeroCarousel() {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((n) => (n + d + slides.length) % slides.length);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [i]);
  const s = slides[i];

  return (
    <section className="patron-huellas-oliva border-b-4 border-cafe px-4 py-8">
      <div className={`mx-auto flex max-w-5xl flex-col-reverse items-center gap-6 rounded-3xl border-2 border-cafe p-6 shadow-[0_4px_0_var(--color-cafe)] sm:flex-row sm:p-12 ${s.bg}`}>
        <div className="flex-1">
          <span className="rounded-full bg-oliva-oscuro px-3 py-1 text-xs font-extrabold tracking-wide text-white uppercase">{s.badge}</span>
          <h1 className="mt-4 text-3xl leading-tight font-extrabold text-oliva-oscuro sm:text-5xl">{s.title}</h1>
          <p className="mt-3 text-cafe">{s.text}</p>
          <Link href={s.href} className="mt-6 inline-block rounded-full border-2 border-cafe bg-oliva-oscuro px-5 py-2 text-sm font-bold text-white hover:bg-oliva">
            Más información
          </Link>
        </div>
        <Image src={s.src} alt={s.alt} width={280} height={280} className="h-44 w-44 sm:h-64 sm:w-64" priority />
      </div>
      <div className="mt-5 flex items-center justify-center gap-3">
        <button onClick={() => go(-1)} aria-label="Anterior" className={arrow}>‹</button>
        {slides.map((_, n) => (
          <button key={n} onClick={() => setI(n)} aria-label={`Ir a ${n + 1}`}
            className={`h-2.5 rounded-full border border-cafe transition-all ${n === i ? "w-8 bg-rosa" : "w-2.5 bg-white"}`} />
        ))}
        <button onClick={() => go(1)} aria-label="Siguiente" className={arrow}>›</button>
      </div>
    </section>
  );
}
