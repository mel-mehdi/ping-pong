import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Section = ({ title, children }) => (
  <section className="my-4">
    <h2>{title}</h2>
    {children}
  </section>
);

const PrivacyPage = () => {
  const { t } = useLanguage();
  return (
    <div className="container my-5">
      <h1>{t('legal.privacy_title')}</h1>
      <p className="text-muted">{t('legal.last_updated')}: {new Date().toLocaleDateString()}</p>

      <p>{t('legal.privacy_intro')}</p>

      <Section title={t('legal.privacy_data_collected_title')}>
        <p>{t('legal.privacy_data_collected')}</p>
      </Section>

      <Section title={t('legal.privacy_use_title')}>
        <p>{t('legal.privacy_use')}</p>
      </Section>

      <Section title={t('legal.privacy_third_party_title')}>
        <p>{t('legal.privacy_third_party')}</p>
      </Section>

      <Section title={t('legal.privacy_security_title')}>
        <p>{t('legal.privacy_security')}</p>
      </Section>

      <Section title={t('legal.privacy_children_title')}>
        <p>{t('legal.privacy_children')}</p>
      </Section>

      <Section title={t('legal.privacy_retention_title')}>
        <p>{t('legal.privacy_retention')}</p>
      </Section>

      <Section title={t('legal.privacy_contact_title')}>
        <p>{t('legal.privacy_contact')}</p>
      </Section>

      <p className="text-muted"><small>{t('legal.privacy_changes')}</small></p>

      <Link to="/" className="btn btn-primary mt-3">{t('legal.back_home')}</Link>
    </div>
  );
};

export default PrivacyPage; 
