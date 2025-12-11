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
                            <div className="stats-row">
                                <div className="stat-card">
                                    <div className="stat-icon">🎮</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.gamesPlayed}</div>
                                        <div className="stat-label">Games Played</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.wins}</div>
                                        <div className="stat-label">Wins</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">❌</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.losses}</div>
                                        <div className="stat-label">Losses</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.winRate}%</div>
                                        <div className="stat-label">Win Rate</div>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🏆</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{stats.rank}</div>
                                        <div className="stat-label">Rank</div>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section mt-4">
                                <h3>Global Ranking</h3>
                                <div className="ranking-card">
                                    <div className="ranking-info">
                                        <div className="ranking-position">{stats.rank}</div>
                                        <div className="ranking-label">Current Rank</div>
                                    </div>
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
