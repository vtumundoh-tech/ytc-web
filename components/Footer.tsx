"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { GATE_PATH } from "@/lib/gate";
import { dict } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

const TIKTOK_URL = "https://www.tiktok.com/@mineclipstudios";
const YOUTUBE_URL = "https://www.youtube.com/@Mineclips_collection";

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLang();
  const showGate = pathname !== GATE_PATH;

  const quickLinks = [
    { href: "/", label: dict.nav.home },
    { href: "/beli", label: dict.nav.buyLicense },
    { href: "/klaim-cashback", label: dict.nav.claimCashback },
  ];

  const socials = [
    {
      href: TIKTOK_URL,
      label: "TikTok @mineclipstudios",
      icon: <TikTokIcon className="w-4 h-4" />,
    },
    {
      href: YOUTUBE_URL,
      label: "YouTube @Mineclips_collection",
      icon: <YouTubeIcon className="w-4 h-4" />,
    },
  ];

  return (
    <footer className="relative border-t border-gray-100 bg-white/60 backdrop-blur-sm mt-20">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <Image
                src="/logo.png"
                alt=""
                width={88}
                height={48}
                className="h-12 w-auto object-contain"
              />
              <span className="font-bold text-gray-900 text-sm tracking-tight">
                MineClip <span className="text-emerald-600">Studios</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              {t(dict.footer.tagline)}
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label={t(dict.footer.quickLinks)}>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
              {t(dict.footer.quickLinks)}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-gray-500 hover:text-emerald-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded"
                  >
                    {t(l.label)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded"
                >
                  {t(dict.footer.terms)}
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan#privacy-policy"
                  className="text-xs text-gray-500 hover:text-emerald-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded"
                >
                  {t(dict.footer.privacy)}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
              {t(dict.footer.followUs)}
            </h3>
            <ul className="space-y-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-violet-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 rounded"
                  >
                    {s.icon}
                    <span className="truncate max-w-[180px]">{s.label}</span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-50" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">
              {t(dict.footer.paymentMethods)}
            </h3>
            <div className="flex flex-wrap gap-2">
              {/* SAAT INI KHUSUS QRIS.
                  TODO: buka lagi array di bawah saat metode lain sudah siap:
                  {["QRIS", t(dict.home.payment.methodBank), "E-Wallet"].map((m) => ( */}
              {["QRIS"].map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-600 shadow-sm"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              &copy; {new Date().getFullYear()} MineClip Studios. {t(dict.footer.rights)}
            </span>
          </div>
        </div>
      </div>
      {showGate && (
        <Link
          href={GATE_PATH}
          aria-label="."
          className="absolute bottom-3 right-4 inline-block w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors"
        />
      )}
    </footer>
  );
}
