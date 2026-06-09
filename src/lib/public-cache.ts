import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getContainer } from "@/lib/container";
import { loadCategorySlides as loadCategorySlidesUncached } from "@/lib/category-slides";

/**
 * Shared cache layer for public catalog reads.
 *
 * Two layers stack here:
 *  - {@link unstable_cache} stores results in Next.js's data cache between
 *    requests, keyed and tagged so admin mutations invalidate only the
 *    affected slices via {@link revalidateTag}.
 *  - {@link cache} (React) deduplicates calls within a single render so
 *    `generateMetadata` and the page body share one read.
 *
 * Tags are exported alongside the helpers so admin actions don't need to
 * remember the literal strings.
 */

export const PUBLIC_CACHE_TAGS = {
  categories: "categories",
  products: "products",
  siteContent: "site-content",
} as const;

const PUBLIC_REVALIDATE_SECONDS = 300;

const fetchPublishedCategories = unstable_cache(
  async (limit?: number) =>
    getContainer().categoryService.list({ publishedOnly: true, limit }),
  ["public:categories:published"],
  { tags: [PUBLIC_CACHE_TAGS.categories], revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getPublishedCategories = cache((limit?: number) =>
  fetchPublishedCategories(limit),
);

const fetchPublishedCategoryBySlug = unstable_cache(
  async (slug: string) => getContainer().categoryService.findBySlug(slug),
  ["public:category:by-slug"],
  { tags: [PUBLIC_CACHE_TAGS.categories], revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getPublishedCategoryBySlug = cache((slug: string) =>
  fetchPublishedCategoryBySlug(slug),
);

const fetchCategoryById = unstable_cache(
  async (id: string) => getContainer().categoryService.getById(id),
  ["public:category:by-id"],
  { tags: [PUBLIC_CACHE_TAGS.categories], revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getPublishedCategoryById = cache((id: string) =>
  fetchCategoryById(id),
);

const fetchPublishedProductsByCategory = unstable_cache(
  async (categoryId: string) =>
    getContainer().productService.list({ categoryId, publishedOnly: true }),
  ["public:products:by-category"],
  {
    tags: [PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.categories],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
);

export const getPublishedProductsByCategory = cache((categoryId: string) =>
  fetchPublishedProductsByCategory(categoryId),
);

const fetchAllPublishedProducts = unstable_cache(
  async () => getContainer().productService.list({ publishedOnly: true }),
  ["public:products:all-published"],
  { tags: [PUBLIC_CACHE_TAGS.products], revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getAllPublishedProducts = cache(() => fetchAllPublishedProducts());

const fetchPublishedProductBySlug = unstable_cache(
  async (slug: string) => getContainer().productService.findBySlug(slug),
  ["public:product:by-slug"],
  { tags: [PUBLIC_CACHE_TAGS.products], revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getPublishedProductBySlug = cache((slug: string) =>
  fetchPublishedProductBySlug(slug),
);

const fetchSiteContent = unstable_cache(
  async (key: string) => getContainer().siteContentService.getByKey(key),
  ["public:site-content:by-key"],
  { tags: [PUBLIC_CACHE_TAGS.siteContent], revalidate: PUBLIC_REVALIDATE_SECONDS },
);

export const getSiteContent = cache((key: string) => fetchSiteContent(key));

const fetchCategorySlides = unstable_cache(
  async (categoryIds: readonly string[]) => {
    const map = await loadCategorySlidesUncached(categoryIds);
    // unstable_cache must return a serialisable value; flatten Map → entries.
    return Array.from(map.entries());
  },
  ["public:category-slides"],
  {
    tags: [PUBLIC_CACHE_TAGS.products, PUBLIC_CACHE_TAGS.categories],
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  },
);

export const getCategorySlides = cache(
  async (categoryIds: readonly string[]) => {
    const entries = await fetchCategorySlides(categoryIds);
    return new Map(entries);
  },
);
