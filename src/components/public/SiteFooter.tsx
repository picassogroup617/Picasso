import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MessageCircle, Phone } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { WhatsappIcon } from "./WhatsappIcon";
import { SocialPlatform } from "@/domain/entities/socialPlatform";
import type { ContactPerson } from "@/domain/entities/contactPerson";
import type { SocialLink } from "@/domain/entities/socialLink";
import type { SiteContent } from "@/domain/entities/siteContent";
import { MapEmbed } from "./MapEmbed";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const SOCIAL_ICON: Record<SocialPlatform, Icon> = {
  LINKEDIN: Linkedin,
  INSTAGRAM: Instagram,
  FACEBOOK: Facebook,
  WHATSAPP: MessageCircle,
};

const telHref = (n: string) => `tel:${n.replace(/\s+/g, "")}`;
const waHref = (n: string) => `https://wa.me/${n.replace(/[^0-9]/g, "")}`;

interface SiteFooterProps {
  siteName: string;
  address: SiteContent | null;
  mapEmbed: SiteContent | null;
  contactPersons: ContactPerson[];
  socialLinks: SocialLink[];
}

export function SiteFooter({
  siteName,
  address,
  mapEmbed,
  contactPersons,
  socialLinks,
}: SiteFooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="mt-16 border-t border-brand-gray-200 bg-brand-gray-50">
      <div className="container-page grid gap-7 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        <div>
          <Image
            src="/brand/logo.png"
            alt={siteName}
            width={400}
            height={100}
            className="h-16 w-auto"
          />
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-brand-gray-500">
            Crafted products, delivered with care. Reach out for a quote tailored to your needs.
          </p>
          <h3 className="mt-4 text-xs font-medium uppercase tracking-wide text-brand-gray-500">
            Follow
          </h3>
          <ul className="mt-2 flex flex-wrap gap-2.5">
            {socialLinks.length === 0 && (
              <li className="text-sm text-brand-gray-500">No social links yet.</li>
            )}
            {socialLinks.map((s) => {
              const Icon = SOCIAL_ICON[s.platform];
              return (
                <li key={s.id}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label ?? s.platform}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-gray-200 bg-brand-white text-brand-gray-700 transition hover:border-brand-gray-400 hover:text-brand-gray-900"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
            Contact
          </h3>
          <ul className="mt-2.5 space-y-3">
            {contactPersons.length === 0 && (
              <li className="text-sm text-brand-gray-500">No contacts yet.</li>
            )}
            {contactPersons.map((p) => (
              <li key={p.id}>
                <p className="text-sm font-medium text-brand-gray-900">{p.name}</p>
                <ul className="mt-1 space-y-1">
                  <li>
                    <PhoneLine number={p.phone1} onWhatsapp={p.phone1OnWhatsapp} />
                  </li>
                  {p.phone2 && (
                    <li>
                      <PhoneLine number={p.phone2} onWhatsapp={p.phone2OnWhatsapp} />
                    </li>
                  )}
                  {p.email && (
                    <li>
                      <a
                        href={`mailto:${p.email}`}
                        className="inline-flex items-center gap-2 text-sm text-brand-gray-700 hover:text-brand-gray-900"
                      >
                        <Mail className="h-4 w-4" aria-hidden />
                        <span>{p.email}</span>
                      </a>
                    </li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {(address || mapEmbed) && (
          <div>
            {address && (
              <>
                <h3 className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
                  {address.title}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-gray-700">
                  {address.description}
                </p>
              </>
            )}
            <MapEmbed
              url={mapEmbed?.description ?? null}
              title={mapEmbed?.title ?? null}
              caption={null}
              className={address ? "mt-4" : undefined}
            />
          </div>
        )}
      </div>

      <div className="border-t border-brand-gray-200">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-4 text-xs text-brand-gray-500 sm:flex-row sm:items-center">
          <p>
            © {year} {siteName}. All rights reserved.
          </p>
          <Link href="/picassoadd" className="hover:text-brand-gray-900">
            Staff sign-in
          </Link>
        </div>
      </div>
    </footer>
  );
}


function PhoneLine({ number, onWhatsapp }: { number: string; onWhatsapp: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-gray-700">
      <a
        href={telHref(number)}
        className="inline-flex items-center gap-2 hover:text-brand-gray-900"
      >
        <Phone className="h-4 w-4" aria-hidden />
        <span>{number}</span>
      </a>
      {onWhatsapp && (
        <a
          href={waHref(number)}
          target="_blank"
          rel="noreferrer"
          aria-label={`WhatsApp ${number}`}
          className="inline-flex items-center text-[#25D366] hover:opacity-80"
        >
          <WhatsappIcon className="h-4 w-4" aria-hidden />
        </a>
      )}
    </span>
  );
}
