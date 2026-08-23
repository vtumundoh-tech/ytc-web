"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Gift, Menu, X } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

export default function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/#harga", label: dict.nav.pricing },
    { href: "/#cara-beli", label: dict.nav.howToBuy },
    { href: "/klaim-cashback", label: dict.nav.claimCashback, icon: Gift },
  ];

  function isActive(link: { href: string }) {
    if (link.href.startsWith("/#")) return pathname === "/";
    return pathname === link.href;
  }

  function close() {
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-gray-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.03)]">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Link href="/" onClick={close} className="flex items-center gap-2.5 group shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40">
          <Image
            src="/logo.png"
            alt="MineClip Studios"
            width={88}
            height={48}
            priority
            className="h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="font-bold text-gray-900 text-sm tracking-tight hidden sm:inline">
            MineClip <span className="text-emerald-600">Studios</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon as React.ElementType | undefined;
            const active = isActive(link);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
                {t(link.label)}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t(dict.nav.language)}
            className="hidden sm:flex items-center rounded-full border border-gray-200 bg-white p-0.5"
          >
            {(["id", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                aria-label={l === "id" ? "Bahasa Indonesia" : "English"}
                className={`w-8 py-1 rounded-full text-[11px] font-bold uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  lang === l ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <Link
            href="/beli"
            onClick={close}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md shadow-emerald-200/50 transition-all duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <CreditCard className="w-3.5 h-3.5" aria-hidden="true" />
            {t(dict.nav.buyLicense)}
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? t(dict.nav.closeMenu) : t(dict.nav.openMenu)}
            aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl animate-slide-up">
          <div className="max-w-5xl mx-auto px-4 py-3 space-y-1">
            {[...links, { href: "/beli", label: dict.nav.buyLicense, icon: CreditCard }].map(
              (link) => {
                const Icon = link.icon as React.ElementType | undefined;
                const active = isActive(link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                    {t(link.label)}
                  </Link>
                );
              }
            )}
            <div className="pt-2 flex items-center gap-2 sm:hidden">
              <span className="text-xs text-gray-400 font-semibold">{t(dict.nav.language)}:</span>
              {(["id", "en"] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                    lang === l ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
