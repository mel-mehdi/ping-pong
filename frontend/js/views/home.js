/**
 * Home View Module
 * Renders the home page with dashboard, leaderboard, and game options
 */

import { STORAGE_KEYS } from '../utils/constants.js';
import { getItem } from '../utils/storage.js';
import { renderNavbar } from '../components/navbar.js';

export class HomeView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        const isLoggedIn = !!userData;
        const username = userData?.username || 'Guest';
        
        this.app.appContainer.innerHTML = `
            ${renderNavbar('home')}

            <!-- Netflix-Style Search Overlay -->
            <div class="search-overlay hidden" id="searchOverlay">
                <div class="search-overlay-content">
                    <button class="search-close-btn" id="closeSearchOverlay" aria-label="Close search">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="search-box">
                        <i class="fas fa-search search-icon"></i>
                        <input 
                            type="text" 
                            class="search-input-main" 
                            id="mainSearchInput"
                            placeholder="Search players, games, tournaments..."
                            autocomplete="off"
                        />
                    </div>
                    <div class="search-results-container" id="mainSearchResults">
                        <div class="search-placeholder">
                            <i class="fas fa-search search-placeholder-icon"></i>
                            <p>Start typing to search</p>
                        </div>
                    </div>
                </div>
            </div>

            <main class="main-container" role="main">
                <!-- Welcome Section -->
                <section class="welcome-section">
                    <h1 class="welcome-title">Welcome to FT Transcendence</h1>
                    <p class="welcome-text">
                        Play Pong online, join tournaments, chat with friends, and compete for the top rank.
                    </p>
                </section>

                ${isLoggedIn ? `
                <!-- Dashboard Stats Section -->
                <section class="dashboard-grid" aria-label="Quick stats">
                    <article class="dashboard-card">
                        <div class="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg></div>
                        <h3>Quick Match</h3>
                        <p>Start a game instantly</p>
                        <button id="quickMatchBtn" class="btn btn-primary" aria-label="Start playing now">Play Now</button>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg></div>
                        <h3>Total Wins</h3>
                        <p class="big-number" aria-label="wins">0</p>
                        <p class="sub-text">Keep playing!</p>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg></div>
                        <h3>Win Rate</h3>
                        <p class="big-number" aria-label="win rate">0%</p>
                        <p class="sub-text">Play more games</p>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                        <h3>Ranking</h3>
                        <p class="big-number" aria-label="Rank">-</p>
                        <p class="sub-text">Start competing!</p>
                    </article>
                </section>
                ` : ''}

                <!-- Play Options -->
                <section class="play-section">
                    <h2 class="section-title">Play Options</h2>
                    <div class="play-options-grid">
                        <button id="quickPlayBtn" class="play-option-card">
                            <div class="play-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
                            <h3>Play Pong</h3>
                            <p>Local Game (2 Players)</p>
                        </button>
                        
                        <button id="onlinePlayBtn" class="play-option-card">
                            <div class="play-icon"><i class="fas fa-globe"></i></div>
                            <h3>Online Game</h3>
                            <p>Play against others online</p>
                        </button>
                        
                        <button id="tournamentBtn" class="play-option-card">
                            <div class="play-icon"><i class="fas fa-trophy"></i></div>
                            <h3>Tournament Mode</h3>
                            <p>Compete in brackets</p>
                        </button>
                    </div>
                </section>

                <!-- Tournament Preview -->
                <section class="tournament-preview-section">
                    <div class="section-header">
                        <h2 class="section-title">Tournament</h2>
                    </div>
                    <div class="tournament-preview-card">
                        <div class="tournament-info">
                            <h3>Upcoming Tournaments</h3>
                            <p>Join and compete with other players to become the champion!</p>
                            <ul class="tournament-features">
                                <li>• Single elimination brackets</li>
                                <li>• 4, 8, or 16 players</li>
                                <li>• Track match history</li>
                            </ul>
                        </div>
                        <button id="startTournamentBtn" class="btn btn-primary btn-large">Start a Tournament</button>
                    </div>
                </section>

                <!-- Leaderboard with Recent Activity -->
                <section class="dashboard-section">
                    <article class="card">
                        <header class="card-header">
                            <h2>Leaderboard</h2>
                        </header>
                        <div class="card-body">
                            <ol class="leaderboard" aria-label="Top players" id="leaderboardList">
                                <li class="text-muted">No players yet. Be the first to play!</li>
                            </ol>
                        </div>
                    </article>

                    ${isLoggedIn ? `
                    <article class="card">
                        <header class="card-header">
                            <h2><i class="fas fa-clipboard-list"></i> Recent Activity</h2>
                        </header>
                        <div class="card-body">
                            <ul class="activity-list" aria-label="Your recent activities" id="activityList">
                                <li class="text-muted">No recent activity</li>
                            </ul>
                        </div>
                    </article>
                    ` : ''}
                </section>

                <!-- Extra Info Section -->
                <section class="extra-info-section">
                    <div class="info-cards-grid">
                        <div class="info-card-small">
                            <div class="info-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                            <h3>Chat</h3>
                            <p>Connect with players</p>
                        </div>
                        <div class="info-card-small">
                            <div class="info-icon"><i class="fas fa-user-friends"></i></div>
                            <h3>Friends</h3>
                            <p>Build your network</p>
                        </div>
                        <div class="info-card-small">
                            <div class="info-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                            <h3>Achievements</h3>
                            <p>Unlock rewards</p>
                        </div>
                        <div class="info-card-small">
                            <div class="info-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg></div>
                            <h3>Statistics</h3>
                            <p>Track your progress</p>
                        </div>
                    </div>
                </section>

                <!-- Game Info -->
                <section class="game-info-section">
                    <h2 class="section-title">How to Play</h2>
                    <div class="game-info-grid">
                        <div class="info-card">
                            <h3><i class="fas fa-bolt"></i> Fair Play</h3>
                            <p>Equal paddle sizes, speeds, and physics for all players</p>
                        </div>
                        <div class="info-card">
                            <h3>Simple Controls</h3>
                            <p>Player 1: W/S keys | Player 2: I/K keys</p>
                        </div>
                        <div class="info-card">
                            <h3><i class="fas fa-medal"></i> Tournament Brackets</h3>
                            <p>Enter names, play matches, crown a champion</p>
                        </div>
                    </div>
                </section>
            </main>
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        const isLoggedIn = !!userData;

        // Navigation
        const navPlayBtn = document.getElementById('navPlayBtn');
        if (navPlayBtn) {
            navPlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!isLoggedIn) {
                    window.location.href = 'login.html';
                    return;
                }
                this.app.loadView('game');
            });
        }

        // Quick match button
        const quickMatchBtn = document.getElementById('quickMatchBtn');
        if (quickMatchBtn) {
            quickMatchBtn.addEventListener('click', () => {
                if (!isLoggedIn) {
                    window.location.href = 'login.html';
                    return;
                }
                this.app.loadView('game');
            });
        }

        // Play options
        document.getElementById('quickPlayBtn')?.addEventListener('click', () => {
            if (!isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            this.app.loadView('game');
        });

        document.getElementById('onlinePlayBtn')?.addEventListener('click', () => {
            if (!isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            alert('Online game mode coming soon!');
        });

        document.getElementById('tournamentBtn')?.addEventListener('click', () => {
            if (!isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            this.app.loadView('tournament');
        });

        document.getElementById('startTournamentBtn')?.addEventListener('click', () => {
            if (!isLoggedIn) {
                window.location.href = 'login.html';
                return;
            }
            this.app.loadView('tournament');
        });

        // Initialize search
        this.app.initNavbarSearch();
        this.app.initNetflixSearch();

        // Load dynamic data from database
        this.loadLeaderboard();
        if (userData) {
            this.loadUserStats();
            this.loadRecentActivity();
        }
    }

    /**
     * Load leaderboard from database
     */
    loadLeaderboard() {
        import('../utils/database.js').then(module => {
            const db = module.default;
            const users = db.find('users')
                .sort((a, b) => (b.wins || 0) - (a.wins || 0))
                .slice(0, 5);

            const leaderboardList = document.getElementById('leaderboardList');
            if (!leaderboardList) return;

            if (users.length === 0) {
                leaderboardList.innerHTML = '<li class="text-muted">No players yet. Be the first to play!</li>';
                return;
            }

            leaderboardList.innerHTML = users.map((user, index) => {
                const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';
                const points = (user.wins || 0) * 10;
                return `
                    <li class="leaderboard-item">
                        <span class="rank ${rankClass}" aria-label="Rank ${index + 1}">${index + 1}</span>
                        <span class="player-name">${user.username}</span>
                        <span class="player-score" aria-label="${points} points">${points} pts</span>
                    </li>
                `;
            }).join('');
        });
    }

    /**
     * Load user stats from database
     */
    loadUserStats() {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) return;
        
        const userData = JSON.parse(userDataStr);

        import('../utils/database.js').then(module => {
            const db = module.default;
            const user = db.findOne('users', { id: userData.userId });
            if (!user) return;

            // Update dashboard stats
            document.querySelectorAll('.big-number').forEach((el, index) => {
                if (index === 0) el.textContent = user.wins || 0; // Total wins
                if (index === 1) {
                    const winRate = user.gamesPlayed > 0 
                        ? ((user.wins / user.gamesPlayed) * 100).toFixed(1) 
                        : 0;
                    el.textContent = winRate + '%';
                }
            });
        }).catch(err => {
            console.error('Error loading user stats:', err);
        });
    }

    /**
     * Load recent activity from database
     */
    loadRecentActivity() {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) return;
        
        const userData = JSON.parse(userDataStr);

        import('../utils/database.js').then(module => {
            const db = module.default;
            const matches = db.find('matches', { userId: userData.userId })
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            const activityList = document.getElementById('activityList');
            if (!activityList) return;

            if (matches.length === 0) {
                activityList.innerHTML = '<li class="text-muted">No recent activity</li>';
                return;
            }

            activityList.innerHTML = matches.map(match => {
                const icon = match.result === 'win' 
                    ? '<svg class="activity-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>'
                    : '<i class="fas fa-times-circle activity-icon"></i>';
                const action = match.result === 'win' ? 'won against' : 'lost to';
                const timeAgo = this.getTimeAgo(match.createdAt);
                
                return `
                    <li class="activity-item">
                        ${icon}
                        <div class="activity-content">
                            <p class="activity-text">You ${action} <strong>${match.opponent}</strong></p>
                            <time class="activity-time">${timeAgo}</time>
                        </div>
                    </li>
                `;
            }).join('');
        }).catch(err => {
            console.error('Error loading recent activity:', err);
        });
    }

    /**
     * Get time ago string
     * @param {string} dateString - ISO date string
     * @returns {string} Time ago string
     */
    getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        return date.toLocaleDateString();
    }
}
