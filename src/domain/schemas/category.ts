import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalString = z
  .string()
  .trim()
  .max(256)
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Slug is optional on input — the service auto-generates one from the name
 * when omitted. When provided, it must already be a valid kebab-case slug.
 */
export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  shortDescription: z.string().trim().min(1, "Description is required").max(280),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(slugPattern, "Use lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  imageUrl: z
    .string()
    .trim()
    .max(2048)
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  imagePublicId: optionalString,
  order: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;
