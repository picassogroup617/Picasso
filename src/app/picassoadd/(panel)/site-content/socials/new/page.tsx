import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { SocialForm } from "../SocialForm";
import { createSocialAction } from "../actions";

export default async function NewSocialPage() {
  await requireWriter();

  return (
    <div className="container-page max-w-2xl py-8">
      <Link
        href="/picassoadd/site-content/socials"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to social links
      </Link>

      <div className="mt-3">
        <PageHeader title="New social link" description="Add a LinkedIn, Instagram, Facebook, or WhatsApp profile link." />
      </div>

      <Card className="mt-6">
        <CardBody>
          <SocialForm mode="create" action={createSocialAction} />
        </CardBody>
      </Card>
    </div>
  );
}
