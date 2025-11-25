/**
 * Dashboard Module
 * Handles dashboard functionality and user data display
 */

import { STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { getItem, removeItem } from './utils/storage.js';
import { getById, setText, addEvent } from './utils/dom.js';

// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const userData = getItem(STORAGE_KEYS.USER_DATA);
    
    if (!userData) {
        window.location.href = ROUTES.LOGIN;
        return;
    }

    // Display user name
    displayUserName(userData);

    // Setup logout functionality
    setupLogout();
});

/**
 * Display user name in welcome message
 * @param {Object} userData - User data object
 */
function displayUserName(userData) {
    const playerNameElement = getById('playerName');
    if (playerNameElement && userData) {
        const name = userData.fullname ? userData.fullname.split(' ')[0] : userData.username;
        setText(playerNameElement, name);
    }
}

/**
 * Setup logout button functionality
 */
function setupLogout() {
    const logoutBtn = getById('logoutBtn');
    if (logoutBtn) {
        addEvent(logoutBtn, 'click', function(e) {
            e.preventDefault();
            removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = ROUTES.LOGIN;
        });
    }
}

