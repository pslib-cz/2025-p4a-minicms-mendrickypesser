import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import CookieConsent from '@/components/ui/CookieConsent';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OlympCMS — Sprava skolnich soutezi a olympiad",
    template: "%s | OlympCMS",
  },
  description: "Komplexni system pro spravu a katalog skolnich soutezi, olympiad a akademickych klani. Propozice, terminy, vysledky a kontakty na jednom miste.",
};

import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('olympcms-theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-bs-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
{/* Microsoft Clarity should only be loaded after consent in CookieConsent component */}
      </head>
      <body className="min-vh-100 d-flex flex-column">
        <Providers>
          {children}
        </Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
