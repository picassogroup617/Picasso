/**
 * Returns an error message safe to surface to end users.
 *
 * Application services throw `Error` with curated, user-facing messages (e.g.
 * "Selected category no longer exists."). Anything below that layer — Prisma,
 * the network, native modules — may include internal details that we never
 * want to leak to a client (schema names, file paths, IP ranges, etc.).
 *
 * The allow-list approach: forward `Error.message` only when it looks like a
 * curated message (no Prisma error codes, no stack-trace markers, reasonable
 * length, ends with sentence punctuation). Otherwise log the real error and
 * fall back to the supplied generic message.
 */

const UNSAFE_PATTERNS = [
  /\bP\d{4}\b/, // Prisma error codes (P2002, P2025, ...)
  /\bPrismaClient\w*Error\b/,
  /\bECONN\w*\b/, // node net errors
  /\bENOTFOUND\b/,
  /\bEAI_AGAIN\b/,
  /at [\w$./<>]+ \(/, // stack trace fragments
  /node_modules/,
];

export function toSafeMessage(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) {
    return fallback;
  }
  const msg = err.message?.trim() ?? "";
  if (
    msg.length === 0 ||
    msg.length > 200 ||
    UNSAFE_PATTERNS.some((p) => p.test(msg))
  ) {
    console.error("[safe-error] suppressed unsafe error:", err);
    return fallback;
  }
  return msg;
}
