'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useLanguageStore, selectLanguage, type Language } from '@/core/store/language.store';
import { useAuthStore } from '@/core/store/auth.store';
import { authApi } from '@/core/api/auth.api';

/**
 * Hook to manage language switching and persistence
 * Changes the language globally and calls API to save user preference
 */
export function useLanguage() {
  const currentLocale = useLocale() as Language;
  const language = useLanguageStore(selectLanguage);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const t = useTranslations('common');

  const isLoading = useLanguageStore((s) => s.isLoading);
  const error = useLanguageStore((s) => s.error);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const setIsLoading = useLanguageStore((s) => s.setIsLoading);
  const setError = useLanguageStore((s) => s.setError);
  const clearError = useLanguageStore((s) => s.clearError);

  // Initialize language from current locale or stored preference on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem('user-language') as Language | null;
    const initialLanguage = storedLanguage || currentLocale;
    setLanguage(initialLanguage);
  }, []);

  // Change language and call API
  const changeLanguage = async (newLanguage: Language) => {
    if (newLanguage === language) return;

    const previousLanguage = language;
    setIsLoading(true);
    setError(null);

    try {
      // Update global language state
      setLanguage(newLanguage);

      // Call API to save preference if user is logged in
      if (user?.userId) {
        const updatedUser = await authApi.updateProfile({ locale: newLanguage });
        updateUser(updatedUser);
      }

      // Store in localStorage for persistence
      localStorage.setItem('user-language', newLanguage);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to change language';
      setError(msg);
      // Revert language if API call failed
      setLanguage(previousLanguage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    language,
    currentLocale,
    isLoading,
    error,
    changeLanguage,
    clearError,
  };
}
