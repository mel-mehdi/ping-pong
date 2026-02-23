export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  THEME: 'theme',
  ACTIVE_API_KEY: 'active_api_key',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const HTTP_STATUS = {
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
};

const BACKEND_ORIGIN = (typeof window !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_ORIGIN) ? import.meta.env.VITE_BACKEND_ORIGIN : '';

export const API_ENDPOINTS = {
  // User-related endpoints are registered at the application root
  // (e.g. GET /users/me/). Public API endpoints live under /api/.
  DJANGO_USER_BASE: `${BACKEND_ORIGIN}`,
  DJANGO_API_BASE: '/api',
};

export const ACHIEVEMENTS = [
  { id: 1, type: 'first_win', title: 'First Victory', icon: '🎯', description: 'Win your first match' },
  { id: 2, type: '10_win_streak', title: 'Winning Streak', icon: '🔥', description: 'Win 10 matches in a row' },
  { id: 3, type: 'tournament_winner', title: 'Tournament Champion', icon: '🏆', description: 'Win a tournament' },
  { id: 4, type: '100_games', title: 'Century Club', icon: '💯', description: 'Play 100 matches' },
  { id: 5, type: 'perfect_game', title: 'Perfect Game', icon: '⭐', description: 'Win without opponent scoring' },
  { id: 6, type: 'speed_demon', title: 'Speed Demon', icon: '⚡', description: 'Win in under 2 minutes' },
  { id: 7, type: 'master_player', title: 'Master Player', icon: '👑', description: 'Achieve 70% win rate with 50+ games' },
  { id: 8, type: 'comeback_king', title: 'Comeback King', icon: '🎪', description: 'Win after being down 0-4' },
  { id: 9, type: 'veteran', title: 'Veteran', icon: '🎖️', description: 'Play 500 matches' },
  { id: 10, type: 'unbeatable', title: 'Unbeatable', icon: '🛡️', description: 'Win 20 matches in a row' },
  { id: 11, type: 'first_blood', title: 'First Blood', icon: '🩸', description: 'Play your first match' },
  { id: 12, type: 'hat_trick', title: 'Hat Trick', icon: '🎩', description: 'Win 3 matches in a row' },
  { id: 13, type: 'marathon', title: 'Marathon', icon: '🏃', description: 'Play 10 matches in one day' },
  { id: 14, type: 'sharp_shooter', title: 'Sharp Shooter', icon: '🎯', description: 'Win 5-0' },
  { id: 15, type: 'social_butterfly', title: 'Social Butterfly', icon: '🦋', description: 'Play against 10 different opponents' },
  { id: 16, type: 'night_owl', title: 'Night Owl', icon: '🦉', description: 'Play between midnight and 4 AM' },
];

export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MAX_EMAIL_LENGTH: 120,
  MAX_FULLNAME_LENGTH: 50,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME_PATTERN: /^[a-zA-Z0-9_]+$/,
};

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username can only contain letters, numbers, and underscores',
  USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION_RULES.MIN_USERNAME_LENGTH} characters`,
  USERNAME_TOO_LONG: `Username must not exceed ${VALIDATION_RULES.MAX_USERNAME_LENGTH} characters`,
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`,
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  UPLOAD_FAILED: 'Upload failed',
  NETWORK_ERROR: 'Network error occurred',
};

export const GAME_DEFAULTS = {
  CANVAS_ASPECT_RATIO: 1.6,
  MARGIN_HEIGHT: 240,
  MARGIN_WIDTH: 60,
  PADDLE_WIDTH_RATIO: 0.012,
  PADDLE_HEIGHT_RATIO: 0.2,
  PADDLE_SPEED_RATIO: 0.016,
  BALL_SIZE_RATIO: 0.025,
  BALL_SPEED_RATIO: 0.0075,
  BALL_SPEED_MULTIPLIER: 2,
  WINNING_SCORE: 5,
};
