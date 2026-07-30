"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, Gift } from "lucide-react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/#harga", label: "Harga" },
  { href: "/#cara-beli", label: "Cara Beli" },
  { href: "/beli", label: "Beli Lisensi", icon: CreditCard },
  { href: "/klaim-cashback", label: "Klaim Cashback", icon: Gift },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            YC
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">
            YouTube <span className="text-emerald-600">Clipper</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon as React.ElementType | undefined;
            const isActive = pathname === link.href || (link.href.startsWith("/#") && pathname === "/");
            const activeStyle = link.href.startsWith("/") && !link.href.startsWith("/#") && pathname === link.href;

            let style = "text-gray-500 hover:text-gray-900 hover:bg-gray-50";
            if (isActive && activeStyle) style = "bg-gray-100 text-gray-900";
            else if (isActive) style = "bg-gray-100 text-gray-900";

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${style}`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
