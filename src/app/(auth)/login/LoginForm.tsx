'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/hooks/useAuth';

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const { login, ssoLogin, isLoading, error, clearError } = useAuth();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ emailOrUsername?: string; password?: string }>({});
  const [ssoLoading, setSsoLoading] = useState<'google' | 'facebook' | 'apple' | null>(null);

  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!emailOrUsername.trim()) errors.emailOrUsername = t('emailOrUsernameRequired');
    if (!password) errors.password = t('passwordRequired');
    else if (password.length < 8) errors.password = t('passwordMinLength');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await login(emailOrUsername, password);
      router.push('/home');
    } catch {
      // error displayed via store
    }
  }

  async function handleSSOLogin(provider: 'google' | 'facebook' | 'apple') {
    setSsoLoading(provider);
    clearError();
    try {
      // In a real implementation, you would get the token from the SSO provider SDK
      // This is a placeholder - you'll need to integrate with actual OAuth providers
      const token = await getSSOToken(provider);
      await ssoLogin({ provider, token });
      router.push('/home');
    } catch (err) {
      // error displayed via store
    } finally {
      setSsoLoading(null);
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
        label={t('emailOrUsername')}
        type="text"
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
        error={fieldErrors.emailOrUsername}
        autoComplete="username"
        required
        placeholder="you@example.com or username"
      />

      <Input
        label={t('password')}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        autoComplete="current-password"
        required
      />

      <Button type="submit" fullWidth loading={isLoading}>
        {t('login')}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">{t('orContinueWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSSOLogin('google')}
          loading={ssoLoading === 'google'}
          disabled={ssoLoading !== null && ssoLoading !== 'google'}
          leftIcon={<GoogleIcon />}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSSOLogin('facebook')}
          loading={ssoLoading === 'facebook'}
          disabled={ssoLoading !== null && ssoLoading !== 'facebook'}
          leftIcon={<FacebookIcon />}
        >
          Facebook
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSSOLogin('apple')}
          loading={ssoLoading === 'apple'}
          disabled={ssoLoading !== null && ssoLoading !== 'apple'}
          leftIcon={<AppleIcon />}
        >
          Apple
        </Button>
      </div>
    </form>
  );
}

// Placeholder function for SSO token retrieval
// You'll need to implement actual OAuth provider integrations
async function getSSOToken(provider: 'google' | 'facebook' | 'apple'): Promise<string> {
  // This should be replaced with actual OAuth provider SDK integration
  // For Google: Use Google Sign-In SDK
  // For Facebook: Use Facebook SDK
  // For Apple: Use Apple Sign In
  throw new Error(`${provider} SSO not implemented yet`);
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M19.665 16.811a10.316 10.316 0 0 1-1.021 1.837c-.537.767-.978 1.297-1.316 1.592-.525.482-1.089.73-1.692.744-.432 0-.954-.123-1.562-.373-.61-.249-1.17-.371-1.683-.371-.537 0-1.113.122-1.73.371-.616.25-1.114.381-1.495.393-.577.025-1.154-.228-1.729-.763-.368-.32-.827-.87-1.376-1.648-.59-.829-1.075-1.794-1.455-2.891-.407-1.187-.611-2.335-.611-3.447 0-1.273.275-2.372.826-3.292a4.857 4.857 0 0 1 1.73-1.751 4.65 4.65 0 0 1 2.34-.662c.46 0 1.063.142 1.81.422s1.227.422 1.436.422c.158 0 .689-.167 1.593-.498.853-.307 1.573-.434 2.163-.384 1.6.129 2.801.759 3.6 1.895-1.43.867-2.137 2.08-2.123 3.637.012 1.213.453 2.222 1.317 3.023a4.33 4.33 0 0 0 1.315.863c-.106.307-.218.6-.336.882zM15.998 2.38c0 .95-.348 1.838-1.039 2.659-.836.976-1.846 1.541-2.941 1.452a2.955 2.955 0 0 1-.021-.36c0-.913.396-1.889 1.103-2.688.352-.404.8-.741 1.343-1.009.542-.264 1.054-.41 1.536-.435.013.128.019.255.019.381z" />
    </svg>
  );
}
