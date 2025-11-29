/**
 * Game View Module
 * Renders the Pong game interface
 */

import { PongGame } from '../pong-engine.js';

export class GameView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.app.appContainer.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <h2>FT Transcendence</h2>
                    </div>
                    <ul class="nav-menu">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#game" class="active">Play</a></li>
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

        this.initializeGame();
    }

    initializeGame() {
        // Initialize Pong Game
        this.app.pongGame = new PongGame('pongCanvas', {
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
            this.app.pongGame.reset();
            msgEl.style.display = 'none';
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.app.loadView('home');
        });
    }
}
