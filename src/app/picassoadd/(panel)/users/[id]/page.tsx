import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserForm } from "../UserForm";
import { ResetPasswordForm } from "../ResetPasswordForm";
import { resetUserPasswordAction, updateUserAction } from "../actions";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const me = await requireAdmin();
  const { id } = await params;
  const user = await getContainer().userService.getById(id);
  if (!user) notFound();

  const updateBound = updateUserAction.bind(null, user.id);
  const resetBound = resetUserPasswordAction.bind(null, user.id);
  const isSelf = user.id === me.id;

  return (
    <div className="container-page max-w-2xl py-8">
      <Link
        href="/picassoadd/users"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to users
      </Link>

      <div className="mt-3">
        <PageHeader
          title={`Edit ${user.name}`}
          description={user.email}
        />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardBody>
          <UserForm
            mode="edit"
            action={updateBound}
            defaults={{
              name: user.name,
              email: user.email,
              role: user.role,
              isActive: user.isActive,
            }}
            lockSelfFields={isSelf}
          />
          {isSelf && (
            <p className="mt-3 text-xs text-brand-gray-500">
              You cannot change your own role or active status.
            </p>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardBody>
          <ResetPasswordForm action={resetBound} />
        </CardBody>
      </Card>
    </div>
  );
}
