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
}
