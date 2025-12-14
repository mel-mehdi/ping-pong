import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateRequired } from '../utils/validation';
import { useLanguage } from '../contexts/LanguageContext';
import db from '../utils/database';
import '../styles/auth.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const usernameValidation = validateRequired(formData.username);
        const passwordValidation = validateRequired(formData.password);

        if (!usernameValidation.isValid) {
            newErrors.username = usernameValidation.message;
        }
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const user = db.findOne('users', { username: formData.username });

            if (!user) {
                setErrors({ username: t('auth.user_not_found') });
                setLoading(false);
                return;
            }

            if (!db.verifyPassword(formData.password, user.passwordHash)) {
                setErrors({ password: t('auth.invalid_password') });
                setLoading(false);
                return;
            }

            const userData = {
                userId: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                avatar: user.avatar,
                loggedIn: true,
                loginTime: new Date().toISOString()
            };

            login(userData);
            db.insert('sessions', { userId: user.id, loginTime: new Date().toISOString() });

            setTimeout(() => {
                navigate('/');
            }, 500);
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: t('auth.login_error') });
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🏓</div>
                        <h1>{t('auth.welcome_back')}</h1>
                        <p>{t('auth.signin_subtitle')}</p>
                        <div className="auth-switch">
                            <p>{t('auth.no_account')} <Link to="/register">{t('auth.sign_up')}</Link></p>
                        </div>
                    </div>

                    {errors.general && (
                        <div className="alert alert-danger">{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="username">{t('auth.username')}</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete="username"
                            />
                            {errors.username && (
                                <div className="invalid-feedback">{errors.username}</div>
                            )}
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
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <div className="invalid-feedback">{errors.password}</div>
                            )}
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

                        <button className="gsi-material-button" type="button" onClick={() => console.log('Google sign-in')}>
                            <div className="gsi-material-button-state"></div>
                            <div className="gsi-material-button-content-wrapper">
                                <div className="gsi-material-button-icon">
                                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{display: 'block'}}>
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                        <path fill="none" d="M0 0h48v48H0z"></path>
                                    </svg>
                                </div>
                                <span className="gsi-material-button-contents">{t('auth.sign_in_with_google')}</span>
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
