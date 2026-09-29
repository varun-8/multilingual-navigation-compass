import { useState, useEffect, createContext, useContext, ReactNode, ReactElement } from 'react';
import React from 'react';
import { SupportedLanguage } from '../types/compass';
import { setI18nLanguage, getI18nLanguage } from '../i18n';
import { loadUserPreferences, saveUserPreferences } from '../services/storageService';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
});

export const LanguageProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [language, setLangState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    loadUserPreferences().then((prefs) => {
      if (prefs.language) {
        setI18nLanguage(prefs.language);
        setLangState(prefs.language);
      }
    });
  }, []);

  const changeLanguage = async (newLang: SupportedLanguage) => {
    setI18nLanguage(newLang);
    setLangState(newLang);
    await saveUserPreferences({ language: newLang });
  };

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage: changeLanguage } },
    children
  );
};

export const useLanguage = () => useContext(LanguageContext);
