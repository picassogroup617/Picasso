import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ContactForm } from "../ContactForm";
import { createContactAction } from "../actions";

export default async function NewContactPage() {
  await requireWriter();

  return (
    <div className="container-page max-w-2xl py-8">
      <Link
        href="/picassoadd/site-content/contacts"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to contacts
      </Link>

      <div className="mt-3">
        <PageHeader title="New contact" description="Add a point of contact with up to two phone numbers and an email." />
      </div>

      <Card className="mt-6">
        <CardBody>
          <ContactForm mode="create" action={createContactAction} />
        </CardBody>
      </Card>
    </div>
  );
}
