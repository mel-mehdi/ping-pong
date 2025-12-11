import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateRequired } from '../utils/validation';
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
                setErrors({ username: 'User not found' });
                setLoading(false);
                return;
            }

            if (!db.verifyPassword(formData.password, user.passwordHash)) {
                setErrors({ password: 'Invalid password' });
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
            setErrors({ general: 'An error occurred during login' });
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">🏓</div>
                        <h1>Welcome Back</h1>
                        <p>Sign in to continue to PingPong</p>
                        <div className="auth-switch">
                            <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
                        </div>
                    </div>

                    {errors.general && (
                        <div className="alert alert-danger">{errors.general}</div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
