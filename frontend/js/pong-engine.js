export class PongGame {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas with id "${canvasId}" not found`);
        }

        this.ctx = this.canvas.getContext('2d');
        this.options = options;

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
        this.PADDLE_WIDTH = Math.floor(canvasWidth * 0.012);
        this.PADDLE_HEIGHT = Math.floor(canvasHeight * 0.2);
        this.PADDLE_SPEED = canvasHeight * 0.016;
        this.BALL_SIZE = Math.floor(canvasHeight * 0.025); 
        this.BALL_SPEED = canvasWidth * 0.0075;
        this.WINNING_SCORE = 5;
        this.MAX_BALL_SPEED = this.BALL_SPEED * 2;

        this.canvas.width = this.CANVAS_WIDTH;
        this.canvas.height = this.CANVAS_HEIGHT;

        this.player1Score = 0;
        this.player2Score = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;

        this.player1Name = options.player1Name || 'Player 1';
        this.player2Name = options.player2Name || 'Player 2';

        this.resetPositions();

        this.keys = {};

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);

        this.animationId = null;

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

    handleKeyDown(e) {

        if (['KeyW', 'KeyS', 'KeyI', 'KeyK', 'Space'].includes(e.code)) {
            e.preventDefault();
        }

        this.keys[e.code] = true;

        if (e.code === 'Space') {
            if (!this.isRunning && !this.gameOver) {
                this.start();
            } else if (this.isRunning && !this.gameOver) {
                this.togglePause();
            }
        }
    }

    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    start() {
        if (this.gameOver) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.notifyStatusChange(null);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.notifyStatusChange(this.isPaused ? 'PAUSED - Press SPACE to Resume' : null);
    }

    update() {

        if (!this.gameOver) {

            this.player1.dy = 0;
            if (this.keys['KeyW'] || this.keys['KeyS']) {
                if (this.keys['KeyW']) {
                    this.player1.dy = -this.PADDLE_SPEED;
                }
                if (this.keys['KeyS']) {
                    this.player1.dy = this.PADDLE_SPEED;
                }
            }

            this.player2.dy = 0;
            if (this.keys['KeyI'] || this.keys['KeyK']) {
                if (this.keys['KeyI']) {
                    this.player2.dy = -this.PADDLE_SPEED;
                }
                if (this.keys['KeyK']) {
                    this.player2.dy = this.PADDLE_SPEED;
                }
            }

            this.player1.y += this.player1.dy;
            this.player2.y += this.player2.dy;

            this.player1.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.PADDLE_HEIGHT, this.player1.y));
            this.player2.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.PADDLE_HEIGHT, this.player2.y));
        }

        if (!this.isRunning || this.isPaused || this.gameOver) {
            return;
        }

        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        if (this.ball.y <= 0 || this.ball.y + this.BALL_SIZE >= this.CANVAS_HEIGHT) {
            this.ball.dy *= -1;
            this.ball.y = Math.max(0, Math.min(this.CANVAS_HEIGHT - this.BALL_SIZE, this.ball.y));
        }

        if (this.checkCollision(this.ball, this.player1)) {
            this.handlePaddleCollision(this.player1);
        } else if (this.checkCollision(this.ball, this.player2)) {
            this.handlePaddleCollision(this.player2);
        }

        if (this.ball.x < 0) {
            this.player2Score++;
            this.notifyScoreUpdate();
            this.checkWin();
            if (!this.gameOver) {
                this.resetBall(1);
            }
        } else if (this.ball.x > this.CANVAS_WIDTH) {
            this.player1Score++;
            this.notifyScoreUpdate();
            this.checkWin();
            if (!this.gameOver) {
                this.resetBall(-1);
            }
        }
    }

    checkCollision(ball, paddle) {

        const ballCenterX = ball.x + ball.width / 2;
        const ballCenterY = ball.y + ball.height / 2;
        
        return ball.x < paddle.x + paddle.width &&
               ball.x + ball.width > paddle.x &&
               ball.y < paddle.y + paddle.height &&
               ball.y + ball.height > paddle.y &&

               ((paddle === this.player1 && this.ball.dx < 0) ||
                (paddle === this.player2 && this.ball.dx > 0));
    }

    handlePaddleCollision(paddle) {

        const ballCenterY = this.ball.y + this.BALL_SIZE / 2;
        const paddleCenterY = paddle.y + paddle.height / 2;
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
        this.notifyStatusChange('Press SPACE to Start');
    }

    destroy() {

        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
