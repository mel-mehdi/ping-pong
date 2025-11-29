/**
 * Home View Module
 * Renders the home page with dashboard, leaderboard, and game options
 */

export class HomeView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || 'Guest';
        
        this.app.appContainer.innerHTML = `
            <nav class="navbar" role="navigation" aria-label="Main navigation">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home" class="active" aria-current="page">Home</a></li>
                        <li><a href="#game" id="navPlayBtn">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="login.html">Login</a></li><li><a href="register.html">Sign Up</a></li>'
                        }
                    </ul>
                    <div class="nav-actions">
                        <div class="nav-search-input-wrapper">
                            <i class="fas fa-search nav-search-icon"></i>
                            <input 
                                type="text" 
                                class="nav-search-input" 
                                id="navSearchInput"
                                placeholder="Search players to invite..."
                                autocomplete="off"
                            />
                            <div class="nav-search-results hidden" id="navSearchResults"></div>
                        </div>
                        <button class="nav-icon-btn" id="navNotificationsBtn" title="Notifications" aria-label="Notifications">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span class="notification-badge hidden" id="navNotificationBadge">0</span>
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Notification Panel -->
            <div class="notification-panel hidden" id="notificationPanel">
                <div class="notification-header">Friend Requests</div>
                <div id="notificationList">
                    <!-- Notifications will be populated here -->
                </div>
            </div>

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
                        <p class="big-number" aria-label="28 wins">28</p>
                        <p class="sub-text">Keep it up!</p>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg></div>
                        <h3>Win Rate</h3>
                        <p class="big-number" aria-label="66.7 percent win rate">66.7%</p>
                        <p class="sub-text">Great performance</p>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                        <h3>Ranking</h3>
                        <p class="big-number" aria-label="Rank 245">#245</p>
                        <p class="sub-text">Keep climbing!</p>
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
                            <ol class="leaderboard" aria-label="Top 5 players">
                                <li class="leaderboard-item">
                                    <span class="rank gold" aria-label="Rank 1">1</span>
                                    <span class="player-name">MasterPlayer</span>
                                    <span class="player-score" aria-label="1250 points">1250 pts</span>
                                </li>
                                <li class="leaderboard-item">
                                    <span class="rank silver" aria-label="Rank 2">2</span>
                                    <span class="player-name">ProGamer99</span>
                                    <span class="player-score" aria-label="1180 points">1180 pts</span>
                                </li>
                                <li class="leaderboard-item">
                                    <span class="rank bronze" aria-label="Rank 3">3</span>
                                    <span class="player-name">ChampionAce</span>
                                    <span class="player-score" aria-label="1120 points">1120 pts</span>
                                </li>
                                <li class="leaderboard-item">
                                    <span class="rank" aria-label="Rank 4">4</span>
                                    <span class="player-name">SpeedDemon</span>
                                    <span class="player-score" aria-label="1050 points">1050 pts</span>
                                </li>
                                <li class="leaderboard-item">
                                    <span class="rank" aria-label="Rank 5">5</span>
                                    <span class="player-name">QuickReflexes</span>
                                    <span class="player-score" aria-label="980 points">980 pts</span>
                                </li>
                            </ol>
                        </div>
                    </article>

                    ${isLoggedIn ? `
                    <article class="card">
                        <header class="card-header">
                            <h2><i class="fas fa-clipboard-list"></i> Recent Activity</h2>
                        </header>
                        <div class="card-body">
                            <ul class="activity-list" aria-label="Your recent activities">
                                <li class="activity-item">
                                    <svg class="activity-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>
                                    <div class="activity-content">
                                        <p class="activity-text">You won against <strong>PlayerX</strong></p>
                                        <time class="activity-time" datetime="2025-11-24T10:00:00">2 hours ago</time>
                                    </div>
                                </li>
                                <li class="activity-item">
                                    <svg class="activity-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                                    <div class="activity-content">
                                        <p class="activity-text">Rank increased to <strong>#245</strong></p>
                                        <time class="activity-time" datetime="2025-11-23T12:00:00">1 day ago</time>
                                    </div>
                                </li>
                                <li class="activity-item">
                                    <svg class="activity-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                                    <div class="activity-content">
                                        <p class="activity-text">Played a match with <strong>GameMaster</strong></p>
                                        <time class="activity-time" datetime="2025-11-23T10:00:00">1 day ago</time>
                                    </div>
                                </li>
                                <li class="activity-item">
                                    <i class="fas fa-star activity-icon" aria-label="Star"></i>
                                    <div class="activity-content">
                                        <p class="activity-text">Achievement unlocked: <strong>10 Win Streak</strong></p>
                                        <time class="activity-time" datetime="2025-11-21T12:00:00">3 days ago</time>
                                    </div>
                                </li>
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
        // Navigation
        const navPlayBtn = document.getElementById('navPlayBtn');
        if (navPlayBtn) {
            navPlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.app.loadView('game');
            });
        }

        // Quick match button
        const quickMatchBtn = document.getElementById('quickMatchBtn');
        if (quickMatchBtn) {
            quickMatchBtn.addEventListener('click', () => {
                this.app.loadView('game');
            });
        }

        // Play options
        document.getElementById('quickPlayBtn')?.addEventListener('click', () => {
            this.app.loadView('game');
        });

        document.getElementById('onlinePlayBtn')?.addEventListener('click', () => {
            alert('Online game mode coming soon!');
        });

        document.getElementById('tournamentBtn')?.addEventListener('click', () => {
            this.app.loadView('tournament');
        });

        document.getElementById('startTournamentBtn')?.addEventListener('click', () => {
            this.app.loadView('tournament');
        });

        // Initialize search
        this.app.initNavbarSearch();
        this.app.initNetflixSearch();
    }
}
