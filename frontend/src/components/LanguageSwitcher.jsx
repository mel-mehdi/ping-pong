import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const order = ['en', 'fr', 'es'];

const LanguageSwitcher = ({ className = '' }) => {
  const { locale, setLocale, t } = useLanguage();

  const cycle = () => {
    const idx = order.indexOf(locale);
    const next = order[(idx + 1) % order.length];
    setLocale(next);
  };

  return (
    <button
      className={`nav-icon-btn language-switcher ${className}`}
      onClick={cycle}
      title={`Language: ${locale}`}
      aria-label={`Language: ${locale}`}
    >
      {t(`lang.${locale}`) || locale.toUpperCase()}
    </button>
  );
};

export default LanguageSwitcher;
