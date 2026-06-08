import { z } from "zod";
import { QuoteStatus } from "@/domain/entities/quoteStatus";

export const updateQuoteStatusSchema = z.object({
  status: z.enum([QuoteStatus.NEW, QuoteStatus.CONTACTED, QuoteStatus.CLOSED]),
});
export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusSchema>;

/** Treats null / undefined / empty-string as "not provided". */
const optionalProductId = z
  .preprocess(
    (v) => (v == null || (typeof v === "string" && v.trim() === "") ? undefined : v),
    z.string().trim().max(64).optional(),
  );

const optionalMessage = z
  .preprocess(
    (v) => (v == null || (typeof v === "string" && v.trim() === "") ? undefined : v),
    z.string().trim().max(2000, "Message is too long").optional(),
  );

/**
 * Public-site form for submitting a quote request. `productId` is optional —
 * sent when the modal is opened from a product page.
 */
export const createQuoteSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(4, "Phone is required").max(40),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  message: optionalMessage,
  productId: optionalProductId,
});
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
