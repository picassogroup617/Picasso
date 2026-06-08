/**
 * Predefined site-content sections. Each key maps to a single `SiteContent` row.
 * Keep this list in sync with the public site sections that read these values.
 */
export const SITE_CONTENT_SECTIONS = [
  {
    key: "hero",
    label: "Hero / Brand line",
    description: "Headline and tagline shown at the top of the home page.",
    hasImage: false,
  },
  {
    key: "our_story",
    label: "Our Story",
    description: "Brand story shown in the 'Who We Are' section.",
    hasImage: true,
  },
  {
    key: "our_vision",
    label: "Our Vision",
    description: "Brand vision shown in the 'Who We Are' section.",
    hasImage: true,
  },
  {
    key: "address",
    label: "Address",
    description: "Office address shown in the Contact Us section.",
    hasImage: false,
  },
  {
    key: "map_embed_url",
    label: "Map embed",
    description:
      "Google Maps embed URL shown in the footer. Open Google Maps → Share → Embed a map → copy only the value inside src=\"…\".",
    hasImage: false,
  },
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_SECTIONS)[number]["key"];

export const SITE_CONTENT_KEYS: readonly SiteContentKey[] =
  SITE_CONTENT_SECTIONS.map((s) => s.key);

export function getSiteContentSection(key: string) {
  return SITE_CONTENT_SECTIONS.find((s) => s.key === key);
}
