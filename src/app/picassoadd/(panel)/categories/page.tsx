import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Role } from "@/domain/entities/role";
import { DeleteCategoryButton } from "./DeleteCategoryButton";

interface CategoriesPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const me = await requireUser();
  const { error } = await searchParams;
  const categories = await getContainer().categoryService.list();
  const canWrite = me.role !== Role.VIEWER;

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Categories"
        description="Top-level groups shown on the public catalog."
        actions={
          canWrite ? (
            <Link href="/picassoadd/categories/new">
              <Button>
                <Plus className="h-4 w-4" /> New category
              </Button>
            </Link>
          ) : undefined
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
              <th className="px-5 py-3 font-medium">Image</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-5 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="h-10 w-10 rounded-md border border-brand-gray-200 object-cover"
                  />
                </td>
                <td className="px-5 py-3 font-medium text-brand-gray-900">{c.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-brand-gray-600">
                  {c.slug}
                </td>
                <td className="px-5 py-3 text-brand-gray-700">{c.order}</td>
                <td className="px-5 py-3">
                  {c.isPublished ? (
                    <Badge tone="green">Published</Badge>
                  ) : (
                    <Badge tone="gray">Draft</Badge>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  {canWrite && (
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/picassoadd/categories/${c.id}`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                      <DeleteCategoryButton id={c.id} name={c.name} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-8 text-center text-sm text-brand-gray-500"
                >
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
