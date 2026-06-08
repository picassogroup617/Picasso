import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { UserForm } from "../UserForm";
import { createUserAction } from "../actions";

export default async function NewUserPage() {
  await requireAdmin();

  return (
    <div className="container-page max-w-2xl py-8">
      <Link
        href="/picassoadd/users"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="mt-3">
        <PageHeader title="New user" description="Create an admin, editor, or viewer account." />
      </div>

      <Card className="mt-6">
        <CardBody>
          <UserForm mode="create" action={createUserAction} />
        </CardBody>
      </Card>
    </div>
  );
}
