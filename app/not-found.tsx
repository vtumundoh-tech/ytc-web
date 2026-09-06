"use client";

import Link from "next/link";
import { Home, SearchX, ArrowLeft } from "lucide-react";
import { useLang } from "@/components/LanguageProvider";
import { dict } from "@/lib/i18n";

export default function GlobalNotFound() {
  const { t } = useLang();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-7 h-7 text-gray-300" aria-hidden="true" />
        </div>
        <div className="text-6xl sm:text-7xl font-black text-gray-200 leading-none mb-4 tabular">404</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{t(dict.notFound.title)}</h1>
        <p className="text-sm text-gray-500 mb-8">{t(dict.notFound.sub)}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-200/50 transition-all duration-200"
          >
            <Home className="w-4 h-4" /> {t(dict.notFound.backHome)}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" /> {t(dict.notFound.backPrev)}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 mt-8">© {new Date().getFullYear()} MineClip Studios</p>
      </div>
    </div>
  );
}