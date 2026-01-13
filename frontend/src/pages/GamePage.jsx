import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../styles/game.css';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import { buildWsUrl } from '../utils/wss';

class PongGame {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.socket = options.socket;
    this.isOnline = options.isOnline || false;

    // setup initial canvas dimensions and sizes
    this.isFullscreen = false;
    this.setupCanvasDimensions(false);
    //for ai 
    this.vsAI = options.vsAI || false; // true if playing against backend AI
    this.aiDifficulty = options.aiDifficulty || 'MEDIUM'; // default difficulty

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
    this.vsAI = false;
    this.aiDirection = 0;

    this.resetPositions();
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    this.render();
  }

  updateSocket(newSocket) {
    this.socket = newSocket;
  }

  resetPositions() {
    this.player1 = {
      x: 20,
      y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT,
      dy: 0,
    };

    this.player2 = {
      x: this.CANVAS_WIDTH - 20 - this.PADDLE_WIDTH,
      y: this.CANVAS_HEIGHT / 2 - this.PADDLE_HEIGHT / 2,
      width: this.PADDLE_WIDTH,
      height: this.PADDLE_HEIGHT,
      dy: 0,
    };

    this.ball = {
      x: this.CANVAS_WIDTH / 2 - this.BALL_SIZE / 2,
      y: this.CANVAS_HEIGHT / 2 - this.BALL_SIZE / 2,
      width: this.BALL_SIZE,
      height: this.BALL_SIZE,
      dx: this.BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      dy: this.BALL_SPEED * (Math.random() * 0.6 - 0.3),
    };
  }

  setupCanvasDimensions(fullscreen = false) {
    const ASPECT = 1.6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const maxW = fullscreen ? vw : Math.max(320, vw - 40);
    const maxH = fullscreen ? vh : Math.max(300, vh - 160);

    let cw = maxW;
    let ch = Math.floor(cw / ASPECT);
    if (ch > maxH) {
      ch = maxH;
      cw = Math.floor(ch * ASPECT);
    }

    // enforce minimums
    cw = Math.max(320, cw);
    ch = Math.max(300, ch);

    this.CANVAS_WIDTH = Math.floor(cw);
    this.CANVAS_HEIGHT = Math.floor(ch);

    // compact size calculations with sensible minima
    this.PADDLE_WIDTH = Math.max(8, Math.round(this.CANVAS_WIDTH * 0.012));
    this.PADDLE_HEIGHT = Math.max(28, Math.round(this.CANVAS_HEIGHT * 0.18));
    this.PADDLE_SPEED = Math.max(4, this.CANVAS_HEIGHT * 0.016);
    this.BALL_SIZE = Math.max(6, Math.round(this.CANVAS_HEIGHT * 0.025));
    this.BALL_SPEED = Math.max(1, this.CANVAS_WIDTH * 0.0075);
    this.WINNING_SCORE = 5;
    this.MAX_BALL_SPEED = this.BALL_SPEED * 2;

    if (this.canvas) {
      this.canvas.width = this.CANVAS_WIDTH;
      this.canvas.height = this.CANVAS_HEIGHT;
      this.canvas.style.maxWidth = '100%';
      this.canvas.style.height = 'auto';
      this.canvas.style.display = 'block';

      // expose a scale var for small-screen tweaks (used by CSS)
      const parent = this.canvas.parentElement || document.documentElement;
      const scale = Math.min(1, this.CANVAS_HEIGHT / 600);
      parent.style.setProperty('--game-scale', scale.toFixed(3));
    }
  }

  handleResize() {
    try {
      this.setupCanvasDimensions(this.isFullscreen);
      if (!this.isOnline) {
        this.resetPositions();
      }
    } catch (err) {
      // ignore
    }
  }

  handleFullscreenChange() {
    setTimeout(() => {
      try {
        this.isFullscreen = !!document.fullscreenElement;
        this.setupCanvasDimensions(this.isFullscreen);
        if (!this.isOnline) {
          this.resetPositions();
        }
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

    if (this.isOnline && this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        this.socket.send(JSON.stringify({
          action: 'input',
          up: this.keys['KeyW'] || this.keys['ArrowUp'],
          down: this.keys['KeyS'] || this.keys['ArrowDown']
        }));
      }
      // For online games, don't allow manual start/pause with SPACE
      if (e.code === 'KeyF') {
        this.toggleFullscreen();
      }
      return;
    }

    // Local game controls
    if (e.code === 'Space') {
      // Only allow pause/resume, not initial start (handled by countdown)
      if (this.isRunning) {
        this.pause();
      } else if (this.isPaused) {
        this.start();
      }
    }

    if (e.code === 'KeyF') {
      this.toggleFullscreen();
    }
  }

  handleKeyUp(e) {
    this.keys[e.code] = false;
    
    if (this.isOnline && this.socket && this.socket.readyState === WebSocket.OPEN) {
      if (e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        this.socket.send(JSON.stringify({
          action: 'input',
          up: this.keys['KeyW'] || this.keys['ArrowUp'],
          down: this.keys['KeyS'] || this.keys['ArrowDown']
        }));
      }
    }
  }

  toggleFullscreen() {
    const arenaElement = this.canvas.parentElement;
    if (!document.fullscreenElement) {
      arenaElement.requestFullscreen().catch(() => {});
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
    const pausedMsg =
      (this.options && this.options.strings && this.options.strings.paused) ||
      'PAUSED - Press SPACE to Resume';
    this.notifyStatusChange(this.isPaused ? pausedMsg : null);
  }

  updateState(state) {
    // Auto-start game when receiving updates from server
    if (!this.isRunning) {
      this.isRunning = true;
      this.isPaused = false;
      this.notifyStatusChange(null);
    }

    // Map server coordinates (800x600) to local canvas dimensions
    const scaleX = this.CANVAS_WIDTH / 800;
    const scaleY = this.CANVAS_HEIGHT / 600;

    this.player1.y = state.p1_y * scaleY;
    this.player2.y = state.p2_y * scaleY;
    this.ball.x = state.bx * scaleX;
    this.ball.y = state.by * scaleY;
    
    this.player1Score = state.s1;
    this.player2Score = state.s2;
    this.notifyScoreUpdate();
  }

  update() {
    if (this.isOnline) return; // Server handles physics

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

    // Apply AI movement if enabled; aiDirection is -1/0/1
    if (this.vsAI && this.aiDirection) {
      if (this.aiDirection === 1 && this.player2.y < this.CANVAS_HEIGHT - this.PADDLE_HEIGHT) {
        this.player2.y += this.PADDLE_SPEED;
      } else if (this.aiDirection === -1 && this.player2.y > 0) {
        this.player2.y -= this.PADDLE_SPEED;
      }
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
    return (
      ball.x < paddle.x + paddle.width &&
      ball.x + ball.width > paddle.x &&
      ball.y < paddle.y + paddle.height &&
      ball.y + ball.height > paddle.y &&
      ((paddle === this.player1 && this.ball.dx < 0) ||
        (paddle === this.player2 && this.ball.dx > 0))
    );
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
    const angle = Math.random() * 0.6 - 0.3;
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
    this.roundRect(
      this.ctx,
      this.player1.x,
      this.player1.y,
      this.player1.width,
      this.player1.height,
      6
    );
    this.roundRect(
      this.ctx,
      this.player2.x,
      this.player2.y,
      this.player2.width,
      this.player2.height,
      6
    );

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
    const startMsg =
      (this.options && this.options.strings && this.options.strings.start) ||
      'Press SPACE to Start';
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
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const matchId = searchParams.get('match'); // For tournament matches
  const aiParam = searchParams.get('ai'); // For local AI games
  const { t } = useLanguage();
  const { userData, isBackendAuthenticated } = useAuth();
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const socketRef = useRef(null);
  const currentRoomRef = useRef(null);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [gameMessage, setGameMessage] = useState(t('game.press_space_start'));
  const [showMessage, setShowMessage] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState('');
  const [isMatchmaking, setIsMatchmaking] = useState(mode === 'online' && !matchId);
  const [playerRole, setPlayerRole] = useState(null);
  const [myName, setMyName] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [didIWin, setDidIWin] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Local AI toggle
  const [isVsAI, setIsVsAI] = useState(aiParam === 'true');
  const [aiDifficulty, setAiDifficulty] = useState('MEDIUM');

  // WebSocket Connection Logic
  useEffect(() => {
    if ((mode !== 'online' && mode !== 'tournament') || !isBackendAuthenticated) return;

    const connectToGame = (roomName) => {
      currentRoomRef.current = roomName;
      const wsUrl = buildWsUrl(`/ws/game/${roomName}/`);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Throttle game state updates to ~60fps max
      let lastUpdateTime = 0;
      let pendingUpdate = null;
      const MIN_UPDATE_INTERVAL = 16; // ~60fps

      socket.onopen = () => {
        // Connected to game server
      };

      socket.onmessage = (event) => {
        // Defer ALL processing to avoid blocking the message handler
        const rawData = event.data;
        
        setTimeout(() => {
          try {
            const data = JSON.parse(rawData);
            
            if (data.type === 'match_found') {
              // Store player info
              setPlayerRole(data.player_role);
              setMyName(data.my_name);
              setOpponentName(data.opponent_name);
              
              // For matchmaking, reconnect to specific room
              if (mode === 'online' && !matchId) {
                if (data.room_id !== currentRoomRef.current) {
                  socket.close();
                  connectToGame(data.room_id);
                  // Update socket reference in existing game if it exists
                  setTimeout(() => {
                    if (gameRef.current && socketRef.current) {
                      gameRef.current.updateSocket(socketRef.current);
                    }
                  }, 500);
                }
              }
              setIsMatchmaking(false);
              setGameMessage(t('game.opponent_found') || 'Opponent Found! Starting...');
              
            } else if (data.type === 'update') {
              // Throttle updates to avoid flooding the main thread
              const now = performance.now();
              
              if (now - lastUpdateTime >= MIN_UPDATE_INTERVAL) {
                // Process immediately if enough time has passed
                if (gameRef.current) {
                  gameRef.current.updateState(data.state);
                }
                lastUpdateTime = now;
                pendingUpdate = null;
              } else {
                // Store the latest update and schedule it
                pendingUpdate = data.state;
                
                if (!pendingUpdate.scheduled) {
                  pendingUpdate.scheduled = true;
                  const delay = MIN_UPDATE_INTERVAL - (now - lastUpdateTime);
                  
                  setTimeout(() => {
                    if (pendingUpdate && gameRef.current) {
                      gameRef.current.updateState(pendingUpdate);
                      lastUpdateTime = performance.now();
                      pendingUpdate = null;
                    }
                  }, delay);
                }
              }
            } else if (data.type === 'countdown') {
              setCountdown(data.count);
              if (data.count > 0) {
                 setGameMessage(`Starting in ${data.count}...`);
                 setShowMessage(true);
              } else {
                 setGameMessage('GO!');
                 setTimeout(() => {
                   setCountdown(null);
                   setShowMessage(false);
                 }, 1000);
              }
            } else if (data.type === 'game_over') {
              if (gameRef.current) {
                const iAmWinner = data.winner === playerRole;
                setDidIWin(iAmWinner);
                gameRef.current.endGame(data.winner_name);
              }
            }
          } catch (err) {
            // ignore malformed messages
          }
        }, 0);
      };

      socket.onclose = () => {
        // Disconnected from game server
      };
    };

    // For tournament matches, connect directly to the match room
    if (mode === 'tournament' && matchId) {
      connectToGame(`tournament_${matchId}`);
      setIsMatchmaking(false);
    } else {
      // Start with matchmaking for regular online mode
      connectToGame('matchmaking');
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [mode, matchId, isBackendAuthenticated, t, playerRole]);

  // Save match result to backend
  const saveMatchResult = async (winnerName, p1Score, p2Score) => {
    if (!isBackendAuthenticated || !userData?.userId) return;
    
    try {
      // Tournament matches are automatically saved by the backend WebSocket consumer
      if (mode === 'tournament' && matchId) {
        return;
      }

      // For regular matches
      const matchData = {
        player1_id: userData.userId,
        player2_id: null, // Local game, no second player
        player1_score: p1Score,
        player2_score: p2Score,
        winner_id: winnerName === t('game.player1') ? userData.userId : null,
        match_type: 'local',
        duration: 0, // Could track actual duration if needed
      };
      
      // Only save match if it's not a local game, as the backend requires two registered users
      if (matchData.match_type !== 'local') {
        await apiClient.createMatch(matchData);
      }
    } catch (err) {
      // Failed to save match result
    }
  };

  const startLocalCountdown = () => {
    let count = 3;
    setCountdown(count);
    setShowMessage(true);
    
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        setTimeout(() => {
          setCountdown(null);
          setShowMessage(false);
          if (gameRef.current) gameRef.current.start();
        }, 1000);
      }
    }, 1000);
  };

  useEffect(() => {
    if (isMatchmaking) return;

    if (canvasRef.current && !gameRef.current) {
      let p1Name, p2Name;
      
      if (isVsAI) {
        // When playing vs AI, show user's username and "AI"
        p1Name = userData?.username || 'Player 1';
        p2Name = 'AI';
      } else if (mode === 'online' || mode === 'tournament') {
        // Online/tournament modes
        p1Name = myName || t('game.player1');
        p2Name = opponentName || t('game.opponent') || 'Opponent';
      } else {
        // Local 2-player mode
        p1Name = t('game.player1');
        p2Name = t('game.player2');
      }

      // Throttle score/status updates to once per animation frame to avoid flooding React's scheduler
      let scoreFrameRequested = false;
      let latestP1 = 0;
      let latestP2 = 0;
      const flushScores = () => {
        setPlayer1Score(latestP1);
        setPlayer2Score(latestP2);
        scoreFrameRequested = false;
      };

      let statusFrameRequested = false;
      let latestStatusMsg = null;
      const flushStatus = () => {
        if (latestStatusMsg) {
          setGameMessage(latestStatusMsg);
          setShowMessage(true);
        } else {
          setShowMessage(false);
        }
        statusFrameRequested = false;
        latestStatusMsg = null;
      };

      gameRef.current = new PongGame(canvasRef.current, {
        player1Name: p1Name,
        player2Name: p2Name,
        socket: socketRef.current,
        isOnline: mode === 'online' || mode === 'tournament',
        strings: {
          start: (mode === 'online' || mode === 'tournament') ? t('game.waiting_for_players') || 'Waiting for both players...' : '',
          paused: t('game.paused_resume'),
          press_space: t('game.press_space'),
        },
        onScoreUpdate: (p1, p2) => {
          latestP1 = p1;
          latestP2 = p2;
          if (!scoreFrameRequested) {
            scoreFrameRequested = true;
            requestAnimationFrame(flushScores);
          }
        },
        onGameEnd: (winnerName) => {
          setWinner(winnerName);
          setGameOver(true);
          setShowMessage(true);
          // Save match result to backend
          saveMatchResult(winnerName, gameRef.current.player1Score, gameRef.current.player2Score);
        },
        onStatusChange: (message) => {
          latestStatusMsg = message;
          if (!statusFrameRequested) {
            statusFrameRequested = true;
            requestAnimationFrame(flushStatus);
          }
        },
      });

      // Auto-start local game
      if (mode !== 'online' && mode !== 'tournament') {
        startLocalCountdown();
      }
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy();
        gameRef.current = null;
      }
    };
  }, [t, isMatchmaking, mode, myName, opponentName, isVsAI, userData]);

  // AI loop: polls backend /game/ai/decide/ for direction when playing locally vs CPU
  useEffect(() => {
    if (mode === 'online' || mode === 'tournament') return; // AI only for local mode
    let timer = null;
    if (isVsAI && gameRef.current) {
      gameRef.current.vsAI = true;
      const loop = async () => {
        try {
          const game = gameRef.current;
          if (!game) return;
          const scaleX = 800 / game.CANVAS_WIDTH;
          const scaleY = 600 / game.CANVAS_HEIGHT;
          const ball = {
            x: game.ball.x * scaleX,
            y: game.ball.y * scaleY,
            vx: game.ball.dx * scaleX,
            vy: game.ball.dy * scaleY,
          };
          const paddle = {
            x: game.player2.x * scaleX,
            y: game.player2.y * scaleY,
            height: game.player2.height * scaleY,
          };
          const res = await apiClient.aiDecide(ball, paddle, aiDifficulty);
          const dir = (res && typeof res.direction === 'number') ? res.direction : 0;
          game.aiDirection = dir;
        } catch (e) {
          // Ignore backend/network errors; keep AI paused (direction stays 0)
        }
      };
      // run immediately then poll
      loop();
      timer = setInterval(loop, 100);
    } else if (gameRef.current) {
      gameRef.current.vsAI = false;
      gameRef.current.aiDirection = 0;
    }
    return () => {
      if (timer) clearInterval(timer);
      if (gameRef.current) {
        gameRef.current.vsAI = false;
        gameRef.current.aiDirection = 0;
      }
    };
  }, [isVsAI, aiDifficulty, mode]);

  const handlePlayAgain = () => {
    if (mode === 'online') {
      window.location.reload();
      return;
    }

    if (gameRef.current) {
      gameRef.current.reset();
      setGameOver(false);
      startLocalCountdown();
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleBackToTournament = () => {
    navigate('/tournament');
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
                <div className="player-name-pro">
                  {isVsAI ? (userData?.username || t('game.player1')) : (mode === 'online' || mode === 'tournament') ? (myName || t('game.player1')) : t('game.player1')}
                </div>
                <div className="player-status-pro">{t('game.ready')}</div>
              </div>
              <div className="player-score-pro">{player1Score}</div>
            </div>

            <div className="match-info-pro">
              <div className="match-title-pro">{mode === 'tournament' ? (t('game.tournament_match') || 'Tournament Match') : t('game.quick_match')}</div>
              <div className="match-status-pro">{t('game.first_to').replace('{n}', '5')}</div>
            </div>

            <div className="player-card-pro">
              <div className="player-score-pro">{player2Score}</div>
              <div className="player-info-pro">
                <div className="player-name-pro">
                  {isVsAI ? 'AI' : (mode === 'online' || mode === 'tournament') ? (opponentName || t('game.opponent') || 'Opponent') : t('game.player2')}
                </div>
                <div className="player-status-pro">{t('game.ready')}</div>
              </div>
              <div className="player-avatar-pro">P2</div>
            </div>
          </div>

          <div className="game-arena-pro">
            <canvas ref={canvasRef}></canvas>
            {isMatchmaking ? (
              <div className="game-overlay-pro">
                <div className="game-start-pro">
                  <div className="start-icon-pro">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                  <p className="start-message-pro">{t('game.searching_opponent') || 'Searching for opponent...'}</p>
                </div>
              </div>
            ) : showMessage && (
              <div className="game-overlay-pro">
                {gameOver ? (
                  <div className="game-result-pro">
                    {(mode === 'online' || mode === 'tournament') ? (
                      <>
                        <div className="winner-trophy-pro">{didIWin ? '🏆' : '💔'}</div>
                        <h2 className="winner-title-pro">
                          {didIWin ? t('game.you_won') || 'You Won!' : t('game.you_lost') || 'You Lost'}
                        </h2>
                        <div className="winner-score-pro">
                          {player1Score} - {player2Score}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="winner-trophy-pro">🏆</div>
                        <h2 className="winner-title-pro">
                          {t('game.winner_wins').replace('{winner}', winner)}
                        </h2>
                        <div className="winner-score-pro">
                          {player1Score} - {player2Score}
                        </div>
                      </>
                    )}
                    <div className="result-actions-pro">
                      {mode === 'tournament' ? (
                        <button onClick={handleBackToTournament} className="btn-result-pro btn-primary-pro">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          {t('game.back_to_tournament') || t('game.main_menu')}
                        </button>
                      ) : (
                        <>
                          <button onClick={handlePlayAgain} className="btn-result-pro btn-primary-pro">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                            </svg>
                            {t('game.play_again')}
                          </button>
                          <button onClick={handleHome} className="btn-result-pro">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            {t('game.main_menu')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : countdown !== null ? (
                  <div className="game-start-pro">
                    <div className="start-icon-pro" style={{ fontSize: '6rem', animation: 'pulse 0.5s infinite alternate' }}>
                      {countdown > 0 ? countdown : 'GO!'}
                    </div>
                    <p className="start-message-pro">{countdown > 0 ? 'Get Ready!' : 'Game On!'}</p>
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
                  <div className="control-label-pro">{mode === 'online' ? 'Controls' : t('game.player1')}</div>
                  <div className="control-keys-pro">
                    {(t('game.keys.player1') || []).map((k, i) => (
                      <span key={`p1-${i}`} className="key-badge-pro">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
                {mode === 'online' && (
                  <div className="control-group-pro">
                    <div className="control-label-pro">Fullscreen</div>
                    <div className="control-keys-pro">
                      <span className="key-badge-pro">F</span>
                    </div>
                  </div>
                )}
                {mode !== 'online' && !isVsAI && (
                  <div className="control-group-pro">
                    <div className="control-label-pro">{t('game.player2')}</div>
                    <div className="control-keys-pro">
                      {(t('game.keys.player2') || []).map((k, i) => (
                        <span key={`p2-${i}`} className="key-badge-pro">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {mode !== 'online' && (
                  <div className="control-group-pro">
                    <div className="control-label-pro">{t('game.label') || 'Game'}</div>
                    <div className="control-keys-pro">
                      {(t('game.keys.game') || []).map((k, i) => (
                        <span
                          key={`g-${i}`}
                          className={`key-badge-pro ${k.length > 6 ? 'wide-pro' : ''}`}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default GamePage;
