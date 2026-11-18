/**
 * In-memory sliding window rate limiter
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const ipStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  ip: string,
  limit: number = 15,
  windowMs: number = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  const existing = ipStore.get(ip);

  if (!existing || now > existing.resetAt) {
    ipStore.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      limit,
      remaining: limit - 1,
      resetSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      success: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  existing.count += 1;
  const resetSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return {
    success: true,
    limit,
    remaining: limit - existing.count,
    resetSeconds,
  };
}

/**
 * Periodically purge expired rate limit entries
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, rec] of ipStore.entries()) {
      if (now > rec.resetAt) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}
