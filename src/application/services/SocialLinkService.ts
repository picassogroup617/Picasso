import type { ISocialLinkRepository } from "@/domain/interfaces/ISocialLinkRepository";
import type { SocialLink } from "@/domain/entities/socialLink";
import type { SocialLinkInput } from "@/domain/schemas/contact";

export class SocialLinkService {
  constructor(private readonly repo: ISocialLinkRepository) {}

  list() {
    return this.repo.list();
  }

  getById(id: string) {
    return this.repo.findById(id);
  }

  create(input: SocialLinkInput): Promise<SocialLink> {
    return this.repo.create({
      platform: input.platform,
      label: input.label ?? null,
      url: input.url,
      order: input.order,
      isActive: input.isActive,
    });
  }

  async update(id: string, input: SocialLinkInput): Promise<SocialLink> {
    const target = await this.repo.findById(id);
    if (!target) throw new Error("Social link not found.");
    return this.repo.update(id, {
      platform: input.platform,
      label: input.label ?? null,
      url: input.url,
      order: input.order,
      isActive: input.isActive,
    });
  }

  async delete(id: string): Promise<void> {
    const target = await this.repo.findById(id);
    if (!target) return;
    await this.repo.delete(id);
  }
}
