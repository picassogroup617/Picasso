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
import { SocialPlatform } from "@/domain/entities/socialPlatform";
import { DeleteSocialButton } from "./DeleteSocialButton";

interface SocialsPageProps {
  searchParams: Promise<{ error?: string }>;
}

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
  WHATSAPP: "WhatsApp",
};

export default async function SocialsPage({ searchParams }: SocialsPageProps) {
  const me = await requireUser();
  const { error } = await searchParams;
  const socials = await getContainer().socialLinkService.list();
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
          title="Social links"
          description="Profile links shown on the public site footer."
          actions={
            canWrite ? (
              <Link href="/picassoadd/site-content/socials/new">
                <Button>
                  <Plus className="h-4 w-4" /> Add link
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
              <th className="px-5 py-3 font-medium">Platform</th>
              <th className="px-5 py-3 font-medium">Label</th>
              <th className="px-5 py-3 font-medium">URL</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {socials.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3 font-medium text-brand-gray-900">
                  {PLATFORM_LABELS[s.platform]}
                </td>
                <td className="px-5 py-3 text-brand-gray-700">{s.label ?? "—"}</td>
                <td className="px-5 py-3 max-w-[24rem] truncate text-brand-gray-700">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {s.url}
                  </a>
                </td>
                <td className="px-5 py-3 text-brand-gray-700">{s.order}</td>
                <td className="px-5 py-3">
                  {s.isActive ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="red">Inactive</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {canWrite && (
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/picassoadd/site-content/socials/${s.id}`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <DeleteSocialButton id={s.id} label={s.label ?? s.url} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {socials.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-brand-gray-500">
                  No social links yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
