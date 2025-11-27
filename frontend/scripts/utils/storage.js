/**
 * Local Storage Utility Functions
 * Provides safe and consistent interface for localStorage operations
 */

/**
 * Get item from localStorage
 * @param {string} key - Storage key
 * @returns {any} Parsed value or null
 */
export function getItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return null;
    }
}

/**
 * Set item in localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export function setItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage: ${key}`, error);
        return false;
    }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage: ${key}`, error);
        return false;
    }
}

/**
 * Clear all items from localStorage
 * @returns {boolean} Success status
 */
export function clear() {
    try {
        localStorage.clear();
        return true;
    } catch (error) {
        console.error('Error clearing localStorage', error);
        return false;
    }
}

/**
 * Check if localStorage is available
 * @returns {boolean} Availability status
 */
export function isAvailable() {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        return false;
    }
}
