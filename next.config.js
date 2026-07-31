/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === "development";

// Origin ketat untuk menggantikan `Access-Control-Allow-Origin: *` yang di-inject Vercel.
// Selama .env belum diisi (NEXT_PUBLIC_APP_URL), fallback ke domain produksi.
const configuredOrigin = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
const appOrigin =
  /^https?:\/\//.test(configuredOrigin) && !configuredOrigin.includes("your-app")
    ? configuredOrigin
    : "https://ytc-web-ten.vercel.app";

const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://app.midtrans.com; "
  : "script-src 'self' 'unsafe-inline' https://app.sandbox.midtrans.com https://app.midtrans.com; ";

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; " +
              scriptSrc +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: https:; " +
              "font-src 'self'; " +
              "frame-src https://app.sandbox.midtrans.com https://app.midtrans.com; " +
              "connect-src 'self' https://api.sandbox.midtrans.com https://api.midtrans.com https://app.sandbox.midtrans.com https://app.midtrans.com; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "frame-ancestors 'none'; " +
              "form-action 'self'; " +
              "upgrade-insecure-requests",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Access-Control-Allow-Origin", value: appOrigin },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
