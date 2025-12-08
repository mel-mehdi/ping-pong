import '../../css/tournament.css';
import { PongGame } from '../pong-engine.ts';
import { TournamentManager } from '../tournament.ts';
import { renderNavbar } from '../components/navbar.ts';

export class TournamentView {
    constructor(app) {
        this.app = app;
    }

    renderSetup() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        this.app.appContainer.innerHTML = `
            ${renderNavbar('game')}

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

        this.initSetupHandlers();
    }

    initSetupHandlers() {
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

                Array.from(playerInputsContainer.children).forEach((group, idx) => {
                    group.querySelector('.player-number').textContent = `#${idx + 1}`;
                    group.querySelector('input').placeholder = `Player ${idx + 1}`;
                });
                updatePlayerCount();
            });

            playerInputsContainer.appendChild(inputGroup);
            updatePlayerCount();
        };

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
                this.app.tournament = new TournamentManager(playerNames);
                this.app.loadView('tournament-play');
            }
        });
    }

    renderPlay() {
        if (!this.app.tournament) {
            this.app.loadView('tournament');
            return;
        }

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const currentMatch = this.app.tournament.getCurrentMatch();
        const nextMatch = this.app.tournament.getNextMatch();

        this.app.appContainer.innerHTML = `
            ${renderNavbar('game')}

            <main class="main-container">
                <div class="tournament-play">
                    <div class="tournament-header">
                        <h1>Tournament - Round ${this.app.tournament.currentRound}</h1>
                        <div class="tournament-progress">
                            Match ${this.app.tournament.currentMatchIndex + 1} of ${this.app.tournament.getRoundMatches().length}
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
        this.initPlayGame(currentMatch);
    }

    renderBracketPreview() {
        const bracketPreview = document.getElementById('bracketPreview');
        if (!bracketPreview) return;

        const matches = this.app.tournament.getRoundMatches();
        
        bracketPreview.innerHTML = matches.map((match, idx) => {
            const isCurrent = idx === this.app.tournament.currentMatchIndex;
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

    initPlayGame(currentMatch) {
        this.app.pongGame = new PongGame('pongCanvas', {
            player1Name: currentMatch.player1,
            player2Name: currentMatch.player2,
            onScoreUpdate: (p1Score, p2Score) => {
                document.getElementById('player1Score').textContent = p1Score;
                document.getElementById('player2Score').textContent = p2Score;
            },
            onGameEnd: (winner) => {
                this.app.tournament.recordMatchWinner(winner);
                this.showMatchEnd(winner);
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

    showMatchEnd(winner) {
        const msgEl = document.getElementById('gameMessage');
        
        if (this.app.tournament.hasMoreMatches()) {
            msgEl.innerHTML = `
                <div class="game-over-content">
                    <h2>${winner} Wins!</h2>
                    <p>Advancing to the next round</p>
                    <button id="nextMatchBtn" class="btn btn-primary">Next Match</button>
                </div>
            `;
            msgEl.style.display = 'flex';

            document.getElementById('nextMatchBtn').addEventListener('click', () => {
                this.app.loadView('tournament-play');
            });
        } else {

            this.app.loadView('tournament-results');
        }
    }

    renderResults() {
        if (!this.app.tournament) {
            this.app.loadView('home');
            return;
        }

        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const champion = this.app.tournament.getChampion();
        const allMatches = this.app.tournament.getAllMatches();

        this.app.appContainer.innerHTML = `
            ${renderNavbar('game')}

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
                                <div class="stat-value">${this.app.tournament.players.length}</div>
                            </div>
                            <div class="stat-box">
                                <div class="stat-label">Total Rounds</div>
                                <div class="stat-value">${this.app.tournament.totalRounds}</div>
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

        this.initResultsHandlers();
    }

    initResultsHandlers() {
        document.getElementById('newTournamentBtn').addEventListener('click', () => {
            this.app.tournament = null;
            this.app.loadView('tournament');
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            this.app.tournament = null;
            this.app.loadView('home');
        });
    }

    renderMatchHistory(matches) {
        if (!matches || matches.length === 0) {
            return '<p>No matches played yet.</p>';
        }

        let html = '';
        let currentRound = 1;
        
        matches.forEach((match, idx) => {

            if (match.round !== currentRound) {
                currentRound = match.round;
            }

            const isFirstOfRound = idx === 0 || matches[idx - 1].round !== match.round;
            if (isFirstOfRound) {
                const roundName = match.round === this.app.tournament.totalRounds ? 'Finals' : 
                                 match.round === this.app.tournament.totalRounds - 1 ? 'Semi-Finals' :
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
