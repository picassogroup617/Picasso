import type { SocialLink } from "@/domain/entities/socialLink";
import type { SocialPlatform } from "@/domain/entities/socialPlatform";

export interface CreateSocialLinkData {
  platform: SocialPlatform;
  label?: string | null;
  url: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateSocialLinkData {
  platform?: SocialPlatform;
  label?: string | null;
  url?: string;
  order?: number;
  isActive?: boolean;
}

export interface ISocialLinkRepository {
  list(): Promise<SocialLink[]>;
  findById(id: string): Promise<SocialLink | null>;
  create(data: CreateSocialLinkData): Promise<SocialLink>;
  update(id: string, data: UpdateSocialLinkData): Promise<SocialLink>;
  delete(id: string): Promise<void>;
}
