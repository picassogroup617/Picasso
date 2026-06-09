import { revalidatePath, revalidateTag } from "next/cache";
import { PUBLIC_CACHE_TAGS } from "@/lib/public-cache";

/**
 * Centralised helpers for invalidating Next.js route cache after admin
 * mutations. Pages that depend on data from multiple admin sections
 * (e.g. the public home + footer) are revalidated here so callers do
 * not have to remember every dependent path.
 *
 * Each helper invalidates both the route-level cache (`revalidatePath`)
 * and the data-cache tags used by `src/lib/public-cache.ts` so unstable_cache
 * entries are dropped immediately on the next request.
 */

/** Public pages that surface category data. */
export function revalidatePublicCategoryPaths(): void {
  revalidateTag(PUBLIC_CACHE_TAGS.categories);
  revalidatePath("/");
  revalidatePath("/categories");
  // Each `categories/[slug]` page caches independently; revalidate the
  // dynamic segment so a single edit propagates to every slug page.
  revalidatePath("/categories/[slug]", "page");
}

/** Public pages that surface product data. */
export function revalidatePublicProductPaths(): void {
  revalidateTag(PUBLIC_CACHE_TAGS.products);
  revalidateTag(PUBLIC_CACHE_TAGS.categories);
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/products/[slug]", "page");
}

/**
 * Anything in the public footer / contact section depends on the site-wide
 * layout, so revalidating the layout cascades to every public page.
 */
export function revalidatePublicLayoutPaths(): void {
  revalidateTag(PUBLIC_CACHE_TAGS.siteContent);
  revalidatePath("/", "layout");
}
