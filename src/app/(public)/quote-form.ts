/**
 * Shared constants and types for the public quote form. Kept out of the
 * sibling `actions.ts` because Next.js forbids non-async value exports from
 * `"use server"` modules.
 */

export interface QuoteFormState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Hidden honeypot input name. Real users leave it empty; bots tend to fill
 * every visible-looking input. The name is deliberately obscure so browser
 * password managers and address autofill do not populate it.
 */
export const HONEYPOT_FIELD = "referral_token";

export const INITIAL_QUOTE_STATE: QuoteFormState = { ok: false };
