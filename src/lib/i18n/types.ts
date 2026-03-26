import type { en } from "./locales/en";

/** Derives the translation shape from the English source of truth. */
export type Translations = typeof en;

/** Supported locale codes. Add new codes here to extend language support. */
export type Locale = "en" | "vi";

/** Metadata for each supported locale (used in the language switcher). */
export const SUPPORTED_LOCALES: ReadonlyArray<{
  code: Locale;
  label: string;
  flag: string;
}> = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export const DEFAULT_LOCALE: Locale = "vi";
