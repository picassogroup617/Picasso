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
import { DeleteProductButton } from "./DeleteProductButton";

interface ProductsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const me = await requireUser();
  const { error } = await searchParams;
  const { productService, categoryService } = getContainer();
  const [products, categories] = await Promise.all([
    productService.list(),
    categoryService.list(),
  ]);
  const canWrite = me.role !== Role.VIEWER;
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const noCategories = categories.length === 0;

  return (
    <div className="container-page py-8">
      <PageHeader
        title="Products"
        description="Items shown on the public catalog."
        actions={
          canWrite && !noCategories ? (
            <Link href="/picassoadd/products/new">
              <Button>
                <Plus className="h-4 w-4" /> New product
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

      {noCategories && canWrite && (
        <Alert tone="warning" className="mt-4">
          You need at least one category before adding products.{" "}
          <Link href="/picassoadd/categories/new" className="font-medium underline">
            Create a category
          </Link>
          .
        </Alert>
      )}

      <Card className="mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-gray-50 text-left text-xs uppercase tracking-wide text-brand-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Image</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Images</th>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-gray-100">
            {products.map((p) => {
              const cover = p.images[0];
              return (
                <tr key={p.id}>
                  <td className="px-5 py-3">
                    {cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={cover.url}
                        alt={cover.alt ?? p.name}
                        className="h-10 w-10 rounded-md border border-brand-gray-200 object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md border border-dashed border-brand-gray-200" />
                    )}
                  </td>
                  <td className="px-5 py-3 font-medium text-brand-gray-900">{p.name}</td>
                  <td className="px-5 py-3 text-brand-gray-700">
                    {categoryName.get(p.categoryId) ?? "—"}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-brand-gray-600">
                    {p.slug}
                  </td>
                  <td className="px-5 py-3 text-brand-gray-700">{p.images.length}</td>
                  <td className="px-5 py-3 text-brand-gray-700">{p.order}</td>
                  <td className="px-5 py-3">
                    {p.isPublished ? (
                      <Badge tone="green">Published</Badge>
                    ) : (
                      <Badge tone="gray">Draft</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canWrite && (
                      <div className="inline-flex items-center gap-2">
                        <Link href={`/picassoadd/products/${p.id}`}>
                          <Button size="sm" variant="secondary">
                            Edit
                          </Button>
                        </Link>
                        <DeleteProductButton id={p.id} name={p.name} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-8 text-center text-sm text-brand-gray-500"
                >
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
