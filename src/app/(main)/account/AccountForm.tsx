'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { authApi } from '@/core/api/auth.api';

export function AccountForm() {
  const t = useTranslations('account');
  const tc = useTranslations('common');
  const { user } = useAuth();
  const { language, changeLanguage, isLoading: isLanguageChanging } = useLanguage();

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await authApi.updateProfile({ displayName });
      setMessage({ type: 'success', text: tc('success') });
    } catch {
      setMessage({ type: 'error', text: tc('error') });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPw(true);
    setMessage(null);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setMessage({ type: 'success', text: tc('success') });
      setCurrentPassword('');
      setNewPassword('');
    } catch {
      setMessage({ type: 'error', text: tc('error') });
    } finally {
      setChangingPw(false);
    }
  }

  async function handleLanguageChange(newLang: string) {
    try {
      await changeLanguage(newLang as 'en' | 'vi' | 'zh' | 'ko' | 'ja' | 'th');
      setMessage({ type: 'success', text: tc('success') });
    } catch {
      setMessage({ type: 'error', text: tc('error') });
    }
  }

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
    { value: 'zh', label: '中文 (Simplified Chinese)' },
    { value: 'ko', label: '한국어 (Korean)' },
    { value: 'ja', label: '日本語 (Japanese)' },
    { value: 'th', label: 'ไทย (Thai)' },
  ];

  return (
    <div className="space-y-6">
      {message && (
        <Alert variant={message.type} dismissible onDismiss={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      {/* Profile section */}
      <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">{t('profile')}</h2>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label={t('email')}
            value={user?.email ?? ''}
            disabled
            type="email"
          />
          <Input
            label={t('displayName')}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Button type="submit" loading={saving}>
            {t('saveChanges')}
          </Button>
        </form>
      </section>

      {/* Language section */}
      <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">{t('language')}</h2>
        <div className="space-y-4">
          <Select
            label={t('language')}
            value={language}
            options={languageOptions}
            onChange={handleLanguageChange}
            disabled={isLanguageChanging}
          />
          <p className="text-xs text-neutral-600">
            {language === 'vi'
              ? 'Thay đổi ngôn ngữ sẽ cập nhật toàn bộ giao diện ứng dụng.'
              : 'Changing the language will update the entire application interface.'}
          </p>
        </div>
      </section>

      {/* Change password section */}
      <section className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
        <h2 className="text-base font-semibold text-neutral-800">{t('changePassword')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label={t('currentPassword')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label={t('newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={changingPw}>
            {t('changePassword')}
          </Button>
        </form>
      </section>
    </div>
  );
}
