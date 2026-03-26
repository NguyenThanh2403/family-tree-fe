"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Locale, Translations } from "./types";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./types";
import { en } from "./locales/en";
import { vi } from "./locales/vi";

// ── Translation registry ─────────────────────────────────────────────────────
// Add new locales here: just import the file and add to this map.
const LOCALE_MAP: Record<Locale, Translations> = { en, vi };

// ── Context ──────────────────────────────────────────────────────────────────
interface I18nContextValue {
  /** Active locale code */
  locale: Locale;
  /** Switch to a different locale */
  setLocale: (locale: Locale) => void;
  /** Typed translation object — access keys like `t.nav.home` */
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: LOCALE_MAP[DEFAULT_LOCALE],
});

// ── Provider ─────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("locale") as Locale | null;
      if (saved && LOCALE_MAP[saved]) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // localStorage may be unavailable in certain environments
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("locale", newLocale);
    } catch {}
    document.documentElement.lang = newLocale;
  }, []);

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: LOCALE_MAP[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
/**
 * Returns `{ t, locale, setLocale }`.
 * `t` is the fully-typed translation object for the current locale.
 *
 * @example
 * const { t, locale, setLocale } = useI18n();
 * <h1>{t.nav.home}</h1>
 */
export function useI18n() {
  return useContext(I18nContext);
}

export { SUPPORTED_LOCALES };
