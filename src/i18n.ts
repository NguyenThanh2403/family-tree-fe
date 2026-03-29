import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'vi', 'zh', 'ko', 'ja', 'th'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'vi';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? defaultLocale;
  const resolvedLocale = locales.includes(locale as Locale)
    ? (locale as Locale)
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`@/locales/${resolvedLocale}.json`)).default,
  };
});
