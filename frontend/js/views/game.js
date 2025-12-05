import { PongGame } from '../pong-engine.js';
import { renderNavbar } from '../components/navbar.js';

export class GameView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.app.appContainer.innerHTML = `
            ${renderNavbar('game')}

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
