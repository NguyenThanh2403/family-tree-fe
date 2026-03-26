/**
 * i18n — Internationalization system for Family Tree.
 *
 * Usage:
 *   1. Wrap your app tree with <LanguageProvider>
 *   2. In any client component: const { t, locale, setLocale } = useI18n();
 *   3. Access translations: t.nav.home, t.auth.login.title, etc.
 *
 * To add a new language:
 *   1. Create src/lib/i18n/locales/<code>.ts satisfying the `Translations` type
 *   2. Import it in context.tsx and add to LOCALE_MAP
 *   3. Add its metadata to SUPPORTED_LOCALES in types.ts
 */

export { LanguageProvider, useI18n, SUPPORTED_LOCALES } from "./context";
export type { Locale, Translations } from "./types";
export { DEFAULT_LOCALE } from "./types";
