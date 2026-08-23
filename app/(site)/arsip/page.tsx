"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import GateClient from "@/components/GateClient";
import { useLang } from "@/components/LanguageProvider";
import { dict } from "@/lib/i18n";

export default function NotFoundPage() {
  const { t } = useLang();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="text-7xl font-black text-gray-200 leading-none mb-4">404</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t(dict.notFound.title)}</h1>
        <p className="text-sm text-gray-500 mb-8">{t(dict.notFound.sub)}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
        >
          <Home className="w-4 h-4" /> {t(dict.notFound.backHome)}
        </Link>

        <div className="fixed bottom-4 left-4 z-50">
          <GateClient />
        </div>
      </div>
    </div>
  );
}
