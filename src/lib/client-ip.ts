import { headers } from "next/headers";

/**
 * Resolves the remote client IP from request headers in a way that resists
 * client-supplied spoofing of `X-Forwarded-For`.
 *
 * The first entry in `X-Forwarded-For` is whatever the client wrote; only the
 * last `TRUSTED_PROXY_HOPS` entries (counted from the right) were appended by
 * proxies you actually trust. Picking the right-most "trusted" entry gives the
 * real client IP behind a known proxy chain.
 *
 * Platform-specific headers (set by the edge, not the client) are preferred
 * when present.
 *
 * Set `TRUSTED_PROXY_HOPS` to:
 *   - `0` (default) when running without a reverse proxy. We then fall back
 *     to the request IP exposed by the platform-specific headers.
 *   - `1` for a single trusted proxy (Vercel, Cloudflare, Fly, Render, ...).
 *   - `2+` for layered proxies (CDN -> load balancer -> app).
 */
const TRUSTED_PROXY_HOPS = Math.max(
  0,
  Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "1", 10) || 0,
);

const ANONYMOUS = "anonymous";

export async function getClientIp(): Promise<string> {
  const h = await headers();

  // Platform-specific headers are set by the edge after stripping any
  // client-supplied copies, so they are always safe to trust when present.
  const platform =
    h.get("cf-connecting-ip") ??
    h.get("x-vercel-forwarded-for") ??
    h.get("fly-client-ip") ??
    h.get("true-client-ip");
  if (platform) return platform.split(",")[0]!.trim();

  if (TRUSTED_PROXY_HOPS > 0) {
    const xff = h.get("x-forwarded-for");
    if (xff) {
      const parts = xff
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length > 0) {
        // Pick the right-most entry written by a trusted proxy; if the chain
        // is shorter than configured, fall back to the left-most still-trusted
        // entry (i.e. the first non-client-controlled hop).
        const idx = Math.max(0, parts.length - TRUSTED_PROXY_HOPS);
        return parts[idx]!;
      }
    }
  }

  const xRealIp = h.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();

  return ANONYMOUS;
}
