import Image from "next/image";
import Link from "next/link";
import { QuoteRequestButton } from "@/components/public/QuoteRequestButton";
import { getPublishedCategories } from "@/lib/public-cache";

export const metadata = {
  title: "Categories",
};

export const revalidate = 300;

export default async function CategoriesIndexPage() {
  const categories = await getPublishedCategories();

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
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                aria-label={c.name}
                className="group block overflow-hidden rounded-[1.5rem] bg-brand-gray-100 shadow-soft transition hover:shadow-elevated"
              >
                <div className="relative aspect-square overflow-hidden">
                  {c.imageUrl ? (
                    <Image
                      src={c.imageUrl}
                      alt={c.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-center text-sm font-medium text-brand-gray-500">
                      {c.name}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
