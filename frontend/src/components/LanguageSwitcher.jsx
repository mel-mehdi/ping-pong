import { useLanguage } from '../contexts/LanguageContext';
import PropTypes from 'prop-types';

const order = ['en', 'fr', 'es'];

const LanguageSwitcher = ({ className = '' }) => {
  const { locale, setLocale, t } = useLanguage();
  const cycle = () => setLocale(order[(order.indexOf(locale) + 1) % order.length]);

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

LanguageSwitcher.propTypes = {
  className: PropTypes.string,
};

export default LanguageSwitcher;
