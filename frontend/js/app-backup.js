/**
 * Main SPA Application Controller
 */

import { PongGame } from './pong-engine.js';
import { TournamentManager } from './tournament.js';
import { initTheme } from './theme.js';

class App {
    constructor() {
        this.currentView = null;
        this.pongGame = null;
        this.tournament = null;
        this.appContainer = document.getElementById('app');
        this.navbarSearchInitialized = false;
        this.notificationClickHandler = null;
        this.documentClickHandler = null;
        
        // Set default user as logged in for demo
        if (!localStorage.getItem('isLoggedIn')) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', 'Player');
        }
        
        // Initialize theme
        initTheme();
        
        this.init();
    }

    init() {
        // Check hash on load and navigate to that view
        const hash = window.location.hash.slice(1) || 'home';
        this.loadView(hash, false);
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.loadView(e.state.view, false);
            }
        });

        // Handle hash changes
        window.addEventListener('hashchange', (e) => {
            const newHash = window.location.hash.slice(1) || 'home';
            if (newHash !== this.currentView) {
                this.loadView(newHash, false);
            }
        });

        // Set initial history state
        history.replaceState({ view: hash }, '', `#${hash}`);
    }

    loadView(viewName, addToHistory = true) {
        this.currentView = viewName;
        
        if (addToHistory) {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        // Clean up previous game instance
        if (this.pongGame) {
            this.pongGame.destroy();
            this.pongGame = null;
        }

        // Remove existing theme toggle before rendering new view
        const existingToggle = document.querySelector('.theme-toggle');
        if (existingToggle) {
            existingToggle.remove();
        }

        switch(viewName) {
            case 'home':
                this.renderHomeView();
                break;
            case 'game':
                this.renderGameView();
                break;
            case 'tournament':
                this.renderTournamentSetup();
                break;
            case 'tournament-play':
                this.renderTournamentPlay();
                break;
            case 'tournament-results':
                this.renderTournamentResults();
                break;
            case 'chat':
                this.renderChatView();
                break;
            case 'profile':
                this.renderProfileView();
                break;
            default:
                this.renderHomeView();
        }
        
        // Reinitialize theme toggle for new view
        initTheme();
        
        // Initialize navbar features if present
        this.initNavbarButtons();
        this.initNavbarSearch();
    }

    renderHomeView() {
        // Check if user is logged in (for demo purposes, you can integrate with your auth system)
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || 'Guest';
        
        this.appContainer.innerHTML = `
            <nav class="navbar" role="navigation" aria-label="Main navigation">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home" class="active" aria-current="page">Home</a></li>
                        <li><a href="#game" id="navPlayBtn">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#profile">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
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
                            <ol class="leaderboard" aria-label="Top 5 players" id="leaderboardList">
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

        // Event listeners for navigation
        const navPlayBtn = document.getElementById('navPlayBtn');
        if (navPlayBtn) {
            navPlayBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadView('game');
            });
        }

        // Event listener for dashboard quick match button
        const quickMatchBtn = document.getElementById('quickMatchBtn');
        if (quickMatchBtn) {
            quickMatchBtn.addEventListener('click', () => {
                this.loadView('game');
            });
        }

        // Event listeners for play options
        document.getElementById('quickPlayBtn').addEventListener('click', () => {
            this.loadView('game');
        });

        document.getElementById('onlinePlayBtn').addEventListener('click', () => {
            alert('Online game mode coming soon!');
        });

        document.getElementById('tournamentBtn').addEventListener('click', () => {
            this.loadView('tournament');
        });

        document.getElementById('startTournamentBtn').addEventListener('click', () => {
            this.loadView('tournament');
        });

        // Initialize search features
        this.initNavbarSearch();
        this.initNetflixSearch();
    }

    initNavbarSearch() {
        const navSearchInput = document.getElementById('navSearchInput');
        const navSearchResults = document.getElementById('navSearchResults');

        if (!navSearchInput || this.navbarSearchInitialized) return;
        
        this.navbarSearchInitialized = true;

        // Load players from database
        let playerData = [];
        import('./utils/database.js').then(module => {
            const db = module.default;
            playerData = db.find('users').map(user => ({
                id: user.id,
                name: user.username,
                status: 'Online',
                rank: `#${user.rank || '?'}`,
                avatar: user.username[0].toUpperCase()
            }));
        }).catch(err => console.error('Error loading players:', err));

        navSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();

                if (!query) {
                    navSearchResults.classList.add('hidden');
                    return;
                }

                // Filter players
                const matches = playerData.filter(player => 
                    player.name.toLowerCase().includes(query)
                );

                if (matches.length === 0) {
                    navSearchResults.innerHTML = `
                        <div class="nav-search-no-results">
                            <i class="fas fa-user-slash"></i>
                            <p>No players found</p>
                        </div>
                    `;
                    navSearchResults.classList.remove('hidden');
                    return;
                }

                navSearchResults.innerHTML = matches.map(player => `
                    <div class="nav-search-item" data-player-id="${player.id}">
                        <div class="nav-search-avatar">${player.avatar}</div>
                        <div class="nav-search-info">
                            <div class="nav-search-name">${this.highlightMatch(player.name, query)}</div>
                            <div class="nav-search-meta">
                                <span class="status-dot ${player.status.toLowerCase()}"></span>
                                <span>${player.status}</span>
                                <span class="separator">•</span>
                                <span>${player.rank}</span>
                            </div>
                        </div>
                        <button class="nav-search-invite-btn" title="Send Invitation">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                `).join('');

                navSearchResults.classList.remove('hidden');

                // Add click handlers for invitation buttons
                navSearchResults.querySelectorAll('.nav-search-invite-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const item = e.target.closest('.nav-search-item');
                        const playerId = item.dataset.playerId;
                        const playerName = item.querySelector('.nav-search-name').textContent;
                        
                        // Show success feedback
                        btn.innerHTML = '<i class="fas fa-check"></i>';
                        btn.classList.add('sent');
                        btn.disabled = true;
                        
                        setTimeout(() => {
                            alert(`Game invitation sent to ${playerName}!`);
                        }, 300);
                    });
                });
            });

            // Close results when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-search-input-wrapper')) {
                    navSearchResults?.classList.add('hidden');
                }
            });

            // Keep results open when clicking inside
            navSearchInput.addEventListener('focus', () => {
                if (navSearchInput.value.trim()) {
                    navSearchResults?.classList.remove('hidden');
                }
            });
    }

    initNetflixSearch() {
        const searchBtn = document.getElementById('navSearchBtn');
        const searchOverlay = document.getElementById('searchOverlay');
        const closeBtn = document.getElementById('closeSearchOverlay');
        const searchInput = document.getElementById('mainSearchInput');
        const searchResults = document.getElementById('mainSearchResults');

        // Load searchable data from database
        let searchData = {
            players: [],
            games: [
                { type: 'game', name: 'Quick Match', description: 'Fast-paced 1v1 game', icon: 'gamepad' },
                { type: 'game', name: 'Tournament Mode', description: 'Compete in brackets', icon: 'trophy' },
            ],
            features: [
                { type: 'feature', name: 'Leaderboard', description: 'View top players', icon: 'ranking-star' },
                { type: 'feature', name: 'Chat', description: 'Connect with players', icon: 'comments' },
                { type: 'feature', name: 'Profile', description: 'Manage your profile', icon: 'user' },
            ]
        };
        
        import('./utils/database.js').then(module => {
            const db = module.default;
            const users = db.find('users');
            searchData.players = users.map(user => {
                const total = user.wins + user.losses;
                const winRate = total > 0 ? Math.round((user.wins / total) * 100) + '%' : '0%';
                return {
                    type: 'player',
                    name: user.username,
                    rank: `#${user.rank || '?'}`,
                    status: 'Online',
                    winRate
                };
            });
        }).catch(err => console.error('Error loading search data:', err));

        const gameData = [
            { type: 'game', name: 'Quick Match', description: 'Fast-paced 1v1 game', icon: 'gamepad' },
            { type: 'game', name: 'Tournament Mode', description: 'Compete in brackets', icon: 'trophy' },
            { type: 'game', name: 'Practice Mode', description: 'Improve your skills', icon: 'dumbbell' },
            { type: 'game', name: 'Online Match', description: 'Play against players worldwide', icon: 'globe' },
        ];
        
        const featureData = [
            { type: 'feature', name: 'Leaderboard', description: 'View top players', icon: 'ranking-star' },
            { type: 'feature', name: 'Chat', description: 'Connect with players', icon: 'comments' },
            { type: 'feature', name: 'Profile Stats', description: 'Track your progress', icon: 'chart-line' },
            { type: 'feature', name: 'Achievements', description: 'Unlock rewards', icon: 'award' },
        ];

        // Open search overlay
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                searchOverlay.classList.remove('hidden');
                setTimeout(() => {
                    searchOverlay.classList.add('active');
                    searchInput.focus();
                }, 10);
            });
        }

        // Close search overlay
        const closeSearch = () => {
            searchOverlay.classList.remove('active');
            setTimeout(() => {
                searchOverlay.classList.add('hidden');
                searchInput.value = '';
                showPlaceholder();
            }, 300);
        };

        if (closeBtn) {
            closeBtn.addEventListener('click', closeSearch);
        }

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !searchOverlay.classList.contains('hidden')) {
                closeSearch();
            }
        });

        // Close on overlay click
        searchOverlay?.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearch();
            }
        });

        // Show placeholder
        const showPlaceholder = () => {
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search search-placeholder-icon"></i>
                    <p>Start typing to search</p>
                </div>
            `;
        };

        // Search functionality with real-time results
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                
                if (!query) {
                    showPlaceholder();
                    return;
                }

                // Filter all data
                const allResults = [];
                
                // Search players
                const playerMatches = searchData.players.filter(item => 
                    item.name.toLowerCase().includes(query)
                );
                
                // Search games
                const gameMatches = gameData.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.description.toLowerCase().includes(query)
                );
                
                // Search features
                const featureMatches = featureData.filter(item => 
                    item.name.toLowerCase().includes(query) || 
                    item.description.toLowerCase().includes(query)
                );

                // Display results
                if (playerMatches.length === 0 && gameMatches.length === 0 && featureMatches.length === 0) {
                    searchResults.innerHTML = `
                        <div class="search-no-results">
                            <i class="fas fa-search search-no-results-icon"></i>
                            <p>No results found for "${e.target.value}"</p>
                            <span>Try searching for players, games, or features</span>
                        </div>
                    `;
                    return;
                }

                let resultsHTML = '';

                // Players section
                if (playerMatches.length > 0) {
                    resultsHTML += `
                        <div class="search-section">
                            <h3 class="search-section-title"><i class="fas fa-user"></i> Players</h3>
                            <div class="search-items">
                                ${playerMatches.map(player => `
                                    <div class="search-item" data-type="player">
                                        <div class="search-item-avatar">${player.name.charAt(0)}</div>
                                        <div class="search-item-info">
                                            <div class="search-item-title">${this.highlightMatch(player.name, query)}</div>
                                            <div class="search-item-meta">
                                                <span class="rank-badge">${player.rank}</span>
                                                <span class="status-dot ${player.status.toLowerCase()}"></span>
                                                <span>${player.status}</span>
                                                <span class="separator">•</span>
                                                <span>${player.winRate} Win Rate</span>
                                            </div>
                                        </div>
                                        <button class="search-item-action">
                                            <i class="fas fa-user-plus"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                // Games section
                if (gameMatches.length > 0) {
                    resultsHTML += `
                        <div class="search-section">
                            <h3 class="search-section-title"><i class="fas fa-gamepad"></i> Game Modes</h3>
                            <div class="search-items">
                                ${gameMatches.map(game => `
                                    <div class="search-item" data-type="game">
                                        <div class="search-item-icon">
                                            <i class="fas fa-${game.icon}"></i>
                                        </div>
                                        <div class="search-item-info">
                                            <div class="search-item-title">${this.highlightMatch(game.name, query)}</div>
                                            <div class="search-item-desc">${game.description}</div>
                                        </div>
                                        <button class="search-item-action">
                                            <i class="fas fa-play"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                // Features section
                if (featureMatches.length > 0) {
                    resultsHTML += `
                        <div class="search-section">
                            <h3 class="search-section-title"><i class="fas fa-star"></i> Features</h3>
                            <div class="search-items">
                                ${featureMatches.map(feature => `
                                    <div class="search-item" data-type="feature">
                                        <div class="search-item-icon">
                                            <i class="fas fa-${feature.icon}"></i>
                                        </div>
                                        <div class="search-item-info">
                                            <div class="search-item-title">${this.highlightMatch(feature.name, query)}</div>
                                            <div class="search-item-desc">${feature.description}</div>
                                        </div>
                                        <button class="search-item-action">
                                            <i class="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                searchResults.innerHTML = resultsHTML;

                // Add click handlers to results
                document.querySelectorAll('.search-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const type = item.dataset.type;
                        if (type === 'game') {
                            closeSearch();
                            this.loadView('game');
                        } else if (type === 'feature') {
                            const title = item.querySelector('.search-item-title').textContent;
                            if (title.includes('Chat')) {
                                closeSearch();
                                this.loadView('chat');
                            } else if (title.includes('Profile')) {
                                closeSearch();
                                this.loadView('profile');
                            }
                        }
                    });
                });
            });
        }
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    renderGameView() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game" class="active">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#profile">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
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

            <main class="main-container">
                <div class="game-view">
                    <div class="game-content">
                        <div class="score-display">
                            <div class="player-score-box">
                                <div class="player-label">Player 1</div>
                                <div id="player1Score" class="score-number">0</div>
                            </div>
                            <div class="score-divider">-</div>
                            <div class="player-score-box">
                                <div class="player-label">Player 2</div>
                                <div id="player2Score" class="score-number">0</div>
                            </div>
                        </div>

                        <div class="canvas-container">
                            <canvas id="pongCanvas"></canvas>
                            <div id="gameMessage" class="game-message">Press SPACE to Start</div>
                        </div>

                        <div class="game-controls-info">
                            <div class="control-item">
                                <strong>Player 1:</strong> W (Up) / S (Down)
                            </div>
                            <div class="control-item">
                                <strong>Player 2:</strong> I (Up) / K (Down)
                            </div>
                            <div class="control-item">
                                <strong>Start/Pause:</strong> SPACE
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;

        // Initialize Pong Game
        this.pongGame = new PongGame('pongCanvas', {
            player1Name: 'Player 1',
            player2Name: 'Player 2',
            onScoreUpdate: (p1Score, p2Score) => {
                document.getElementById('player1Score').textContent = p1Score;
                document.getElementById('player2Score').textContent = p2Score;
            },
            onGameEnd: (winner) => {
                this.showGameOverMessage(winner);
            },
            onStatusChange: (message) => {
                const msgEl = document.getElementById('gameMessage');
                if (message) {
                    msgEl.textContent = message;
                    msgEl.style.display = 'block';
                } else {
                    msgEl.style.display = 'none';
                }
            }
        });
    }

    showGameOverMessage(winner) {
        const msgEl = document.getElementById('gameMessage');
        msgEl.innerHTML = `
            <div class="game-over-content">
                <h2>${winner} Wins!</h2>
                <button id="playAgainBtn" class="btn btn-primary">Play Again</button>
                <button id="homeBtn" class="btn">Main Menu</button>
            </div>
        `;
        msgEl.style.display = 'flex';

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.pongGame.reset();
            msgEl.style.display = 'none';
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.loadView('home');
        });
    }

    renderTournamentSetup() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game" class="active">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#profile">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
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

            <main class="main-container">
                <div class="tournament-setup">
                    <div class="tournament-header">
                        <h1>Tournament Setup</h1>
                    </div>

                <div class="tournament-setup-content">
                    <div class="setup-instructions">
                        <h2>Enter Player Names</h2>
                        <p>Add 4, 8, or 16 players to start the tournament</p>
                    </div>

                    <div class="player-input-section">
                        <div id="playerInputs" class="player-inputs"></div>
                    </div>

                    <div class="setup-actions">
                        <button id="addPlayerBtn" class="btn btn-secondary">+ Add Player</button>
                        <button id="startTournamentBtn" class="btn btn-primary btn-large" disabled>
                            Start Tournament
                        </button>
                        <p class="player-count" id="playerCount">0 players added</p>
                    </div>
                </div>
            </main>
        `;

        const playerInputsContainer = document.getElementById('playerInputs');
        const addPlayerBtn = document.getElementById('addPlayerBtn');
        const startTournamentBtn = document.getElementById('startTournamentBtn');
        const playerCountEl = document.getElementById('playerCount');

        let playerCount = 0;

        const updatePlayerCount = () => {
            const inputs = playerInputsContainer.querySelectorAll('input');
            const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
            playerCount = filledInputs.length;
            
            playerCountEl.textContent = `${playerCount} player${playerCount !== 1 ? 's' : ''} added`;
            
            const validCounts = [4, 8, 16];
            const canStart = validCounts.includes(playerCount);
            startTournamentBtn.disabled = !canStart;
            
            if (playerCount > 0 && !canStart) {
                playerCountEl.textContent += ` (need 4, 8, or 16 players)`;
            }

            addPlayerBtn.disabled = playerCount >= 16;
        };

        const addPlayerInput = (name = '') => {
            const index = playerInputsContainer.children.length + 1;
            const inputGroup = document.createElement('div');
            inputGroup.className = 'player-input-group';
            inputGroup.innerHTML = `
                <span class="player-number">#${index}</span>
                <input type="text" class="player-name-input" placeholder="Player ${index}" value="${name}" maxlength="20">
                <button class="btn-remove" aria-label="Remove player">×</button>
            `;

            const input = inputGroup.querySelector('input');
            const removeBtn = inputGroup.querySelector('.btn-remove');

            input.addEventListener('input', updatePlayerCount);
            
            removeBtn.addEventListener('click', () => {
                inputGroup.remove();
                // Renumber remaining inputs
                Array.from(playerInputsContainer.children).forEach((group, idx) => {
                    group.querySelector('.player-number').textContent = `#${idx + 1}`;
                    group.querySelector('input').placeholder = `Player ${idx + 1}`;
                });
                updatePlayerCount();
            });

            playerInputsContainer.appendChild(inputGroup);
            updatePlayerCount();
        };

        // Add initial 4 inputs
        for (let i = 0; i < 4; i++) {
            addPlayerInput();
        }

        addPlayerBtn.addEventListener('click', () => {
            if (playerInputsContainer.children.length < 16) {
                addPlayerInput();
            }
        });

        startTournamentBtn.addEventListener('click', () => {
            const inputs = playerInputsContainer.querySelectorAll('input');
            const playerNames = Array.from(inputs)
                .map(input => input.value.trim())
                .filter(name => name !== '');

            if ([4, 8, 16].includes(playerNames.length)) {
                this.tournament = new TournamentManager(playerNames);
                this.loadView('tournament-play');
            }
        });
    }

    renderTournamentPlay() {
        if (!this.tournament) {
            this.loadView('tournament');
            return;
        }

        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game" class="active">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#profile">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
                        }
                    </ul>
                    <div class="nav-actions">
                        <button class="nav-icon-btn" id="navSearchBtn" title="Search Users" aria-label="Search Users">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>
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

            <main class="main-container">
                <div class="tournament-play">
                    <div class="tournament-header">
                        <h1>Tournament - Round ${this.tournament.currentRound}</h1>
                        <div class="tournament-progress">
                            Match ${this.tournament.currentMatchIndex + 1} of ${this.tournament.getRoundMatches().length}
                        </div>
                    </div>

                <div class="tournament-content">
                    <div class="match-info-panel">
                        <div class="current-match-card">
                            <h3>Current Match</h3>
                            <div class="match-players">
                                <div class="match-player">${currentMatch.player1}</div>
                                <div class="vs-text">VS</div>
                                <div class="match-player">${currentMatch.player2}</div>
                            </div>
                        </div>

                        ${nextMatch ? `
                            <div class="next-match-card">
                                <h3><i class="fas fa-clipboard-list"></i> Next Match</h3>
                                <div class="match-players-small">
                                    <span>${nextMatch.player1}</span>
                                    <span>vs</span>
                                    <span>${nextMatch.player2}</span>
                                </div>
                            </div>
                        ` : ''}

                        <div class="tournament-bracket-preview">
                            <h4>Tournament Bracket</h4>
                            <div id="bracketPreview"></div>
                        </div>
                    </div>

                    <div class="game-area">
                        <div class="score-display">
                            <div class="player-score-box">
                                <div class="player-label">${currentMatch.player1}</div>
                                <div id="player1Score" class="score-number">0</div>
                            </div>
                            <div class="score-divider">-</div>
                            <div class="player-score-box">
                                <div class="player-label">${currentMatch.player2}</div>
                                <div id="player2Score" class="score-number">0</div>
                            </div>
                        </div>

                        <div class="canvas-container">
                            <canvas id="pongCanvas"></canvas>
                            <div id="gameMessage" class="game-message">Press SPACE to Start</div>
                        </div>

                        <div class="game-controls-info">
                            <div class="control-item">
                                <strong>${currentMatch.player1}:</strong> W (Up) / S (Down)
                            </div>
                            <div class="control-item">
                                <strong>${currentMatch.player2}:</strong> I (Up) / K (Down)
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        `;

        this.renderBracketPreview();

        // Initialize game for current match
        this.pongGame = new PongGame('pongCanvas', {
            player1Name: currentMatch.player1,
            player2Name: currentMatch.player2,
            onScoreUpdate: (p1Score, p2Score) => {
                document.getElementById('player1Score').textContent = p1Score;
                document.getElementById('player2Score').textContent = p2Score;
            },
            onGameEnd: (winner) => {
                this.tournament.recordMatchWinner(winner);
                this.showTournamentMatchEnd(winner);
            },
            onStatusChange: (message) => {
                const msgEl = document.getElementById('gameMessage');
                if (message) {
                    msgEl.textContent = message;
                    msgEl.style.display = 'block';
                } else {
                    msgEl.style.display = 'none';
                }
            }
        });
    }

    renderBracketPreview() {
        const bracketPreview = document.getElementById('bracketPreview');
        const matches = this.tournament.getRoundMatches();
        
        bracketPreview.innerHTML = matches.map((match, idx) => {
            const isCurrent = idx === this.tournament.currentMatchIndex;
            const status = match.winner ? 'W' : (isCurrent ? '→' : '○');
            
            return `
                <div class="bracket-match ${isCurrent ? 'active' : ''} ${match.winner ? 'completed' : ''}">
                    <span class="match-status">${status}</span>
                    <span class="bracket-player">${match.player1}</span>
                    <span class="bracket-vs">vs</span>
                    <span class="bracket-player">${match.player2}</span>
                    ${match.winner ? `<span class="winner-badge">→ ${match.winner}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    showTournamentMatchEnd(winner) {
        const msgEl = document.getElementById('gameMessage');
        
        if (this.tournament.hasMoreMatches()) {
            msgEl.innerHTML = `
                <div class="game-over-content">
                    <h2>${winner} Wins!</h2>
                    <p>Advancing to the next round</p>
                    <button id="nextMatchBtn" class="btn btn-primary">Next Match</button>
                </div>
            `;
            msgEl.style.display = 'flex';

            document.getElementById('nextMatchBtn').addEventListener('click', () => {
                this.loadView('tournament-play');
            });
        } else {
            // Tournament complete
            this.loadView('tournament-results');
        }
    }

    renderTournamentResults() {
        if (!this.tournament) {
            this.loadView('home');
            return;
        }

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const champion = this.tournament.getChampion();
        const allMatches = this.tournament.getAllMatches();

        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game" class="active">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#profile">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
                        }
                    </ul>
                    <div class="nav-actions">
                        <button class="nav-icon-btn" id="navSearchBtn" title="Search Users" aria-label="Search Users">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                        </button>
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

            <main class="main-container">
                <div class="tournament-results">
                <div class="champion-banner">
                    <h1>TOURNAMENT CHAMPION</h1>
                    <div class="champion-name">${champion}</div>
                    <div class="confetti"><i class="fas fa-trophy"></i> <i class="fas fa-crown"></i> <i class="fas fa-medal"></i> <i class="fas fa-star"></i> <i class="fas fa-award"></i> <i class="fas fa-certificate"></i></div>
                </div>

                <div class="results-content">
                    <div class="results-section">
                        <h2>Tournament Summary</h2>
                        <div class="summary-stats">
                            <div class="stat-box">
                                <div class="stat-label">Total Players</div>
                                <div class="stat-value">${this.tournament.players.length}</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">Total Rounds</div>
                                <div class="stat-value">${this.tournament.totalRounds}</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">Matches Played</div>
                                <div class="stat-value">${allMatches.filter(m => m.winner).length}</div>
                            </div>
                        </div>
                    </div>

                    <div class="results-section">
                        <h2>Match History</h2>
                        <div class="match-history">
                            ${this.renderMatchHistory(allMatches)}
                        </div>
                    </div>

                    <div class="results-actions">
                        <button id="newTournamentBtn" class="btn btn-primary">New Tournament</button>
                        <button id="homeBtn" class="btn btn-secondary">Main Menu</button>
                    </div>
                </div>
            </main>
        `;

        document.getElementById('newTournamentBtn').addEventListener('click', () => {
            this.tournament = null;
            this.loadView('tournament');
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.tournament = null;
            this.loadView('home');
        });
    }

    renderMatchHistory(matches) {
        if (!matches || matches.length === 0) {
            return '<p>No matches played yet.</p>';
        }

        let html = '';
        let currentRound = 1;
        
        matches.forEach((match, idx) => {
            // Start a new round section when round number changes
            if (match.round !== currentRound) {
                currentRound = match.round;
            }
            
            // Add round header if this is the first match of this round
            const isFirstOfRound = idx === 0 || matches[idx - 1].round !== match.round;
            if (isFirstOfRound) {
                const roundName = match.round === this.tournament.totalRounds ? 'Finals' : 
                                 match.round === this.tournament.totalRounds - 1 ? 'Semi-Finals' :
                                 `Round ${match.round}`;
                html += `<div class="round-header">${roundName}</div>`;
            }

            html += `
                <div class="history-match">
                    <span class="history-players">${match.player1} vs ${match.player2}</span>
                    <span class="history-winner">Winner: ${match.winner}</span>
                </div>
            `;
        });

        return html;
    }

    renderChatView() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || 'Player';

        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="#chat" class="active">Chat</a></li>
                        <li><a href="#profile">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
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

            <main class="main-container">
                <div class="chat-view">
                    <div class="chat-container">
                        <!-- Chat Sidebar -->
                        <aside class="chat-sidebar">
                            <div class="chat-sidebar-header">
                                <h3>Conversations</h3>
                            </div>
                            <ul class="chat-users-list" id="chatUsersList">
                                <li class="chat-user-item active" data-user="Alice">
                                    <div class="chat-user-avatar">A</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Alice</div>
                                        <div class="chat-user-status">Online</div>
                                    </div>
                                    <div class="chat-status-indicator"></div>
                                </li>
                                <li class="chat-user-item" data-user="Bob">
                                    <div class="chat-user-avatar">B</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Bob</div>
                                        <div class="chat-user-status">Away</div>
                                    </div>
                                    <div class="chat-status-indicator"></div>
                                </li>
                                <li class="chat-user-item" data-user="Charlie">
                                    <div class="chat-user-avatar">C</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Charlie</div>
                                        <div class="chat-user-status">Last seen 2h ago</div>
                                    </div>
                                    <div class="chat-status-indicator offline"></div>
                                </li>
                                <li class="chat-user-item" data-user="Diana">
                                    <div class="chat-user-avatar">D</div>
                                    <div class="chat-user-info">
                                        <div class="chat-user-name">Diana</div>
                                        <div class="chat-user-status">Online</div>
                                    </div>
                                    <div class="chat-status-indicator"></div>
                                </li>
                            </ul>
                        </aside>

                        <!-- Main Chat Area -->
                        <section class="chat-main">
                            <div class="chat-header">
                                <div class="chat-header-info">
                                    <div class="chat-user-avatar">A</div>
                                    <div>
                                        <div class="chat-header-title">Alice</div>
                                        <div class="chat-header-status">Online</div>
                                    </div>
                                </div>
                            </div>

                            <div class="chat-messages" id="chatMessages">
                                <div class="chat-date-divider">
                                    <span class="chat-date-text">Today</span>
                                </div>

                                <div class="chat-message">
                                    <div class="chat-message-avatar">A</div>
                                    <div class="chat-message-content">
                                        <div class="chat-message-bubble">
                                            <p class="chat-message-text">Hey! Ready for a game?</p>
                                        </div>
                                        <div class="chat-message-time">10:30 AM</div>
                                    </div>
                                </div>

                                <div class="chat-message own">
                                    <div class="chat-message-avatar">${username.charAt(0).toUpperCase()}</div>
                                    <div class="chat-message-content">
                                        <div class="chat-message-bubble">
                                            <p class="chat-message-text">Absolutely! Let's play!</p>
                                        </div>
                                        <div class="chat-message-time">10:31 AM</div>
                                    </div>
                                </div>

                                <div class="chat-message">
                                    <div class="chat-message-avatar">A</div>
                                    <div class="chat-message-content">
                                        <div class="chat-message-bubble">
                                            <p class="chat-message-text">Great! I'll create a tournament room.</p>
                                        </div>
                                        <div class="chat-message-time">10:32 AM</div>
                                    </div>
                                </div>
                            </div>

                            <div class="chat-input-area">
                                <div class="chat-input-wrapper">
                                    <textarea 
                                        class="chat-input" 
                                        id="chatInput" 
                                        placeholder="Type a message..."
                                        rows="1"
                                    ></textarea>
                                    <button class="chat-send-btn" id="chatSendBtn">
                                        <span>Send</span>
                                        <i class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <!-- Search Users Modal -->
            <div class="modal-overlay hidden" id="searchModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-plus"></i> Add Friends</h3>
                        <button class="modal-close" id="closeSearchModal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="search-input-wrapper">
                            
                            <input 
                                type="text" 
                                class="search-input" 
                                id="userSearchInput"
                                placeholder="Search for users..."
                            />
                        </div>
                        <div class="user-search-results" id="searchResults">
                            <!-- Search results will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add chat functionality
        this.initChat();
        this.initUserSearch();

        if (isLoggedIn) {
            document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                window.location.href = 'pages/login.html';
            });
        }
    }

    initChat() {
        const chatInput = document.getElementById('chatInput');
        const chatSendBtn = document.getElementById('chatSendBtn');
        const chatMessages = document.getElementById('chatMessages');
        const chatUsersList = document.getElementById('chatUsersList');
        const username = localStorage.getItem('username') || 'Player';
        let currentUser = 'Alice';

        // Auto-resize textarea
        if (chatInput) {
            chatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Send on Enter (Shift+Enter for new line)
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    chatSendBtn.click();
                }
            });
        }

        // Send message
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', () => {
                const message = chatInput.value.trim();
                if (message) {
                    const time = new Date().toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit' 
                    });

                    const messageHTML = `
                        <div class="chat-message own">
                            <div class="chat-message-avatar">${username.charAt(0).toUpperCase()}</div>
                            <div class="chat-message-content">
                                <div class="chat-message-bubble">
                                    <p class="chat-message-text">${this.escapeHtml(message)}</p>
                                </div>
                                <div class="chat-message-time">${time}</div>
                            </div>
                        </div>
                    `;

                    chatMessages.insertAdjacentHTML('beforeend', messageHTML);
                    chatInput.value = '';
                    chatInput.style.height = 'auto';
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // Simulate response after 1 second
                    setTimeout(() => {
                        const responseTime = new Date().toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit' 
                        });
                        const responses = [
                            'Sounds good!',
                            'I agree!',
                            'Let\'s do it!',
                            'That works for me!',
                            'Great idea!'
                        ];
                        const response = responses[Math.floor(Math.random() * responses.length)];

                        const responseHTML = `
                            <div class="chat-message">
                                <div class="chat-message-avatar">${currentUser.charAt(0)}</div>
                                <div class="chat-message-content">
                                    <div class="chat-message-bubble">
                                        <p class="chat-message-text">${response}</p>
                                    </div>
                                    <div class="chat-message-time">${responseTime}</div>
                                </div>
                            </div>
                        `;

                        chatMessages.insertAdjacentHTML('beforeend', responseHTML);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }, 1000);
                }
            });
        }

        // Switch users
        if (chatUsersList) {
            chatUsersList.addEventListener('click', (e) => {
                const userItem = e.target.closest('.chat-user-item');
                if (userItem) {
                    // Update active state
                    document.querySelectorAll('.chat-user-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    userItem.classList.add('active');

                    // Update header
                    currentUser = userItem.dataset.user;
                    const avatar = userItem.querySelector('.chat-user-avatar').textContent;
                    const name = userItem.querySelector('.chat-user-name').textContent;
                    const status = userItem.querySelector('.chat-user-status').textContent;

                    document.querySelector('.chat-header-title').textContent = name;
                    document.querySelector('.chat-header-status').textContent = status;
                    document.querySelector('.chat-header .chat-user-avatar').textContent = avatar;

                    // Clear messages and show new conversation
                    chatMessages.innerHTML = `
                        <div class="chat-date-divider">
                            <span class="chat-date-text">Today</span>
                        </div>
                        <div class="chat-empty-state">
                            <div class="chat-empty-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                            <div class="chat-empty-text">Start a conversation with ${name}</div>
                            <div class="chat-empty-subtext">Send a message to get started</div>
                        </div>
                    `;
                }
            });
        }
    }

    renderProfileView() {
        const username = localStorage.getItem('username') || 'Player';
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#profile" class="active">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
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

            <main class="main-container">
                <div class="profile-view">
                    <div class="profile-container">
                        <div class="profile-header">
                            <div class="profile-avatar">
                                <div class="avatar-circle">
                                    ${username.charAt(0).toUpperCase()}
                                </div>
                                <button class="avatar-edit-btn" id="editAvatarBtn"><i class="fas fa-camera"></i></button>
                            </div>
                            <div class="profile-info">
                                <h1 class="profile-name">${username}</h1>
                                <p class="profile-status"><i class="fas fa-circle" style="color: #22c55e;"></i> Online</p>
                                <button class="btn btn-primary" id="editProfileBtn"><i class="fas fa-edit"></i> Edit Profile</button>
                            </div>
                        </div>

                        <div class="profile-stats">
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">127</div>
                                    <div class="stat-label">Games Played</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">89</div>
                                    <div class="stat-label">Wins</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">70%</div>
                                    <div class="stat-label">Win Rate</div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg></div>
                                <div class="stat-content">
                                    <div class="stat-value">#42</div>
                                    <div class="stat-label">Rank</div>
                                </div>
                            </div>
                        </div>

                        <div class="profile-sections">
                            <div class="profile-section">
                                <div class="section-header">
                                    <h2>Recent Matches</h2>
                                </div>
                                <div class="matches-list">
                                    <div class="match-item win">
                                        <div class="match-icon">W</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Bob</div>
                                            <div class="match-time">2 hours ago</div>
                                        </div>
                                        <div class="match-score">11 - 8</div>
                                    </div>
                                    <div class="match-item win">
                                        <div class="match-icon">W</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Alice</div>
                                            <div class="match-time">5 hours ago</div>
                                        </div>
                                        <div class="match-score">11 - 7</div>
                                    </div>
                                    <div class="match-item loss">
                                        <div class="match-icon">L</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Charlie</div>
                                            <div class="match-time">1 day ago</div>
                                        </div>
                                        <div class="match-score">9 - 11</div>
                                    </div>
                                    <div class="match-item win">
                                        <div class="match-icon">W</div>
                                        <div class="match-details">
                                            <div class="match-opponent">vs Diana</div>
                                            <div class="match-time">2 days ago</div>
                                        </div>
                                        <div class="match-score">11 - 6</div>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-section">
                                <div class="section-header">
                                    <h2>Achievements</h2>
                                </div>
                                <div class="achievements-grid">
                                    <div class="achievement-item unlocked">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
                                        <div class="achievement-name">First Win</div>
                                    </div>
                                    <div class="achievement-item unlocked">
                                        <div class="achievement-icon"><i class="fas fa-fire"></i></div>
                                        <div class="achievement-name">5 Win Streak</div>
                                    </div>
                                    <div class="achievement-item unlocked">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></div>
                                        <div class="achievement-name">100 Games</div>
                                    </div>
                                    <div class="achievement-item">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20"></path><path d="m3.5 6 2 8h13l2-8"></path><path d="m7 11 2-5"></path><path d="m15 11-2-5"></path><path d="M12 16v-6"></path></svg></div>
                                        <div class="achievement-name">Champion</div>
                                    </div>
                                    <div class="achievement-item">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path></svg></div>
                                        <div class="achievement-name">Legend</div>
                                    </div>
                                    <div class="achievement-item">
                                        <div class="achievement-icon"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>
                                        <div class="achievement-name">Perfect Game</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <!-- Edit Profile Modal -->
            <div class="modal-overlay hidden" id="editProfileModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Edit Profile</h2>
                        <button class="modal-close-btn" id="closeEditProfileModal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="editProfileForm">
                            <div class="form-group">
                                <label for="editUsername">Username</label>
                                <input type="text" id="editUsername" value="${username}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEmail">Email</label>
                                <input type="email" id="editEmail" value="${localStorage.getItem('userEmail') || 'user@example.com'}" required>
                            </div>
                            <div class="form-group">
                                <label for="editBio">Bio</label>
                                <textarea id="editBio" rows="3" placeholder="Tell us about yourself...">${localStorage.getItem('userBio') || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="editLocation">Location</label>
                                <input type="text" id="editLocation" value="${localStorage.getItem('userLocation') || ''}" placeholder="City, Country">
                            </div>
                            <div class="form-group">
                                <label for="editPassword">New Password (optional)</label>
                                <input type="password" id="editPassword" placeholder="Leave blank to keep current">
                            </div>
                            <div class="form-group">
                                <label for="editConfirmPassword">Confirm New Password</label>
                                <input type="password" id="editConfirmPassword" placeholder="Confirm new password">
                            </div>
                            <div class="modal-actions">
                                <button type="button" class="btn btn-secondary" id="cancelEditProfile">Cancel</button>
                                <button type="submit" class="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.initEditProfile();
    }

    initEditProfile() {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editProfileModal = document.getElementById('editProfileModal');
        const closeModalBtn = document.getElementById('closeEditProfileModal');
        const cancelBtn = document.getElementById('cancelEditProfile');
        const editProfileForm = document.getElementById('editProfileForm');

        // Open modal
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                editProfileModal.classList.remove('hidden');
            });
        }

        // Close modal functions
        const closeModal = () => {
            editProfileModal.classList.add('hidden');
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeModal);
        }

        // Close on overlay click
        editProfileModal?.addEventListener('click', (e) => {
            if (e.target === editProfileModal) {
                closeModal();
            }
        });

        // Handle form submission
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const username = document.getElementById('editUsername').value.trim();
                const email = document.getElementById('editEmail').value.trim();
                const bio = document.getElementById('editBio').value.trim();
                const location = document.getElementById('editLocation').value.trim();
                const password = document.getElementById('editPassword').value;
                const confirmPassword = document.getElementById('editConfirmPassword').value;

                // Validate passwords match if provided
                if (password || confirmPassword) {
                    if (password !== confirmPassword) {
                        alert('Passwords do not match!');
                        return;
                    }
                    if (password.length < 6) {
                        alert('Password must be at least 6 characters!');
                        return;
                    }
                }

                // Save to localStorage
                localStorage.setItem('username', username);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userBio', bio);
                localStorage.setItem('userLocation', location);

                if (password) {
                    localStorage.setItem('userPassword', password);
                }

                // Show success message and reload profile
                alert('Profile updated successfully!');
                closeModal();
                this.loadView('profile');
            });
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    initUserSearch() {
        const searchBtn = document.getElementById('searchUsersBtn');
        const searchModal = document.getElementById('searchModal');
        const closeModal = document.getElementById('closeSearchModal');
        const searchInput = document.getElementById('userSearchInput');
        const searchResults = document.getElementById('searchResults');

        // Load users from database
        let allUsers = [];
        import('./utils/database.js').then(module => {
            const db = module.default;
            allUsers = db.find('users').map(user => ({
                id: user.id,
                name: user.username,
                status: 'Online',
                avatar: user.username[0].toUpperCase()
            }));
        }).catch(err => console.error('Error loading users:', err));

        let friendRequests = JSON.parse(localStorage.getItem('friendRequests') || '[]');
        let friends = JSON.parse(localStorage.getItem('friends') || '[]');

        // Open modal
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                searchModal.classList.remove('hidden');
                searchInput.focus();
                displayUsers(allUsers);
            });
        }

        // Close modal
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                searchModal.classList.add('hidden');
                searchInput.value = '';
            });
        }

        // Close on overlay click
        searchModal?.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                searchModal.classList.add('hidden');
                searchInput.value = '';
            }
        });

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query) {
                    const filtered = allUsers.filter(user => 
                        user.name.toLowerCase().includes(query)
                    );
                    displayUsers(filtered);
                } else {
                    displayUsers(allUsers);
                }
            });
        }

        function displayUsers(users) {
            if (users.length === 0) {
                searchResults.innerHTML = `
                    <div class="chat-empty-state">
                        <div class="chat-empty-icon"></div>
                        <div class="chat-empty-text">No users found</div>
                        <div class="chat-empty-subtext">Try a different search</div>
                    </div>
                `;
                return;
            }

            searchResults.innerHTML = users.map(user => {
                const isFriend = friends.includes(user.id);
                const isPending = friendRequests.some(req => req.to === user.id);
                let buttonHTML = '';

                if (isFriend) {
                    buttonHTML = '<button class="add-user-btn" disabled>Friends</button>';
                } else if (isPending) {
                    buttonHTML = '<button class="add-user-btn pending" disabled>Pending</button>';
                } else {
                    buttonHTML = `<button class="add-user-btn" data-user-id="${user.id}">+ Add Friend</button>`;
                }

                return `
                    <div class="user-search-item">
                        <div class="user-search-avatar">${user.avatar}</div>
                        <div class="user-search-info">
                            <div class="user-search-name">${user.name}</div>
                            <div class="user-search-status">${user.status}</div>
                        </div>
                        ${buttonHTML}
                    </div>
                `;
            }).join('');

            // Add event listeners to add buttons
            searchResults.querySelectorAll('.add-user-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    const userId = parseInt(btn.dataset.userId);
                    const user = allUsers.find(u => u.id === userId);
                    sendFriendRequest(user);
                    btn.disabled = true;
                    btn.classList.add('pending');
                    btn.textContent = 'Pending';
                });
            });
        }

        function sendFriendRequest(user) {
            const username = localStorage.getItem('username') || 'Player';
            friendRequests.push({
                from: username,
                to: user.id,
                toName: user.name,
                timestamp: Date.now()
            });
            localStorage.setItem('friendRequests', JSON.stringify(friendRequests));

            // Simulate receiving the request (in real app, this would be server-side)
            const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
            receivedRequests.push({
                from: username,
                fromId: 0,
                avatar: username.charAt(0).toUpperCase(),
                timestamp: Date.now()
            });
            localStorage.setItem('receivedRequests', JSON.stringify(receivedRequests));
            updateNotificationBadge();
        }

        function updateNotificationBadge() {
            const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
            const badge = document.getElementById('notificationBadge');
            if (badge) {
                if (receivedRequests.length > 0) {
                    badge.textContent = receivedRequests.length;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        }

        updateNotificationBadge();
    }

    displayNotifications() {
        const notifList = document.getElementById('notificationList');
        if (!notifList) return;

        const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');

        if (receivedRequests.length === 0) {
            notifList.innerHTML = '<div class="notification-empty">No new notifications</div>';
            return;
        }

        notifList.innerHTML = receivedRequests.map((request, index) => `
            <div class="notification-item" data-index="${index}">
                <div class="notification-avatar">${request.avatar}</div>
                <div class="notification-content">
                    <div class="notification-text">
                        <strong>${request.from}</strong> sent you a friend request
                    </div>
                    <div class="notification-actions">
                        <button class="notification-btn accept" data-action="accept">Accept</button>
                        <button class="notification-btn decline" data-action="decline">Decline</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners
        notifList.querySelectorAll('.notification-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const item = btn.closest('.notification-item');
                const index = parseInt(item.dataset.index);
                this.handleFriendRequest(index, action);
                item.remove();

                // Check if no more notifications
                if (notifList.children.length === 0) {
                    notifList.innerHTML = '<div class="notification-empty">No new notifications</div>';
                }
            });
        });
    }

    handleFriendRequest(index, action) {
        let receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
        const request = receivedRequests[index];

        if (action === 'accept') {
            // Add to friends list
            const friends = JSON.parse(localStorage.getItem('friends') || '[]');
            friends.push(request.fromId);
            localStorage.setItem('friends', JSON.stringify(friends));

            // Add to chat users list
            const chatUsersList = document.getElementById('chatUsersList');
            if (chatUsersList) {
                const newUserHTML = `
                    <li class="chat-user-item" data-user="${request.from}">
                        <div class="chat-user-avatar">${request.avatar}</div>
                        <div class="chat-user-info">
                            <div class="chat-user-name">${request.from}</div>
                            <div class="chat-user-status">Online</div>
                        </div>
                        <div class="chat-status-indicator"></div>
                    </li>
                `;
                chatUsersList.insertAdjacentHTML('beforeend', newUserHTML);
            }
        }

        // Remove from received requests
        receivedRequests.splice(index, 1);
        localStorage.setItem('receivedRequests', JSON.stringify(receivedRequests));
        this.updateNotificationBadge();
    }

    updateNotificationBadge() {
        const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
        const badge = document.getElementById('notificationBadge');
        const navBadge = document.getElementById('navNotificationBadge');
        
        if (badge) {
            if (receivedRequests.length > 0) {
                badge.textContent = receivedRequests.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        
        if (navBadge) {
            if (receivedRequests.length > 0) {
                navBadge.textContent = receivedRequests.length;
                navBadge.classList.remove('hidden');
            } else {
                navBadge.classList.add('hidden');
            }
        }
    }

    initNavbarButtons() {
        const navNotifBtn = document.getElementById('navNotificationsBtn');
        const navNotifBadge = document.getElementById('navNotificationBadge');

        // Update notification badge from localStorage
        if (navNotifBadge) {
            const receivedRequests = JSON.parse(localStorage.getItem('receivedRequests') || '[]');
            if (receivedRequests.length > 0) {
                navNotifBadge.textContent = receivedRequests.length;
                navNotifBadge.classList.remove('hidden');
            } else {
                navNotifBadge.classList.add('hidden');
            }
        }

        // Notification button - toggle notification panel directly
        if (navNotifBtn && !this.notificationClickHandler) {
            this.notificationClickHandler = (e) => {
                e.stopPropagation();
                const notifPanel = document.getElementById('notificationPanel');
                notifPanel?.classList.toggle('hidden');
                this.displayNotifications();
            };
            navNotifBtn.addEventListener('click', this.notificationClickHandler);
        }

        // Close notification panel when clicking outside
        if (!this.documentClickHandler) {
            this.documentClickHandler = (e) => {
                const notifPanel = document.getElementById('notificationPanel');
                const navNotifBtn = document.getElementById('navNotificationsBtn');
                if (notifPanel && !notifPanel.contains(e.target) && !navNotifBtn?.contains(e.target)) {
                    notifPanel.classList.add('hidden');
                }
            };
            document.addEventListener('click', this.documentClickHandler);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
