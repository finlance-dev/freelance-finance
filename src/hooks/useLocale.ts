"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { translations, type Locale, type TranslationSection, type TranslationKey } from "@/lib/i18n";
import React from "react";

const LOCALE_KEY = "ff_locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <S extends TranslationSection>(section: S, key: TranslationKey<S>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "th";
  return (localStorage.getItem(LOCALE_KEY) as Locale) || "th";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getStoredLocale());
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_KEY, newLocale);
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("ff_locale_changed", { detail: { locale: newLocale } }));
  }, []);

  const t = useCallback(
    <S extends TranslationSection>(section: S, key: TranslationKey<S>): string => {
      const sectionData = translations[section];
      if (!sectionData) return String(key);
      const entry = sectionData[key] as Record<Locale, string> | undefined;
      if (!entry) return String(key);
      return entry[locale] || entry["th"] || String(key);
    },
    [locale]
  );

  // Use mounted locale to avoid hydration mismatch
  const value: LocaleContextValue = {
    locale: mounted ? locale : "th",
    setLocale,
    t,
  };

  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
