import type { PrismaClient } from "@prisma/client";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";

/**
 * Aggregates publicId references across every table that stores one. Used by
 * services before deleting an asset from Cloudinary so a shared image is not
 * removed while another row still depends on it.
 */
export class PrismaImageUsage implements IImageUsage {
  constructor(private readonly db: PrismaClient) {}

  async countReferences(publicId: string): Promise<number> {
    if (!publicId) return 0;
    const [categories, productImages, siteContent] = await Promise.all([
      this.db.category.count({ where: { imagePublicId: publicId } }),
      this.db.productImage.count({ where: { publicId } }),
      this.db.siteContent.count({ where: { imagePublicId: publicId } }),
    ]);
    return categories + productImages + siteContent;
  }

  async countReferencesMany(
    publicIds: readonly string[],
  ): Promise<Map<string, number>> {
    const unique = Array.from(new Set(publicIds.filter((p) => Boolean(p))));
    const result = new Map<string, number>(unique.map((id) => [id, 0]));
    if (unique.length === 0) return result;

    // Three grouped queries (one per table) instead of 3·N counts.
    const [categoryGroups, productImageGroups, siteContentGroups] =
      await Promise.all([
        this.db.category.groupBy({
          by: ["imagePublicId"],
          where: { imagePublicId: { in: unique } },
          _count: { _all: true },
        }),
        this.db.productImage.groupBy({
          by: ["publicId"],
          where: { publicId: { in: unique } },
          _count: { _all: true },
        }),
        this.db.siteContent.groupBy({
          by: ["imagePublicId"],
          where: { imagePublicId: { in: unique } },
          _count: { _all: true },
        }),
      ]);

    for (const g of categoryGroups) {
      if (g.imagePublicId) {
        result.set(g.imagePublicId, (result.get(g.imagePublicId) ?? 0) + g._count._all);
      }
    }
    for (const g of productImageGroups) {
      if (g.publicId) {
        result.set(g.publicId, (result.get(g.publicId) ?? 0) + g._count._all);
      }
    }
    for (const g of siteContentGroups) {
      if (g.imagePublicId) {
        result.set(g.imagePublicId, (result.get(g.imagePublicId) ?? 0) + g._count._all);
      }
    }
    return result;
  }
}
