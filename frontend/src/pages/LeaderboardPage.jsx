import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/leaderboard.css';

const LeaderboardPage = () => {
    const [timeFilter, setTimeFilter] = useState('all-time');
    
    const leaderboardData = [
        { rank: 1, username: 'ProPlayer123', wins: 156, losses: 23, winRate: 87, points: 2450, level: 28 },
        { rank: 2, username: 'PongMaster', wins: 142, losses: 31, winRate: 82, points: 2280, level: 26 },
        { rank: 3, username: 'GameChampion', wins: 138, losses: 35, winRate: 80, points: 2150, level: 25 },
        { rank: 4, username: 'SpeedDemon', wins: 125, losses: 40, winRate: 76, points: 1980, level: 23 },
        { rank: 5, username: 'TableKing', wins: 118, losses: 44, winRate: 73, points: 1850, level: 22 },
        { rank: 6, username: 'AcePaddle', wins: 105, losses: 48, winRate: 69, points: 1720, level: 20 },
        { rank: 7, username: 'BallWizard', wins: 98, losses: 52, winRate: 65, points: 1590, level: 19 },
        { rank: 8, username: 'PongNinja', wins: 89, losses: 55, winRate: 62, points: 1460, level: 18 },
        { rank: 9, username: 'QuickReflexes', wins: 82, losses: 58, winRate: 59, points: 1340, level: 17 },
        { rank: 10, username: 'PlayerTen', wins: 76, losses: 62, winRate: 55, points: 1220, level: 16 },
    ];

    return (
        <>
            <Navbar />
            <main className="main-container">
                <div className="container my-5">
                    <div className="leaderboard-header">
                        <h1>🏆 Global Leaderboard</h1>
                        <p className="text-muted">Compete with the best players worldwide</p>
                    </div>

                    <div className="leaderboard-filters">
                        <button 
                            className={`filter-btn ${timeFilter === 'all-time' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('all-time')}
                        >
                            All Time
                        </button>
                        <button 
                            className={`filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('monthly')}
                        >
                            This Month
                        </button>
                        <button 
                            className={`filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('weekly')}
                        >
                            This Week
                        </button>
                    </div>

                    <div className="leaderboard-table-container">
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Level</th>
                                    <th>Wins</th>
                                    <th>Losses</th>
                                    <th>Win Rate</th>
                                    <th>Points</th>
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
                            <h3>📊 How Rankings Work</h3>
                            <ul>
                                <li>Win matches to earn points and climb the ranks</li>
                                <li>Higher difficulty opponents give more points</li>
                                <li>Win streaks provide bonus multipliers</li>
                                <li>Rankings reset monthly for seasonal competition</li>
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
