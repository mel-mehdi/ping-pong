import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';

const Navbar = () => {
    const { isAuthenticated, userData, logout } = useAuth();
    const location = useLocation();
    const [theme, setTheme] = useState('light');
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [pendingInvites, setPendingInvites] = useState([]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    useEffect(() => {
        if (isAuthenticated && userData?.userId) {
            loadNotifications();
        }
    }, [isAuthenticated, userData]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const loadNotifications = async () => {
        try {
            const requests = await apiClient.getFriendRequests(userData.userId);
            setNotifications(requests.filter((req) => req.status === 'pending'));
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length >= 2) {
            setIsSearching(true);
            try {
                const results = await apiClient.searchUsers(query);
                // Mock data for demonstration
                const mockUsers = [
                    { id: 1, username: 'ProPlayer123', status: 'online', avatar: '👤' },
                    { id: 2, username: 'PongMaster', status: 'offline', avatar: '🎮' },
                    { id: 3, username: 'GameChampion', status: 'online', avatar: '🏆' },
                    { id: 4, username: 'SpeedDemon', status: 'online', avatar: '⚡' },
                    { id: 5, username: 'TableKing', status: 'offline', avatar: '👑' },
                ];
                const filtered = mockUsers.filter(user => 
                    user.username.toLowerCase().includes(query.toLowerCase())
                );
                setSearchResults(filtered);
                setShowSearchResults(true);
            } catch (error) {
                console.error('Search error:', error);
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
            // TODO: Replace with actual API call
            console.log(`Invite sent to user ${userId} (${username})`);
            setPendingInvites([...pendingInvites, userId]);
        } catch (error) {
            console.error('Error sending invite:', error);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="navbar" role="navigation" aria-label="Main navigation">
                <div className="nav-container">
                    <div className="nav-brand">
                        <h2>PingPong</h2>
                    </div>
                    <ul className="nav-menu">
                        <li>
                            <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
                        </li>
                        <li>
                            <Link to="/game" className={isActive('/game') ? 'active' : ''}>Play</Link>
                        </li>
                        <li>
                            <Link to="/tournament" className={isActive('/tournament') ? 'active' : ''}>Tournaments</Link>
                        </li>
                        <li>
                            <Link to="/leaderboard" className={isActive('/leaderboard') ? 'active' : ''}>Leaderboard</Link>
                        </li>
                        <li>
                            <Link to="/chat" className={isActive('/chat') ? 'active' : ''}>Chat</Link>
                        </li>
                        <li>
                            <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>Profile</Link>
                        </li>
                        {isAuthenticated ? (
                            <li><a href="#" onClick={handleLogout}>Logout</a></li>
                        ) : (
                            <>
                                <li><Link to="/login">Login</Link></li>
                                <li><Link to="/register">Sign Up</Link></li>
                            </>
                        )}
                    </ul>
                    <div className="nav-actions">
                        {isAuthenticated && (
                            <div className="nav-search-wrapper">
                                <div className="nav-search-input-wrapper">
                                    <svg className="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    <input
                                        type="text"
                                        className="nav-search-input"
                                        placeholder="Search players..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                                        onBlur={() => setTimeout(() => setShowSearchResults(false), 300)}
                                        autoComplete="off"
                                    />
                                </div>
                                {showSearchResults && (
                                    <div className="nav-search-results">
                                        {isSearching ? (
                                            <div className="nav-search-loading">Searching...</div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((user) => (
                                                <div key={user.id} className="nav-search-result-item">
                                                    <div className="nav-search-result-info">
                                                        <span className="nav-user-avatar">{user.avatar}</span>
                                                        <div className="nav-user-details">
                                                            <span className="nav-user-name">{user.username}</span>
                                                            <span className={`nav-user-status ${user.status}`}>
                                                                <span className="nav-status-dot"></span>
                                                                {user.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        className={`nav-btn-invite ${pendingInvites.includes(user.id) ? 'pending' : ''}`}
                                                        onClick={() => handleSendInvite(user.id, user.username)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        disabled={pendingInvites.includes(user.id)}
                                                    >
                                                        {pendingInvites.includes(user.id) ? 'Pending' : 'Invite'}
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="nav-search-no-results">No users found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
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
                    <div className="notification-header">Friend Requests</div>
                    <div id="notificationList">
                        {notifications.length === 0 ? (
                            <p className="text-center">No new notifications</p>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} className="notification-item">
                                    {notif.fromName} sent you a friend request
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
