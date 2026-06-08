import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireWriter } from "@/lib/auth-guards";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { CategoryForm } from "../CategoryForm";
import { createCategoryAction } from "../actions";

export default async function NewCategoryPage() {
  await requireWriter();

  return (
    <div className="container-page max-w-3xl py-8">
      <Link
        href="/picassoadd/categories"
        className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
      >
        <ChevronLeft className="h-4 w-4" /> Back to categories
      </Link>

      <div className="mt-3">
        <PageHeader
          title="New category"
          description="Add a top-level product category."
        />
      </div>

      <Card className="mt-6">
        <CardBody>
          <CategoryForm mode="create" action={createCategoryAction} />
        </CardBody>
      </Card>
    </div>
  );
}
