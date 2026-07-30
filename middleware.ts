import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidSessionCookieValue } from "@/lib/adminSession";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Halaman login & API login tetap harus bisa diakses tanpa sesi.
  if (pathname === "/admin/login" || pathname === "/api/admin-login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await isValidSessionCookieValue(cookie))) {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
