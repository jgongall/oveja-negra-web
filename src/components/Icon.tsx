/** Íconos de marca en public/marca/iconos (SVG, se usan como imagen). */
export type IconName =
  | "buscar" | "carrito" | "corazon" | "envio" | "estrella" | "gato" | "huella" | "hueso" | "instagram" | "perro"
  | "regalo" | "tallas" | "usuario" | "whatsapp";

export function Icon({ name, size = 24, label }: { name: IconName; size?: number; label?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/marca/iconos/${name}.svg`} width={size} height={size} alt={label ?? ""} aria-hidden={!label} />
  );
}
