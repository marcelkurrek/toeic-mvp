// Simple in-memory rate limiter (per-process; fine for single-instance deployments)
// For multi-instance/edge, replace with Redis or Upstash.

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Clean up stale entries periodically (every 5 min)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

/**
 * Returns `true` if the request is allowed, `false` if rate-limited.
 * @param key     Identifier (e.g. user ID or IP)
 * @param limit   Max requests per window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
