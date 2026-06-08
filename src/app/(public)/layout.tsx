import { getContainer } from "@/lib/container";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import {
  WhatsappContactsProvider,
  type WhatsappContact,
} from "@/components/public/WhatsappContactsProvider";

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? "Picasso";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteContentService, contactPersonService, socialLinkService } =
    getContainer();
  const [address, mapEmbed, contactPersons, socialLinks] = await Promise.all([
    siteContentService.getByKey("address"),
    siteContentService.getByKey("map_embed_url"),
    contactPersonService.list(),
    socialLinkService.list(),
  ]);

  const activeContacts = contactPersons.filter((p) => p.isActive);

  // Flatten the active contacts into one entry per WhatsApp-enabled phone so
  // the quote modal can render direct-chat shortcuts.
  const whatsappContacts: WhatsappContact[] = activeContacts.flatMap((p) => {
    const entries: WhatsappContact[] = [];
    if (p.phone1OnWhatsapp) entries.push({ name: p.name, phone: p.phone1 });
    if (p.phone2 && p.phone2OnWhatsapp)
      entries.push({ name: p.name, phone: p.phone2 });
    return entries;
  });

  return (
    <WhatsappContactsProvider contacts={whatsappContacts}>
      <div className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteHeader siteName={SITE_NAME} />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter
          siteName={SITE_NAME}
          address={address}
          mapEmbed={mapEmbed}
          contactPersons={activeContacts}
          socialLinks={socialLinks.filter((s) => s.isActive)}
        />
      </div>
    </WhatsappContactsProvider>
  );
}
