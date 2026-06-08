import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getContainer } from "@/lib/container";
import { ProductGallery } from "@/components/public/ProductGallery";
import { QuoteRequestButton } from "@/components/public/QuoteRequestButton";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const { productService } = getContainer();
  const product = await productService.findBySlug(slug);
  if (!product || !product.isPublished) {
    return { title: "Product not found" };
  }
  const description = product.longDescription.slice(0, 160);
  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const { productService, categoryService } = getContainer();
  const product = await productService.findBySlug(slug);

  if (!product || !product.isPublished) {
    return <ProductNotFound />;
  }

  const category = await categoryService.getById(product.categoryId);
  const categoryVisible = Boolean(category && category.isPublished);

  return (
    <>
      <section className="border-b border-brand-gray-200 bg-brand-gray-50">
        <div className="container-page py-6">
          <Link
            href={
              categoryVisible && category
                ? `/categories/${category.slug}`
                : "/categories"
            }
            className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            {categoryVisible && category ? category.name : "All categories"}
          </Link>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} productName={product.name} />

          <div className="flex flex-col">
            {categoryVisible && category && (
              <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
                {category.name}
              </p>
            )}
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-brand-gray-900 sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-6 whitespace-pre-wrap text-base leading-relaxed text-brand-gray-700">
              {product.longDescription}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <QuoteRequestButton
                size="lg"
                productId={product.id}
                productName={product.name}
              >
                Get a quote for this
              </QuoteRequestButton>
              <Link
                href={
                  categoryVisible && category
                    ? `/categories/${category.slug}`
                    : "/categories"
                }
                className="inline-flex h-11 items-center gap-2 rounded-md border border-brand-gray-200 bg-brand-white px-5 text-sm font-medium text-brand-gray-700 transition hover:bg-brand-gray-50"
              >
                Browse more
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProductNotFound() {
  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-brand-gray-200 bg-brand-white p-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-gray-900">
          Product not found
        </h1>
        <p className="mt-2 text-sm text-brand-gray-500">
          The product you&apos;re looking for isn&apos;t available right now.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/categories"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-gray-200 bg-brand-white px-4 text-sm font-medium text-brand-gray-700 transition hover:bg-brand-gray-50"
          >
            Browse categories
          </Link>
          <QuoteRequestButton>Get a quote</QuoteRequestButton>
        </div>
      </div>
    </section>
  );
}
