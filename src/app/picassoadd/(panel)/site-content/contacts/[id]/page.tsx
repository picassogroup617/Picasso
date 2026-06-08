import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ContactForm } from "../ContactForm";
import { updateContactAction } from "../actions";

interface EditContactPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditContactPage({ params }: EditContactPageProps) {
  await requireWriter();
  const { id } = await params;
  const contact = await getContainer().contactPersonService.getById(id);
  if (!contact) notFound();

  const updateBound = updateContactAction.bind(null, contact.id);

  return (
    <div className="container-page max-w-2xl py-8">
      <Link
        href="/picassoadd/site-content/contacts"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to contacts
      </Link>

      <div className="mt-3">
        <PageHeader title="Edit contact" description={contact.name} />
      </div>

      <Card className="mt-6">
        <CardBody>
          <ContactForm mode="edit" action={updateBound} defaults={contact} />
        </CardBody>
      </Card>
    </div>
  );
}
