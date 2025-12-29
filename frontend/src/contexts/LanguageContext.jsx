import { createContext, useContext, useEffect, useState } from 'react';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

const resources = { en, fr, es };
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => localStorage.getItem('locale') || 'en');

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key) => {
    if (!key) return '';
    return key.split('.').reduce((obj, k) => obj?.[k], resources[locale] || resources.en) || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
