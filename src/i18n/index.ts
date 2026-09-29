import en from './en.json';
import ta from './ta.json';
import hi from './hi.json';
import { SupportedLanguage } from '../types/compass';

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en,
  ta,
  hi,
};

let currentLanguage: SupportedLanguage = 'en';

export const setI18nLanguage = (lang: SupportedLanguage) => {
  if (translations[lang]) {
    currentLanguage = lang;
  }
};

export const getI18nLanguage = (): SupportedLanguage => {
  return currentLanguage;
};

export const t = (key: string, params?: Record<string, string | number>): string => {
  const langDict = translations[currentLanguage] || translations.en;
  let text = langDict[key] || translations.en[key] || key;

  if (params) {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`{\\s*${paramKey}\\s*}`, 'g'), String(params[paramKey]));
    });
  }

  return text;
};

export const getSupportedLanguagesList = () => [
  { code: 'en' as SupportedLanguage, label: 'English', nativeLabel: 'English' },
  { code: 'ta' as SupportedLanguage, label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'hi' as SupportedLanguage, label: 'Hindi', nativeLabel: 'हिन्दी' },
];
