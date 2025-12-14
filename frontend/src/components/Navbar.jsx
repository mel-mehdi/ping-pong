import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import apiClient from '../utils/api';
import db from '../utils/database';

const Navbar = () => {
    const { isAuthenticated, isBackendAuthenticated, userData, logout } = useAuth();
    const location = useLocation();
    const [theme, setTheme] = useState('dark');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchSource, setSearchSource] = useState('backend');
    const [pendingInvites, setPendingInvites] = useState([]);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const searchInputRef = useRef(null);
    const navSearchRef = useRef(null);

    useEffect(() => {
        if (!searchExpanded) return;
        const onDocClick = (e) => {
            if (!navSearchRef.current) return;
            if (!navSearchRef.current.contains(e.target)) {
                // click outside -> collapse if no query
                if (!searchQuery) setSearchExpanded(false);
                setShowSearchResults(false);
            }
        };
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setSearchExpanded(false);
                setShowSearchResults(false);
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('mousedown', onDocClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [searchExpanded, searchQuery]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !userData?.userId) return;
        if (!isBackendAuthenticated) {
            // Use mock fallback directly and avoid backend calls to prevent 403
            try {
                const mock = db.getCollection('friendships') || [];
                const pending = mock.filter(f => f.status === 'pending').map(f => ({ id: f.id, fromName: f.fromName || f.from_user?.username || f.from_user || 'Unknown' }));
                setNotifications(pending);
            } catch (err) {
                setNotifications([]);
            }
            return;
        }
        loadNotifications();
    }, [isAuthenticated, userData, isBackendAuthenticated]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const isValidUser = (u) => {
        if (!u || typeof u !== 'object') return false;
        const username = (u.username || '').toString().trim();
        const email = (u.email || '').toString().trim();
        if (!username && !email) return false;
        if (username.length > 50 || email.length > 120) return false;
        const badPattern = /https?:\/\/|www\.|\/.+|=|\?|&|om\/api|\bapi\b/i;
        if (badPattern.test(username) || badPattern.test(email)) return false;
        return true;
    };

    const loadNotifications = async () => {
        try {
            const requests = await apiClient.getFriendRequests(userData.userId);
            setNotifications((requests || []).filter((req) => req.status === 'pending').map(r => ({ id: r.id, fromName: r.fromName || r.from_user?.username || r.from_user || 'Unknown' })));
        } catch (error) {
            console.error('Error loading notifications:', error);
            // Fallback to local mock DB for friend requests
            try {
                const mock = db.getCollection('friendships') || [];
                // Normalize stored friendships to the same shape used by the UI
                const pending = mock.filter(f => f.status === 'pending').map(f => ({ id: f.id, fromName: f.fromName || f.from_user?.username || f.from_user || 'Unknown' }));
                setNotifications(pending);
            } catch (err) {
                console.error('Error loading notifications from mock DB:', err);
            }
        }
    };



    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length >= 1) {
            setIsSearching(true);
            try {
                const isValidUser = (u) => {
                    if (!u || typeof u !== 'object') return false;
                    const username = (u.username || '').toString().trim();
                    const email = (u.email || '').toString().trim();
                    if (!username && !email) return false;
                    if (username.length > 50 || email.length > 120) return false;
                    const badPattern = /https?:\/\/|www\.|\/.+|=|\?|&|om\/api|\bapi\b/i;
                    if (badPattern.test(username) || badPattern.test(email)) return false;
                    return true;
                };

                if (!isBackendAuthenticated) {
                    // Avoid backend calls when not authenticated — use client DB
                    const dbModule = await import('../utils/database');
                    const db = dbModule.default;
                    const all = db.getCollection('users') || [];
                    const q = query.toLowerCase();
                    const fallback = (all || []).filter(u => u && typeof u === 'object' && ((u.username && (u.username || '').toLowerCase().includes(q)) || (u.email && (u.email || '').toLowerCase().includes(q)) || (u.fullname && (u.fullname || '').toLowerCase().includes(q)))).map(u => ({ ...u, id: u.id || u.userId })).filter(isValidUser);
                    // exclude current user from search results
                    const filteredFallback = fallback.filter(u => {
                        if (!userData) return true;
                        const uid = userData.userId || userData.id;
                        if (!uid) return u.username !== userData.username;
                        return (u.id !== uid && u.userId !== uid && u.username !== userData.username && u.email !== userData.email);
                    });

                    setSearchResults(filteredFallback);
                    setSearchSource('mock');
                    setShowSearchResults(true);
                    return;
                }

                const results = await apiClient.searchUsers(query);
                const normalized = (results || []).filter(u => u && typeof u === 'object' && (u.username || u.email)).map(u => ({ ...u, id: u.id || u.userId })).filter(isValidUser);
                // exclude current user from backend results
                const filteredNormalized = normalized.filter(u => {
                    if (!userData) return true;
                    const uid = userData.userId || userData.id;
                    if (!uid) return u.username !== userData.username;
                    return (u.id !== uid && u.userId !== uid && u.username !== userData.username && u.email !== userData.email);
                });

                setSearchResults(filteredNormalized);
                setSearchSource('backend');
                if (filteredNormalized.length === 0) {
                    // backend returned no results; try local DB search directly as a last resort
                    try {
                        const dbModule = await import('../utils/database');
                        const db = dbModule.default;
                        const all = db.getCollection('users') || [];
                        const q = query.toLowerCase();
                        const fallback = (all || []).filter(u => {
                            const username = (u.username || '').toLowerCase();
                            const email = (u.email || '').toLowerCase();
                            const fullname = (u.fullname || '').toLowerCase();
                            return (username && username.includes(q)) || (email && email.includes(q)) || (fullname && fullname.includes(q));
                        }).map(u => ({ ...u, id: u.id || u.userId }));
                        if (fallback.length > 0) {
                            setSearchResults(fallback);
                            setSearchSource('mock');
                        }
                    } catch (err) {
                        // ignore fallback failure
                    }
                }
                setShowSearchResults(true);
            } catch (error) {
                console.error('Search error:', error);
                // Use local DB fallback
                try {
                    const dbModule = await import('../utils/database');
                    const db = dbModule.default;
                    const all = db.getCollection('users') || [];
                    const q = query.toLowerCase();
                    const fallback = (all || []).filter(u => {
                        const username = (u.username || '').toLowerCase();
                        const email = (u.email || '').toLowerCase();
                        const fullname = (u.fullname || '').toLowerCase();
                        return (username && username.includes(q)) || (email && email.includes(q)) || (fullname && fullname.includes(q));
                    }).map(u => ({ ...u, id: u.id || u.userId }));
                    setSearchResults(fallback);
                    setSearchSource('mock');
                    setShowSearchResults(true);
                } catch (err) {
                    console.error('Search fallback DB error:', err);
                }
            } finally {
                setIsSearching(false);
            }
        } else {
            setShowSearchResults(false);
            setSearchResults([]);
        }
    };

    const handleSendInvite = async (userId, username) => {
        try {
            if (!userData) return;
            if (!isBackendAuthenticated) {
                // Save pending invites locally when not backend authenticated
                try {
                    const dbModule = await import('../utils/database');
                    const db = dbModule.default;
                    const friendships = db.getCollection('friendships') || [];
                    friendships.push({ id: db.generateId(), from_user: userData.userId || userData.id, to_user: userId, fromName: userData.username, toName: username, status: 'pending' });
                    db.saveCollection('friendships', friendships);
                } catch (err) {
                    console.error('Error writing local friendship:', err);
                }
                setPendingInvites([...pendingInvites, userId]);
                console.log('Invite saved locally (mock)');
                return;
            }

            await apiClient.sendInvitation(userData.userId, userData.username, userId, username);
            setPendingInvites([...pendingInvites, userId]);
        } catch (error) {
            console.error('Error sending invite:', error);
        }
    };

    const handleAcceptRequest = async (id) => {
        try {
            if (!isBackendAuthenticated) {
                const dbModule = await import('../utils/database');
                const db = dbModule.default;
                const friendships = db.getCollection('friendships') || [];
                const idx = friendships.findIndex(f => f.id === id);
                if (idx !== -1) {
                    friendships[idx].status = 'accepted';
                    db.saveCollection('friendships', friendships);
                    // update local notifications state
                    setNotifications(notifications.filter(n => n.id !== id));
                }
                return;
            }
            await apiClient.updateFriendRequest(id, 'accepted');
            // reload notifications from backend
            loadNotifications();
        } catch (err) {
            console.error('Error accepting friend request:', err);
        }
    };

    const handleDeclineRequest = async (id) => {
        try {
            if (!isBackendAuthenticated) {
                const dbModule = await import('../utils/database');
                const db = dbModule.default;
                const friendships = db.getCollection('friendships') || [];
                const idx = friendships.findIndex(f => f.id === id);
                if (idx !== -1) {
                    friendships[idx].status = 'rejected';
                    db.saveCollection('friendships', friendships);
                    setNotifications(notifications.filter(n => n.id !== id));
                }
                return;
            }
            await apiClient.updateFriendRequest(id, 'rejected');
            loadNotifications();
        } catch (err) {
            console.error('Error declining friend request:', err);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) => location.pathname === path;

    const { t } = useLanguage();

    return (
        <>
            <nav className="navbar" role="navigation" aria-label="Main navigation">
                <div className="nav-container">
                    <div className="nav-brand">
                        <h2>{t('brand')}</h2>
                    </div>
                    <ul className="nav-menu">
                        <li>
                            <Link to="/" className={isActive('/') ? 'active' : ''}>{t('nav.home')}</Link>
                        </li>
                        <li>
                            <Link to="/game" className={isActive('/game') ? 'active' : ''}>{t('nav.play')}</Link>
                        </li>
                        <li>
                            <Link to="/tournament" className={isActive('/tournament') ? 'active' : ''}>{t('nav.tournaments')}</Link>
                        </li>
                        <li>
                            <Link to="/leaderboard" className={isActive('/leaderboard') ? 'active' : ''}>{t('nav.leaderboard')}</Link>
                        </li>
                        <li>
                            <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>{t('nav.chat')}</Link>
                        </li>
                        <li>
                            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>{t('nav.profile')}</Link>
                        </li>
                        {isAuthenticated ? (
                            <li><a href="#" onClick={handleLogout}>{t('nav.logout')}</a></li>
                        ) : (
                            <>
                                <li><Link to="/login">{t('nav.login')}</Link></li>
                                <li><Link to="/register">{t('nav.signup')}</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="nav-actions">
                        {isAuthenticated && (
                            <div className="nav-search-wrapper" ref={navSearchRef}>
                                <div className="nav-search-input-wrapper">
                                    <button
                                        type="button"
                                        className="nav-search-toggle"
                                        aria-label="Open search"
                                        onClick={() => { setSearchExpanded(true); setTimeout(() => searchInputRef.current?.focus(), 0); }}
                                    >
                                        <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.35-4.35"></path>
                                        </svg>
                                    </button>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className={`nav-search-input ${searchExpanded ? 'expanded' : 'collapsed'}`}
                                        placeholder={t('search.placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => { setSearchExpanded(true); searchQuery.length >= 1 && setShowSearchResults(true); }}
                                        onBlur={() => setTimeout(() => { setShowSearchResults(false); if (!searchQuery) setSearchExpanded(false); }, 300)}
                                        onKeyDown={(e) => { if (e.key === 'Escape') { setSearchExpanded(false); searchInputRef.current?.blur(); } }}
                                        autoComplete="off"
                                    />
                                </div>
                                {showSearchResults && (
                                    <div className="nav-search-results">
                                        {isSearching && (
                                            <div className="nav-search-loading">{t('search.searching')}</div>
                                        )}

                                        {!isSearching && searchResults.length > 0 && (
                                            <>
                                                <div style={{ padding: '0.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{searchSource === 'backend' ? t('search.backend_results') : t('search.client_results')}</div>
                                                {searchResults.filter(u => isValidUser(u) && (!userData || (u.username !== userData.username && (u.id || u.userId) !== (userData.userId || userData.id)))).map((user) => (
                                                    <div key={user.id} className="nav-search-result-item">
                                                    <div className="nav-search-result-info">
                                                        {(() => {
                                                            const avatar = user.avatar;
                                                            const isImage = typeof avatar === 'string' && (avatar.startsWith('data:') || avatar.startsWith('http') || avatar.startsWith('//'));
                                                            const fallback = typeof avatar === 'string' && avatar.length <= 3 ? avatar : (user.username ? user.username.slice(0, 2).toUpperCase() : '🙂');
                                                            return (
                                                                <span className="nav-user-avatar">{isImage ? (
                                                                    <img src={avatar} alt={user.username} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                                                                ) : (
                                                                    <span className="nav-avatar-fallback">{fallback}</span>
                                                                )}</span>
                                                            );
                                                        })()}
                                                        <div className="nav-user-details">
                                                            <span className="nav-user-name">{user.username}</span>
                                                            <span className={`nav-user-status ${user.online_status ? 'online' : 'offline'}`}>
                                                                <span className="nav-status-dot"></span>
                                                                {user.online_status ? t('status.online') : t('status.offline')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className={`nav-btn-invite ${pendingInvites.includes(user.id) ? 'pending' : ''}`}
                                                        onClick={() => handleSendInvite(user.id, user.username)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        disabled={pendingInvites.includes(user.id)}
                                                    >
                                                        {pendingInvites.includes(user.id) ? t('invite.pending') : t('invite.invite')}
                                                    </button>
                                                </div>
                                                ))}
                                            </>
                                        )}

                                        {!isSearching && searchResults.filter(isValidUser).length === 0 && (
                                            <div className="nav-search-no-results">{t('search.no_users')}</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                            <LanguageSwitcher />

                            <button
                                className="nav-icon-btn"
                                onClick={toggleTheme}
                                title="Toggle theme"
                                aria-label="Toggle dark mode"
                            >
                            {theme === 'light' ? (
                                <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="5"></circle>
                                    <line x1="12" y1="1" x2="12" y2="3"></line>
                                    <line x1="12" y1="21" x2="12" y2="23"></line>
                                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                    <line x1="1" y1="12" x2="3" y2="12"></line>
                                    <line x1="21" y1="12" x2="23" y2="12"></line>
                                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                                </svg>
                            ) : (
                                <svg className="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                                </svg>
                            )}
                        </button>
                        {isAuthenticated && (
                            <button
                                className="nav-icon-btn"
                                onClick={() => setShowNotifications(!showNotifications)}
                                title="Notifications"
                                aria-label="Notifications"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {notifications.length > 0 && (
                                    <span className="notification-badge">{notifications.length}</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {showNotifications && (
                <div className="notification-panel">
                    <div className="notification-header">{t('notifications.title')}</div>
                    <div id="notificationList">
                        {notifications.length === 0 ? (
                            <p className="text-center">{t('notifications.no_notifications')}</p>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className="notification-item">
                                    <div className="notification-text">{t('notifications.message').replace('{from}', notif.fromName)}</div>
                                    <div className="notification-actions">
                                        <button className="btn btn-sm btn-success" onClick={() => handleAcceptRequest(notif.id)}>{t('notifications.accept')}</button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleDeclineRequest(notif.id)} style={{ marginLeft: '0.5rem' }}>{t('notifications.decline')}</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
