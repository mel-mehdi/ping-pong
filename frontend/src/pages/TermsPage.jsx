import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const Section = ({ title, children }) => (
  <section className="my-4">
    <h2>{title}</h2>
    {children}
  </section>
);

const TermsPage = () => {
  const { t } = useLanguage();
  return (
    <div className="container my-5">
      <h1>{t('legal.terms_title')}</h1>
      <p className="text-muted">{t('legal.last_updated')}: {new Date().toLocaleDateString()}</p>

      <p>{t('legal.terms_intro')}</p>

      <Section title={t('legal.terms_user_rules_title')}>
        <p>{t('legal.terms_user_rules')}</p>
      </Section>

      <Section title={t('legal.terms_account_title')}>
        <p>{t('legal.terms_account')}</p>
      </Section>

      <Section title={t('legal.terms_ip_title')}>
        <p>{t('legal.terms_ip')}</p>
      </Section>

      <Section title={t('legal.terms_disclaimer_title')}>
        <p>{t('legal.terms_disclaimer')}</p>
      </Section>

      <Section title={t('legal.terms_governing_law_title')}>
        <p>{t('legal.terms_governing_law')}</p>
      </Section>

      <p className="text-muted"><small>{t('legal.terms_changes')}</small></p>

      <Link to="/" className="btn btn-primary mt-3">{t('legal.back_home')}</Link>
    </div>
  );
};

export default TermsPage;
