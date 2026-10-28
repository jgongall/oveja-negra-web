import type { Metadata } from "next";
import { SIZES } from "@/lib/types";
import { ImportForm } from "./ImportForm";

export const metadata: Metadata = { title: "Subir catálogo" };

export default function CatalogImportPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="text-2xl font-bold">Subir catálogo</h1>
      <p className="text-sm text-cafe/70">
        Sube un archivo CSV (desde Excel: <em>Guardar como → CSV UTF-8</em>) con una fila por talla/color.
        Las filas con el mismo nombre forman un producto. Si el producto o la talla ya existen se actualizan
        (precio, stock, etc.); lo que no venga en el archivo no se toca. Las fotos se suben después en cada producto.
      </p>
      <a href="/plantilla-catalogo.csv" download className="self-start text-sm underline">Descargar plantilla de ejemplo</a>
      <table className="text-left text-sm">
        <thead className="text-cafe/70"><tr><th className="pr-4">Columna</th><th>Valor</th></tr></thead>
        <tbody>
          <tr><td className="pr-4 font-mono">nombre</td><td>Obligatorio</td></tr>
          <tr><td className="pr-4 font-mono">descripcion</td><td>Opcional</td></tr>
          <tr><td className="pr-4 font-mono">categoria</td><td>Una categoría existente (Impermeables, Camisas, Polars, Disfraces)</td></tr>
          <tr><td className="pr-4 font-mono">mascota</td><td>perro, gato o ambos (vacío = ambos)</td></tr>
          <tr><td className="pr-4 font-mono">precio</td><td>En pesos, sin decimales (ej. 14990)</td></tr>
          <tr><td className="pr-4 font-mono">talla</td><td>{SIZES.join(", ")}</td></tr>
          <tr><td className="pr-4 font-mono">color</td><td>Opcional</td></tr>
          <tr><td className="pr-4 font-mono">sku</td><td>Opcional, único</td></tr>
          <tr><td className="pr-4 font-mono">stock</td><td>Número entero (vacío = 0)</td></tr>
          <tr><td className="pr-4 font-mono">activo</td><td>si / no (vacío = si)</td></tr>
        </tbody>
      </table>
      <ImportForm />
    </div>
  );
}
