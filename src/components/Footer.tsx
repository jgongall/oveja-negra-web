import { Icon } from "./Icon";

// Enlaces de redes: se muestran sólo si están configurados en .env.local.
const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP; // número con código de país, sólo dígitos (ej. 56912345678)

export function Footer() {
  return (
    <footer className="patron-huellas border-t border-rosa py-8 text-center text-sm text-cafe">
      <div className="mb-3 flex justify-center gap-4">
        {instagram && <a href={instagram} target="_blank" rel="noopener"><Icon name="instagram" size={28} label="Instagram" /></a>}
        {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener"><Icon name="whatsapp" size={28} label="WhatsApp" /></a>}
      </div>
      <p className="font-semibold">Oveja Negra · Ropa para perritos y gatitos</p>
    </footer>
  );
}
