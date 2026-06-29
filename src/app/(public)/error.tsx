"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

/**
 * Error boundary for the public site. The public layout (header/footer)
 * remains intact above this fallback because the segment-level error.tsx
 * lives below the layout boundary.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("PublicError:", error);
  }, [error]);

  return (
    <section className="container-page py-20">
      <div className="mx-auto max-w-lg rounded-xl border border-brand-gray-200 bg-brand-white p-10 text-center shadow-soft">
        <h1 className="font-display text-2xl font-semibold text-brand-gray-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-brand-gray-500">
          We hit an unexpected error loading this page. Please try again, or
          head back to the home page.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-brand-gray-300">
            Ref: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-gray-550 bg-brand-gray-550 px-4 text-sm font-medium text-brand-white shadow-soft transition hover:bg-brand-gray-650"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-brand-gray-200 bg-brand-white px-4 text-sm font-medium text-brand-gray-700 transition hover:bg-brand-gray-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
