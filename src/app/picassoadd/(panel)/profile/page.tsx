import { requireUser } from "@/lib/auth-guards";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Role } from "@/domain/entities/role";
import { ChangePasswordForm, ProfileNameForm } from "./ProfileForms";

const ROLE_TONES: Record<Role, "yellow" | "blue" | "gray"> = {
  ADMIN: "yellow",
  EDITOR: "blue",
  VIEWER: "gray",
};

export default async function ProfilePage() {
  const me = await requireUser();

  return (
    <div className="container-page max-w-2xl py-8">
      <PageHeader title="My profile" description="Update your name and password." />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <Badge tone={ROLE_TONES[me.role]}>{me.role}</Badge>
        </CardHeader>
        <CardBody>
          <div className="mb-4 text-sm text-brand-gray-500">
            <span className="font-medium text-brand-gray-700">Email:</span> {me.email}
          </div>
          <ProfileNameForm defaultName={me.name} />
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardBody>
          <ChangePasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}
