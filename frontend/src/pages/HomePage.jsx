import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/home.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userData } = useAuth();
    const { t } = useLanguage();
    const achievementsCount = Array.isArray(userData?.achievements) ? userData.achievements.length : (typeof userData?.achievements === 'number' ? userData.achievements : 0);

    const handleQuickPlay = () => {
        navigate('/game');
    };

    const handleTournament = () => {
        navigate('/tournament');
    };

    return (
        <>
            <Navbar />
            <main role="main" className="home-main">
                {/* Hero Section */}
                <section className="hero-banner">
                    <div className="hero-content container">
                        {isAuthenticated ? (
                            <>
                                <h1 className="hero-title animate-fade-in-up">
                                    {t('home.welcome_back').replace('{user}', userData?.username || t('profile.player'))}
                                </h1>
                                <p className="hero-subtitle animate-fade-in">
                                    {t('home.welcome_subtitle')}
                                </p>
                                <div className="hero-cta animate-scale-in">
                                    <button onClick={handleQuickPlay} className="btn btn-hero btn-hero-primary">
                                        {t('home.play_now')}
                                    </button>
                                    <button onClick={handleTournament} className="btn btn-hero btn-hero-secondary">
                                        {t('home.join_tournament')}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="hero-title animate-fade-in-up">{t('home.welcome')}</h1>
                                <p className="hero-subtitle animate-fade-in">{t('home.intro')}</p>
                                <div className="hero-cta animate-scale-in">
                                    <button onClick={() => navigate('/register')} className="btn btn-hero btn-hero-primary">
                                        {t('home.get_started')}
                                    </button>
                                    <button onClick={() => navigate('/login')} className="btn btn-hero btn-hero-secondary">
                                        {t('home.sign_in')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Quick Stats for Authenticated Users */}
                {isAuthenticated && (
                    <section className="container section-spacing-sm">
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem'}}>
                            <div>
                                <div className="modern-card hover-lift text-center">
                                    <div className="card-icon text-primary mb-3">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                            <path d="M4 22h16"></path>
                                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                        </svg>
                                    </div>
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>{t('home.total_wins')}</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem'}}>
                                        {userData?.wins || 0}
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>{t('home.keep_playing')}</small>
                                </div>
                            </div>

                            <div>
                                <div className="modern-card hover-lift text-center">
                                    <div className="card-icon mb-3" style={{color: '#10b981'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="12" y1="20" x2="12" y2="10"></line>
                                            <line x1="18" y1="20" x2="18" y2="4"></line>
                                            <line x1="6" y1="20" x2="6" y2="16"></line>
                                        </svg>
                                    </div>
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>{t('home.win_rate_label')}</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem'}}>
                                        {userData?.winRate || 0}%
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>{t('home.great_progress')}</small>
                                </div>
                            </div>

                            <div>
                                <div className="modern-card hover-lift text-center">
                                    <div className="card-icon mb-3" style={{color: '#f59e0b'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <circle cx="12" cy="12" r="6"></circle>
                                            <circle cx="12" cy="12" r="2"></circle>
                                        </svg>
                                    </div>
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>{t('home.global_rank')}</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem'}}>
                                        #{userData?.rank || '-'}
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>{t('home.keep_climbing')}</small>
                                </div>
                            </div>

                            <div>
                                <div className="modern-card hover-lift text-center">
                                    <div className="card-icon mb-3" style={{color: '#8b5cf6'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                            <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                                            <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                                            <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                                            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                            <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                        </svg>
                                    </div>
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>{t('home.achievements')}</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.25rem'}}>
                                        {achievementsCount}
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>{t('home.unlock_more')}</small>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Features Section */}
                {!isAuthenticated && (
                    <section className="features-section">
                        <div className="container">
                            <div className="section-header">
                                <h2>{t('home.features_title')}</h2>
                                <p>{t('home.features_subtitle')}</p>
                            </div>
                            <div className="features-grid">
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">🎮</div>
                                    <h3 className="feature-title">{t('home.feature_multiplayer.title')}</h3>
                                    <p className="feature-description">{t('home.feature_multiplayer.desc')}</p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">🏆</div>
                                    <h3 className="feature-title">{t('home.feature_tournaments.title')}</h3>
                                    <p className="feature-description">{t('home.feature_tournaments.desc')}</p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">📊</div>
                                    <h3 className="feature-title">{t('home.feature_stats.title')}</h3>
                                    <p className="feature-description">{t('home.feature_stats.desc')}</p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">💬</div>
                                    <h3 className="feature-title">{t('home.feature_social.title')}</h3>
                                    <p className="feature-description">{t('home.feature_social.desc')}</p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">🎖️</div>
                                    <h3 className="feature-title">{t('home.feature_achievements.title')}</h3>
                                    <p className="feature-description">{t('home.feature_achievements.desc')}</p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">📱</div>
                                    <h3 className="feature-title">{t('home.feature_cross.title')}</h3>
                                    <p className="feature-description">{t('home.feature_cross.desc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Play Options Section */}
                <section className="container section-spacing">
                    <div className="section-header">
                        <h2>{t('home.choose_mode_title')}</h2>
                        <p>{t('home.choose_mode_subtitle')}</p>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                        <div>
                            <button onClick={handleQuickPlay} className="modern-card hover-lift text-center w-100" style={{border: 'none', background: 'var(--bg)', cursor: 'pointer'}}>
                                <div className="play-icon text-primary mb-3">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </div>
                                <h5 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)'}}>{t('home.quick_play_title')}</h5>
                                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                                    {t('home.quick_play_desc')}
                                </p>
                                <span className="card-badge">{t('home.start_now')}</span>
                            </button>
                        </div>

                        <div>
                            <button onClick={handleQuickPlay} className="modern-card hover-lift text-center w-100" style={{border: 'none', background: 'var(--bg)', cursor: 'pointer'}}>
                                <div className="play-icon mb-3" style={{color: '#10b981'}}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                </div>
                                <h5 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)'}}>{t('home.online_game_title')}</h5>
                                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                                    {t('home.online_game_desc')}
                                </p>
                                <span className="card-badge" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>{t('home.play_online')}</span>
                            </button>
                        </div>

                        <div>
                            <button onClick={handleTournament} className="modern-card hover-lift text-center w-100" style={{border: 'none', background: 'var(--bg)', cursor: 'pointer'}}>
                                <div className="play-icon mb-3" style={{color: '#f59e0b'}}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                        <path d="M4 22h16"></path>
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                    </svg>
                                </div>
                                <h5 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)'}}>{t('home.tournament_title')}</h5>
                                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                                    {t('home.tournament_desc')}
                                </p>
                                <span className="card-badge" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>{t('home.join_now')}</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                {!isAuthenticated && (
                    <section className="stats-section">
                        <div className="container">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <span className="stat-number">10K+</span>
                                    <span className="stat-label">Active Players</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">50K+</span>
                                    <span className="stat-label">Matches Played</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">500+</span>
                                    <span className="stat-label">Daily Tournaments</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">24/7</span>
                                    <span className="stat-label">Support</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                {!isAuthenticated && (
                    <section className="cta-section">
                        <div className="container">
                            <div className="cta-content">
                                <h2 className="cta-title">{t('home.cta.title')}</h2>
                                <p className="cta-description">{t('home.cta.desc')}</p>
                                <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{fontSize: '1.125rem', padding: '1rem 2.5rem'}}>
                                    {t('home.cta.button')}
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Leaderboard Section */}
                {isAuthenticated && (
                    <section className="container section-spacing-sm">
                        <div className="modern-card">
                            <div className="card-header-modern" style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem'}}>
                                <h3 style={{fontSize: '1.5rem', fontWeight: '600', margin: 0}}>
                                    <span style={{marginRight: '0.5rem'}}>🏆</span>
                                    {t('home.top_players')}
                                </h3>
                                    <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate('/leaderboard');
                                    }} 
                                    className="btn btn-sm" 
                                    style={{
                                        color: 'var(--primary)', 
                                        cursor: 'pointer', 
                                        background: 'transparent', 
                                        border: 'none', 
                                        padding: '0.5rem 1rem',
                                        pointerEvents: 'auto',
                                        position: 'relative',
                                        zIndex: 10
                                    }}
                                    >
                                    {t('home.view_all')} →
                                    </button>
                            </div>
                            <div style={{padding: '1.5rem 0'}}>
                                <ol className="list-group list-group-numbered">
                                    <li className="list-group-item" style={{border: 'none', color: 'var(--text-muted)', padding: '1rem', textAlign: 'center'}}>
                                        {t('leaderboard.empty_message')}
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
};

export default HomePage;
