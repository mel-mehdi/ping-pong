import '../../css/home.css';
import { STORAGE_KEYS } from '../utils/constants.ts';
import { getItem } from '../utils/storage.ts';
import { renderNavbar } from '../components/navbar.ts';
import { renderFooter } from '../components/footer.ts';

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

            <main role="main" class="home-main">
                <!-- Welcome Section -->
                <section class="welcome-section">
                    <div class="container">
                        <h1 class="welcome-title">Welcome to FT Transcendence</h1>
                        <p class="welcome-text">
                            Play Pong online, join tournaments, chat with friends, and compete for the top rank.
                        </p>
                    </div>
                </section>

                ${isLoggedIn ? `
                <!-- Dashboard Stats Section -->
                <section class="container my-4" aria-label="Quick stats">
                    <div class="row g-4">
                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100 text-center shadow-sm">
                                <div class="card-body">
                                    <div class="card-icon text-primary mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg></div>
                                    <h5 class="card-title">Quick Match</h5>
                                    <p class="card-text">Start a game instantly</p>
                                    <button id="quickMatchBtn" class="btn btn-primary" aria-label="Start playing now">Play Now</button>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100 text-center shadow-sm">
                                <div class="card-body">
                                    <div class="card-icon text-warning mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg></div>
                                    <h5 class="card-title">Total Wins</h5>
                                    <p class="display-4 mb-0" aria-label="wins">0</p>
                                    <small class="text-muted">Keep playing!</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100 text-center shadow-sm">
                                <div class="card-body">
                                    <div class="card-icon text-success mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg></div>
                                    <h5 class="card-title">Win Rate</h5>
                                    <p class="display-4 mb-0" aria-label="win rate">0%</p>
                                    <small class="text-muted">Play more games</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6 col-lg-3">
                            <div class="card h-100 text-center shadow-sm">
                                <div class="card-body">
                                    <div class="card-icon text-info mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                                    <h5 class="card-title">Ranking</h5>
                                    <p class="display-4 mb-0" aria-label="Rank">-</p>
                                    <small class="text-muted">Start competing!</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                ` : ''}

                <!-- Play Options -->
                <section class="container my-5">
                    <h2 class="section-title text-center mb-4">Play Options</h2>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <button id="quickPlayBtn" class="card h-100 text-center border-0 shadow-sm hover-card w-100">
                                <div class="card-body">
                                    <div class="play-icon text-primary mb-3"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></div>
                                    <h5 class="card-title">Play Pong</h5>
                                    <p class="card-text text-muted">Local Game (2 Players)</p>
                                </div>
                            </button>
                        </div>
                        
                        <div class="col-md-4">
                            <button id="onlinePlayBtn" class="card h-100 text-center border-0 shadow-sm hover-card w-100">
                                <div class="card-body">
                                    <div class="play-icon text-success mb-3"><i class="fas fa-globe fs-1"></i></div>
                                    <h5 class="card-title">Online Game</h5>
                                    <p class="card-text text-muted">Play against others online</p>
                                </div>
                            </button>
                        </div>
                        
                        <div class="col-md-4">
                            <button id="tournamentBtn" class="card h-100 text-center border-0 shadow-sm hover-card w-100">
                                <div class="card-body">
                                    <div class="play-icon text-warning mb-3"><i class="fas fa-trophy fs-1"></i></div>
                                    <h5 class="card-title">Tournament Mode</h5>
                                    <p class="card-text text-muted">Compete in brackets</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Tournament Preview -->
                <section class="container my-5">
                    <div class="section-header mb-4">
                        <h2 class="section-title text-center">Tournament</h2>
                    </div>
                    <div class="card shadow-sm">
                        <div class="card-body p-4">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h3 class="h4 mb-3">Upcoming Tournaments</h3>
                                    <p class="text-muted mb-3">Join and compete with other players to become the champion!</p>
                                    <ul class="list-unstyled">
                                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i> Single elimination brackets</li>
                                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i> 4, 8, or 16 players</li>
                                        <li class="mb-2"><i class="fas fa-check-circle text-success me-2"></i> Track match history</li>
                                    </ul>
                                </div>
                                <div class="col-md-4 text-center">
                                    <button id="startTournamentBtn" class="btn btn-primary btn-lg w-100">Start a Tournament</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Leaderboard with Recent Activity -->
                <section class="container my-5">
                    <div class="row g-4">
                        <div class="col-lg-6">
                            <div class="card shadow-sm h-100">
                                <div class="card-header bg-primary text-white">
                                    <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>Leaderboard</h5>
                                </div>
                                <div class="card-body">
                                    <ol class="list-group list-group-numbered" aria-label="Top players" id="leaderboardList">
                                        <li class="list-group-item text-muted">No players yet. Be the first to play!</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        ${isLoggedIn ? `
                        <div class="col-lg-6">
                            <div class="card shadow-sm h-100">
                                <div class="card-header bg-info text-white">
                                    <h5 class="mb-0"><i class="fas fa-clipboard-list me-2"></i>Recent Activity</h5>
                                </div>
                                <div class="card-body">
                                    <ul class="list-group list-group-flush" aria-label="Your recent activities" id="activityList">
                                        <li class="list-group-item text-muted">No recent activity</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </section>

                <!-- Extra Info Section -->
                <section class="container my-5">
                    <div class="row g-4">
                        <div class="col-md-6 col-lg-3">
                            <div class="card text-center shadow-sm h-100">
                                <div class="card-body">
                                    <div class="info-icon text-primary mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                                    <h5 class="card-title">Chat</h5>
                                    <p class="card-text text-muted">Connect with players</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3">
                            <div class="card text-center shadow-sm h-100">
                                <div class="card-body">
                                    <div class="info-icon text-success mb-3"><i class="fas fa-user-friends fs-2"></i></div>
                                    <h5 class="card-title">Friends</h5>
                                    <p class="card-text text-muted">Build your network</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3">
                            <div class="card text-center shadow-sm h-100">
                                <div class="card-body">
                                    <div class="info-icon text-warning mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                                    <h5 class="card-title">Achievements</h5>
                                    <p class="card-text text-muted">Unlock rewards</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-lg-3">
                            <div class="card text-center shadow-sm h-100">
                                <div class="card-body">
                                    <div class="info-icon text-info mb-3"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg></div>
                                    <h5 class="card-title">Statistics</h5>
                                    <p class="card-text text-muted">Track your progress</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Game Info -->
                <section class="container my-5 mb-5 pb-5">
                    <h2 class="section-title text-center mb-4">How to Play</h2>
                    <div class="row g-4">
                        <div class="col-md-4">
                            <div class="card text-center shadow-sm h-100 border-0">
                                <div class="card-body">
                                    <div class="mb-3 text-success"><i class="fas fa-bolt fs-1"></i></div>
                                    <h5 class="card-title">Fair Play</h5>
                                    <p class="card-text">Equal paddle sizes, speeds, and physics for all players</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-center shadow-sm h-100 border-0">
                                <div class="card-body">
                                    <div class="mb-3 text-primary"><i class="fas fa-keyboard fs-1"></i></div>
                                    <h5 class="card-title">Simple Controls</h5>
                                    <p class="card-text">Player 1: W/S keys | Player 2: I/K keys</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-center shadow-sm h-100 border-0">
                                <div class="card-body">
                                    <div class="mb-3 text-warning"><i class="fas fa-medal fs-1"></i></div>
                                    <h5 class="card-title">Tournament Brackets</h5>
                                    <p class="card-text">Enter names, play matches, crown a champion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            ${renderFooter()}
        `;

        this.attachEventListeners();
    }

    attachEventListeners() {
        const userData = getItem(STORAGE_KEYS.USER_DATA);
        const isLoggedIn = !!userData;

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
            console.log('Online game mode coming soon!');
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

        this.app.initNavbarSearch();
        this.app.initNetflixSearch();

        this.loadLeaderboard();
        if (userData) {
            this.loadUserStats();
            this.loadRecentActivity();
        }
    }

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

    loadUserStats() {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) return;
        
        const userData = JSON.parse(userDataStr);

        import('../utils/database.js').then(module => {
            const db = module.default;
            const user = db.findOne('users', { id: userData.userId });
            if (!user) return;

            document.querySelectorAll('.big-number').forEach((el, index) => {
                if (index === 0) el.textContent = user.wins || 0; 
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
