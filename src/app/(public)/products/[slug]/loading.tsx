/**
 * Skeleton for /products/[slug]. Mirrors the gallery + text layout so the
 * page doesn't visibly jump when the real content paints.
 */
export default function ProductDetailLoading() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <section className="border-b border-brand-gray-200 bg-brand-gray-50">
        <div className="container-page py-6">
          <div className="h-4 w-32 animate-pulse rounded bg-brand-gray-200" />
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-3">
            <div className="aspect-square w-full animate-pulse rounded-xl bg-brand-gray-100" />
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-md bg-brand-gray-100"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="h-3 w-24 animate-pulse rounded bg-brand-gray-200" />
            <div className="mt-3 h-9 w-3/4 animate-pulse rounded bg-brand-gray-200" />

            <div className="mt-6 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-brand-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-brand-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-brand-gray-200" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-brand-gray-200" />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="h-11 w-44 animate-pulse rounded-md bg-brand-gray-200" />
              <div className="h-11 w-32 animate-pulse rounded-md bg-brand-gray-200" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
