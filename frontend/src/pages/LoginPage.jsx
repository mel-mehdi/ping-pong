import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateRequired } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';
import apiClient from '../utils/api';
import '../styles/auth.css';
import SplashCursor from '../components/SplashCursor';

const GOOGLE_CLIENT_ID = '726422486704-f02t4gf3nvs5jo8c2lda00klda9p80mb.apps.googleusercontent.com';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, checkBackendAuth, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [googlePrompting, setGooglePrompting] = useState(false);
  const promptTimeoutRef = useRef(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize Google Sign-In without rendering the default button
    if (window.google && GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp) => {
          // Ensure any pending prompt loading state is cleared when a credential arrives
          setGooglePrompting(false);
          handleGoogleResponse(resp);
        },
      });
      // mark initialization complete so prompt() is safe to call
      setGoogleInitialized(true);
    }

    return () => {
      if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
    };
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = () => setIsTyping(true);
  const handleBlur = () => setIsTyping(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validations = {
      username: validateRequired(formData.username),
      password: validateRequired(formData.password),
    };
    
    const newErrors = Object.entries(validations).reduce((acc, [key, val]) => {
      if (!val.isValid) acc[key] = val.message;
      return acc;
    }, {});

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const resp = await apiClient.login(formData.username, formData.password);
      const userPayload = resp?.user || resp || {};
      
      login({
        ...userPayload,
        userId: userPayload.id || userPayload.userId,
        username: userPayload.username || formData.username,
        token: resp?.token || resp?.access,
        loggedIn: true,
        loginTime: new Date().toISOString(),
      });
      
      checkBackendAuth().catch(() => {});
      navigate('/');
    } catch (error) {
      setLoading(false);
      console.error('Login failed', error);

      // Handle 401/invalid credentials specifically
      if (error.status === 401) {
        const msg = error.detail || error.data?.detail || error.data?.error || t('auth.invalid_credentials') || 'Invalid credentials';
        setErrors({ password: msg });
        return;
      }

      // Backend may return structured errors (e.g., non_field_errors)
      const backendMsg = error.data?.non_field_errors?.[0] || error.data?.detail || error.data?.error || error.message;
      setErrors({ general: backendMsg || t('auth.login_error') || 'An error occurred during login' });
    }
  };

  return (
    <div className="auth-page">
      <SplashCursor paused={isAuthenticated || isTyping} />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">🏓</div>
            <h1>{t('auth.welcome_back')}</h1>
            <p>{t('auth.signin_subtitle')}</p>
            <div className="auth-switch">
              <p>
                {t('auth.no_account')} <Link to="/register">{t('auth.sign_up')}</Link>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem', color: 'var(--error)', background: 'rgba(255, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                {errors.general}
              </div>
            )}
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
                autoComplete="current-password"
              />
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>

            <div className="auth-divider">
              <span>{t('auth.or')}</span>
            </div>

            <button
              className={`gsi-material-button ${googlePrompting ? 'loading' : ''}`}
              type="button"
              onClick={() => {
                if (googleInitialized && window.google && !googlePrompting) {
                  // show spinner while the Google prompt/UI appears
                  setGooglePrompting(true);
                  // Fallback: clear spinner after timeout if nothing happens
                  if (promptTimeoutRef.current) clearTimeout(promptTimeoutRef.current);
                  promptTimeoutRef.current = setTimeout(() => setGooglePrompting(false), 8000);

                  window.google.accounts.id.prompt();
                } else {
                  console.warn('Google Sign-In not initialized yet.');
                }
              }}
              disabled={!googleInitialized || loading || googlePrompting}
              title={!googleInitialized ? t('auth.google_not_ready') || 'Google Sign-In not ready' : ''}
            >
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
                {/* Spinner shown while waiting for Google prompt */}
                <span className="gsi-spinner" aria-hidden={!googlePrompting} style={{ display: googlePrompting ? 'inline-block' : 'none' }}></span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
