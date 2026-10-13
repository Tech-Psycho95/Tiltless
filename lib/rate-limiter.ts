interface RateLimit {
  count: number;
  resetAt: number;
}

// In-memory store (for production, use Redis or similar)
const userLimits = new Map<string, RateLimit>();
const globalLimits = new Map<string, RateLimit>();

export type RateLimitResult =
  | { ok: true; }
  | { ok: false; error: string; status: number; retryAfter?: number; };

export function checkRateLimit(userId: string, action: 'analysis' | 'chat'): RateLimitResult {
  const now = Date.now();
  const key = `${userId}:${action}`;
  const limits = {
    analysis: { max: 5, window: 60 * 60 * 1000 }, // 5 per hour
    chat: { max: 30, window: 60 * 60 * 1000 },    // 30 per hour
  };
  
  const config = limits[action];
  let limit = userLimits.get(key);

  // Reset if window expired
  if (!limit || now >= limit.resetAt) {
    limit = {
      count: 0,
      resetAt: now + config.window,
    };
  }

  // Check if limit exceeded
  if (limit.count >= config.max) {
    const retryAfter = Math.ceil((limit.resetAt - now) / 1000);
    return {
      ok: false,
      error: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      status: 429,
      retryAfter,
    };
  }

  // Increment and store
  limit.count++;
  userLimits.set(key, limit);

  // Also check global daily limit as safety net
  const globalKey = `global:${action}:${new Date().toISOString().split('T')[0]}`;
  const globalMax = action === 'analysis' ? 10000 : 100000;
  let globalLimit = globalLimits.get(globalKey);

  if (!globalLimit) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    globalLimit = {
      count: 0,
      resetAt: tomorrow.getTime(),
    };
  }

  if (globalLimit.count >= globalMax) {
    return {
      ok: false,
      error: 'Service temporarily unavailable. Please try again later.',
      status: 503,
    };
  }

  globalLimit.count++;
  globalLimits.set(globalKey, globalLimit);

  return { ok: true };
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, limit] of userLimits.entries()) {
    if (now >= limit.resetAt) {
      userLimits.delete(key);
    }
  }
  for (const [key, limit] of globalLimits.entries()) {
    if (now >= limit.resetAt) {
      globalLimits.delete(key);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour
