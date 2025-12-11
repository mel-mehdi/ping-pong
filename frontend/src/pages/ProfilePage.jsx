import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/profile.css';

const ProfilePage = () => {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    
    const stats = {
        gamesPlayed: 42,
        wins: 28,
        losses: 14,
        winRate: 67,
        rank: '#127',
        level: 15
    };

    const recentMatches = [
        { id: 1, opponent: 'Player One', score: '11-7', result: 'win', date: '2 hours ago' },
        { id: 2, opponent: 'Player Two', score: '9-11', result: 'loss', date: '5 hours ago' },
        { id: 3, opponent: 'Player Three', score: '11-5', result: 'win', date: '1 day ago' },
        { id: 4, opponent: 'Player Four', score: '11-8', result: 'win', date: '2 days ago' },
    ];

    const achievements = [
        { id: 1, title: 'First Win', icon: '🏆', earned: true },
        { id: 2, title: '10 Win Streak', icon: '🔥', earned: true },
        { id: 3, title: 'Tournament Winner', icon: '👑', earned: false },
        { id: 4, title: '100 Games', icon: '🎯', earned: false },
        { id: 5, title: 'Perfect Game', icon: '💯', earned: true },
        { id: 6, title: 'Speed Demon', icon: '⚡', earned: true },
        { id: 7, title: 'Master Player', icon: '🎖️', earned: false },
        { id: 8, title: 'Comeback King', icon: '🔄', earned: true },
        { id: 9, title: 'Veteran', icon: '⭐', earned: false },
        { id: 10, title: 'Unbeatable', icon: '🛡️', earned: false },
        { id: 11, title: 'First Blood', icon: '🩸', earned: true },
        { id: 12, title: 'Hat Trick', icon: '🎩', earned: true },
        { id: 13, title: 'Marathon', icon: '🏃', earned: false },
        { id: 14, title: 'Sharp Shooter', icon: '🎲', earned: true },
        { id: 15, title: 'Social Butterfly', icon: '🦋', earned: false },
        { id: 16, title: 'Night Owl', icon: '🦉', earned: true },
    ];

    return (
        <>
            <Navbar />
            <main className="profile-view">
                <div className="profile-container">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {userData?.username ? userData.username[0].toUpperCase() : 'U'}
                            </div>
                        </div>
                        <h1 className="profile-username">{userData?.username || 'Player'}</h1>
                        <p className="profile-email">{userData?.email || 'player@example.com'}</p>
                        <div className="profile-level">
                            <span className="level-badge">Level {stats.level}</span>
                        </div>
                        <button className="btn-edit-profile">
                            <svg className="edit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                    </div>

                    <div className="profile-tabs">
                        <button 
                            className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`profile-tab ${activeTab === 'matches' ? 'active' : ''}`}
                            onClick={() => setActiveTab('matches')}
                        >
                            Match History
                        </button>
                        <button 
                            className={`profile-tab ${activeTab === 'achievements' ? 'active' : ''}`}
                            onClick={() => setActiveTab('achievements')}
                        >
                            Achievements
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="profile-content">
                            <div className="achievements-grid">
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#667eea'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                                            <line x1="7" y1="2" x2="7" y2="22"></line>
                                            <line x1="17" y1="2" x2="17" y2="22"></line>
                                            <line x1="2" y1="12" x2="22" y2="12"></line>
                                            <line x1="2" y1="7" x2="7" y2="7"></line>
                                            <line x1="2" y1="17" x2="7" y2="17"></line>
                                            <line x1="17" y1="17" x2="22" y2="17"></line>
                                            <line x1="17" y1="7" x2="22" y2="7"></line>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.gamesPlayed}</div>
                                    <div className="achievement-title">Games Played</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#10b981'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.wins}</div>
                                    <div className="achievement-title">Wins</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#ef4444'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.losses}</div>
                                    <div className="achievement-title">Losses</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#f59e0b'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="20" x2="12" y2="10"></line>
                                            <line x1="18" y1="20" x2="18" y2="4"></line>
                                            <line x1="6" y1="20" x2="6" y2="16"></line>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.winRate}%</div>
                                    <div className="achievement-title">Win Rate</div>
                                </div>
                                <div className="achievement-card">
                                    <div className="achievement-icon" style={{color: '#fbbf24'}}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                                            <path d="M4 22h16"></path>
                                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                                        </svg>
                                    </div>
                                    <div className="stat-value">{stats.rank}</div>
                                    <div className="achievement-title">Rank</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="profile-content">
                            <div className="match-history">
                                {recentMatches.map(match => (
                                    <div key={match.id} className="match-item">
                                        <div className="match-result">
                                            <span className={`result-badge ${match.result}`}>
                                                {match.result === 'win' ? '✓' : '✗'}
                                            </span>
                                        </div>
                                        <div className="match-details">
                                            <div className="match-opponent">vs {match.opponent}</div>
                                            <div className="match-score">{match.score}</div>
                                        </div>
                                        <div className="match-date">{match.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="profile-content">
                            <div className="achievements-grid">
                                {achievements.map(achievement => (
                                    <div key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}>
                                        <div className="achievement-icon">{achievement.icon}</div>
                                        <div className="achievement-title">{achievement.title}</div>
                                        {!achievement.earned && (
                                            <div className="achievement-locked">🔒</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProfilePage;
