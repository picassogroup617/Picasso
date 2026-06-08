import type { MetadataRoute } from "next";
import { getContainer } from "@/lib/container";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

/**
 * Auto-generated XML sitemap. Lists static public routes plus every published
 * category and product. Missing/empty data degrades to just the static routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/categories`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    const { categoryService, productService } = getContainer();
    const [categories, products] = await Promise.all([
      categoryService.list({ publishedOnly: true }),
      productService.list({ publishedOnly: true }),
    ]);

    const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${SITE_URL}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...base, ...categoryEntries, ...productEntries];
  } catch {
    return base;
  }
}
