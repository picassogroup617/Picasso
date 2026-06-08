import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const productImageSchema = z.object({
  url: z.string().trim().min(1).max(2048).url("Invalid image URL"),
  publicId: z
    .string()
    .trim()
    .max(256)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  alt: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type ProductImageInput = z.infer<typeof productImageSchema>;

/**
 * Accepts a JSON string from a hidden form input and parses it into an array
 * of image records. The form serialises images via JSON because there is no
 * native way to submit a nested array of objects.
 */
export const productImagesFromJson = z
  .string()
  .transform((raw, ctx) => {
    if (!raw) return [] as ProductImageInput[];
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid images payload" });
      return z.NEVER;
    }
  })
  .pipe(z.array(productImageSchema).min(1, "Add at least one image").max(20));

export const productSchema = z.object({
  categoryId: z.string().trim().min(1, "Category is required"),
  name: z.string().trim().min(1, "Name is required").max(200),
  longDescription: z.string().trim().min(1, "Description is required").max(10000),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(80)
    .regex(slugPattern, "Use lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  order: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(true),
  images: productImagesFromJson,
});
export type ProductInput = z.infer<typeof productSchema>;
