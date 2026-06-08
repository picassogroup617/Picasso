import type { PrismaClient } from "@prisma/client";
import type {
  ISiteContentRepository,
  UpsertSiteContentData,
} from "@/domain/interfaces/ISiteContentRepository";
import type { SiteContent } from "@/domain/entities/siteContent";

export class PrismaSiteContentRepository implements ISiteContentRepository {
  constructor(private readonly db: PrismaClient) {}

  private toEntity(row: {
    key: string;
    title: string;
    description: string;
    imageUrl: string | null;
    imagePublicId: string | null;
  }): SiteContent {
    return {
      key: row.key,
      title: row.title,
      description: row.description,
      imageUrl: row.imageUrl,
      imagePublicId: row.imagePublicId,
    };
  }

  async findByKey(key: string): Promise<SiteContent | null> {
    const row = await this.db.siteContent.findUnique({ where: { key } });
    return row ? this.toEntity(row) : null;
  }

  async list(): Promise<SiteContent[]> {
    const rows = await this.db.siteContent.findMany({ orderBy: { key: "asc" } });
    return rows.map((r) => this.toEntity(r));
  }

  async upsert(data: UpsertSiteContentData): Promise<SiteContent> {
    const row = await this.db.siteContent.upsert({
      where: { key: data.key },
      create: {
        key: data.key,
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        imagePublicId: data.imagePublicId ?? null,
      },
      update: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl ?? null,
        imagePublicId: data.imagePublicId ?? null,
      },
    });
    return this.toEntity(row);
  }
}
