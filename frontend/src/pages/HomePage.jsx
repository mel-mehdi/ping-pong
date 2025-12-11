import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/home.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userData } = useAuth();

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
                                    Welcome back, {userData?.username || 'Player'}!
                                </h1>
                                <p className="hero-subtitle animate-fade-in">
                                    Ready for your next match? Challenge players worldwide or join a tournament
                                </p>
                                <div className="hero-cta animate-scale-in">
                                    <button onClick={handleQuickPlay} className="btn btn-hero btn-hero-primary">
                                        Play Now
                                    </button>
                                    <button onClick={handleTournament} className="btn btn-hero btn-hero-secondary">
                                        Join Tournament
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h1 className="hero-title animate-fade-in-up">Welcome to PingPong</h1>
                                <p className="hero-subtitle animate-fade-in">
                                    Experience the classic Pong game reimagined with modern multiplayer features,
                                    tournaments, and competitive rankings
                                </p>
                                <div className="hero-cta animate-scale-in">
                                    <button onClick={() => navigate('/register')} className="btn btn-hero btn-hero-primary">
                                        Get Started Free
                                    </button>
                                    <button onClick={() => navigate('/login')} className="btn btn-hero btn-hero-secondary">
                                        Sign In
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
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>Total Wins</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem'}}>
                                        {userData?.wins || 0}
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>Keep playing!</small>
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
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>Win Rate</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem'}}>
                                        {userData?.winRate || 0}%
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>Great progress!</small>
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
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>Global Rank</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem'}}>
                                        #{userData?.rank || '-'}
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>Keep climbing!</small>
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
                                    <h5 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text)'}}>Achievements</h5>
                                    <p className="display-4" style={{fontSize: '2.5rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '0.25rem'}}>
                                        {userData?.achievements || 0}
                                    </p>
                                    <small style={{color: 'var(--text-muted)'}}>Unlock more!</small>
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
                                <h2>Why Choose PingPong?</h2>
                                <p>Join thousands of players in the ultimate online Pong experience</p>
                            </div>
                            <div className="features-grid">
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">🎮</div>
                                    <h3 className="feature-title">Real-time Multiplayer</h3>
                                    <p className="feature-description">
                                        Challenge players from around the world in smooth, lag-free matches
                                    </p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">🏆</div>
                                    <h3 className="feature-title">Tournaments</h3>
                                    <p className="feature-description">
                                        Compete in daily tournaments and climb the championship brackets
                                    </p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">📊</div>
                                    <h3 className="feature-title">Advanced Stats</h3>
                                    <p className="feature-description">
                                        Track your performance with detailed statistics and match history
                                    </p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">💬</div>
                                    <h3 className="feature-title">Social Features</h3>
                                    <p className="feature-description">
                                        Chat with friends, form teams, and build your gaming community
                                    </p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">🎖️</div>
                                    <h3 className="feature-title">Achievements</h3>
                                    <p className="feature-description">
                                        Unlock badges and rewards as you master the game
                                    </p>
                                </div>
                                <div className="feature-card hover-lift">
                                    <div className="feature-icon">📱</div>
                                    <h3 className="feature-title">Cross-Platform</h3>
                                    <p className="feature-description">
                                        Play on any device with our responsive web design
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Play Options Section */}
                <section className="container section-spacing">
                    <div className="section-header">
                        <h2>Choose Your Game Mode</h2>
                        <p>Multiple ways to play and compete</p>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                        <div>
                            <button onClick={handleQuickPlay} className="modern-card hover-lift text-center w-100" style={{border: 'none', background: 'var(--bg)', cursor: 'pointer'}}>
                                <div className="play-icon text-primary mb-3">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </div>
                                <h5 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)'}}>Quick Play</h5>
                                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                                    Jump straight into action with instant matchmaking
                                </p>
                                <span className="card-badge">Start Now</span>
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
                                <h5 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)'}}>Online Game</h5>
                                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                                    Challenge players from around the world
                                </p>
                                <span className="card-badge" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>Play Online</span>
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
                                <h5 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)'}}>Tournament</h5>
                                <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                                    Compete in brackets and win championships
                                </p>
                                <span className="card-badge" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>Join Now</span>
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
                                <h2 className="cta-title">Ready to Play?</h2>
                                <p className="cta-description">
                                    Join the community and start your journey to becoming a champion
                                </p>
                                <button onClick={() => navigate('/register')} className="btn btn-primary btn-lg" style={{fontSize: '1.125rem', padding: '1rem 2.5rem'}}>
                                    Create Your Free Account
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
                                    Top Players
                                </h3>
                                <button onClick={() => navigate('/leaderboard')} className="btn btn-sm" style={{color: 'var(--primary)', cursor: 'pointer'}}>
                                    View All →
                                </button>
                            </div>
                            <div style={{padding: '1.5rem 0'}}>
                                <ol className="list-group list-group-numbered">
                                    <li className="list-group-item" style={{border: 'none', color: 'var(--text-muted)', padding: '1rem'}}>
                                        Play matches to appear on the leaderboard!
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
