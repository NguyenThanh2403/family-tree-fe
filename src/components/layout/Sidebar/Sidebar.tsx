'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, GitBranch, User, LogOut, TreePine } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useAuth } from '@/hooks/useAuth';

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { href: '/home', label: t('home'), icon: Home },
    { href: '/tree', label: t('myTrees'), icon: GitBranch },
    { href: '/account', label: t('account'), icon: User },
  ];

  return (
    <aside
      className="hidden md:flex flex-col w-60 min-h-screen bg-[var(--surface)] border-r border-[var(--border)]"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 p-5 border-b border-[var(--border)]">
        <TreePine className="text-[var(--accent)]" size={24} aria-hidden />
        <span className="font-bold text-lg text-[var(--text-primary)]">Family Tree+</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-colors duration-100',
                active
                  ? 'bg-[var(--surface-active)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]',
              )}
            >
              <Icon size={18} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium
                     text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} aria-hidden />
          {t('logout')}
        </button>
      </div>
    </aside>
  );
}

