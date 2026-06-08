import type { Quote } from "@/domain/entities/quote";

/**
 * Side-channel notifications triggered by application events.
 *
 * Implementations must never throw on transient delivery failures — callers
 * rely on best-effort semantics (a quote enquiry must persist even when the
 * notification channel is misconfigured or unreachable).
 */
export interface INotificationService {
  /** Notify staff that a new quote request was submitted. */
  notifyNewQuote(quote: Quote): Promise<void>;
}
