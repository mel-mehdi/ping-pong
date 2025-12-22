import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

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
          <div className="footer-section">
            <h5>{t('footer.quick_links')}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/">{t('nav.home')}</Link>
              </li>
              <li>
                <Link to="/game">{t('footer.play_game')}</Link>
              </li>
              <li>
                <Link to="/chat">{t('nav.chat')}</Link>
              </li>
              <li>
                <Link to="/profile">{t('nav.profile')}</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h5>{t('footer.legal')}</h5>
            <ul className="footer-links">
              <li>
                <Link to="/privacy">{t('footer.privacy')}</Link>
              </li>
              <li>
                <Link to="/terms">{t('footer.terms')}</Link>
              </li>
            </ul>
          </div>

        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} {t('brand')}. {t('footer.all_rights')}
          </p>
          <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
