import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Role } from "@/domain/entities/role";
import { DeleteContactButton } from "./DeleteContactButton";

interface ContactsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const me = await requireUser();
  const { error } = await searchParams;
  const contacts = await getContainer().contactPersonService.list();
  const canWrite = me.role !== Role.VIEWER;

  return (
    <div className="container-page py-8">
      <Link
        href="/picassoadd/site-content"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to site content
      </Link>

      <div className="mt-3">
        <PageHeader
          title="Contact people"
          description="Points of contact shown on the public site, each with up to two phones and an email."
          actions={
            canWrite ? (
              <Link href="/picassoadd/site-content/contacts/new">
                <Button>
                  <Plus className="h-4 w-4" /> Add contact
                </Button>
              </Link>
            ) : undefined
          }
        />
      </div>

      {error && (
        <Alert tone="error" className="mt-4">
          {error}
        </Alert>
      )}

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-50 text-left text-xs uppercase tracking-wide text-brand-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Phone 1</th>
              <th className="px-5 py-3 font-medium">Phone 2</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {contacts.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3 font-medium text-brand-gray-900">{c.name}</td>
                <td className="px-5 py-3 text-brand-gray-700">{c.email ?? "—"}</td>
                <td className="px-5 py-3 text-brand-gray-700">
                  <PhoneCell number={c.phone1} onWhatsapp={c.phone1OnWhatsapp} />
                </td>
                <td className="px-5 py-3 text-brand-gray-700">
                  {c.phone2 ? (
                    <PhoneCell number={c.phone2} onWhatsapp={c.phone2OnWhatsapp} />
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-3 text-brand-gray-700">{c.order}</td>
                <td className="px-5 py-3">
                  {c.isActive ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="red">Inactive</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {canWrite && (
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/picassoadd/site-content/contacts/${c.id}`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <DeleteContactButton id={c.id} label={c.name} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-sm text-brand-gray-500">
                  No contacts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PhoneCell({ number, onWhatsapp }: { number: string; onWhatsapp: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{number}</span>
      {onWhatsapp && <Badge tone="green">WhatsApp</Badge>}
    </span>
  );
}
