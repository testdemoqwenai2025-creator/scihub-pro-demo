'use client';

import { ReactNode } from 'react';
import { I18nProvider } from '@/i18n/useTranslation';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <I18nProvider defaultLocale="en">
      {children}
    </I18nProvider>
  );
}
