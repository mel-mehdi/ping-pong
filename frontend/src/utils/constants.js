export const STORAGE_KEYS = {
  USER_DATA: 'userData',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/',
};

export const GAME_SETTINGS = {
  CANVAS_WIDTH: 700,
  CANVAS_HEIGHT: 500,
  PADDLE_WIDTH: 10,
  PADDLE_HEIGHT: 80,
  BALL_SIZE: 10,
  PADDLE_SPEED: 6,
  INITIAL_BALL_SPEED: 4,
  SPEED_INCREMENT: 1.05,
  WINNING_SCORE: 5,
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
};
