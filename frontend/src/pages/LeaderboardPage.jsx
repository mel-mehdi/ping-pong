import { useState, useEffect } from 'react';
import apiClient from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/leaderboard.css';

const LeaderboardPage = () => {
    const { isBackendAuthenticated } = useAuth();
    const { t } = useLanguage();
    const [timeFilter, setTimeFilter] = useState('all-time');
    
    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = isBackendAuthenticated ? await apiClient.getLeaderboard() : [];
                setLeaderboardData((data || []).map((p, idx) => ({ ...p, rank: idx + 1 })));
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
            }
        };
        loadLeaderboard();
    }, [isBackendAuthenticated]);

    return (
        <>
            <Navbar />
            <main className="main-container">
                <div className="container my-5">
                    <div className="leaderboard-header">
                        <h1>{t('leaderboard.title')}</h1>
                        <p className="text-muted">{t('leaderboard.subtitle')}</p>
                    </div>

                    <div className="leaderboard-filters">
                        <button 
                            className={`filter-btn ${timeFilter === 'all-time' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('all-time')}
                        >
                            {t('leaderboard.filters.all_time')}
                        </button>
                        <button 
                            className={`filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('monthly')}
                        >
                            {t('leaderboard.filters.monthly')}
                        </button>
                        <button 
                            className={`filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('weekly')}
                        >
                            {t('leaderboard.filters.weekly')}
                        </button>
                    </div>

                    <div className="leaderboard-table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>{t('leaderboard.table.rank')}</th>
                                    <th>{t('leaderboard.table.player')}</th>
                                    <th>{t('leaderboard.table.level')}</th>
                                    <th>{t('leaderboard.table.wins')}</th>
                                    <th>{t('leaderboard.table.losses')}</th>
                                    <th>{t('leaderboard.table.win_rate')}</th>
                                    <th>{t('leaderboard.table.points')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map(player => (
                                    <tr key={player.rank} className={player.rank <= 3 ? 'top-three' : ''}>
                                        <td className="rank-cell">
                                            {player.rank === 1 ? (
                                                <svg className="rank-icon rank-1" width="32" height="32" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                                                </svg>
                                            ) : player.rank === 2 ? (
                                                <svg className="rank-icon rank-2" width="32" height="32" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                                                </svg>
                                            ) : player.rank === 3 ? (
                                                <svg className="rank-icon rank-3" width="32" height="32" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#cd7f32" stroke="#a0522d" strokeWidth="1"/>
                                                </svg>
                                            ) : (
                                                <span className="rank-number">{player.rank}</span>
                                            )}
                                        </td>
                                        <td className="player-cell">
                                            <div className="player-info">
                                                {player.badge && <span className="player-badge">{player.badge}</span>}
                                                <span className="player-name">{player.username}</span>
                                            </div>
                                        </td>
                                        <td className="level-cell">
                                            <span className="level-badge">{player.level}</span>
                                        </td>
                                        <td className="wins-cell">{player.wins}</td>
                                        <td className="losses-cell">{player.losses}</td>
                                        <td className="winrate-cell">
                                            <div className="winrate-bar">
                                                <div 
                                                    className="winrate-fill" 
                                                    style={{ width: `${player.winRate}%` }}
                                                ></div>
                                                <span className="winrate-text">{player.winRate}%</span>
                                            </div>
                                        </td>
                                        <td className="points-cell">
                                            <strong>{player.points}</strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="leaderboard-info">
                        <div className="info-card">
                            <h3>{t('leaderboard.info.title')}</h3>
                            <ul>
                                <li>{t('leaderboard.info.win_matches')}</li>
                                <li>{t('leaderboard.info.harder_opponents')}</li>
                                <li>{t('leaderboard.info.streaks')}</li>
                                <li>{t('leaderboard.info.reset_monthly')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default LeaderboardPage;
