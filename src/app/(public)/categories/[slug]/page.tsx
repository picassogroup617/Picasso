import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { getContainer } from "@/lib/container";
import { QuoteRequestButton } from "@/components/public/QuoteRequestButton";

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const { categoryService } = getContainer();
  const category = await categoryService.findBySlug(slug);
  if (!category || !category.isPublished) {
    return { title: "Category not found" };
  }
  return {
    title: category.name,
    description: category.shortDescription,
    openGraph: {
      title: category.name,
      description: category.shortDescription,
    },
  };
}

export default async function CategoryDetailPage({
  params,
}: CategoryDetailPageProps) {
  const { slug } = await params;
  const { categoryService, productService } = getContainer();
  const category = await categoryService.findBySlug(slug);

  if (!category || !category.isPublished) {
    return <CategoryNotFound />;
  }

  const products = await productService.list({
    categoryId: category.id,
    publishedOnly: true,
  });

  return (
    <>
      <section className="border-b border-brand-gray-200 bg-brand-gray-50">
        <div className="container-page py-12 sm:py-16">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1 text-sm text-brand-gray-500 hover:text-brand-gray-900"
          >
            <ChevronLeft className="h-4 w-4" /> All categories
          </Link>
          <div className="mt-4 grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
                Category
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                {category.name}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-brand-gray-500">
                {category.shortDescription}
              </p>
            </div>
            <QuoteRequestButton size="lg">Get a quote</QuoteRequestButton>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-gray-200 bg-brand-white p-10 text-center">
            <h2 className="font-display text-xl font-medium text-brand-gray-900">
              No products to show
            </h2>
            <p className="mt-2 text-sm text-brand-gray-500">
              This category is being updated. Send us a quote request and
              we&apos;ll respond with what&apos;s available.
            </p>
            <div className="mt-6 flex justify-center">
              <QuoteRequestButton>Get a quote</QuoteRequestButton>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const cover = p.images[0];
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-white transition hover:border-brand-yellow hover:shadow-soft"
                >
                  <div className="relative aspect-square bg-brand-gray-100">
                    {cover ? (
                      <Image
                        src={cover.url}
                        alt={cover.alt ?? p.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition motion-safe:group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-brand-gray-500">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-3 p-5">
                    <h3 className="font-display text-base font-medium text-brand-gray-900">
                      {p.name}
                    </h3>
                    <ArrowRight className="mt-1 h-4 w-4 flex-none text-brand-gray-500 transition group-hover:text-brand-gray-900" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

function CategoryNotFound() {
  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-xl border border-dashed border-brand-gray-200 bg-brand-white p-10 text-center">
        <h1 className="font-display text-2xl font-semibold text-brand-gray-900">
          Category not found
        </h1>
        <p className="mt-2 text-sm text-brand-gray-500">
          The category you&apos;re looking for isn&apos;t available right now.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/categories"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-gray-200 bg-brand-white px-4 text-sm font-medium text-brand-gray-700 transition hover:bg-brand-gray-50"
          >
            Browse all categories
          </Link>
          <QuoteRequestButton>Get a quote</QuoteRequestButton>
        </div>
      </div>
    </section>
  );
}
