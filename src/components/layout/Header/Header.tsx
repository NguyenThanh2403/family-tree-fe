'use client';

import { TreePine, Globe, Menu, Sun, Moon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/components/ThemeProvider';

type Locale = 'en' | 'vi';

interface HeaderProps {
  locale?: Locale;
  onLocaleChange?: (locale: Locale) => void;
}

export function Header({ locale = 'vi', onLocaleChange }: HeaderProps) {
  const t = useTranslations('nav');
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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

        {/* Language toggle */}
        <button
          onClick={() => onLocaleChange?.(locale === 'vi' ? 'en' : 'vi')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm
                     text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Switch language"
        >
          <Globe size={15} aria-hidden />
          <span className="uppercase font-medium">{locale}</span>
        </button>

        {/* User avatar */}
        {user && (
          <Link
            href="/account"
            className="w-8 h-8 rounded-full bg-[var(--surface-active)] flex items-center justify-center
                       text-[var(--accent)] text-sm font-semibold hover:ring-2 hover:ring-[var(--accent)] transition"
            aria-label={`Account: ${user.displayName}`}
          >
            {user.displayName?.charAt(0).toUpperCase()}
          </Link>
        )}
      </div>
    </header>
  );
}

