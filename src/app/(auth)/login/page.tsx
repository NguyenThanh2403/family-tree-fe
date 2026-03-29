import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './LoginForm';
import { TreePine, Users, GitBranch, Globe } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Log in' };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');
  const tw = await getTranslations('welcome');
  const tc = await getTranslations('common');

  const features = [
    { Icon: Users, title: tw('feature1Title'), desc: tw('feature1Desc') },
    { Icon: GitBranch, title: tw('feature2Title'), desc: tw('feature2Desc') },
    { Icon: Globe, title: tw('feature3Title'), desc: tw('feature3Desc') },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Decorative left panel (lg+) ── */}
      <aside
        aria-hidden="true"
        className="relative hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#180d12] via-[#3a1e2e] to-[#db2777] flex-col items-center justify-center p-16 text-white overflow-hidden select-none"
      >
        {/* Background blobs */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-black/10 rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-12 w-32 h-32 bg-pink-300/15 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xs gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white/15 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-sm">
              <TreePine size={52} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{tc('appName')}</h1>
              <p className="text-pink-200 text-sm mt-2 leading-relaxed">{tw('subtitle')}</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-5 w-full text-left">
            {features.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <span className="mt-0.5 p-1.5 bg-white/15 rounded-lg shrink-0 border border-white/10">
                  <Icon size={15} />
                </span>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-pink-200 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center bg-[var(--surface)] px-6 py-12"
      >
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="flex flex-col items-center gap-2 mb-10 lg:hidden">
            <div className="p-3 bg-[var(--surface-active)] rounded-2xl border border-[var(--border)]">
              <TreePine size={32} className="text-[var(--accent)]" />
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">{tc('appName')}</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('welcomeBack')}</h2>
            <p className="text-[var(--text-muted)] mt-1 text-sm">{t('loginSubtitle')}</p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-[var(--text-muted)] mt-8">
            {t('noAccount')}{' '}
            <Link href="/register" className="text-[var(--accent)] font-semibold hover:underline">
              {t('register')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
