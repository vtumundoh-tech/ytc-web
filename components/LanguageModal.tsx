"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Globe } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { useLang } from "./LanguageProvider";

export default function LanguageModal({
  onChoose,
  onClose,
}: {
  onChoose: (l: Lang) => void;
  onClose: () => void;
}) {
  const { t } = useLang();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const options: { lang: Lang; label: string; sub: string; flagClass: string }[] = [
    { lang: "id", label: "Bahasa Indonesia", sub: "Default", flagClass: "from-red-500 via-white to-red-500" },
    { lang: "en", label: "English", sub: "EN", flagClass: "from-blue-700 via-white to-red-600" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-gray-900/40 backdrop-blur-sm no-print"
      style={{ overscrollBehavior: "contain" }}
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lang-modal-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center animate-scale-in outline-none my-auto"
        >
          <div className="w-24 h-24 rounded-2xl bg-white border border-gray-100 shadow-md flex items-center justify-center mx-auto mb-5 p-2.5">
            <Image
              src="/logo.png"
              alt=""
              width={110}
              height={60}
              className="w-full h-auto object-contain"
            />
          </div>

          <h2 id="lang-modal-title" className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
            <Globe className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            {t(dict.langModal.title)}
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">{t(dict.langModal.sub)}</p>

          <div className="space-y-3">
            {options.map((opt) => (
              <button
                key={opt.lang}
                type="button"
                onClick={() => {
                  onChoose(opt.lang);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                  opt.lang === "id"
                    ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-400 hover:bg-emerald-50"
                    : "border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`shrink-0 w-9 h-9 rounded-full bg-gradient-to-b ${opt.flagClass} shadow-inner`}
                />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-gray-900">{opt.label}</span>
                  <span className="block text-xs text-gray-400">{opt.sub}</span>
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 text-xs font-semibold text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded"
          >
            {t(dict.langModal.skip)}
          </button>
        </div>
      </div>
    </div>
  );
}
