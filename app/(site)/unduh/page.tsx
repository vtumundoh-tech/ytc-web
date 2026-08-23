"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { dict } from "@/lib/i18n";
import { useLang } from "@/components/LanguageProvider";

function UnduhContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { t } = useLang();

  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage(t(dict.download.invalidLink));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/download?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t(dict.download.errLoad));
        if (cancelled) return;
        setDownloadUrl(data.url);
        setState("ready");
        // Auto-download
        window.location.href = data.url;
      } catch (err: any) {
        if (cancelled) return;
        setState("error");
        setMessage(err.message || t(dict.download.errGeneric));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 sm:py-24">
      <div className="card-lg text-center">
        {state === "loading" && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">{t(dict.download.preparingTitle)}</h1>
            <p className="text-sm text-gray-500">{t(dict.download.preparingSub)}</p>
          </>
        )}

        {state === "ready" && (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">{t(dict.download.startedTitle)}</h1>
            <p className="text-sm text-gray-500 mb-5">{t(dict.download.startedSub)}</p>
            <a
              href={downloadUrl}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-md"
            >
              <Download className="w-4 h-4" /> {t(dict.download.downloadBtn)}
            </a>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">{t(dict.download.failedTitle)}</h1>
<p className="text-sm text-gray-500">{message}</p>
              <a
                href={`mailto:mineclipstudios@gmail.com?subject=Kendala%20Unduhan%20Aplikasi${token ? `%20(${encodeURIComponent(token.slice(0, 8))})` : ""}`}
                className="mt-5 inline-block text-sm font-semibold text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                {t(dict.download.contactAdmin)}
              </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function UnduhPage() {
  return (
    <Suspense fallback={
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card-lg text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
        </div>
      </div>
    }>
      <UnduhContent />
    </Suspense>
  );
}
