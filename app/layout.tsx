import "./globals.css";
import type { Metadata } from "next";
import LanguageProvider from "@/components/LanguageProvider";

export const metadata: Metadata = {
  title: "MineClip Studios — Lisensi & Cashback",
  description: "Beli lisensi atau klaim cashback MineClip Studios",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
