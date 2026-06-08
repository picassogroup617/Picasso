import Link from "next/link";
import { ArrowRight, Phone, Share2 } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONTENT_SECTIONS } from "@/domain/constants/siteContentKeys";

export default async function SiteContentPage() {
  await requireUser();

  const { siteContentService, contactPersonService, socialLinkService } = getContainer();
  const [filled, contacts, socials] = await Promise.all([
    siteContentService.list(),
    contactPersonService.list(),
    socialLinkService.list(),
  ]);
  const filledKeys = new Set(filled.map((s) => s.key));

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Site Content"
        description="Edit the text, images, and contact details shown on the public site."
      />

      <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
        Page sections
      </h2>
      <section className="mt-2 grid gap-4 sm:grid-cols-2">
        {SITE_CONTENT_SECTIONS.map((s) => {
          const isSet = filledKeys.has(s.key);
          return (
            <Link key={s.key} href={`/picassoadd/site-content/${s.key}`} className="block">
              <Card className="transition hover:border-brand-yellow">
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-brand-gray-900">{s.label}</h3>
                      <p className="mt-1 text-xs text-brand-gray-500">{s.description}</p>
                    </div>
                    <Badge tone={isSet ? "green" : "gray"}>
                      {isSet ? "Set" : "Not set"}
                    </Badge>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-gray-700">
                    Edit <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </section>

      <h2 className="mt-8 text-xs font-semibold uppercase tracking-wide text-brand-gray-500">
        Contact &amp; social
      </h2>
      <section className="mt-2 grid gap-4 sm:grid-cols-2">
        <Link href="/picassoadd/site-content/contacts" className="block">
          <Card className="transition hover:border-brand-yellow">
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-gray-900">
                    <Phone className="h-4 w-4" /> Contact people
                  </h3>
                  <p className="mt-1 text-xs text-brand-gray-500">
                    Points of contact with phones, emails, and WhatsApp flags.
                  </p>
                </div>
                <Badge tone="gray">{contacts.length}</Badge>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/picassoadd/site-content/socials" className="block">
          <Card className="transition hover:border-brand-yellow">
            <CardBody>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-brand-gray-900">
                    <Share2 className="h-4 w-4" /> Social links
                  </h3>
                  <p className="mt-1 text-xs text-brand-gray-500">
                    LinkedIn, Instagram, Facebook, and WhatsApp profile links.
                  </p>
                </div>
                <Badge tone="gray">{socials.length}</Badge>
              </div>
            </CardBody>
          </Card>
        </Link>
      </section>
    </div>
  );
}
