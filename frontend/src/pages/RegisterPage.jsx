import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  validateRequired,
  validateEmail,
  validateUsername,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';
import apiClient from '../utils/api';
import '../styles/auth.css';
import SplashCursor from '../components/SplashCursor';

const GOOGLE_CLIENT_ID = '726422486704-f02t4gf3nvs5jo8c2lda00klda9p80mb.apps.googleusercontent.com';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login, checkBackendAuth, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signup-button'),
        { 
          theme: 'outline', 
          size: 'large', 
          width: document.getElementById('google-signup-button')?.offsetWidth || 400,
          text: 'signup_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    }
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);
      const result = await apiClient.googleLogin(response.credential);
      const userPayload = result?.user || result || {};

      login({
        ...userPayload,
        userId: userPayload.id || userPayload.userId,
        username: userPayload.username,
        token: result?.token || result?.access,
        loggedIn: true,
        loginTime: new Date().toISOString(),
      });

      checkBackendAuth().catch(() => {});
      navigate('/');
    } catch (error) {
      setLoading(false);
      setErrors({
        general: 'Google Sign-In failed. Please try again.',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = () => setIsTyping(true);
  const handleBlur = () => setIsTyping(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validations = {
      fullname: validateRequired(formData.fullname),
      email: validateEmail(formData.email),
      username: validateUsername(formData.username),
      password: validatePassword(formData.password),
      confirmPassword: validatePasswordMatch(formData.password, formData.confirmPassword),
    };

    const newErrors = Object.entries(validations).reduce((acc, [key, val]) => {
      if (!val.isValid) acc[key] = val.message;
      return acc;
    }, {});

    if (!formData.terms) newErrors.terms = t('auth.must_accept_terms');

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await apiClient.register(formData.username, formData.email, formData.password);
      const loginResp = await apiClient.login(formData.username, formData.password);
      const userPayload = loginResp?.user || loginResp || {};
      
      login({
        ...userPayload,
        userId: userPayload.id || userPayload.userId,
        username: userPayload.username || formData.username,
        email: userPayload.email || formData.email,
        fullname: userPayload.fullname || formData.fullname,
        token: loginResp?.token || loginResp?.access,
        loggedIn: true,
        registrationTime: new Date().toISOString(),
      });

      checkBackendAuth().catch(() => {});
      setTimeout(() => navigate('/'), 500);
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <SplashCursor paused={isAuthenticated || isTyping} />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🏓</div>
            <h1>{t('auth.create_account')}</h1>
            <p>{t('auth.join_subtitle')}</p>
            <div className="auth-switch">
              <p>
                {t('auth.already_have_account')} <Link to="/login">{t('auth.sign_in')}</Link>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullname">{t('auth.fullname')}</label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                  value={formData.fullname}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                {errors.fullname && <div className="invalid-feedback">{errors.fullname}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="email">{t('auth.email')}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoComplete="email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">{t('auth.username')}</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoComplete="username"
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('auth.password')}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoComplete="new-password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirm_password')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className={`form-check-input ${errors.terms ? 'is-invalid' : ''}`}
                checked={formData.terms}
                onChange={handleChange}
              />
              <label htmlFor="terms" className="form-check-label">
                {t('auth.terms_prefix')} <Link to="/terms">{t('auth.terms')}</Link> {t('auth.and')}{' '}
                <Link to="/privacy">{t('auth.privacy')}</Link>
              </label>
              {errors.terms && <div className="invalid-feedback">{errors.terms}</div>}
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? t('auth.creating_account') : t('auth.sign_up')}
            </button>

            <div className="auth-divider">
              <span>{t('auth.or')}</span>
            </div>

            <div
              id="google-signup-button"
              className="google-signin-container"
            ></div>
            <button
              className="gsi-material-button"
              type="button"
              id="manual-google-signup-button"
              style={{ display: 'none' }}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">
                  {t('auth.sign_in_with_google')}
                </span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
