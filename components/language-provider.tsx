"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type AppLanguage = "vi" | "en";

type LanguageContextValue = {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") return "vi";
    const stored = window.localStorage.getItem("countlove_lang");
    return stored === "en" ? "en" : "vi";
  });

  const value = useMemo(
    () => ({
      lang,
      setLang: (nextLang: AppLanguage) => {
        setLangState(nextLang);
        window.localStorage.setItem("countlove_lang", nextLang);
      },
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
