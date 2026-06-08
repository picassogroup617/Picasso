import type { ISiteContentRepository } from "@/domain/interfaces/ISiteContentRepository";
import type { IImageStorage } from "@/domain/interfaces/IImageStorage";
import type { IImageUsage } from "@/domain/interfaces/IImageUsage";
import type { SiteContent } from "@/domain/entities/siteContent";
import type { UpsertSiteContentInput } from "@/domain/schemas/siteContent";
import {
  SITE_CONTENT_KEYS,
  getSiteContentSection,
} from "@/domain/constants/siteContentKeys";
import { cleanupDetachedImages } from "./imageCleanup";

/**
 * Manages singleton site-content blocks (Hero, Story, Vision, Address...).
 * Validates that the section key is one of the predefined sections and that
 * image fields are only set on sections that allow them. Cleans up replaced
 * images from the image-storage provider.
 */
export class SiteContentService {
  constructor(
    private readonly repo: ISiteContentRepository,
    private readonly images: IImageStorage,
    private readonly imageUsage: IImageUsage,
  ) {}

  list() {
    return this.repo.list();
  }

  getByKey(key: string): Promise<SiteContent | null> {
    return this.repo.findByKey(key);
  }

  async upsert(input: UpsertSiteContentInput): Promise<SiteContent> {
    if (!SITE_CONTENT_KEYS.includes(input.key as (typeof SITE_CONTENT_KEYS)[number])) {
      throw new Error("Unknown site content section.");
    }
    const section = getSiteContentSection(input.key);
    const allowsImage = Boolean(section?.hasImage);

    const imageUrl = allowsImage ? input.imageUrl ?? null : null;
    const imagePublicId = allowsImage ? input.imagePublicId ?? null : null;

    const existing = await this.repo.findByKey(input.key);
    const saved = await this.repo.upsert({
      key: input.key,
      title: input.title,
      description: input.description,
      imageUrl,
      imagePublicId,
    });

    if (
      existing?.imagePublicId &&
      existing.imagePublicId !== saved.imagePublicId
    ) {
      await cleanupDetachedImages([existing.imagePublicId], {
        images: this.images,
        imageUsage: this.imageUsage,
      });
    }
    return saved;
  }
}
