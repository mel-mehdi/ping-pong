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
  const [missingApiKey, setMissingApiKey] = useState(false);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        let players = [];

        if (isBackendAuthenticated) {
          // Use time-filtered leaderboard endpoints based on selected filter
          let leaderboardData = [];
          try {
            switch (timeFilter) {
              case 'this-week':
                leaderboardData = await apiClient.getLeaderboardThisWeek();
                break;
              case 'this-month':
                leaderboardData = await apiClient.getLeaderboardThisMonth();
                break;
              case 'all-time':
              default:
                leaderboardData = await apiClient.getLeaderboardAllTime();
                break;
            }
          } catch (err) {
            console.warn('Time-filtered leaderboard not available, falling back to profiles');
          }

          // If time-filtered endpoint returned data, use it
          if (Array.isArray(leaderboardData) && leaderboardData.length > 0) {
            players = leaderboardData.map((p) => {
              const user = p.user || {};
              const wins = p.wins || 0;
              const losses = p.losses || 0;
              const total = wins + losses || 0;
              const winRate = total ? Math.round((wins / total) * 100) : 0;
              return {
                username: user.username || p.username || user.email || 'Unknown',
                level: p.level || user.level || 1,
                wins,
                losses,
                winRate,
                points: p.points || p.rank || wins * 10,
                rank: p.rank || null,
              };
            });
          } else {
            // Fallback: Prefer profiles endpoint (includes wins/losses/rank/level)
            const profiles = await apiClient.getProfiles();
            if (Array.isArray(profiles) && profiles.length > 0) {
              players = profiles.map((p) => {
                const user = p.user || {};
                const wins = p.wins || 0;
                const losses = p.losses || 0;
                const total = wins + losses || 0;
                const winRate = total ? Math.round((wins / total) * 100) : 0;
                return {
                  username: user.username || user.email || 'Unknown',
                  level: p.level || user.level || 1,
                  wins,
                  losses,
                  winRate,
                  points: p.rank || p.points || wins * 10,
                  rank: p.rank || null,
                };
              });
            } else {
              // Fallback to users list
              const users = await apiClient.getAllUsers();
              if (Array.isArray(users) && users.length > 0) {
                players = users.map((u, idx) => ({
                  username: u.username || u.email || 'Unknown',
                  level: u.level || 1,
                  wins: u.wins || 0,
                  losses: u.losses || 0,
                  winRate: u.win_rate || 0,
                  points: (u.wins || 0) * 10,
                  rank: idx + 1,
                }));
              }
            }
          }
        } else {
          // Not authenticated: prefer public /users/ list (doesn't require API key) and fall back
          // to /api/leaderboard/ only if we have an active public API key.
          try {
            const users = await apiClient.getAllUsers();
            if (Array.isArray(users) && users.length > 0) {
              players = users.map((u, idx) => ({
                username: u.username || u.email || 'Unknown',
                level: u.level || 1,
                wins: u.wins || 0,
                losses: u.losses || 0,
                winRate: u.win_rate || 0,
                points: (u.wins || 0) * 10,
                rank: idx + 1,
              }));
            } else {
              // No public users available; try public leaderboard if an API key is set
              const activeKey = apiClient.getActiveApiKey();
              if (activeKey) {
                try {
                  const res = await apiClient.getLeaderboard();
                  const list = res?.leaderboard || res || [];
                  if (Array.isArray(list)) {
                    players = list.map((p, idx) => ({
                      username: p.user?.username || p.username || 'Unknown',
                      level: p.level || p.user?.level || 1,
                      wins: p.wins || 0,
                      losses: p.losses || 0,
                      winRate: p.win_rate || 0,
                      points: p.points || (p.wins || 0) * 10,
                      rank: p.rank || idx + 1,
                    }));
                  }
                } catch (e) {
                  console.warn('public leaderboard not available', e);
                  setMissingApiKey(true);
                  players = [];
                }
              } else {
                setMissingApiKey(true);
                players = [];
              }
            }
          } catch (err) {
            console.warn('getAllUsers failed or not available', err);
            // Try public leaderboard only if API key exists
            const activeKey = apiClient.getActiveApiKey();
            if (activeKey) {
              try {
                const res = await apiClient.getLeaderboard();
                const list = res?.leaderboard || res || [];
                if (Array.isArray(list)) {
                  players = list.map((p, idx) => ({
                    username: p.user?.username || p.username || 'Unknown',
                    level: p.level || p.user?.level || 1,
                    wins: p.wins || 0,
                    losses: p.losses || 0,
                    winRate: p.win_rate || 0,
                    points: p.points || (p.wins || 0) * 10,
                    rank: p.rank || idx + 1,
                  }));
                }
              } catch (e2) {
                console.warn('public leaderboard not available', e2);
                setMissingApiKey(true);
                players = [];
              }
            } else {
              setMissingApiKey(true);
              players = [];
            }
          }
        }

        // Ensure ranks are present and sort by points descending
        players = players.map((p, idx) => ({ ...p, rank: p.rank || idx + 1 }));
        players.sort((a, b) => (b.points || 0) - (a.points || 0));
        players = players.map((p, idx) => ({ ...p, rank: idx + 1 }));

        setLeaderboardData(players);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
    setMissingApiKey(false);
    loadLeaderboard();
  }, [isBackendAuthenticated, timeFilter]);

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
                {leaderboardData.map((player) => (
                  <tr key={player.rank} className={player.rank <= 3 ? 'top-three' : ''}>
                    <td className="rank-cell">
                      {player.rank === 1 ? (
                        <svg
                          className="rank-icon rank-1"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="#fbbf24"
                            stroke="#f59e0b"
                            strokeWidth="1"
                          />
                        </svg>
                      ) : player.rank === 2 ? (
                        <svg
                          className="rank-icon rank-2"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="#94a3b8"
                            stroke="#64748b"
                            strokeWidth="1"
                          />
                        </svg>
                      ) : player.rank === 3 ? (
                        <svg
                          className="rank-icon rank-3"
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            fill="#cd7f32"
                            stroke="#a0522d"
                            strokeWidth="1"
                          />
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
                        <div className="winrate-fill" style={{ width: `${player.winRate}%` }}></div>
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

          {missingApiKey && (
            <div className="leaderboard-warning">
              <p>
                Public leaderboard data is not available. Sign in to view internal rankings, or ask an
                administrator to enable public leaderboard access.
              </p>
              <p style={{ marginTop: '0.5rem' }}>
                <a href="/login" className="btn btn-api small">Sign in</a>
              </p>
            </div>
          )}

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
