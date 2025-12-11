import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    validateRequired,
    validateEmail,
    validateUsername,
    validatePassword,
    validatePasswordMatch
} from '../utils/validation';
import db from '../utils/database';
import '../styles/auth.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        terms: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const fullnameValidation = validateRequired(formData.fullname);
        const emailValidation = validateEmail(formData.email);
        const usernameValidation = validateUsername(formData.username);
        const passwordValidation = validatePassword(formData.password);
        const passwordMatchValidation = validatePasswordMatch(formData.password, formData.confirmPassword);

        if (!fullnameValidation.isValid) newErrors.fullname = fullnameValidation.message;
        if (!emailValidation.isValid) newErrors.email = emailValidation.message;
        if (!usernameValidation.isValid) newErrors.username = usernameValidation.message;
        if (!passwordValidation.isValid) newErrors.password = passwordValidation.message;
        if (!passwordMatchValidation.isValid) newErrors.confirmPassword = passwordMatchValidation.message;
        if (!formData.terms) newErrors.terms = 'You must accept the terms and conditions';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // Check if user already exists
            const existingUser = db.findOne('users', { username: formData.username });
            if (existingUser) {
                setErrors({ username: 'Username already exists' });
                setLoading(false);
                return;
            }

            const existingEmail = db.findOne('users', { email: formData.email });
            if (existingEmail) {
                setErrors({ email: 'Email already registered' });
                setLoading(false);
                return;
            }

            // Create new user
            const passwordHash = db.hashPassword(formData.password);
            const newUser = db.insert('users', {
                fullname: formData.fullname,
                email: formData.email,
                username: formData.username,
                passwordHash,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullname)}&background=random`
            });

            const userData = {
                userId: newUser.id,
                username: newUser.username,
                email: newUser.email,
                fullname: newUser.fullname,
                avatar: newUser.avatar,
                loggedIn: true,
                registrationTime: new Date().toISOString()
            };

            login(userData);

            setTimeout(() => {
                navigate('/');
            }, 500);
        } catch (error) {
            console.error('Registration error:', error);
            setErrors({ general: 'An error occurred during registration' });
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🏓</div>
                        <h1>Create Account</h1>
                        <p>Join PingPong and start playing</p>
                        <div className="auth-switch">
                            <p>Already have an account? <Link to="/login">Sign In</Link></p>
                        </div>
                    </div>

                    {errors.general && (
                        <div className="alert alert-danger">{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fullname">Full Name</label>
                                <input
                                    type="text"
                                    id="fullname"
                                    name="fullname"
                                    className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                                    value={formData.fullname}
                                    onChange={handleChange}
                                />
                                {errors.fullname && (
                                    <div className="invalid-feedback">{errors.fullname}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    autoComplete="email"
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
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
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                                I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
                            </label>
                            {errors.terms && (
                                <div className="invalid-feedback">{errors.terms}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className={`btn btn-primary btn-block ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </button>

                        <div className="auth-divider">
                            <span>or</span>
                        </div>

                        <button className="gsi-material-button" type="button" onClick={() => console.log('Google sign-up')}>
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
                                <span className="gsi-material-button-contents">Sign in with Google</span>
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
