import Link from 'next/link';
import { TreePine } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('common');

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50">
      <TreePine size={48} className="text-green-600" />
      <h1 className="text-4xl font-bold text-neutral-900">404</h1>
      <p className="text-neutral-500">{t('pageNotFound')}</p>
      <Link
        href="/"
        className="mt-2 text-sm text-green-600 font-medium hover:underline"
      >
        {t('goBackHome')}
      </Link>
    </main>
  );
}
