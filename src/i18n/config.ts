/**
 * SciHub Pro - Internationalization Configuration
 */

export const locales = ['en', 'es', 'de', 'fr', 'zh', 'ja', 'pt', 'ar', 'hi', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
  zh: '中文',
  ja: '日本語',
  pt: 'Português',
  ar: 'العربية',
  hi: 'हिन्दी',
  ko: '한국어',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  de: '🇩🇪',
  fr: '🇫🇷',
  zh: '🇨🇳',
  ja: '🇯🇵',
  pt: '🇧🇷',
  ar: '🇸🇦',
  hi: '🇮🇳',
  ko: '🇰🇷',
};
