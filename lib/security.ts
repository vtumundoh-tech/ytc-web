import { createHash, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export function getClientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || "unknown";
}

export async function safeEqual(a: string, b: string): Promise<boolean> {
  const hash = (value: string) =>
    createHash("sha256").update(value).digest();
  const ah = hash(a);
  const bh = hash(b);
  return timingSafeEqual(ah, bh);
}