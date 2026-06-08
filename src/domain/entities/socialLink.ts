import type { SocialPlatform } from "./socialPlatform";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string | null;
  url: string;
  order: number;
  isActive: boolean;
}
