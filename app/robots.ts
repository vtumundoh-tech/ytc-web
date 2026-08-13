import type { MetadataRoute } from "next";

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://ytc-web-ten.vercel.app").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: ["/api/", "/admin/", "/arsip", "/unduh"],
    },
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}