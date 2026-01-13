import { useState, useEffect, useRef } from 'react';
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

  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [googlePrompting, setGooglePrompting] = useState(false);
  const promptTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize Google Sign-In (do not render the default button; use our custom button)
    if (window.google && GOOGLE_CLIENT_ID) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp) => {
            // clear prompting state when credential arrives
            setGooglePrompting(false);
            if (!resp || !resp.credential) {
              console.error('Google callback received without credential', resp);
              setErrors({ general: 'Google Sign-In failed to return a credential. Try again or use Incognito to rule out extensions.' });
              return;
            }
            handleGoogleResponse(resp);
          },
        });

        // Mark initialization complete so we can safely call prompt from our custom button
        setGoogleInitialized(true);
      } catch (err) {
        console.error('Failed to initialize Google Sign-In', err);
        setErrors({ general: 'Google Sign-In initialization failed. Check browser extensions and that the Google client ID is configured.' });
      }
    }

    return () => {
      if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setLoading(true);

      if (!response || !response.credential) {
        setLoading(false);
        console.error('Invalid Google response', response);
        setErrors({ general: 'Invalid response from Google Sign-In.' });
        return;
      }

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
      console.error('Google Sign-In error:', error);
      const msg = (error?.status === 0 || /network|cors|failed/i.test(error?.message || ''))
        ? 'Network or CORS error during Google Sign-In. Try Incognito or check OAuth origins and browser extensions.'
        : 'Google Sign-In failed. Please try again.';
      setErrors({ general: msg });
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
      await apiClient.register(formData.username, formData.email, formData.password, formData.fullname);
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
      setLoading(false);
      
      // Handle backend validation errors
      if (error?.data) {
        const backendErrors = {};
        if (error.data.username) {
          backendErrors.username = Array.isArray(error.data.username) 
            ? error.data.username[0] 
            : error.data.username;
        }
        if (error.data.email) {
          backendErrors.email = Array.isArray(error.data.email) 
            ? error.data.email[0] 
            : error.data.email;
        }
        if (error.data.password) {
          backendErrors.password = Array.isArray(error.data.password) 
            ? error.data.password[0] 
            : error.data.password;
        }
        if (Object.keys(backendErrors).length > 0) {
          setErrors(backendErrors);
        }
      }
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

            {/* Keep the placeholder for Google's renderButton for compatibility, but the UI will show our custom button */}
            <div
              id="google-signup-button"
              className="google-signin-container"
              style={{ display: 'none' }}
            ></div>

            <button
              className={`gsi-material-button ${googlePrompting ? 'loading' : ''}`}
              type="button"
              id="manual-google-signup-button"
              onClick={() => {
                if (googleInitialized && window.google && !googlePrompting) {
                  setGooglePrompting(true);
                  if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
                  promptTimeoutRef.current = setTimeout(() => {
                    setGooglePrompting(false);
                    setErrors({ general: 'Google Sign-In took too long or was blocked. Try Incognito or disable extensions.' });
                  }, 8000);
                  try {
                    window.google.accounts.id.prompt();
                  } catch (err) {
                    console.error('Google prompt failed', err);
                    setGooglePrompting(false);
                    setErrors({ general: 'Google Sign-In failed to open. Check that the Google scripts are reachable and not blocked.' });
                  }
                } else {
                  console.warn('Google Sign-In not initialized yet.');
                }
              }}
              disabled={!googleInitialized || loading || googlePrompting}
              title={!googleInitialized ? t('auth.google_not_ready') || 'Google Sign-In not ready' : ''}
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
                <span className="gsi-spinner" aria-hidden={!googlePrompting} style={{ display: googlePrompting ? 'inline-block' : 'none' }}></span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
