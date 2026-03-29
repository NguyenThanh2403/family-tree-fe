import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // /vi/... for vi, no prefix for default (vi)
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
