import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { TreePine, GitBranch, Search, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Welcome — Family Tree+',
  description: 'Quản lý gia phả trực tuyến. Explore and preserve your family history.',
};

export default async function WelcomePage() {
  const t = await getTranslations('welcome');
  const ta = await getTranslations('auth');

  const features = [
    { icon: GitBranch, title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: Search,    title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: Globe,     title: t('feature3Title'), desc: t('feature3Desc') },
  ];

  return (
    <main id="main-content" className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center pt-20 pb-16 px-4">
        <TreePine size={56} className="text-green-600 mb-4" aria-hidden />
        <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 mb-4 leading-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-neutral-500 max-w-lg mb-8">
          {t('subtitle')}
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl
                       bg-green-600 text-white font-semibold text-sm
                       hover:bg-green-700 transition-colors shadow-sm"
          >
            {t('cta')}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-11 px-6 rounded-xl
                       bg-white text-neutral-700 font-semibold text-sm border border-neutral-300
                       hover:bg-neutral-50 transition-colors"
          >
            {ta('login')}
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        aria-labelledby="features-heading"
        className="max-w-4xl mx-auto px-4 pb-20"
      >
        <h2 id="features-heading" className="sr-only">{t('featuresHeading')}</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-3
                         hover:shadow-md transition-shadow"
            >
              <Icon size={28} className="text-green-600" aria-hidden />
              <dt className="font-semibold text-neutral-900">{title}</dt>
              <dd className="text-sm text-neutral-500">{desc}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
