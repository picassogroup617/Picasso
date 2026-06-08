/**
 * Lightweight skeleton shown during server-side data fetching for any public
 * route segment. Mirrors the typical header band + grid layout so the page
 * doesn't visibly jump on hydration.
 */
export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <section className="border-b border-brand-gray-200 bg-brand-gray-50">
        <div className="container-page py-14 sm:py-20">
          <div className="h-3 w-20 animate-pulse rounded bg-brand-gray-200" />
          <div className="mt-3 h-9 w-72 animate-pulse rounded bg-brand-gray-200" />
          <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-brand-gray-200" />
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-brand-gray-200 bg-brand-white"
            >
              <div className="aspect-[4/3] animate-pulse bg-brand-gray-100" />
              <div className="space-y-2 p-5">
                <div className="h-4 w-32 animate-pulse rounded bg-brand-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-brand-gray-200" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-brand-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
