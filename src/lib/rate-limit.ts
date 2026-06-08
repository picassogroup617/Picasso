/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Counters live inside the Node process, so this is only correct for
 * deployments that route every request for a given client to the same
 * instance. In practice that means EITHER:
 *   - a single Node replica, OR
 *   - a load balancer configured with sticky sessions keyed on the same
 *     attribute the limiter uses (client IP, user id).
 *
 * On serverless / horizontally scaled platforms (Vercel functions, multiple
 * pods behind a round-robin LB, ...) every replica keeps its own counter and
 * the effective limit is `N × configured limit`. Swap in a Redis-backed
 * implementation (e.g. Upstash) behind the same `IRateLimiter` interface for
 * those targets.
 */

export interface RateLimitResult {
  ok: boolean;
  /** Seconds the client should wait before retrying. Only set when `ok=false`. */
  retryAfterSeconds?: number;
}

export interface IRateLimiter {
  /**
   * Records a hit for `key` and returns whether it falls within the allowed
   * window. The first call after the window expires resets the counter.
   */
  check(key: string, limit: number, windowMs: number): RateLimitResult;
}

interface Bucket {
  hits: number[];
}

class InMemoryRateLimiter implements IRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  check(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const cutoff = now - windowMs;
    const bucket = this.buckets.get(key) ?? { hits: [] };

    // Drop expired hits from the front of the window.
    const live = bucket.hits.filter((t) => t > cutoff);

    if (live.length >= limit) {
      const oldest = live[0];
      const retryAfterMs = Math.max(0, oldest + windowMs - now);
      this.buckets.set(key, { hits: live });
      return {
        ok: false,
        retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
      };
    }

    live.push(now);
    this.buckets.set(key, { hits: live });

    // Opportunistic cleanup so the map doesn't grow unbounded.
    if (this.buckets.size > 5000) this.gc(cutoff);

    return { ok: true };
  }

  private gc(cutoff: number): void {
    for (const [key, bucket] of this.buckets) {
      const live = bucket.hits.filter((t) => t > cutoff);
      if (live.length === 0) this.buckets.delete(key);
      else bucket.hits = live;
    }
  }
}

/** Process-wide limiter. Survives across server-action invocations. */
export const rateLimiter: IRateLimiter = new InMemoryRateLimiter();

export { InMemoryRateLimiter };
