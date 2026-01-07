import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const FooterLinks = ({ title, links }) => (
  <div className="footer-section">
    <h5>{title}</h5>
    <ul className="footer-links">
      {links.map(({ to, label }) => (
        <li key={to}><Link to={to}>{label}</Link></li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>{t('brand')}</h4>
            <p>{t('footer.description')}</p>
            <p className="footer-academic">{t('footer.academic')}</p>
          </div>
          
          <FooterLinks 
            title={t('footer.quick_links')} 
            links={[
              { to: '/', label: t('nav.home') },
              { to: '/game', label: t('footer.play_game') },
              { to: '/chat', label: t('nav.chat') },
              { to: '/profile', label: t('nav.profile') },
            ]}
          />
          
          <FooterLinks 
            title={t('footer.legal')} 
            links={[
              { to: '/privacy', label: t('footer.privacy') },
              { to: '/terms', label: t('footer.terms') },
            ]}
          />
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {t('brand')}. {t('footer.all_rights')}</p>
          <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
