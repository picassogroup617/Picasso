import { z } from "zod";
import { SITE_CONTENT_KEYS } from "@/domain/constants/siteContentKeys";
import { extractMapEmbedUrl, isAllowedMapEmbedUrl } from "@/lib/map-embed";

const keySchema = z.enum(SITE_CONTENT_KEYS as readonly [string, ...string[]]);

const optionalUrl = z.preprocess(
  (v) => (v == null || (typeof v === "string" && v.trim() === "") ? undefined : v),
  z.string().trim().max(2048, "URL is too long").url("Enter a valid URL").optional(),
);

const optionalString = z.preprocess(
  (v) => (v == null || (typeof v === "string" && v.trim() === "") ? undefined : v),
  z.string().trim().max(256).optional(),
);

export const upsertSiteContentSchema = z
  .object({
    key: keySchema,
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().trim().min(1, "Description is required").max(5000),
    imageUrl: optionalUrl,
    imagePublicId: optionalString,
  })
  .transform((data) => {
    // For the map embed section, accept either a bare URL or a full <iframe>
    // snippet pasted from Google Maps and normalise to just the src URL.
    if (data.key === "map_embed_url") {
      return { ...data, description: extractMapEmbedUrl(data.description) };
    }
    return data;
  })
  .superRefine((data, ctx) => {
    if (data.key === "map_embed_url" && !isAllowedMapEmbedUrl(data.description)) {
      ctx.addIssue({
        code: "custom",
        path: ["description"],
        message:
          "Paste a Google Maps embed URL or the full <iframe> snippet. The src must start with https://www.google.com/maps/embed or https://maps.google.com/maps.",
      });
    }
  });
export type UpsertSiteContentInput = z.infer<typeof upsertSiteContentSchema>;
