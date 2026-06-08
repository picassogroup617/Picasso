import { revalidatePath } from "next/cache";

/**
 * Centralised helpers for invalidating Next.js route cache after admin
 * mutations. Pages that depend on data from multiple admin sections
 * (e.g. the public home + footer) are revalidated here so callers do
 * not have to remember every dependent path.
 */

/** Public pages that surface category data. */
export function revalidatePublicCategoryPaths(): void {
  revalidatePath("/");
  revalidatePath("/categories");
  // Each `categories/[slug]` page caches independently; revalidate the
  // dynamic segment so a single edit propagates to every slug page.
  revalidatePath("/categories/[slug]", "page");
}

/** Public pages that surface product data. */
export function revalidatePublicProductPaths(): void {
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
  revalidatePath("/", "layout");
}
