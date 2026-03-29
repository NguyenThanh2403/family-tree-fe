'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';

export function RegisterForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    
    if (!username.trim() || username.length < 3)
      errors.username = t('usernameMinLength');
    
    if (!firstName.trim() || firstName.length < 2)
      errors.firstName = t('firstNameRequired');
    
    if (!lastName.trim() || lastName.length < 2)
      errors.lastName = t('lastNameRequired');
    
    if (!email.trim()) errors.email = t('emailRequired');
    else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = t('invalidEmail');
    
    if (!password) errors.password = t('passwordRequired');
    else if (password.length < 8) errors.password = t('passwordMinLength');
    
    if (password !== confirmPassword) errors.confirmPassword = t('passwordMismatch');
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register(username, email, password, firstName, lastName);
      router.push('/home');
    } catch {
      // error displayed via store
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {error && (
        <Alert variant="error" dismissible onDismiss={clearError}>
          {error}
        </Alert>
      )}

      <Input
        label={t('username')}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={fieldErrors.username}
        autoComplete="username"
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('firstName')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={fieldErrors.firstName}
          autoComplete="given-name"
          required
        />
        <Input
          label={t('lastName')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          error={fieldErrors.lastName}
          autoComplete="family-name"
          required
        />
      </div>

      <Input
        label={t('email')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        autoComplete="email"
        required
        placeholder="you@example.com"
      />

      <Input
        label={t('password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        autoComplete="new-password"
        required
      />

      <Input
        label={t('confirmPassword')}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={fieldErrors.confirmPassword}
        autoComplete="new-password"
        required
      />

      <Button type="submit" fullWidth loading={isLoading}>
        {t('register')}
      </Button>
    </form>
  );
}
