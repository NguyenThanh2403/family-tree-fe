'use client';

import React, { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useLanguageStore } from '@/core/store/language.store';
import type { Language } from '@/core/store/language.store';

/**
 * LanguageProvider handles dynamic language switching on the client side
 * It reloads messages based on the selected language from the store
 */
export function LanguageProvider({
  children,
  defaultLocale,
  defaultMessages,
}: {
  children: React.ReactNode;
  defaultLocale: Language;
  defaultMessages: any;
}) {
  const language = useLanguageStore((s) => s.language);
  const [messages, setMessages] = useState(defaultMessages);
  const [locale, setLocale] = useState<Language>(defaultLocale);
  const [isLoading, setIsLoading] = useState(false);

  // Load new messages when language changes
  useEffect(() => {
    if (language === locale) return;

    setIsLoading(true);
    const loadMessages = async () => {
      try {
        const newMessages = await import(`@/locales/${language}.json`);
        setMessages(newMessages.default);
        setLocale(language);
      } catch (err) {
        console.error('Failed to load messages for locale:', language, err);
        // Revert to previous locale on error
        setLocale(locale);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [language, locale]);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
