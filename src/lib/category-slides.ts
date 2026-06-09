import { getContainer } from "@/lib/container";
import type { SlideImage } from "@/components/public/CategoryImageSlideshow";

/** Max product images shown in a category's slideshow card. */
export const CATEGORY_SLIDESHOW_MAX = 10;

/** Fisher–Yates shuffle. */
function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * For each category id, returns up to `CATEGORY_SLIDESHOW_MAX` product images
 * to feed the home/listing card slideshows. When a category has fewer images
 * all are returned; otherwise a random sample is taken.
 */
export async function loadCategorySlides(
  categoryIds: readonly string[],
): Promise<Map<string, SlideImage[]>> {
  const result = new Map<string, SlideImage[]>(categoryIds.map((id) => [id, []]));
  if (categoryIds.length === 0) return result;

  const { productService } = getContainer();
  // One batched query for every category instead of N parallel reads.
  const products = await productService.list({
    categoryIds,
    publishedOnly: true,
  });

  const buckets = new Map<string, SlideImage[]>(categoryIds.map((id) => [id, []]));
  for (const p of products) {
    const bucket = buckets.get(p.categoryId);
    if (!bucket) continue;
    for (const img of p.images) {
      bucket.push({ url: img.url, alt: img.alt ?? p.name });
    }
  }

  for (const [id, all] of buckets) {
    const picked =
      all.length <= CATEGORY_SLIDESHOW_MAX
        ? all
        : shuffle(all).slice(0, CATEGORY_SLIDESHOW_MAX);
    result.set(id, picked);
  }
  return result;
}
