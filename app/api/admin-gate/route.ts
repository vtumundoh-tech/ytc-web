import { NextRequest, NextResponse } from "next/server";
import {
  createGateCookieValue,
  isSecureCookieEnv,
} from "@/lib/adminSession";
import {
  GATE_COOKIE_NAME,
  GATE_COOKIE_MAX_AGE_SECONDS,
  GATE_BLOCK_COOKIE_NAME,
  GATE_BLOCK_MAX_AGE_SECONDS,
  GATE_MAX_FAILURES,
} from "@/lib/gate";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp, safeEqual } from "@/lib/security";
import { logSecurityEvent } from "@/lib/securityAlert";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    const existingBlock = req.cookies.get(GATE_BLOCK_COOKIE_NAME)?.value;
    if (existingBlock) {
      return NextResponse.json({ error: "Akses dibatasi. Coba lagi besok." }, { status: 403 });
    }

    const rl = await checkRateLimit(rateLimitKey("gate", ip), GATE_MAX_FAILURES, GATE_BLOCK_MAX_AGE_SECONDS * 1000);
    if (!rl.allowed) {
      await logSecurityEvent({
        type: "gate_failed",
        ip,
        detail: "Diblokir 1 hari (melewati batas percobaan gate)",
        userAgent: req.headers.get("user-agent"),
      });
      const res = NextResponse.json({ error: "Terlalu banyak percobaan. Akses dibatasi 1 hari." }, { status: 429 });
      res.cookies.set(GATE_BLOCK_COOKIE_NAME, "1", {
        httpOnly: true,
        secure: isSecureCookieEnv(),
        sameSite: "lax",
        path: "/",
        maxAge: GATE_BLOCK_MAX_AGE_SECONDS,
      });
      return res;
    }

    const { password } = await req.json();

    if (!process.env.ADMIN_GATE_PASSWORD) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 500 });
    }

    const ok = await safeEqual(String(password ?? ""), process.env.ADMIN_GATE_PASSWORD);
    if (!ok) {
      await logSecurityEvent({
        type: "gate_failed",
        ip,
        userAgent: req.headers.get("user-agent"),
      });
      return NextResponse.json({ error: "Kode tidak valid." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(GATE_COOKIE_NAME, await createGateCookieValue(), {
      httpOnly: true,
      secure: isSecureCookieEnv(),
      sameSite: "lax",
      path: "/",
      maxAge: GATE_COOKIE_MAX_AGE_SECONDS,
    });
    return res;
  } catch (err: any) {
    console.error("admin-gate error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
