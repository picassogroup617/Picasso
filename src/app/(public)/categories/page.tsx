import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { QuoteRequestButton } from "@/components/public/QuoteRequestButton";
import { CategoryImageSlideshow } from "@/components/public/CategoryImageSlideshow";
import {
  getCategorySlides,
  getPublishedCategories,
} from "@/lib/public-cache";

export const metadata = {
  title: "Categories",
};

export const revalidate = 300;

export default async function CategoriesIndexPage() {
  const categories = await getPublishedCategories();
  const slidesByCategory = await getCategorySlides(categories.map((c) => c.id));

  return (
    <>
      <section className="border-b border-brand-gray-200 bg-brand-gray-50">
        <div className="container-page py-14 sm:py-20">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-gray-500">
            Catalog
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Categories
          </h1>
          <p className="mt-3 max-w-2xl text-base text-brand-gray-500">
            Browse our full range. Pick a category to see the products inside.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-gray-200 bg-brand-white p-10 text-center">
            <h2 className="font-display text-xl font-medium text-brand-gray-900">
              Nothing here yet
            </h2>
            <p className="mt-2 text-sm text-brand-gray-500">
              Our catalog is being prepared. In the meantime, get in touch and
              we&apos;ll help you find what you need.
            </p>
            <div className="mt-6 flex justify-center">
              <QuoteRequestButton>Get a quote</QuoteRequestButton>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group block overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-white transition hover:border-brand-yellow hover:shadow-soft"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-brand-gray-100">
                  <CategoryImageSlideshow
                    images={slidesByCategory.get(c.id) ?? []}
                    fallbackUrl={c.imageUrl}
                    fallbackAlt={c.name}
                  />
                </div>
                <div className="flex items-start justify-between gap-3 p-5">
                  <div>
                    <h2 className="font-display text-lg font-medium text-brand-gray-900">
                      {c.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-brand-gray-500">
                      {c.shortDescription}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 flex-none text-brand-gray-500 transition group-hover:text-brand-gray-900" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
