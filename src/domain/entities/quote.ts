import type { QuoteStatus } from "./quoteStatus";

/** Lightweight product summary attached to a quote for admin display. */
export interface QuoteProductSummary {
  id: string;
  name: string;
  slug: string;
}

/** Customer quote request submitted via the public site. */
export interface Quote {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string | null;
  productId: string | null;
  product: QuoteProductSummary | null;
  status: QuoteStatus;
  createdAt: Date;
  updatedAt: Date;
}
