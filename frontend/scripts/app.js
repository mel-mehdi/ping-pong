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
            default:
                this.renderHomeView();
        }
        
        // Reinitialize theme toggle for new view
        initTheme();
    }

    renderHomeView() {
        // Check if user is logged in (for demo purposes, you can integrate with your auth system)
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const username = localStorage.getItem('username') || 'Guest';
        
        this.appContainer.innerHTML = `
            <nav class="navbar" role="navigation" aria-label="Main navigation">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2><span role="img" aria-label="Ping Pong">🏓</span> FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home" class="active" aria-current="page">Home</a></li>
                        <li><a href="#game" id="navPlayBtn">Play</a></li>
                        <li><a href="pages/profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li><li><a href="pages/register.html">Sign Up</a></li>'
                        }
                    </ul>
                </div>
            </nav>

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
                        <div class="card-icon" role="img" aria-label="Game controller">🎮</div>
                        <h3>Quick Match</h3>
                        <p>Start a game instantly</p>
                        <button id="quickMatchBtn" class="btn btn-primary" aria-label="Start playing now">Play Now</button>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon" role="img" aria-label="Trophy">🏆</div>
                        <h3>Total Wins</h3>
                        <p class="big-number" aria-label="28 wins">28</p>
                        <p class="sub-text">Keep it up!</p>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon" role="img" aria-label="Statistics">📊</div>
                        <h3>Win Rate</h3>
                        <p class="big-number" aria-label="66.7 percent win rate">66.7%</p>
                        <p class="sub-text">Great performance</p>
                    </article>

                    <article class="dashboard-card">
                        <div class="card-icon" role="img" aria-label="Target">🎯</div>
                        <h3>Ranking</h3>
                        <p class="big-number" aria-label="Rank 245">#245</p>
                        <p class="sub-text">Keep climbing!</p>
                    </article>
                </section>
                ` : ''}

                <!-- Play Options -->
                <section class="play-section">
                    <h2 class="section-title">🎮 Play Options</h2>
                    <div class="play-options-grid">
                        <button id="quickPlayBtn" class="play-option-card">
                            <div class="play-icon">▶️</div>
                            <h3>Play Pong</h3>
                            <p>Local Game (2 Players)</p>
                        </button>
                        
                        <button id="onlinePlayBtn" class="play-option-card">
                            <div class="play-icon">🌐</div>
                            <h3>Online Game</h3>
                            <p>Play against others online</p>
                        </button>
                        
                        <button id="tournamentBtn" class="play-option-card">
                            <div class="play-icon">🏆</div>
                            <h3>Tournament Mode</h3>
                            <p>Compete in brackets</p>
                        </button>
                    </div>
                </section>

                <!-- Tournament Preview -->
                <section class="tournament-preview-section">
                    <div class="section-header">
                        <h2 class="section-title">🏆 Tournament</h2>
                    </div>
                    <div class="tournament-preview-card">
                        <div class="tournament-info">
                            <h3>Upcoming Tournaments</h3>
                            <p>Join and compete with other players to become the champion!</p>
                            <ul class="tournament-features">
                                <li>✓ Single elimination brackets</li>
                                <li>✓ 4, 8, or 16 players</li>
                                <li>✓ Track match history</li>
                            </ul>
                        </div>
                        <button id="startTournamentBtn" class="btn btn-primary btn-large">Start a Tournament</button>
                    </div>
                </section>

                <!-- Leaderboard with Recent Activity -->
                <section class="dashboard-section">
                    <article class="card">
                        <header class="card-header">
                            <h2>🏆 Leaderboard</h2>
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
                            <h2>📋 Recent Activity</h2>
                        </header>
                        <div class="card-body">
                            <ul class="activity-list" aria-label="Your recent activities">
                                <li class="activity-item">
                                    <span class="activity-icon" role="img" aria-label="Trophy">🏆</span>
                                    <div class="activity-content">
                                        <p class="activity-text">You won against <strong>PlayerX</strong></p>
                                        <time class="activity-time" datetime="2025-11-24T10:00:00">2 hours ago</time>
                                    </div>
                                </li>
                                <li class="activity-item">
                                    <span class="activity-icon" role="img" aria-label="Up arrow">⬆️</span>
                                    <div class="activity-content">
                                        <p class="activity-text">Rank increased to <strong>#245</strong></p>
                                        <time class="activity-time" datetime="2025-11-23T12:00:00">1 day ago</time>
                                    </div>
                                </li>
                                <li class="activity-item">
                                    <span class="activity-icon" role="img" aria-label="Game controller">🎮</span>
                                    <div class="activity-content">
                                        <p class="activity-text">Played a match with <strong>GameMaster</strong></p>
                                        <time class="activity-time" datetime="2025-11-23T10:00:00">1 day ago</time>
                                    </div>
                                </li>
                                <li class="activity-item">
                                    <span class="activity-icon" role="img" aria-label="Star">🌟</span>
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
                            <div class="info-icon">💬</div>
                            <h3>Chat</h3>
                            <p>Connect with players</p>
                        </div>
                        <div class="info-card-small">
                            <div class="info-icon">👥</div>
                            <h3>Friends</h3>
                            <p>Build your network</p>
                        </div>
                        <div class="info-card-small">
                            <div class="info-icon">🎯</div>
                            <h3>Achievements</h3>
                            <p>Unlock rewards</p>
                        </div>
                        <div class="info-card-small">
                            <div class="info-icon">📊</div>
                            <h3>Statistics</h3>
                            <p>Track your progress</p>
                        </div>
                    </div>
                </section>

                <!-- Game Info -->
                <section class="game-info-section">
                    <h2 class="section-title">ℹ️ How to Play</h2>
                    <div class="game-info-grid">
                        <div class="info-card">
                            <h3>⚡ Fair Play</h3>
                            <p>Equal paddle sizes, speeds, and physics for all players</p>
                        </div>
                        <div class="info-card">
                            <h3>🎯 Simple Controls</h3>
                            <p>Player 1: W/S keys | Player 2: I/K keys</p>
                        </div>
                        <div class="info-card">
                            <h3>🏅 Tournament Brackets</h3>
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
    }

    renderGameView() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>🏓 FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game" class="active">Play</a></li>
                        <li><a href="pages/profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li>'
                        }
                    </ul>
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
                <h2>🏆 ${winner} Wins!</h2>
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
                        <h2>🏓 FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="pages/profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li>'
                        }
                    </ul>
                </div>
            </nav>

            <main class="main-container">
                <div class="tournament-setup">
                    <div class="tournament-header">
                        <h1>🏆 Tournament Setup</h1>
                    </div>

                <div class="tournament-setup-content">
                    <div class="setup-instructions">
                        <h2>Enter Player Names</h2>
                        <p>Add 4, 8, or 16 players to start the tournament</p>
                    </div>

                    <div class="player-input-section">
                        <div id="playerInputs" class="player-inputs"></div>
                        <button id="addPlayerBtn" class="btn btn-secondary">+ Add Player</button>
                    </div>

                    <div class="setup-actions">
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

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentMatch = this.tournament.getCurrentMatch();
        const nextMatch = this.tournament.getNextMatch();

        this.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>🏓 FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="pages/profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li>'
                        }
                    </ul>
                </div>
            </nav>

            <main class="main-container">
                <div class="tournament-play">
                    <div class="tournament-header">
                        <h1>🏆 Tournament - Round ${this.tournament.currentRound}</h1>
                        <div class="tournament-progress">
                            Match ${this.tournament.currentMatchIndex + 1} of ${this.tournament.getRoundMatches().length}
                        </div>
                    </div>

                <div class="tournament-content">
                    <div class="match-info-panel">
                        <div class="current-match-card">
                            <h3>⚔️ Current Match</h3>
                            <div class="match-players">
                                <div class="match-player">${currentMatch.player1}</div>
                                <div class="vs-text">VS</div>
                                <div class="match-player">${currentMatch.player2}</div>
                            </div>
                        </div>

                        ${nextMatch ? `
                            <div class="next-match-card">
                                <h3>📋 Next Match</h3>
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
            const status = match.winner ? '✓' : (isCurrent ? '▶' : '○');
            
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
                    <h2>🏆 ${winner} Wins!</h2>
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
                        <h2>🏓 FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game">Play</a></li>
                        <li><a href="pages/profile.html">Profile</a></li>
                        ${isLoggedIn ? 
                            '<li><a href="pages/login.html" id="logoutBtn">Logout</a></li>' : 
                            '<li><a href="pages/login.html">Login</a></li>'
                        }
                    </ul>
                </div>
            </nav>

            <main class="main-container">
                <div class="tournament-results">
                <div class="champion-banner">
                    <h1>🏆 TOURNAMENT CHAMPION 🏆</h1>
                    <div class="champion-name">${champion}</div>
                    <div class="confetti">🎉 🎊 🎈 🎉 🎊 🎈</div>
                </div>

                <div class="results-content">
                    <div class="results-section">
                        <h2>📊 Tournament Summary</h2>
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
                        <h2>🎯 Match History</h2>
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
