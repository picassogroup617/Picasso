import { z } from "zod";
import { SocialPlatform } from "@/domain/entities/socialPlatform";

const labelSchema = z
  .string()
  .trim()
  .max(60, "Label is too long")
  .optional()
  .or(z.literal("").transform(() => undefined));

const orderSchema = z.coerce.number().int().min(0).max(9999).default(0);

const phoneNumberSchema = z
  .string()
  .trim()
  .min(5, "Number is too short")
  .max(32, "Number is too long")
  .regex(/^[+0-9\s().-]+$/, "Use digits and + ( ) - . space only");

/** Treats null/undefined/empty-string as "not provided" and runs the inner
 *  schema only when there's actually a non-empty value. */
const optionalPhoneSchema = z
  .preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    phoneNumberSchema.optional(),
  )
  .nullable()
  .transform((v) => v ?? undefined);

const optionalEmailSchema = z
  .preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z
      .string()
      .trim()
      .toLowerCase()
      .max(254)
      .email("Enter a valid email")
      .optional(),
  )
  .nullable()
  .transform((v) => v ?? undefined);

// ---------- Contact persons ----------

export const contactPersonBaseSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: optionalEmailSchema,
  phone1: phoneNumberSchema,
  phone1OnWhatsapp: z.boolean().default(false),
  phone2: optionalPhoneSchema,
  phone2OnWhatsapp: z.boolean().default(false),
  order: orderSchema,
  isActive: z.boolean().default(true),
});

/**
 * Validates phone 2 format only when present, and forces
 * phone2OnWhatsapp false when phone 2 is empty.
 */
export const contactPersonSchema = contactPersonBaseSchema.superRefine((data, ctx) => {
  if (data.phone2) {
    const r = phoneNumberSchema.safeParse(data.phone2);
    if (!r.success) {
      for (const i of r.error.issues) {
        ctx.addIssue({ ...i, path: ["phone2"] });
      }
    }
  } else if (data.phone2OnWhatsapp) {
    data.phone2OnWhatsapp = false;
  }
});
export type ContactPersonInput = z.infer<typeof contactPersonSchema>;

// ---------- Social links ----------

export const socialLinkSchema = z.object({
  platform: z.enum([
    SocialPlatform.LINKEDIN,
    SocialPlatform.INSTAGRAM,
    SocialPlatform.FACEBOOK,
    SocialPlatform.WHATSAPP,
  ]),
  label: labelSchema,
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048)
    .url("Enter a valid URL"),
  order: orderSchema,
  isActive: z.boolean().default(true),
});
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
