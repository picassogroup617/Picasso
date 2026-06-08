export const SocialPlatform = {
  LINKEDIN: "LINKEDIN",
  INSTAGRAM: "INSTAGRAM",
  FACEBOOK: "FACEBOOK",
  WHATSAPP: "WHATSAPP",
} as const;
export type SocialPlatform = (typeof SocialPlatform)[keyof typeof SocialPlatform];
