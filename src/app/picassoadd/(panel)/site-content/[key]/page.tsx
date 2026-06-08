import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSiteContentSection } from "@/domain/constants/siteContentKeys";
import { Role } from "@/domain/entities/role";
import { SiteContentForm } from "./SiteContentForm";
import { saveSiteContentAction } from "./actions";

interface SiteContentEditPageProps {
  params: Promise<{ key: string }>;
}

export default async function SiteContentEditPage({ params }: SiteContentEditPageProps) {
  const me = await requireUser();
  const { key } = await params;

  const section = getSiteContentSection(key);
  if (!section) notFound();

  const existing = await getContainer().siteContentService.getByKey(key);
  const readOnly = me.role === Role.VIEWER;
  const saveBound = saveSiteContentAction.bind(null, key);

  return (
    <div className="container-page max-w-3xl py-8">
      <Link
        href="/picassoadd/site-content"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to site content
      </Link>

      <div className="mt-3">
        <PageHeader title={section.label} description={section.description} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Content</CardTitle>
          {readOnly && <Badge tone="gray">View only</Badge>}
        </CardHeader>
        <CardBody>
          <SiteContentForm
            action={saveBound}
            sectionKey={section.key}
            hasImage={section.hasImage}
            readOnly={readOnly}
            defaults={{
              title: existing?.title ?? "",
              description: existing?.description ?? "",
              imageUrl: existing?.imageUrl ?? "",
              imagePublicId: existing?.imagePublicId ?? "",
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
