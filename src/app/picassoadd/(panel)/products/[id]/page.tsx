import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { ProductForm } from "../ProductForm";
import { updateProductAction } from "../actions";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  await requireWriter();
  const { id } = await params;
  const { productService, categoryService } = getContainer();
  const [product, categories] = await Promise.all([
    productService.getById(id),
    categoryService.list(),
  ]);
  if (!product) notFound();

  const updateBound = updateProductAction.bind(null, product.id);

  return (
    <div className="container-page max-w-3xl py-8">
      <Link
        href="/picassoadd/products"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>

      <div className="mt-3">
        <PageHeader title="Edit product" description={product.name} />
      </div>

      <Card className="mt-6">
        <CardBody>
          <ProductForm
            mode="edit"
            action={updateBound}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            defaults={product}
          />
        </CardBody>
      </Card>
    </div>
  );
}
