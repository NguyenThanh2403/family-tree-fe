'use client';

import { TreePine, Globe, Menu, Sun, Moon, Loader2, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/hooks/useLanguage';
import type { Language } from '@/core/store/language.store';

export function Header() {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const { language, changeLanguage, isLoading: isLanguageChanging, error: languageError } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLanguageToast, setShowLanguageToast] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'zh', label: '中文' },
    { value: 'ko', label: '한국어' },
    { value: 'ja', label: '日本語' },
    { value: 'th', label: 'ไทย' },
  ];

  // Close language menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    }

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLanguageMenu]);

  const handleLanguageChange = async (newLang: Language) => {
    if (newLang === language) {
      setShowLanguageMenu(false);
      return;
    }
    try {
      await changeLanguage(newLang);
      setShowLanguageToast(true);
      setShowLanguageMenu(false);
      setTimeout(() => setShowLanguageToast(false), 2000);
    } catch (err) {
      console.error('Failed to change language:', err);
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-[var(--surface)] border-b border-[var(--border)] px-4 md:px-6 h-14 flex items-center justify-between">
      {/* Left: Logo (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="md:hidden p-1.5 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-raised)] transition-colors"
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} />
        </button>

        <Link href="/home" className="hidden md:flex items-center gap-2">
          <TreePine size={20} className="text-[var(--accent)]" aria-hidden />
          <span className="font-bold text-[var(--text-primary)]">Family Tree+</span>
        </Link>
      </div>

      {/* Right: theme toggle + locale switcher + avatar */}
      <div className="flex items-center gap-1">
        {/* Dark / Light toggle */}
        <button
          onClick={toggle}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]',
          )}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={17} aria-hidden /> : <Moon size={17} aria-hidden />}
        </button>

        {/* Language selector */}
        <div className="relative" ref={languageMenuRef}>
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            disabled={isLanguageChanging}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm',
              'transition-colors',
              isLanguageChanging
                ? 'text-[var(--text-muted)] cursor-not-allowed opacity-60'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]',
            )}
            aria-label="Switch language"
            title="Change language"
          >
            {isLanguageChanging ? (
              <Loader2 size={15} className="animate-spin" aria-hidden />
            ) : (
              <Globe size={15} aria-hidden />
            )}
            <span className="uppercase font-medium">{language}</span>
            <ChevronDown size={14} aria-hidden />
          </button>

          {/* Language dropdown menu */}
          {showLanguageMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-[var(--surface-raised)] border border-[var(--border)] rounded-lg shadow-lg z-50">
              {languageOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleLanguageChange(opt.value)}
                  disabled={isLanguageChanging}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm transition-colors',
                    language === opt.value
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-semibold'
                      : 'text-[var(--text-primary)] hover:bg-[var(--surface-active)]',
                    isLanguageChanging && 'cursor-not-allowed opacity-60',
                    'first:rounded-t-lg last:rounded-b-lg',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language error toast */}
        {languageError && (
          <div className="absolute top-16 right-4 bg-red-500/10 text-red-400 px-3 py-2 rounded-lg text-sm max-w-xs">
            {languageError}
          </div>
        )}

        {/* User avatar */}
        {user && (
          <Link
            href="/account"
            className="w-8 h-8 rounded-full bg-[var(--surface-active)] flex items-center justify-center
                       text-[var(--accent)] text-xs font-semibold hover:ring-2 hover:ring-[var(--accent)] transition"
            aria-label={`Account: ${user.displayName || user.firstName || user.username}`}
            title={user.displayName || `${user.firstName} ${user.lastName}` || user.username}
          >
            {(user.displayName || `${user.firstName}${user.lastName}` || user.username)?.charAt(0).toUpperCase()}
          </Link>
        )}
      </div>
    </header>
  );
}

