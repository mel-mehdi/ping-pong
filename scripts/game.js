/**
 * Ping Pong Game Module
 * Handles game logic, rendering, and user interaction
 */

import { GAME_SETTINGS, STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { removeItem } from './utils/storage.js';
import { getById, addEvent, toggleClass } from './utils/dom.js';

// Canvas setup
const canvas = getById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// Set canvas size
if (canvas) {
    canvas.width = 600;
    canvas.height = 350;
}

// Game state
let gameRunning = false;
let gamePaused = false;

// Paddle positions
const player1 = {
    x: 30,
    y: 0,
    width: GAME_SETTINGS.PADDLE_WIDTH,
    height: GAME_SETTINGS.PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const player2 = {
    x: 0,
    y: 0,
    width: GAME_SETTINGS.PADDLE_WIDTH,
    height: GAME_SETTINGS.PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

// Ball
const ball = {
    x: 0,
    y: 0,
    size: GAME_SETTINGS.BALL_SIZE,
    dx: GAME_SETTINGS.INITIAL_BALL_SPEED,
    dy: GAME_SETTINGS.INITIAL_BALL_SPEED
};

// Keyboard state
const keys = {};

// Initialize game
function initGame() {
    if (!canvas || !ctx) return;

    // Reset positions
    player1.y = canvas.height / 2 - GAME_SETTINGS.PADDLE_HEIGHT / 2;
    player2.x = canvas.width - 30 - GAME_SETTINGS.PADDLE_WIDTH;
    player2.y = canvas.height / 2 - GAME_SETTINGS.PADDLE_HEIGHT / 2;
    
    resetBall();

    // Event listeners
    const startBtn = getById('startBtn');
    const pauseBtn = getById('pauseBtn');
    const restartBtn = getById('restartBtn');
    const fullscreenBtn = getById('fullscreenBtn');
    const logoutBtn = getById('logoutBtn');

    if (startBtn) addEvent(startBtn, 'click', startGame);
    if (pauseBtn) addEvent(pauseBtn, 'click', togglePause);
    if (restartBtn) addEvent(restartBtn, 'click', restartGame);
    if (fullscreenBtn) addEvent(fullscreenBtn, 'click', toggleFullscreen);

    addEvent(document, 'keydown', (e) => {
        keys[e.key] = true;
        
        // Start game with Space key
        if (e.code === 'Space' && !gameRunning) {
            e.preventDefault();
            startGame();
        }
    });

    addEvent(document, 'keyup', (e) => {
        keys[e.key] = false;
    });

    // Logout functionality
    if (logoutBtn) {
        addEvent(logoutBtn, 'click', function(e) {
            e.preventDefault();
            removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = ROUTES.LOGIN;
        });
    }

    // Initial draw
    draw();
}

// Game functions
function startGame() {
    gameRunning = true;
    gamePaused = false;
    const startBtn = getById('startBtn');
    const pauseBtn = getById('pauseBtn');
    const gameOverDiv = getById('gameOver');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (gameOverDiv) toggleClass(gameOverDiv, 'hidden', true);
    
    gameLoop();
}

function togglePause() {
    gamePaused = !gamePaused;
    const pauseBtn = getById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    }
    if (!gamePaused) {
        gameLoop();
    }
}

function restartGame() {
    player1.score = 0;
    player2.score = 0;
    updateScores();
    resetBall();
    startGame();
}

function toggleFullscreen() {
    const fullscreenArea = getById('fullscreenArea');
    if (!fullscreenArea) return;

    if (!document.fullscreenElement) {
        if (fullscreenArea.requestFullscreen) {
            fullscreenArea.requestFullscreen();
        } else if (fullscreenArea.webkitRequestFullscreen) { // Safari
            fullscreenArea.webkitRequestFullscreen();
        } else if (fullscreenArea.msRequestFullscreen) { // IE11
            fullscreenArea.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
    }
}

function resetBall() {
    if (!canvas) return;
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * GAME_SETTINGS.INITIAL_BALL_SPEED;
    ball.dy = (Math.random() - 0.5) * 8;
}

function updateScores() {
    const player1ScoreEl = getById('player1Score');
    const player2ScoreEl = getById('player2Score');
    
    if (player1ScoreEl) player1ScoreEl.textContent = player1.score;
    if (player2ScoreEl) player2ScoreEl.textContent = player2.score;
}

function checkWinner() {
    if (player1.score >= GAME_SETTINGS.WINNING_SCORE) {
        endGame('Player 1 Wins! 🎉');
        return true;
    } else if (player2.score >= GAME_SETTINGS.WINNING_SCORE) {
        endGame('Player 2 Wins! 🎉');
        return true;
    }
    return false;
}

function endGame(message) {
    gameRunning = false;
    const winnerEl = getById('winner');
    const gameOverDiv = getById('gameOver');
    const startBtn = getById('startBtn');
    const pauseBtn = getById('pauseBtn');
    
    if (winnerEl) winnerEl.textContent = message;
    if (gameOverDiv) toggleClass(gameOverDiv, 'hidden', false);
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
}

function update() {
    if (!canvas) return;
    
    // Move paddles
    const paddleSpeed = GAME_SETTINGS.PADDLE_SPEED;

    // Player 1 (W/S keys)
    if (keys['w'] || keys['W']) {
        player1.y = Math.max(0, player1.y - paddleSpeed);
    }
    if (keys['s'] || keys['S']) {
        player1.y = Math.min(canvas.height - GAME_SETTINGS.PADDLE_HEIGHT, player1.y + paddleSpeed);
    }

    // Player 2 (I/K keys)
    if (keys['i'] || keys['I']) {
        player2.y = Math.max(0, player2.y - paddleSpeed);
    }
    if (keys['k'] || keys['K']) {
        player2.y = Math.min(canvas.height - GAME_SETTINGS.PADDLE_HEIGHT, player2.y + paddleSpeed);
    }

    // Move ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom
    if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy *= -1;
    }

    // Ball collision with paddles
    // Player 1 paddle
    if (ball.x <= player1.x + player1.width &&
        ball.y + ball.size >= player1.y &&
        ball.y <= player1.y + player1.height) {
        ball.dx = Math.abs(ball.dx);
        ball.dx *= GAME_SETTINGS.SPEED_INCREMENT;
    }

    // Player 2 paddle
    if (ball.x + ball.size >= player2.x &&
        ball.y + ball.size >= player2.y &&
        ball.y <= player2.y + player2.height) {
        ball.dx = -Math.abs(ball.dx);
        ball.dx *= GAME_SETTINGS.SPEED_INCREMENT;
    }

    // Score points
    if (ball.x < 0) {
        player2.score++;
        updateScores();
        if (!checkWinner()) {
            resetBall();
        }
    } else if (ball.x > canvas.width) {
        player1.score++;
        updateScores();
        if (!checkWinner()) {
            resetBall();
        }
    }
}

function draw() {
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#667eea';
    ctx.fillRect(player1.x, player1.y, player1.width, player1.height);
    ctx.fillRect(player2.x, player2.y, player2.width, player2.height);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGame);

