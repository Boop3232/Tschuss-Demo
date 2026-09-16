import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../translations/en.json';
import deTranslations from '../translations/de.json';
import { translationService } from '../services/translationService';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
  isApiTranslated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tschuess_lang');
    if (saved === 'en' || saved === 'de') return saved;
    // Auto-detect German browser locale if applicable
    return navigator.language.startsWith('de') ? 'de' : 'en';
  });

  const [isApiTranslated, setIsApiTranslated] = useState(language === 'de');

  // Sync translation engine on mount
  useEffect(() => {
    translationService.initScript();
    if (language === 'de') {
      translationService.translateWholeWebsite('de');
      setIsApiTranslated(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tschuess_lang', lang);
    setIsApiTranslated(lang === 'de');

    // Trigger API translation for the whole website
    translationService.translateWholeWebsite(lang);
  };

  const translations = language === 'de' ? deTranslations : enTranslations;

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback || path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isApiTranslated }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
