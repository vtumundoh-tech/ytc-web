"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Lang, T } from "@/lib/i18n";
import {
  getLangCookie,
  markAskedThisSession,
  setLangCookie,
  wasAskedThisSession,
} from "@/lib/i18n";
import LanguageModal from "./LanguageModal";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (s: T) => string;
}

const defaultValue: LangContextValue = {
  lang: "id",
  setLang: () => {},
  t: (s) => s.id,
};

const LangContext = createContext<LangContextValue>(defaultValue);

export function useLang() {
  return useContext(LangContext);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const saved = getLangCookie();
    if (saved) {
      setLangState(saved);
    } else if (!wasAskedThisSession()) {
      setModalOpen(true);
    }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setLangCookie(l);
  }, []);

  const t = useCallback((s: T) => s[lang], [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  function closeModal() {
    markAskedThisSession();
    setModalOpen(false);
  }

  return (
    <LangContext.Provider value={value}>
      {children}
      {modalOpen && <LanguageModal onChoose={setLang} onClose={closeModal} />}
    </LangContext.Provider>
  );
}
