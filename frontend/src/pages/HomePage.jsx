import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import apiClient from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/home.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userData, isBackendAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [userStats, setUserStats] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [inviting, setInviting] = useState(null);
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteMessage, setInviteMessage] = useState(null);
  const [inviteMessageType, setInviteMessageType] = useState('success');

  const achievementsCount = userStats?.achievements || 0;

  // Fetch user stats from API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !isBackendAuthenticated || !userData?.userId) return;
      
      setLoading(true);
      try {
        // Fetch user profile for complete stats
        const profile = await apiClient.getUserProfile(userData.userId);
        if (profile) {
          setUserStats({
            wins: profile.wins || 0,
            losses: profile.losses || 0,
            winRate: profile.wins && (profile.wins + profile.losses) 
              ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) 
              : 0,
            rank: profile.rank || 0,
            level: profile.level || 1,
            achievements: Array.isArray(profile.achievements) ? profile.achievements.length : 0,
          });
        }

        // Fetch recent matches
        const matches = await apiClient.getMyMatches();
        if (Array.isArray(matches)) {
          setRecentMatches(matches.slice(0, 5)); // Get last 5 matches
        }
      } catch (err) {
        // Failed to fetch user data
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, isBackendAuthenticated, userData]);

  const handleQuickPlay = () => {
    navigate('/game');
  };

  const handleOnlineGame = () => {
    navigate('/game?mode=online');
  };

  const handleTournament = () => {
    navigate('/tournament');
  };

  const handlePlayWithFriend = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setShowFriendModal(true);
    // Try to fetch friends, but don't block if it fails or is empty
    try {
      const myFriends = await apiClient.getMyFriends();
      if (myFriends && myFriends.length > 0) {
        setFriends(myFriends);
        setSuggestedUsers([]);
      } else {
        setFriends([]);
        // If no friends, fetch suggested users (all users)
        try {
          const allUsers = await apiClient.getAllUsers();
          // Filter out self
          const others = (allUsers || []).filter(u => u.id !== userData?.userId).slice(0, 10);
          setSuggestedUsers(others);
        } catch (e) {
          // Failed to fetch suggested users
        }
      }
    } catch (err) {
      setFriends([]);
    }
  };

  const handleInviteSearch = async (e) => {
    const query = e.target.value;
    setInviteSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiClient.searchUsers(query);
      // Filter out self
      const filtered = results.filter(u => u.id !== userData?.userId);
      setSearchResults(filtered);
    } catch (err) {
      // Search failed
    } finally {
      setIsSearching(false);
    }
  };

  const sendGameInvite = async (friendId) => {
    setInviting(friendId);
    try {
      await apiClient.sendGameInvitation(friendId, 'match', 'Game Invite');
      // Show success feedback or close modal
      setInviteMessage(t('home.invite_sent') || 'Invitation sent!');
      setInviteMessageType('success');
      setTimeout(() => setInviteMessage(null), 4000);
      setShowFriendModal(false);
      setInviteSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      setInviteMessage(t('home.invite_failed') || 'Failed to send invitation');
      setInviteMessageType('danger');
      setTimeout(() => setInviteMessage(null), 4000);
    } finally {
      setInviting(null);
    }
  };

  return (
    <>
      <Navbar />
      <main role="main" className="home-main">
        {/* Hero Section */}
        <section className="hero-banner">
          <div className="hero-content container">
            {inviteMessage && (
              <div className={`alert alert-${inviteMessageType} mt-2`} role="status">{inviteMessage}</div>
            )}
            {isAuthenticated ? (
              <>
                <h1 className="hero-title animate-fade-in-up">
                  {t('home.welcome_back').replace(
                    '{user}',
                    userData?.username || t('profile.player')
                  )}
                </h1>
                <p className="hero-subtitle animate-fade-in">{t('home.welcome_subtitle')}</p>
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
                  <button
                    onClick={() => navigate('/register')}
                    className="btn btn-hero btn-hero-primary"
                  >
                    {t('home.get_started')}
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn btn-hero btn-hero-secondary"
                  >
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1.5rem',
              }}
            >
              <div>
                <div className="modern-card hover-lift text-center">
                  <div className="card-icon text-primary mb-3">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                      <path d="M4 22h16"></path>
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                    </svg>
                  </div>
                  <h5
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: 'var(--text)',
                    }}
                  >
                    {t('home.total_wins')}
                  </h5>
                  <p
                    className="display-4"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: 'var(--primary)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {userStats?.wins || userData?.wins || 0}
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>{t('home.keep_playing')}</small>
                </div>
              </div>

              <div>
                <div className="modern-card hover-lift text-center">
                  <div className="card-icon mb-3" style={{ color: '#10b981' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                  </div>
                  <h5
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: 'var(--text)',
                    }}
                  >
                    {t('home.win_rate_label')}
                  </h5>
                  <p
                    className="display-4"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: '#10b981',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {userStats?.winRate || userData?.winRate || 0}%
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>{t('home.great_progress')}</small>
                </div>
              </div>

              <div>
                <div className="modern-card hover-lift text-center">
                  <div className="card-icon mb-3" style={{ color: '#f59e0b' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="6"></circle>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                  </div>
                  <h5
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: 'var(--text)',
                    }}
                  >
                    {t('home.global_rank')}
                  </h5>
                  <p
                    className="display-4"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: '#f59e0b',
                      marginBottom: '0.25rem',
                    }}
                  >
                    #{userStats?.rank || userData?.rank || '-'}
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>{t('home.keep_climbing')}</small>
                </div>
              </div>

              <div>
                <div className="modern-card hover-lift text-center">
                  <div className="card-icon mb-3" style={{ color: '#8b5cf6' }}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                      <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                      <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h5
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: 'var(--text)',
                    }}
                  >
                    {t('home.achievements')}
                  </h5>
                  <p
                    className="display-4"
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: '#8b5cf6',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {achievementsCount}
                  </p>
                  <small style={{ color: 'var(--text-muted)' }}>{t('home.unlock_more')}</small>
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
                {/* Multiplayer Icon - Already correct! */}
                <div className="feature-card hover-lift">
                  <div className="feature-icon icon-multiplayer">
                    <svg 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-hidden="true"
                      stroke="currentColor" 
                      strokeWidth="2"
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <h3 className="feature-title">{t('home.feature_multiplayer.title')}</h3>
                  <p className="feature-description">{t('home.feature_multiplayer.desc')}</p>
                </div>

                {/* Tournaments Icon - Fixed */}
                <div className="feature-card hover-lift">
                  <div className="feature-icon icon-tournaments">
                    <svg 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-hidden="true"
                      stroke="currentColor" 
                      strokeWidth="2"
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">{t('home.feature_tournaments.title')}</h3>
                  <p className="feature-description">{t('home.feature_tournaments.desc')}</p>
                </div>

                {/* Stats Icon - Fixed */}
                <div className="feature-card hover-lift">
                  <div className="feature-icon icon-stats">
                    <svg 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-hidden="true"
                      stroke="currentColor" 
                      strokeWidth="2"
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="12" width="4" height="8" rx="1" />
                      <rect x="10" y="8" width="4" height="12" rx="1" />
                      <rect x="17" y="4" width="4" height="16" rx="1" />
                    </svg>
                  </div>
                  <h3 className="feature-title">{t('home.feature_stats.title')}</h3>
                  <p className="feature-description">{t('home.feature_stats.desc')}</p>
                </div>

                {/* Social/Chat Icon - Fixed */}
                <div className="feature-card hover-lift">
                  <div className="feature-icon icon-social">
                    <svg 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-hidden="true"
                      stroke="currentColor" 
                      strokeWidth="2"
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
                      <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
                      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  </div>
                  <h3 className="feature-title">{t('home.feature_social.title')}</h3>
                  <p className="feature-description">{t('home.feature_social.desc')}</p>
                </div>

                {/* Achievements/Star Icon - Fixed */}
                <div className="feature-card hover-lift">
                  <div className="feature-icon icon-achievements">
                    <svg 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-hidden="true"
                      stroke="currentColor" 
                      strokeWidth="2"
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <h3 className="feature-title">{t('home.feature_achievements.title')}</h3>
                  <p className="feature-description">{t('home.feature_achievements.desc')}</p>
                </div>

                {/* Cross-Platform Icon - Fixed */}
                <div className="feature-card hover-lift">
                  <div className="feature-icon icon-cross">
                    <svg 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg" 
                      aria-hidden="true"
                      stroke="currentColor" 
                      strokeWidth="2"
                      fill="none" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="10" rx="2" />
                      <path d="M7 22h10" />
                      <path d="M12 17v5" />
                    </svg>
                  </div>
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
          <div className="play-options-grid">
            <div style={{ display: 'flex' }}>
              <button
                onClick={handleQuickPlay}
                className="modern-card hover-lift text-center w-100"
                style={{ border: 'none', background: 'var(--bg)', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div className="play-icon text-primary mb-3">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <h5
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'var(--text)',
                  }}
                >
                  {t('home.quick_play_title')}
                </h5>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('home.quick_play_desc')}
                </p>
                <span className="card-badge">{t('home.start_now')}</span>
              </button>
            </div>

            <div style={{ display: 'flex' }}>
              <button
                onClick={handleOnlineGame}
                className="modern-card hover-lift text-center w-100"
                style={{ border: 'none', background: 'var(--bg)', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div className="play-icon mb-3" style={{ color: '#10b981' }}>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <h5
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'var(--text)',
                  }}
                >
                  {t('home.online_game_title')}
                </h5>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('home.online_game_desc')}
                </p>
                <span
                  className="card-badge"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                >
                  {t('home.play_online')}
                </span>
              </button>
            </div>

            <div style={{ display: 'flex' }}>
              <button
                onClick={() => navigate('/game?mode=local&ai=true')}
                className="modern-card hover-lift text-center w-100"
                style={{ border: 'none', background: 'var(--bg)', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div className="play-icon mb-3" style={{ color: '#6366f1' }}>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2C8 2 4 4 4 8v8c0 4 4 6 8 6s8-2 8-6V8c0-4-4-6-8-6z"></path>
                    <circle cx="12" cy="11" r="2"></circle>
                  </svg>
                </div>
                <h5
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'var(--text)',
                  }}
                >
                  {t('home.play_vs_ai')}
                </h5>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('home.ai_desc')}
                </p>
                <span className="card-badge">{t('home.start_now')}</span>
              </button>
            </div>

            <div style={{ display: 'flex' }}>
              <button
                onClick={handlePlayWithFriend}
                className="modern-card hover-lift text-center w-100"
                style={{ border: 'none', background: 'var(--bg)', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div className="play-icon mb-3" style={{ color: '#ec4899' }}>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h5
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'var(--text)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('home.play_friend_title') || 'Play with Friend'}
                </h5>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('home.play_friend_desc') || 'Invite a friend to a match'}
                </p>
                <span className="card-badge">{t('home.invite') || 'Invite'}</span>
              </button>
            </div>

            <div style={{ display: 'flex' }}>
              <button
                onClick={handleTournament}
                className="modern-card hover-lift text-center w-100"
                style={{ border: 'none', background: 'var(--bg)', cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div className="play-icon mb-3" style={{ color: '#f59e0b' }}>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                  </svg>
                </div>
                <h5
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: 'var(--text)',
                  }}
                >
                  {t('home.tournament_title')}
                </h5>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  {t('home.tournament_desc')}
                </p>
                <span
                  className="card-badge"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  {t('home.join_now')}
                </span>
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
                <button
                  onClick={() => navigate('/register')}
                  className="btn btn-primary btn-lg"
                  style={{ fontSize: '1.125rem', padding: '1rem 2.5rem' }}
                >
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
              <div
                className="card-header-modern"
                style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}
              >
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                  <span style={{ marginRight: '0.5rem' }}>🏆</span>
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
                    zIndex: 10,
                  }}
                >
                  {t('home.view_all')} →
                </button>
              </div>
              <div style={{ padding: '1.5rem 0' }}>
                <ol className="list-group list-group-numbered">
                  <li
                    className="list-group-item"
                    style={{
                      border: 'none',
                      color: 'var(--text-muted)',
                      padding: '1rem',
                      textAlign: 'center',
                    }}
                  >
                    {t('leaderboard.empty_message')}
                  </li>
                </ol>
              </div>
            </div>
          </section>
        )}
        {/* Friend Selection Modal */}
        {showFriendModal && (
          <div className="modal-overlay" onClick={() => setShowFriendModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
              <div className="modal-header">
                <h3>{t('home.select_friend') || 'Invite a Player'}</h3>
                <button className="close-btn" onClick={() => setShowFriendModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('home.search_placeholder') || "Search by username..."}
                    value={inviteSearchQuery}
                    onChange={handleInviteSearch}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }}
                  />
                </div>

                {inviteSearchQuery.length > 0 ? (
                  <div className="search-results">
                    {isSearching ? (
                      <p className="text-center text-muted">{t('common.loading') || 'Searching...'}</p>
                    ) : searchResults.length === 0 ? (
                      <p className="text-center text-muted">{t('home.no_results') || 'No users found'}</p>
                    ) : (
                      <div className="friend-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {searchResults.map(user => (
                          <div key={user.id} className="friend-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className={`avatar-circle ${user.online_status ? 'online' : 'offline'}`} style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.2rem' }}>
                                {user.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600' }}>{user.username}</div>
                              </div>
                            </div>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => sendGameInvite(user.id)}
                              disabled={inviting === user.id}
                            >
                              {inviting === user.id ? (t('home.sending') || 'Sending...') : (t('home.invite') || 'Invite')}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <h4 className="mb-3" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>{t('home.your_friends') || 'Your Friends'}</h4>
                    {friends.length === 0 ? (
                      suggestedUsers.length > 0 ? (
                        <>
                          <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>{t('home.no_friends_suggestion') || 'You have no friends yet. Here are some suggested players:'}</p>
                          <div className="friend-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {suggestedUsers.map(user => (
                              <div key={user.id} className="friend-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div className={`avatar-circle ${user.online_status ? 'online' : 'offline'}`} style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.2rem' }}>
                                    {user.username?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '600' }}>{user.username}</div>
                                  </div>
                                </div>
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => sendGameInvite(user.id)}
                                  disabled={inviting === user.id}
                                >
                                  {inviting === user.id ? (t('home.sending') || 'Sending...') : (t('home.invite') || 'Invite')}
                                </button>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-center text-muted">{t('home.no_friends') || 'No friends found. Search above to invite anyone!'}</p>
                      )
                    ) : (
                      <div className="friend-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {friends.map(friend => (
                          <div key={friend.id} className="friend-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className={`avatar-circle ${friend.online_status ? 'online' : 'offline'}`} style={{ width: '40px', height: '40px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.2rem' }}>
                                {friend.username?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: '600' }}>{friend.username}</div>
                                <div style={{ fontSize: '0.8rem', color: friend.online_status ? 'var(--success)' : 'var(--text-muted)' }}>
                                  {friend.online_status ? t('status.online') : t('status.offline')}
                                </div>
                              </div>
                            </div>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => sendGameInvite(friend.id)}
                              disabled={inviting === friend.id}
                            >
                              {inviting === friend.id ? (t('home.sending') || 'Sending...') : (t('home.invite') || 'Invite')}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
