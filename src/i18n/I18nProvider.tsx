"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./locales/en";
import { th } from "./locales/th";

export type Language = "en" | "th";
export type Dictionary = typeof en;

interface I18nContextType {
  lang: Language;
  dict: Dictionary;
  toggleLanguage: () => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en"); // Default to English initially
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const savedLang = localStorage.getItem("app-lang") as Language;
    if (savedLang === "en" || savedLang === "th") {
      setTimeout(() => setLang(savedLang), 0);
    } else {
      // Default to Thai for this app if nothing saved
      setTimeout(() => setLang("th"), 0);
    }
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === "en" ? "th" : "en";
      localStorage.setItem("app-lang", next);
      return next;
    });
  };

  const dict = lang === "en" ? en : th;

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="min-h-screen bg-zinc-50" />; 
  }

  return (
    <I18nContext.Provider value={{ lang, dict, toggleLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
