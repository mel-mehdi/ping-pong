import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const PrivacyPage = () => {
  const { t } = useLanguage();
  return (
    <div className="container my-5">
      <h1>{t('legal.privacy_title')}</h1>
      <p>
        {t('legal.last_updated')}: {new Date().toLocaleDateString()}
      </p>
      <p>{t('footer.disclaimer')}</p>
      <Link to="/" className="btn btn-primary mt-3">
        {t('legal.back_home')}
      </Link>
    </div>
  );
};

export default PrivacyPage;
