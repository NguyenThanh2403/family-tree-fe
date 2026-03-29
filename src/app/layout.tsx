import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import type { Locale } from '@/i18n';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const messages = await getMessages();

  const appName = (messages as any)?.common?.appName ?? 'Family Tree+';
  const description =
    (messages as any)?.common?.metaDescription ??
    'Quản lý gia phả trực tuyến — Explore, manage, and analyze your family history interactively.';
  const keywordsRaw = (messages as any)?.common?.metaKeywords ?? [
    'family tree',
    'gia phả',
    'genealogy',
    'phả hệ',
    'Vietnam',
  ];
  const keywords = Array.isArray(keywordsRaw)
    ? keywordsRaw
    : typeof keywordsRaw === 'string'
    ? keywordsRaw.split(',').map((s: string) => s.trim())
    : keywordsRaw;

  return {
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description,
    keywords,
    openGraph: {
      type: 'website',
      siteName: appName,
      title: (messages as any)?.common?.ogTitle ?? `${appName} — Quản lý gia phả`,
      description: (messages as any)?.common?.ogDescription ?? description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-flash: apply saved theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <a href="#main-content" className="skip-link">
          {(messages as any)?.common?.skipToMain ?? 'Skip to main content'}
        </a>
        <LanguageProvider defaultLocale={locale as Locale} defaultMessages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
