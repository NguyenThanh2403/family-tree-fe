import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { GitBranch, Plus, TreePine } from 'lucide-react';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return { title: 'Home' };
}

export default async function HomePage() {
  const t = await getTranslations();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <section className="text-center py-8">
        <TreePine size={48} className="text-green-600 mx-auto mb-4" aria-hidden />
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          {t('common.appName')}
        </h1>
        <p className="text-neutral-500 text-lg">
          {t('welcome.subtitle')}
        </p>
      </section>

      {/* Quick actions */}
      <section aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-lg font-semibold text-neutral-800 mb-4">
          {t('tree.myTrees')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create tree card */}
          <Link
            href="/tree/new"
            className="flex flex-col items-center justify-center gap-3 p-6
                       border-2 border-dashed border-neutral-300 rounded-xl
                       text-neutral-500 hover:border-green-400 hover:text-green-600
                       hover:bg-green-50 transition-colors group"
          >
            <Plus
              size={28}
              className="group-hover:scale-110 transition-transform"
              aria-hidden
            />
            <span className="text-sm font-medium">{t('tree.createTree')}</span>
          </Link>

          {/* View all trees */}
          <Link
            href="/tree"
            className="flex flex-col items-center justify-center gap-3 p-6
                       border border-neutral-200 rounded-xl bg-white
                       text-neutral-600 hover:shadow-md hover:border-green-300
                       transition-all"
          >
            <GitBranch size={28} className="text-green-600" aria-hidden />
            <span className="text-sm font-medium">{t('tree.myTrees')}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
