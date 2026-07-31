"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Gift, Clapperboard, Menu, X } from "lucide-react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/#harga", label: "Harga" },
  { href: "/#cara-beli", label: "Cara Beli" },
  { href: "/beli", label: "Beli Lisensi", icon: CreditCard },
  { href: "/klaim-cashback", label: "Klaim Cashback", icon: Gift },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function isActive(link: { href: string }) {
    if (link.href.startsWith("/#")) return pathname === "/";
    return pathname === link.href;
  }

  function close() {
    setOpen(false);
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" onClick={close} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Clapperboard className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">
            YouTube <span className="text-emerald-600">Clipper</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon as React.ElementType | undefined;
            const active = isActive(link);
            const style = active
              ? "bg-gray-100 text-gray-900"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50";
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${style}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
          <div className="max-w-5xl mx-auto px-4 py-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon as React.ElementType | undefined;
              const active = isActive(link);
              const style = active
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50";
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${style}`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
