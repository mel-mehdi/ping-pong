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
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
