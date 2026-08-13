import { Redis } from "@upstash/redis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const useUpstash = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

const redis = useUpstash ? new Redis({ url: UPSTASH_URL!, token: UPSTASH_TOKEN! }) : null;

const counters = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    try {
      const windowKey = Math.floor(Date.now() / windowMs);
      const redisKey = `rl:${key}:${windowKey}`;
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.expire(redisKey, Math.ceil(windowMs / 1000));
      return { allowed: count <= maxRequests, remaining: Math.max(0, maxRequests - count) };
    } catch {
      // fall through to in-memory fallback
    }
  }

  const now = Date.now();
  const entry = counters.get(key);

  if (!entry || now > entry.resetAt) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

export function rateLimitKey(prefix: string, ip: string): string {
  return `${prefix}:${ip}`;
}