import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube Clipper — Lisensi & Cashback",
  description: "Beli lisensi atau klaim cashback YouTube Clipper",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
