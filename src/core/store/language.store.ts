'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'vi' | 'zh' | 'ko' | 'ja' | 'th';

interface LanguageState {
  language: Language;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLanguage: (language: Language) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'vi',
      isLoading: false,
      error: null,

      setLanguage: (language: Language) => set({ language }),
      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'family-tree-language',
    },
  ),
);

// Derived selectors
export const selectLanguage = (s: LanguageState) => s.language;
export const selectIsLoading = (s: LanguageState) => s.isLoading;
export const selectError = (s: LanguageState) => s.error;
