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
