/**
 * SciHub Pro - Internationalization Hook
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import en from '@/i18n/messages/en';
import type { Locale } from '@/i18n/config';
import { localeNames } from '@/i18n/config';

export type MessageKeys = typeof en;

// Import types
export type { Locale };
export { localeNames };

// ============ TRANSLATION CONTEXT ============

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  availableLocales: typeof localeNames;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// ============ PROVIDER ============

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

const messages: Record<Locale, any> = {
  en,
  // Other locales would be imported here
  es: en, // Fallback to English for now
  de: en,
  fr: en,
  zh: en,
  ja: en,
  pt: en,
  ar: en,
  hi: en,
  ko: en,
};

export function I18nProvider({ children, defaultLocale = 'en' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('scihub-locale', newLocale);
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = messages[locale] || messages.en;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = messages.en;
        for (const fallbackKey of keys.slice(keys.indexOf(k))) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters like {count}, {name}, etc.
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) =>
          str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue)),
        value
      );
    }

    return value;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, availableLocales: localeNames }}>
      {children}
    </I18nContext.Provider>
  );
}

// ============ HOOK ============

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }

  return context;
}

export function useLocale() {
  const { locale, setLocale, availableLocales } = useTranslation();
  return { locale, setLocale, availableLocales };
}
