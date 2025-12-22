import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import '../styles/game.css';
import { useLanguage } from '../contexts/LanguageContext';

class PongGame {

    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = options;

        // setup initial canvas dimensions and sizes
        this.isFullscreen = false;
        this.setupCanvasDimensions(false);

        // bind resize/fullscreen handlers so canvas is recalculated when viewport changes
        this.handleResize = this.handleResize.bind(this);
        this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);

        this.player1Score = 0;
        this.player2Score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;

        this.player1Name = options.player1Name || 'Player 1';
        this.player2Name = options.player2Name || 'Player 2';



        this.player1 = {};
        this.player2 = {};
        this.ball = {};
        this.keys = {};
        this.animationId = null;

        this.resetPositions();
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.render();
    }

    resetPositions() {
        this.player1 = {
            x: 20,
            y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
            width: this.PADDLE_WIDTH,
            height: this.PADDLE_HEIGHT,
            dy: 0
        };

        this.player2 = {
            x: this.CANVAS_WIDTH - 20 - this.PADDLE_WIDTH,
            y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
            width: this.PADDLE_WIDTH,
            height: this.PADDLE_HEIGHT,
            dy: 0
        };

        this.ball = {
            x: this.CANVAS_WIDTH / 2 - this.BALL_SIZE / 2,
            y: this.CANVAS_HEIGHT / 2 - this.BALL_SIZE / 2,
            width: this.BALL_SIZE,
            height: this.BALL_SIZE,
            dx: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            dy: this.BALL_SPEED * (Math.random() * 0.6 - 0.3)
        };
    }

    setupCanvasDimensions(fullscreen = false) {
        // If fullscreen requested, use exact window inner size (no margins)
        if (fullscreen) {
            const canvasWidth = window.innerWidth;
            const canvasHeight = window.innerHeight;
            this.CANVAS_WIDTH = Math.floor(canvasWidth);
            this.CANVAS_HEIGHT = Math.floor(canvasHeight);
        } else {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const availableHeight = viewportHeight - 240;
            const availableWidth = viewportWidth - 60;
            const aspectRatio = 1.6;

            let canvasWidth = availableWidth;
            let canvasHeight = canvasWidth / aspectRatio;

            if (canvasHeight > availableHeight) {
                canvasHeight = availableHeight;
                canvasWidth = canvasHeight * aspectRatio;
            }

            this.CANVAS_WIDTH = Math.floor(canvasWidth);
            this.CANVAS_HEIGHT = Math.floor(canvasHeight);
        }

        // element sizes derived from final canvas dimensions
        this.PADDLE_WIDTH = Math.floor(this.CANVAS_WIDTH * 0.012);
        this.PADDLE_HEIGHT = Math.floor(this.CANVAS_HEIGHT * 0.2);
        this.PADDLE_SPEED = this.CANVAS_HEIGHT * 0.016;
        this.BALL_SIZE = Math.floor(this.CANVAS_HEIGHT * 0.025);
        this.BALL_SPEED = this.CANVAS_WIDTH * 0.0075;
        this.WINNING_SCORE = 5;
        this.MAX_BALL_SPEED = this.BALL_SPEED * 2;

        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;
    }

    handleResize() {
        // Recalculate sizes and center paddles/ball so layout looks correct after resize/fullscreen
        try {
            this.setupCanvasDimensions(this.isFullscreen);
            this.resetPositions();
        } catch (err) {
            // ignore
        }
    }

    handleFullscreenChange() {
        // small delay to allow browser to settle fullscreen layout
        setTimeout(() => {
            try {
                this.isFullscreen = !!document.fullscreenElement;
                this.setupCanvasDimensions(this.isFullscreen);
                this.resetPositions();
            } catch (err) {
                // ignore
            }
        }, 50);
    }

    handleKeyDown(e) {
        if (['KeyW', 'KeyS', 'KeyI', 'KeyK', 'Space', 'KeyF'].includes(e.code)) {
            e.preventDefault();
        }
        this.keys[e.code] = true;

        if (e.code === 'Space') {
            if (!this.isRunning && !this.gameOver) {
                this.start();
            } else if (this.isRunning) {
                this.pause();
            }
        }

        if (e.code === 'KeyF') {
            this.toggleFullscreen();
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    toggleFullscreen() {
        const arenaElement = this.canvas.parentElement;
        if (!document.fullscreenElement) {
            arenaElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    start() {
        if (this.gameOver) return;
        this.isRunning = true;
        this.isPaused = false;
        this.notifyStatusChange(null);
    }

    pause() {
        this.isPaused = !this.isPaused;
        const pausedMsg = (this.options && this.options.strings && this.options.strings.paused) || 'PAUSED - Press SPACE to Resume';
        this.notifyStatusChange(this.isPaused ? pausedMsg : null);
    }

    update() {
        if (!this.isRunning || this.isPaused || this.gameOver) return;

        if (this.keys['KeyW'] && this.player1.y > 0) {
            this.player1.y -= this.PADDLE_SPEED;
        }
        if (this.keys['KeyS'] && this.player1.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
            this.player1.y += this.PADDLE_SPEED;
        }

        if (this.keys['KeyI'] && this.player2.y > 0) {
            this.player2.y -= this.PADDLE_SPEED;
        }
        if (this.keys['KeyK'] && this.player2.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
            this.player2.y += this.PADDLE_SPEED;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.y <= 0 || this.ball.y + this.BALL_SIZE >= this.CANVAS_HEIGHT) {
            this.ball.dy = -this.ball.dy;
        }

        if (this.checkCollision(this.ball, this.player1)) {
            this.handlePaddleCollision(this.player1);
        } else if (this.checkCollision(this.ball, this.player2)) {
            this.handlePaddleCollision(this.player2);
        }

        if (this.ball.x < 0) {
            this.player2Score++;
            this.notifyScoreUpdate();
            this.resetBall(1);
            this.checkWin();
        } else if (this.ball.x > this.CANVAS_WIDTH) {
            this.player1Score++;
            this.notifyScoreUpdate();
            this.resetBall(-1);
            this.checkWin();
        }
    }

    checkCollision(ball, paddle) {
        return ball.x < paddle.x + paddle.width &&
               ball.x + ball.width > paddle.x &&
               ball.y < paddle.y + paddle.height &&
               ball.y + ball.height > paddle.y &&
               ((paddle === this.player1 && this.ball.dx < 0) ||
                (paddle === this.player2 && this.ball.dx > 0));
    }

    handlePaddleCollision(paddle) {
        const ballCenterY = this.ball.y + this.BALL_SIZE / 2;

        const hitPos = (ballCenterY - paddle.y) / paddle.height;
        const angle = (hitPos - 0.5) * 1.6;

        const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
        const newSpeed = Math.min(speed * 1.03, this.MAX_BALL_SPEED);

        const direction = paddle === this.player1 ? 1 : -1;
        this.ball.dx = direction * newSpeed * 0.85;
        this.ball.dy = angle * newSpeed;

        if (paddle === this.player1) {
            this.ball.x = paddle.x + paddle.width + 1;
        } else {
            this.ball.x = paddle.x - this.BALL_SIZE - 1;
        }
    }

    resetBall(direction) {
        this.ball.x = this.CANVAS_WIDTH / 2 - this.BALL_SIZE / 2;
        this.ball.y = this.CANVAS_HEIGHT / 2 - this.BALL_SIZE / 2;
        const angle = (Math.random() * 0.6 - 0.3);
        this.ball.dx = this.BALL_SPEED * direction * 0.85;
        this.ball.dy = this.BALL_SPEED * angle;
    }

    checkWin() {
        if (this.player1Score >= this.WINNING_SCORE) {
            this.endGame(this.player1Name);
        } else if (this.player2Score >= this.WINNING_SCORE) {
            this.endGame(this.player2Name);
        }
    }

    endGame(winner) {
        this.gameOver = true;
        this.isRunning = false;
        if (this.options.onGameEnd) {
            this.options.onGameEnd(winner);
        }
    }

    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);

        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.CANVAS_WIDTH / 2, 0);
        this.ctx.lineTo(this.CANVAS_WIDTH / 2, this.CANVAS_HEIGHT);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = '#667eea';
        this.roundRect(this.ctx, this.player1.x, this.player1.y, this.player1.width, this.player1.height, 6);
        this.roundRect(this.ctx, this.player2.x, this.player2.y, this.player2.width, this.player2.height, 6);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(
            this.ball.x + this.ball.width / 2,
            this.ball.y + this.ball.height / 2,
            this.ball.width / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();

        this.update();
        this.animationId = requestAnimationFrame(() => this.render());
    }

    notifyScoreUpdate() {
        if (this.options.onScoreUpdate) {
            this.options.onScoreUpdate(this.player1Score, this.player2Score);
        }
    }

    notifyStatusChange(message) {
        if (this.options.onStatusChange) {
            this.options.onStatusChange(message);
        }
    }

    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }

    reset() {
        this.player1Score = 0;
        this.player2Score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.resetPositions();
        this.notifyScoreUpdate();
        const startMsg = (this.options && this.options.strings && this.options.strings.start) || 'Press SPACE to Start';
        this.notifyStatusChange(startMsg);
    }



    destroy() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

const GamePage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const canvasRef = useRef(null);
    const gameRef = useRef(null);
    const [player1Score, setPlayer1Score] = useState(0);
    const [player2Score, setPlayer2Score] = useState(0);
    const [gameMessage, setGameMessage] = useState(t('game.press_space_start'));
    const [showMessage, setShowMessage] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState('');


    useEffect(() => {
        if (canvasRef.current && !gameRef.current) {
            gameRef.current = new PongGame(canvasRef.current, {
                    player1Name: t('game.player1'),
                    player2Name: t('game.player2'),
                    strings: {
                        start: t('game.press_space_start'),
                        paused: t('game.paused_resume'),
                        press_space: t('game.press_space')
                    },
                onScoreUpdate: (p1, p2) => {
                    setPlayer1Score(p1);
                    setPlayer2Score(p2);
                },
                onGameEnd: (winnerName) => {
                    setWinner(winnerName);
                    setGameOver(true);
                    setShowMessage(true);
                },
                onStatusChange: (message) => {
                    if (message) {
                        setGameMessage(message);
                        setShowMessage(true);
                    } else {
                        setShowMessage(false);
                    }
                }
            });


        }

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy();
                gameRef.current = null;
            }
        };
    }, [t]);

    const handlePlayAgain = () => {
        if (gameRef.current) {
            gameRef.current.reset();
            setGameOver(false);
            setShowMessage(true);
            setGameMessage(t('game.press_space_start'));
        }
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <>
            <Navbar />
            <main className="main-container">
                <div className="game-view-pro">
                    <div className="game-header-pro">
                        <div className="player-card-pro">
                            <div className="player-avatar-pro">P1</div>
                            <div className="player-info-pro">
                                <div className="player-name-pro">{t('game.player1')}</div>
                                <div className="player-status-pro">{t('game.ready')}</div>
                            </div>
                            <div className="player-score-pro">{player1Score}</div>
                        </div>
                        
                        <div className="match-info-pro">
                            <div className="match-title-pro">{t('game.quick_match')}</div>
                            <div className="match-status-pro">{t('game.first_to').replace('{n}', '5')}</div>
                        </div>

                        <div className="player-card-pro">
                            <div className="player-score-pro">{player2Score}</div>
                            <div className="player-info-pro">
                                <div className="player-name-pro">{t('game.player2')}</div>
                                <div className="player-status-pro">{t('game.ready')}</div>
                            </div>
                            <div className="player-avatar-pro">P2</div>
                        </div>
                    </div>

                    <div className="game-arena-pro">
                        <canvas ref={canvasRef}></canvas>
                        {showMessage && (
                            <div className="game-overlay-pro">
                                {gameOver ? (
                                    <div className="game-result-pro">
                                        <div className="winner-trophy-pro">🏆</div>
                                        <h2 className="winner-title-pro">{t('game.winner_wins').replace('{winner}', winner)}</h2>
                                        <div className="winner-score-pro">{player1Score} - {player2Score}</div>
                                        <div className="result-actions-pro">
                                            <button onClick={handlePlayAgain} className="btn-result-pro btn-primary-pro">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                                </svg>
                                                {t('game.play_again')}
                                            </button>
                                            <button onClick={handleHome} className="btn-result-pro">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                                    <polyline points="9 22 9 12 15 12 15 22"/>
                                                </svg>
                                                {t('game.main_menu')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="game-start-pro">
                                        <div className="start-icon-pro">⚡</div>
                                        <p className="start-message-pro">{gameMessage}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="game-controls-pro">
                        <div className="controls-section-pro">
                            <h4 className="controls-title-pro">{t('game.controls')}</h4>
                            <div className="controls-grid-pro">
                                <div className="control-group-pro">
                                    <div className="control-label-pro">{t('game.player1')}</div>
                                    <div className="control-keys-pro">
                                        {(t('game.keys.player1') || []).map((k, i) => (
                                            <span key={`p1-${i}`} className="key-badge-pro">{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="control-group-pro">
                                    <div className="control-label-pro">{t('game.player2')}</div>
                                    <div className="control-keys-pro">
                                        {(t('game.keys.player2') || []).map((k, i) => (
                                            <span key={`p2-${i}`} className="key-badge-pro">{k}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="control-group-pro">
                                    <div className="control-label-pro">{t('game.label') || 'Game'}</div>
                                    <div className="control-keys-pro">
                                        {(t('game.keys.game') || []).map((k, i) => (
                                            <span key={`g-${i}`} className={`key-badge-pro ${k.length>6? 'wide-pro':''}`}>{k}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};

export default GamePage;
