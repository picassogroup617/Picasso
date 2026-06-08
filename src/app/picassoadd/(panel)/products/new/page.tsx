import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductForm } from "../ProductForm";
import { createProductAction } from "../actions";

export default async function NewProductPage() {
  await requireWriter();
  const categories = await getContainer().categoryService.list();
  if (categories.length === 0) {
    redirect("/picassoadd/products");
  }

  return (
    <div className="container-page max-w-3xl py-8">
      <Link
        href="/picassoadd/products"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="mt-3">
        <PageHeader
          title="New product"
          description="Add a product to your catalog."
        />
      </div>

      <Card className="mt-6">
        <CardBody>
          <ProductForm
            mode="create"
            action={createProductAction}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          />
        </CardBody>
      </Card>
    </div>
  );
}
