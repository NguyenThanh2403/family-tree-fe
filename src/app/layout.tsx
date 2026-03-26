import type { Metadata } from "next";
import { SEO } from "@/lib/constants";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: SEO.DEFAULT_TITLE,
    template: SEO.TITLE_TEMPLATE,
  },
  description: SEO.DEFAULT_DESCRIPTION,
  keywords: [...SEO.DEFAULT_KEYWORDS],
  authors: [{ name: "Family Tree Team" }],
  creator: "Family Tree",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    siteName: "Family Tree",
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
