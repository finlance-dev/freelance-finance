// Simple in-memory rate limiter for API routes
const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, maxAttempts = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return false; // rate limited
  }
  return true;
}
