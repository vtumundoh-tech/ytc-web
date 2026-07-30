import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — YouTube Clipper",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
