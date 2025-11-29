/**
 * Application Constants
 * Central location for all constant values used across the application
 */

export const APP_NAME = 'Ping Pong';

export const STORAGE_KEYS = {
    USER_DATA: 'userData',
    GAME_SETTINGS: 'gameSettings',
    HIGH_SCORES: 'highScores'
};

export const ROUTES = {
    LOGIN: 'login.html',
    REGISTER: 'register.html',
    HOME: 'index.html',
    GAME: 'index.html#game',
    PROFILE: 'profile.html'
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
    WINNING_SCORE: 5
};

export const VALIDATION_RULES = {
    MIN_PASSWORD_LENGTH: 8,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME_PATTERN: /^[a-zA-Z0-9_]+$/
};

export const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_USERNAME: 'Username can only contain letters, numbers, and underscores',
    USERNAME_TOO_SHORT: `Username must be at least ${VALIDATION_RULES.MIN_USERNAME_LENGTH} characters`,
    USERNAME_TOO_LONG: `Username must not exceed ${VALIDATION_RULES.MAX_USERNAME_LENGTH} characters`,
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.MIN_PASSWORD_LENGTH} characters`,
    PASSWORDS_NOT_MATCH: 'Passwords do not match',
    TERMS_NOT_ACCEPTED: 'You must accept the Terms & Conditions'
};

export const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', ''];
