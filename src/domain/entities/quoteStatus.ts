/** Mirror of Prisma `QuoteStatus` enum for use in client/edge code. */
export const QuoteStatus = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  CLOSED: "CLOSED",
} as const;

export type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

export const QUOTE_STATUSES: QuoteStatus[] = [
  QuoteStatus.NEW,
  QuoteStatus.CONTACTED,
  QuoteStatus.CLOSED,
];
