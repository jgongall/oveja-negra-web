import { Icon } from "./Icon";
import { Logo } from "./Logo";

// Contacto y redes: se muestran sólo si están configurados en .env.local.
const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP; // número con código de país, sólo dígitos (ej. 56912345678)
const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

const roundButton = "flex h-9 w-9 items-center justify-center rounded-full border-2 border-cafe bg-rosa";

export function Footer() {
  return (
    <footer id="contacto" className="border-t-4 border-cafe bg-oliva text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6">
        <Logo tagline="Ropa para perros y gatos" />
        <div className="flex items-center gap-3 text-sm font-bold">
          {instagram && <a href={instagram} target="_blank" rel="noopener" className={roundButton}><Icon name="instagram" size={20} label="Instagram" /></a>}
          {whatsapp && <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener" className={roundButton}><Icon name="whatsapp" size={20} label="WhatsApp" /></a>}
          {email && <a href={`mailto:${email}`} className="hover:underline">{email}</a>}
          {whatsapp && <span>+{whatsapp}</span>}
        </div>
      </div>
    </footer>
  );
}
