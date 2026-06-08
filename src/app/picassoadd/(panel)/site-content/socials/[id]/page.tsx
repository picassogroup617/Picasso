import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { SocialForm } from "../SocialForm";
import { updateSocialAction } from "../actions";

interface EditSocialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSocialPage({ params }: EditSocialPageProps) {
  await requireWriter();
  const { id } = await params;
  const social = await getContainer().socialLinkService.getById(id);
  if (!social) notFound();

  const updateBound = updateSocialAction.bind(null, social.id);

  return (
    <div className="container-page max-w-2xl py-8">
      <Link
        href="/picassoadd/site-content/socials"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to social links
      </Link>

      <div className="mt-3">
        <PageHeader title="Edit social link" description={social.label ?? social.url} />
      </div>

      <Card className="mt-6">
        <CardBody>
          <SocialForm mode="edit" action={updateBound} defaults={social} />
        </CardBody>
      </Card>
    </div>
  );
}
