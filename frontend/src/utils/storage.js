import logger from './logger';

/**
 * Get a JSON-parsed item from localStorage
 * @param {string} key - The localStorage key
 * @returns {*} The parsed value or null if not found/error
 */
export function getItem(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    logger.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
}

/**
 * Store a value in localStorage as JSON
 * @param {string} key - The localStorage key
 * @param {*} value - The value to store
 * @returns {boolean} True if successful
 */
export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} True if successful
 */
export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logger.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Get a raw (non-parsed) item from localStorage
 * @param {string} key - The localStorage key
 * @returns {string|null} The raw value or null
 */
export function getRawItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    logger.error(`Error reading raw item from localStorage: ${key}`, error);
    return null;
  }
}

/**
 * Store a raw value in localStorage
 * @param {string} key - The localStorage key
 * @param {string} value - The raw value to store
 * @returns {boolean} True if successful
 */
export function setRawItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    logger.error(`Error writing raw item to localStorage: ${key}`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} True if successful
 */
export function clearStorage() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    logger.error('Error clearing localStorage', error);
    return false;
  }
}

/**
 * Check if a key exists in localStorage
 * @param {string} key - The localStorage key
 * @returns {boolean} True if the key exists
 */
export function hasItem(key) {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    logger.error(`Error checking localStorage: ${key}`, error);
    return false;
  }
}
