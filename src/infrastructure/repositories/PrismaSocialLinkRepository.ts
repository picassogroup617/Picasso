import type { PrismaClient } from "@prisma/client";
import type {
  CreateSocialLinkData,
  ISocialLinkRepository,
  UpdateSocialLinkData,
} from "@/domain/interfaces/ISocialLinkRepository";
import type { SocialLink } from "@/domain/entities/socialLink";
import type { SocialPlatform } from "@/domain/entities/socialPlatform";

export class PrismaSocialLinkRepository implements ISocialLinkRepository {
  constructor(private readonly db: PrismaClient) {}

  private toEntity(row: {
    id: string;
    platform: string;
    label: string | null;
    url: string;
    order: number;
    isActive: boolean;
  }): SocialLink {
    return {
      id: row.id,
      platform: row.platform as SocialPlatform,
      label: row.label,
      url: row.url,
      order: row.order,
      isActive: row.isActive,
    };
  }

  async list(): Promise<SocialLink[]> {
    const rows = await this.db.socialLink.findMany({
      orderBy: [{ platform: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return rows.map((r) => this.toEntity(r));
  }

  async findById(id: string): Promise<SocialLink | null> {
    const row = await this.db.socialLink.findUnique({ where: { id } });
    return row ? this.toEntity(row) : null;
  }

  async create(data: CreateSocialLinkData): Promise<SocialLink> {
    const row = await this.db.socialLink.create({
      data: {
        platform: data.platform,
        label: data.label ?? null,
        url: data.url,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
    return this.toEntity(row);
  }

  async update(id: string, data: UpdateSocialLinkData): Promise<SocialLink> {
    const row = await this.db.socialLink.update({
      where: { id },
      data: {
        ...(data.platform !== undefined && { platform: data.platform }),
        ...(data.label !== undefined && { label: data.label }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return this.toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.socialLink.delete({ where: { id } });
  }
}
