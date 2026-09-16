import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import enTranslations from '../translations/en.json';
import deTranslations from '../translations/de.json';
import { translationService } from '../services/translationService';

type Language = 'en' | 'de';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tschuess_lang');
    if (saved === 'en' || saved === 'de') return saved;
    // Auto-detect German browser locale if applicable
    return navigator.language.startsWith('de') ? 'de' : 'en';
  });

  // Sync translation engine on mount
  useEffect(() => {
    if (language === 'de') {
      translationService.translateWholeWebsite('de');
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tschuess_lang', lang);
    translationService.translateWholeWebsite(lang);
  }, []);

  const translations = useMemo(() => {
    return language === 'de' ? deTranslations : enTranslations;
  }, [language]);

  const t = useCallback((path: string, fallback?: string): string => {
    const keys = path.split('.');
    let current: any = translations;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        if (language === 'de' && fallback) {
          const dictTranslation = translationService.translateSync(fallback);
          if (dictTranslation) return dictTranslation;
        }
        return fallback || path;
      }
    }
    return typeof current === 'string' ? current : fallback || path;
  }, [translations, language]);

  const contextValue = useMemo<LanguageContextType>(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <LanguageContext.Provider value={contextValue}>
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
