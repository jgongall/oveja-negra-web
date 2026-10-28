"use client";

import { useState, useTransition } from "react";
import { importCatalog, type ImportResult } from "../actions";

export function ImportForm() {
  const [result, setResult] = useState<ImportResult>({});
  const [pending, start] = useTransition();

  function submit(form: FormData) {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return setResult({ error: "Elige un archivo CSV." });
    if (file.size > 900 * 1024) return setResult({ error: "El archivo supera 900 KB (límite de las acciones del servidor): divídelo." });
    start(async () => setResult(await importCatalog(await file.text())));
  }

  return (
    <form action={submit} className="flex flex-col gap-3 rounded border p-4">
      <input name="file" type="file" accept=".csv,text/csv" required />
      <button disabled={pending} className="self-start rounded bg-cafe hover:bg-cafe-oscuro px-4 py-2 text-sm text-white disabled:opacity-50">
        {pending ? "Importando…" : "Importar"}
      </button>
      {result.message && <p className="text-sm text-green-700">{result.message}</p>}
      {result.error && <p className="text-sm text-red-600">{result.error}</p>}
      {result.errors && (
        <ul className="list-disc pl-5 text-sm text-red-600">{result.errors.map((e) => <li key={e}>{e}</li>)}</ul>
      )}
    </form>
  );
}
