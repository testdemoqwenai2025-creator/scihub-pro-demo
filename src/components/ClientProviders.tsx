'use client';

/**
 * SciHub Pro - Client Providers
 * 
 * Wraps the app with all necessary client-side providers:
 * - I18nProvider: Internationalization support
 * - ThemeProvider: Dark/light mode support via next-themes
 */

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { I18nProvider } from '@/i18n/useTranslation';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <I18nProvider defaultLocale="en">
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
