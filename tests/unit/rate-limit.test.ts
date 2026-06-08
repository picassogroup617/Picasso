import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryRateLimiter } from "@/lib/rate-limit";

let limiter: InMemoryRateLimiter;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  limiter = new InMemoryRateLimiter();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("InMemoryRateLimiter", () => {
  it("allows hits up to the configured limit", () => {
    for (let i = 0; i < 3; i++) {
      expect(limiter.check("ip:1", 3, 60_000).ok).toBe(true);
    }
  });

  it("rejects the next hit once the limit is reached and reports retryAfter", () => {
    for (let i = 0; i < 3; i++) limiter.check("ip:1", 3, 60_000);
    const blocked = limiter.check("ip:1", 3, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("isolates buckets per key", () => {
    for (let i = 0; i < 3; i++) limiter.check("ip:1", 3, 60_000);
    expect(limiter.check("ip:2", 3, 60_000).ok).toBe(true);
  });

  it("resets after the window slides past the oldest hit", () => {
    for (let i = 0; i < 3; i++) limiter.check("ip:1", 3, 60_000);
    expect(limiter.check("ip:1", 3, 60_000).ok).toBe(false);

    vi.advanceTimersByTime(60_001);
    expect(limiter.check("ip:1", 3, 60_000).ok).toBe(true);
  });

  it("treats limit=0 as immediate rejection", () => {
    expect(limiter.check("ip:1", 0, 60_000).ok).toBe(false);
  });
});
