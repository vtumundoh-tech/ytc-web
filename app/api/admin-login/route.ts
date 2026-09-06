import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE, createSessionCookieValue, isSecureCookieEnv } from "@/lib/adminSession";
import { checkRateLimit, rateLimitKey } from "@/lib/rateLimit";
import { getClientIp, safeEqual } from "@/lib/security";
import { logSecurityEvent } from "@/lib/securityAlert";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = await checkRateLimit(rateLimitKey("admin-login", ip), 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const { username, password } = await req.json();

    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    if (!envUser || !envPass) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 500 });
    }

    const userOk = await safeEqual(String(username ?? ""), envUser);
    const passOk = await safeEqual(String(password ?? ""), envPass);
    if (!userOk || !passOk) {
      const triedUser = String(username ?? "").slice(0, 60);
      await logSecurityEvent({
        type: "login_failed",
        ip,
        detail: `Username dicoba: ${triedUser || "(kosong)"}`,
        userAgent: req.headers.get("user-agent"),
      });
      return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
    }

    await logSecurityEvent({
      type: "login_ok",
      ip,
      detail: `Username: ${envUser}`,
      userAgent: req.headers.get("user-agent"),
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, await createSessionCookieValue(), {
      httpOnly: true,
      secure: isSecureCookieEnv(),
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return res;
  } catch (err: any) {
    console.error("admin-login error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
