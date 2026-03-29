import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AccountForm } from './AccountForm';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Account' };
}

export default async function AccountPage() {
  const t = await getTranslations('account');
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('title')}</h1>
      <AccountForm />
    </div>
  );
}
