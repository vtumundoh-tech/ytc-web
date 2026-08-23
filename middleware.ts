import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
  createSessionCookieValue,
  getSessionCookieState,
  isValidGateCookieValue,
} from "@/lib/adminSession";
import {
  GATE_PATH,
  GATE_COOKIE_NAME,
  GATE_COOKIE_MAX_AGE_SECONDS,
  GATE_BLOCK_COOKIE_NAME,
} from "@/lib/gate";
import { logSecurityEvent } from "@/lib/securityAlert";

function clientIp(req: NextRequest): string {
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || "unknown";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Halaman "404 palsu": hanya bisa dibuka jika tidak ter-block
  if (pathname === GATE_PATH) {
    if (req.cookies.get(GATE_BLOCK_COOKIE_NAME)?.value) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Halaman & API login admin: wajib lulus gate terlebih dahulu
  if (pathname === "/admin/login" || pathname === "/api/admin-login") {
    const gate = req.cookies.get(GATE_COOKIE_NAME)?.value;
    const ok = await isValidGateCookieValue(gate, GATE_COOKIE_MAX_AGE_SECONDS);
    if (!ok) {
      if (pathname === "/api/admin-login") {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const state = await getSessionCookieState(cookie);
    if (state !== "ok") {
      // Alert bypass HANYA untuk cookie yang tidak ada/rusak. Sesi yang habis
      // karena idle adalah admin sah — cukup arahkan ke login tanpa notif.
      if (state === "invalid") {
        await logSecurityEvent({
          type: "unauthorized_access",
          ip: clientIp(req),
          detail: `Path: ${pathname}`,
          userAgent: req.headers.get("user-agent"),
        });
      }
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL(
        state === "idle" ? "/admin/login?reason=idle" : "/admin/login",
        req.url
      );
      return NextResponse.redirect(loginUrl);
    }
    // Sliding session: perpanjang masa idle pada tiap aktivitas.
    const res = NextResponse.next();
    res.cookies.set(ADMIN_COOKIE_NAME, await createSessionCookieValue(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/arsip", "/admin/:path*", "/api/admin/:path*", "/api/admin-login"],
};
