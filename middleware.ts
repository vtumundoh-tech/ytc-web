import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue, isValidGateCookieValue } from "@/lib/adminSession";
import {
  GATE_PATH,
  GATE_COOKIE_NAME,
  GATE_COOKIE_MAX_AGE_SECONDS,
  GATE_BLOCK_COOKIE_NAME,
} from "@/lib/gate";

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
    if (!(await isValidSessionCookieValue(cookie))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/arsip", "/admin/:path*", "/api/admin/:path*", "/api/admin-login"],
};
