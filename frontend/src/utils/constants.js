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

export const API_ENDPOINTS = {
  DJANGO_USER_BASE: '',
  DJANGO_API_BASE: '/api',
};

export const ACHIEVEMENTS = [
  { id: 1, title: 'First Win', icon: '🏆' },
  { id: 2, title: '10 Win Streak', icon: '🔥' },
  { id: 3, title: 'Tournament Winner', icon: '👑' },
  { id: 4, title: '100 Games', icon: '🎯' },
  { id: 5, title: 'Perfect Game', icon: '💯' },
  { id: 6, title: 'Speed Demon', icon: '⚡' },
  { id: 7, title: 'Master Player', icon: '🎖️' },
  { id: 8, title: 'Comeback King', icon: '🔄' },
  { id: 9, title: 'Veteran', icon: '⭐' },
  { id: 10, title: 'Unbeatable', icon: '🛡️' },
  { id: 11, title: 'First Blood', icon: '🩸' },
  { id: 12, title: 'Hat Trick', icon: '🎩' },
  { id: 13, title: 'Marathon', icon: '🏃' },
  { id: 14, title: 'Sharp Shooter', icon: '🎲' },
  { id: 15, title: 'Social Butterfly', icon: '🦋' },
  { id: 16, title: 'Night Owl', icon: '🦉' },
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
