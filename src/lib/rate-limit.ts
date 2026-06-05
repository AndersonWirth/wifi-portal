// src/lib/rate-limit.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  key: string,
  max = Number(process.env.RATE_LIMIT_MAX) || 10,
  windowSeconds = Number(process.env.RATE_LIMIT_WINDOW) || 3600
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { success: true, remaining: max - 1 }
  }

  if (entry.count >= max) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: max - entry.count }
}
