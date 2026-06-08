import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { getContainer } from "@/lib/container";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { CategoryForm } from "../CategoryForm";
import { updateCategoryAction } from "../actions";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  await requireWriter();
  const { id } = await params;
  const category = await getContainer().categoryService.getById(id);
  if (!category) notFound();

  const updateBound = updateCategoryAction.bind(null, category.id);

  return (
    <div className="container-page max-w-3xl py-8">
      <Link
        href="/picassoadd/categories"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to categories
      </Link>

      <div className="mt-3">
        <PageHeader title="Edit category" description={category.name} />
      </div>

      <Card className="mt-6">
        <CardBody>
          <CategoryForm mode="edit" action={updateBound} defaults={category} />
        </CardBody>
      </Card>
    </div>
  );
}
