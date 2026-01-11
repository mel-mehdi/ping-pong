import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import apiClient from '../utils/api';
import { buildWsUrl, wsLog } from '../utils/wss';

const Navbar = () => {
    const { isAuthenticated, isBackendAuthenticated, userData, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchSource, setSearchSource] = useState('backend');
    const [pendingInvites, setPendingInvites] = useState([]);
    const [friends, setFriends] = useState([]);
    const [isLoadingFriendships, setIsLoadingFriendships] = useState(false);
    const searchInputRef = useRef(null);
    const [searchExpanded, setSearchExpanded] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const MAX_SEARCH_RESULTS = 8;

    // Defer focus work to avoid long synchronous handlers on focus events
    const handleSearchFocus = () => {
        setTimeout(() => {
            setSearchExpanded(true);
            if (searchQuery.length >= 1) setShowSearchResults(true);
        }, 0);
    };

    const handleSearchBlur = () => {
        setTimeout(() => {
            setShowSearchResults(false);
            if (!searchQuery) setSearchExpanded(false);
        }, 300);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const loadNotifications = useCallback(async () => {
        if (!userData?.userId || !isBackendAuthenticated) {
            setNotifications([]);
            return;
        }
        
        try {
            // Get pending friend requests and game invitations
            const friendRequests = await apiClient.getPendingFriendRequests();
            const gameInvites = await apiClient.getPendingGameInvitations();
            
            const allNotifications = [
                ...(friendRequests || []).map(req => ({ 
                    id: req.id,
                    senderId: req.from_user?.id,
                    fromName: req.from_user?.username || req.from_user?.fullname || 'Unknown',
                    type: 'friend_request',
                    backendType: 'friendship'
                })),
                ...(gameInvites || []).map(inv => ({
                    id: inv.id,
                    senderId: inv.sender?.id,
                    fromName: inv.sender?.username || inv.sender?.fullname || 'Unknown',
                    type: 'game_invite',
                    backendType: 'game_invitation'
                }))
            ];

            // Debug: warn if ids collide across types which could confuse UI
            try {
              const idMap = {};
              allNotifications.forEach(n => {
                const key = `${n.id}`;
                if (!idMap[key]) idMap[key] = new Set();
                idMap[key].add(n.type);
              });
              Object.entries(idMap).forEach(([k, set]) => {
                if (set.size > 1) {
                  // eslint-disable-next-line no-console
                  console.warn('[NOTIF] id collision across types for id', k, Array.from(set));
                }
              });
            } catch (e) { /* ignore */ }
            
            setNotifications(allNotifications);
        } catch (err) {
            // Error loading notifications
            setNotifications([]);
        }
    }, [userData, isBackendAuthenticated]);

    const loadFriendships = useCallback(async () => {
        if (!userData?.userId || !isBackendAuthenticated) {
            setPendingInvites([]);
            setFriends([]);
            setIsLoadingFriendships(false);
            return;
        }
        
        setIsLoadingFriendships(true);
        try {
            // Load sent friend requests and accepted friendships
            const [sentRequests, friendships] = await Promise.all([
                apiClient.getSentFriendRequests(),
                apiClient.getMyFriends()
            ]);
            
            // Add IDs of users we've sent requests to
            const pendingUserIds = (sentRequests || []).map(req => req.to_user?.id).filter(Boolean);
            
            // Add IDs of users who are already friends
            const friendUserIds = (friendships || []).map(fs => {
                // If the API returns friendship objects (with from_user/to_user), derive the other user's id
                if (fs && (fs.from_user || fs.to_user)) {
                    const myId = userData.userId || userData.id;
                    const otherUser = (fs.from_user?.id === myId || fs.from_user?.userId === myId) ? fs.to_user : fs.from_user;
                    return otherUser?.id || otherUser?.userId;
                }
                // Otherwise, if the API returned user objects directly, use their id
                return fs?.id || fs?.userId;
            }).filter(Boolean);
            
            setPendingInvites(pendingUserIds);
            setFriends(friendUserIds);
        } catch (err) {
            // Silently handle friendship loading errors during search
        } finally {
            setIsLoadingFriendships(false);
        }
    }, [userData, isBackendAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated || !userData?.userId) return;
        if (!isBackendAuthenticated) {
            // No backend auth — don't load notifications
            setNotifications([]);
            return;
        }
        loadNotifications();
        loadFriendships();
    }, [isAuthenticated, userData, isBackendAuthenticated, loadNotifications, loadFriendships]);

    useEffect(() => {
        if (!isAuthenticated || !userData?.userId || !isBackendAuthenticated) return;

        const wsUrl = buildWsUrl('/ws/notifications/');
        
        let ws = null;
        let isClosed = false;

        try {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                wsLog('[WSS][Navbar] open', wsUrl);
            };

            ws.onerror = (err) => {
                wsLog('[WSS][Navbar] error', err);
            };

            ws.onclose = (ev) => {
                wsLog('[WSS][Navbar] close', ev);
            };

            ws.onmessage = (event) => {
                // Defer processing to avoid blocking the main thread
                const processMessage = () => {
                    const t0 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
                    try {
                        const data = JSON.parse(event.data);
                        
                        if (data.type === 'game_invite_accepted') {
                            navigate('/game?mode=online');
                            const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
                            if (typeof wsLog !== 'undefined' && (t1 - t0) > 50) wsLog('[WSS][Navbar] processMessage took', (t1 - t0).toFixed(1), 'ms');
                            return;
                        }

                        if (data.type === 'new_notification') {
                            const notif = data.notification;
                            
                            let newNotif = null;
                            
                            if (notif.game_invitation) {
                                newNotif = {
                                    id: notif.game_invitation.id,
                                    senderId: notif.related_user?.id,
                                    fromName: notif.related_user?.username || 'Unknown',
                                    type: 'game_invite',
                                    backendType: 'game_invitation'
                                };
                            } else if (notif.friend_request_id || notif.type === 'friend_request_received') {
                                newNotif = {
                                    id: notif.friend_request_id || notif.id,
                                    senderId: notif.related_user?.id,
                                    fromName: notif.related_user?.username || notif.from_user || 'Unknown',
                                    type: 'friend_request',
                                    backendType: 'friendship'
                                };
                            } else if (notif.type === 'friend_request_accepted') {
                                // Friend request accepted - reload friendships to update UI
                                loadFriendships();
                                // Don't show as notification badge, just update state
                                return;
                            } else if (notif.type === 'achievement_unlocked' && notif.achievement) {
                                newNotif = {
                                    id: notif.id,
                                    achievementName: notif.achievement.name,
                                    achievementDesc: notif.achievement.description,
                                    achievementIcon: notif.achievement.icon,
                                    xpReward: notif.achievement.xp_reward,
                                    type: 'achievement_unlocked',
                                    timestamp: Date.now()
                                };
                                // Trigger profile refresh event
                                window.dispatchEvent(new Event('achievementUnlocked'));
                                // Auto-dismiss achievement notifications after 5 seconds
                                setTimeout(() => {
                                    setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                }, 5000);
                            }

                            if (newNotif) {
                                setNotifications(prev => {
                                    if (prev.some(n => n.id === newNotif.id && n.type === newNotif.type)) return prev;
                                    return [newNotif, ...prev];
                                });
                            }
                        }
                    } catch (err) {
                        // Error processing notification
                    }
                    const t1 = (typeof performance !== 'undefined') ? performance.now() : Date.now();
                    if (typeof wsLog !== 'undefined' && (t1 - t0) > 50) wsLog('[WSS][Navbar] processMessage took', (t1 - t0).toFixed(1), 'ms');
                };
                
                // Use requestIdleCallback to defer processing, or setTimeout as fallback
                if (typeof requestIdleCallback !== 'undefined') {
                    requestIdleCallback(processMessage, { timeout: 100 });
                } else {
                    setTimeout(processMessage, 0);
                }
            };

            ws.onerror = () => {
                // Silently handle connection errors
            };

            ws.onclose = () => {
                isClosed = true;
            };
        } catch (err) {
            // Silently handle WebSocket creation errors
        }

        return () => {
            isClosed = true;
            if (ws) {
                try {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    } else if (ws.readyState === WebSocket.CONNECTING) {
                        // Wait for connection to open before closing
                        ws.onopen = () => ws.close();
                    }
                } catch (err) {
                    // Silently handle close errors
                }
            }
        };
    }, [isAuthenticated, userData, isBackendAuthenticated, navigate]);

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
        if (!username && !email || username.length > 50 || email.length > 120) return false;
        const badPattern = /https?:\/\/|www\.|\/.+|=|\?|&|om\/api|\bapi\b/i;
        return !badPattern.test(username) && !badPattern.test(email);
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        
        if (query.trim().length < 1) {
            setShowSearchResults(false);
            setSearchResults([]);
            return;
        }

        if (!isBackendAuthenticated) {
            setSearchResults([]);
            setSearchSource('none');
            return;
        }

        setIsSearching(true);
        setShowSearchResults(true);
        
        try {        
            // Refresh friendships when searching to ensure button states are accurate
            await loadFriendships();
            
            const results = await apiClient.searchUsers(query);
            const uid = userData?.userId || userData?.id;
            const filtered = (results || [])
                .filter(u => u && (u.username || u.email))
                .map(u => ({ ...u, id: u.id || u.userId }))
                .filter(isValidUser)
                .filter(u => u.id !== uid && u.userId !== uid);

            setSearchResults(filtered);
            setSearchSource('backend');
            setShowSearchResults(true);
        } catch (error) {
            setSearchResults([]);
            setSearchSource('none');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendInvite = async (userId, username) => {
        if (!userData || !isBackendAuthenticated) return;
        
        // Don't send if already friends or already pending
        if (friends.includes(userId) || pendingInvites.includes(userId)) {
            return;
        }
        
        try {
            await apiClient.sendFriendRequest(userData.userId, userData.username, userId, username);
            setPendingInvites([...pendingInvites, userId]);
        } catch (error) {
            // Check if it's an "already exists" error (400)
            if (error.status === 400) {
                if (error.message?.includes('already friends')) {
                    // Already friends - add to friends list and reload to sync
                    setFriends([...friends, userId]);
                    loadFriendships(); // Reload to ensure sync
                } else if (error.message?.includes('already exists')) {
                    // Already pending - mark as pending in UI and reload
                    setPendingInvites([...pendingInvites, userId]);
                    loadFriendships(); // Reload to ensure sync
                }
            } else {
                // Other errors - silently ignore to avoid spamming console during search
            }
        }
    };

    const handleAcceptRequest = async (notification) => {
        // Debug log for investigation
        // eslint-disable-next-line no-console
        console.debug('[NOTIF] accept clicked', notification);

        if (!isBackendAuthenticated) return;
        
        try {
            // Prefer the explicit backendType when branching (safer against naming mismatches)
            if (notification.backendType === 'game_invitation' || notification.type === 'game_invite') {
                const res = await apiClient.respondToInvitation(notification.id, 'accepted');
                // Only navigate after the server confirms acceptance
                if (res) {
                    setShowNotifications(false);
                    navigate('/game?mode=online');
                }
            } else if (notification.backendType === 'friendship' || notification.type === 'friend_request') {
                await apiClient.acceptFriendRequest(notification.id);
                // Trigger event to refresh friends list in chat
                window.dispatchEvent(new Event('friendAccepted'));
                // Reload friendships to update state (move from pending to friends)
                await loadFriendships();
            } else {
                // Unknown notification type - don't take action
                // eslint-disable-next-line no-console
                console.warn('[NOTIF] unknown accept type', notification);
            }
            
            loadNotifications();
        } catch (err) {
            // Error accepting request
            // eslint-disable-next-line no-console
            console.error('[NOTIF] accept failed', err, notification);
        }
    };

    const handleDeclineRequest = async (notification) => {
        if (!isBackendAuthenticated) return;
        
        try {
            if (notification.type === 'game_invite') {
                await apiClient.respondToInvitation(notification.id, 'declined');
            } else if (notification.type === 'friend_request') {
                await apiClient.rejectFriendRequest(notification.id);
                // Reload friendships after rejecting
                loadFriendships();
            }
            loadNotifications();
        } catch (err) {
            // Error declining request
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
                    <Link to="/" className="nav-brand">
                        <svg className="nav-brand-icon" width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect x="4" y="4" width="24" height="24" rx="8" fill="currentColor" opacity="0.1"/>
                            <path d="M8 16h16M16 8v16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                            <circle cx="16" cy="16" r="3" fill="currentColor"/>
                        </svg>
                        <span className="nav-brand-text">{t('brand')}</span>
                    </Link>
                    <ul className="nav-menu">
                        <li>
                            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                </svg>
                                <span>{t('nav.home')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/game" className={`nav-link ${isActive('/game') ? 'active' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="7" width="20" height="15" rx="2"/>
                                    <polyline points="17 2 12 7 7 2"/>
                                </svg>
                                <span>{t('nav.play')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/tournament" className={`nav-link ${isActive('/tournament') ? 'active' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                    <path d="M4 22h16"/>
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                                </svg>
                                <span>{t('nav.tournaments')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6"/>
                                    <line x1="8" y1="12" x2="21" y2="12"/>
                                    <line x1="8" y1="18" x2="21" y2="18"/>
                                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                                </svg>
                                <span>{t('nav.leaderboard')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/chat" className={`nav-link ${isActive('/chat') ? 'active' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                                <span>{t('nav.chat')}</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                    <circle cx="12" cy="7" r="4"/>
                                </svg>
                                <span>{t('nav.profile')}</span>
                            </Link>
                        </li>
                        {!isAuthenticated && (
                            <>
                                <li><Link to="/login" className="nav-link">{t('nav.login')}</Link></li>
                                <li><Link to="/register" className="nav-link nav-link-cta">{t('nav.signup')}</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="nav-actions">
                        {isAuthenticated && (
                            <div className="nav-search-wrapper">
                                <div className={`nav-search-input-wrapper ${searchExpanded ? 'search-expanded' : ''}`}>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className={`nav-search-input small ${searchExpanded ? 'expanded' : ''}`}
                                        placeholder={t('search.placeholder')}
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={handleSearchFocus}
                                        onBlur={handleSearchBlur}
                                        onKeyDown={(e) => { if (e.key === 'Escape') { e.currentTarget.blur(); setShowSearchResults(false); setSearchExpanded(false); } }}
                                        autoComplete="off"
                                    />
                                    <button
                                        type="button"
                                        className="nav-search-toggle nav-icon-btn"
                                        aria-label="Open search"
                                        aria-expanded={searchExpanded}
                                        onClick={() => { setSearchExpanded(true); setTimeout(() => searchInputRef.current?.focus(), 0); }}
                                    >
                                        <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <path d="m21 21-4.35-4.35"></path>
                                        </svg>
                                    </button>
                                </div>
                                {showSearchResults && (
                                    <div className="nav-search-results">
                                        {isSearching && (
                                            <div className="nav-search-loading">{t('search.searching')}</div>
                                        )}

                                        {!isSearching && searchResults.length > 0 && (
                                            <>
                                                <div style={{ padding: '0.25rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{searchSource === 'backend' ? t('search.backend_results') : t('search.client_results')}</div>
                                                {searchResults.filter(u => isValidUser(u) && (!userData || (u.username !== userData.username && (u.id || u.userId) !== (userData.userId || userData.id)))).slice(0, MAX_SEARCH_RESULTS).map((user) => (
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
                                                    {friends.includes(user.id) ? (
                                                        <button className="nav-btn-friend" disabled>
                                                            {t('invite.friend') || 'Friend'}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className={`nav-btn-invite ${pendingInvites.includes(user.id) ? 'pending' : ''}`}
                                                            onClick={() => handleSendInvite(user.id, user.username)}
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            disabled={isLoadingFriendships || pendingInvites.includes(user.id)}
                                                        >
                                                            {isLoadingFriendships ? '...' : pendingInvites.includes(user.id) ? t('invite.pending') : t('invite.invite')}
                                                        </button>
                                                    )}
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
                        {isAuthenticated && (
                            <button
                                className="nav-icon-btn nav-logout-btn"
                                onClick={handleLogout}
                                title={t('nav.logout')}
                                aria-label={t('nav.logout')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </button>
                        )}
                        <button 
                            className="nav-mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {mobileMenuOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="nav-mobile-menu">
                        <Link to="/" className={`nav-mobile-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                <polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                            <span>{t('nav.home')}</span>
                        </Link>
                        <Link to="/game" className={`nav-mobile-link ${isActive('/game') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="15" rx="2"/>
                                <polyline points="17 2 12 7 7 2"/>
                            </svg>
                            <span>{t('nav.play')}</span>
                        </Link>
                        <Link to="/tournament" className={`nav-mobile-link ${isActive('/tournament') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                                <path d="M4 22h16"/>
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
                            </svg>
                            <span>{t('nav.tournaments')}</span>
                        </Link>
                        <Link to="/leaderboard" className={`nav-mobile-link ${isActive('/leaderboard') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="8" y1="6" x2="21" y2="6"/>
                                <line x1="8" y1="12" x2="21" y2="12"/>
                                <line x1="8" y1="18" x2="21" y2="18"/>
                                <line x1="3" y1="6" x2="3.01" y2="6"/>
                                <line x1="3" y1="12" x2="3.01" y2="12"/>
                                <line x1="3" y1="18" x2="3.01" y2="18"/>
                            </svg>
                            <span>{t('nav.leaderboard')}</span>
                        </Link>
                        <Link to="/chat" className={`nav-mobile-link ${isActive('/chat') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>{t('nav.chat')}</span>
                        </Link>
                        <Link to="/profile" className={`nav-mobile-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span>{t('nav.profile')}</span>
                        </Link>
                        {!isAuthenticated && (
                            <>
                                <Link to="/login" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                                        <polyline points="10 17 15 12 10 7"/>
                                        <line x1="15" y1="12" x2="3" y2="12"/>
                                    </svg>
                                    <span>{t('nav.login')}</span>
                                </Link>
                                <Link to="/register" className="nav-mobile-link nav-mobile-link-cta" onClick={() => setMobileMenuOpen(false)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="8.5" cy="7" r="4"/>
                                        <line x1="20" y1="8" x2="20" y2="14"/>
                                        <line x1="23" y1="11" x2="17" y2="11"/>
                                    </svg>
                                    <span>{t('nav.signup')}</span>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </nav>

            {showNotifications && (
                <div className="notification-panel">
                    <div className="notification-header">{t('notifications.title')}</div>
                    <div id="notificationList">
                        {notifications.length === 0 ? (
                            <p className="text-center">{t('notifications.no_notifications')}</p>
                        ) : (
                            notifications.map((notif) => (
                                <div key={`${notif.type}-${notif.id}`} className={`notification-item ${notif.type === 'achievement_unlocked' ? 'achievement-notification' : ''}`}>
                                    <div className="notification-text">
                                        {notif.type === 'achievement_unlocked' ? (
                                            <div className="achievement-content">
                                                <span className="achievement-icon">{notif.achievementIcon || '🏆'}</span>
                                                <div className="achievement-details">
                                                    <strong>Achievement Unlocked!</strong>
                                                    <div className="achievement-name">{notif.achievementName}</div>
                                                    <div className="achievement-desc">{notif.achievementDesc}</div>
                                                    <div className="achievement-xp">+{notif.xpReward} XP</div>
                                                </div>
                                            </div>
                                        ) : notif.type === 'game_invite' ? (
                                            `${notif.fromName} invited you to play!`
                                        ) : (
                                            t('notifications.message').replace('{from}', notif.fromName)
                                        )}
                                    </div>
                                    {notif.type !== 'achievement_unlocked' && (
                                        <div className="notification-actions">
                                            <button className="btn btn-sm btn-success" onClick={() => handleAcceptRequest(notif)}>{t('notifications.accept')}</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => handleDeclineRequest(notif)} style={{ marginLeft: '0.5rem' }}>{t('notifications.decline')}</button>
                                        </div>
                                    )}
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
