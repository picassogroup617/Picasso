import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Role } from "@/domain/entities/role";
import { DeleteUserButton } from "./DeleteUserButton";

interface UsersPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ROLE_TONES: Record<Role, "yellow" | "blue" | "gray"> = {
  ADMIN: "yellow",
  EDITOR: "blue",
  VIEWER: "gray",
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const me = await requireAdmin();
  const { error } = await searchParams;
  const users = await getContainer().userService.list();

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Users"
        description="Create and manage admin / editor / viewer accounts."
        actions={
          <Link href="/picassoadd/users/new">
            <Button>
              <Plus className="h-4 w-4" /> New User
            </Button>
          </Link>
        }
      />

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
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-5 py-3 font-medium text-brand-gray-900">
                  {u.name}
                  {u.id === me.id && (
                    <span className="ml-2 text-xs text-brand-gray-500">(you)</span>
                  )}
                </td>
                <td className="px-5 py-3 text-brand-gray-700">{u.email}</td>
                <td className="px-5 py-3">
                  <Badge tone={ROLE_TONES[u.role]}>{u.role}</Badge>
                </td>
                <td className="px-5 py-3">
                  {u.isActive ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="red">Inactive</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link href={`/picassoadd/users/${u.id}`}>
                      <Button size="sm" variant="secondary">
                        Edit
                      </Button>
                    </Link>
                    {u.id !== me.id && <DeleteUserButton userId={u.id} userName={u.name} />}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-brand-gray-500">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
