import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { TreeListClient } from './TreeListClient';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'My Trees' };
}

export default async function TreeListPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const t = await getTranslations('tree');
  const { create } = await searchParams;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('myTrees')}</h1>
      <TreeListClient autoCreate={create === '1'} />
    </div>
  );
}
