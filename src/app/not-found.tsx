import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page not found",
};

/**
 * Root 404 — rendered for any unmatched URL across the entire app.
 * Kept intentionally minimal so it works even without the public layout
 * (e.g., for a stray admin path with a typo).
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-gray-50 px-6 py-20">
      <div className="w-full max-w-md rounded-xl border border-brand-gray-200 bg-brand-white p-10 text-center shadow-soft">
        <span className="inline-flex items-center rounded-full bg-brand-yellow-soft px-3 py-1 text-xs font-medium text-brand-gray-700">
          404
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-brand-gray-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-brand-gray-500">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-gray-550 bg-brand-gray-550 px-4 text-sm font-medium text-brand-white shadow-soft transition hover:bg-brand-gray-650"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Link
            href="/categories"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-gray-200 bg-brand-white px-4 text-sm font-medium text-brand-gray-700 transition hover:bg-brand-gray-50"
          >
            Browse categories
          </Link>
        </div>
      </div>
    </main>
  );
}
