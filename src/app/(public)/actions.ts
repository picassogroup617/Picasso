"use server";

import { revalidatePath } from "next/cache";
import { getClientIp } from "@/lib/client-ip";
import { getContainer } from "@/lib/container";
import { createQuoteSchema } from "@/domain/schemas/quote";
import { rateLimiter } from "@/lib/rate-limit";
import { toSafeMessage } from "@/lib/safe-error";
import { fieldErrorsFromZod } from "@/lib/zod-errors";
import { HONEYPOT_FIELD, type QuoteFormState } from "./quote-form";

/** Window: 3 submissions per IP per 10 minutes. */
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Public quote submission. Applies the per-IP rate limit first (so bots that
 * also trip the honeypot still contribute to the bucket), then drops obvious
 * bot traffic via a honeypot, validates the payload, delegates to
 * `QuoteService.create`, and revalidates admin views so a new request appears
 * on the dashboard immediately.
 */
export async function submitQuoteAction(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const ip = await getClientIp();
  const limit = rateLimiter.check(
    `quote:${ip}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    const mins = Math.max(1, Math.ceil((limit.retryAfterSeconds ?? 60) / 60));
    return {
      ok: false,
      error: `Too many requests. Please try again in about ${mins} minute${mins === 1 ? "" : "s"}.`,
    };
  }

  // Honeypot: silently accept (fake success) so bots don't learn to bypass.
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { ok: true };
  }

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
    productId: formData.get("productId"),
  };
  const parsed = createQuoteSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  try {
    await getContainer().quoteService.create(parsed.data);
  } catch (err) {
    return { ok: false, error: toSafeMessage(err, "Could not submit your request.") };
  }

  revalidatePath("/picassoadd/quotes");
  revalidatePath("/picassoadd/dashboard");
  return { ok: true };
}
