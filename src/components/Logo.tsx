import Image from "next/image";
import Link from "next/link";

/** Logo circular + nombre en letra manuscrita (header y pie). */
export function Logo({ tagline }: { tagline?: string }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 text-white">
      <Image src="/marca/logo.jpg" alt="" width={48} height={48} priority
        className="h-11 w-11 rounded-full border-2 border-white bg-white object-cover" />
      <span className="leading-tight">
        <span className="block font-script text-2xl font-bold">Oveja Negra</span>
        {tagline && <span className="block text-xs font-semibold">{tagline}</span>}
      </span>
    </Link>
  );
}
