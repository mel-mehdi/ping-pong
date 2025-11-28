/**
 * Profile Module
 * Handles user profile display and editing
 */

import { STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { getItem, setItem, removeItem } from './utils/storage.js';
import { getById, setText, addEvent, queryAll } from './utils/dom.js';

// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const userData = getItem(STORAGE_KEYS.USER_DATA);
    
    if (!userData) {
        window.location.href = ROUTES.LOGIN;
        return;
    }

    // Set profile data
    loadProfileData(userData);

    // Setup edit profile functionality
    setupEditProfile(userData);

    // Setup logout functionality
    setupLogout();
});

/**
 * Load user data into profile form
 * @param {Object} userData - User data object
 */
function loadProfileData(userData) {
    if (userData.fullname) {
        const fullnameInput = getById('profileFullname');
        if (fullnameInput) {
            fullnameInput.value = userData.fullname;
        }
        
        // Set avatar initials
        const initialsElement = getById('avatarInitials');
        if (initialsElement) {
            const initials = userData.fullname
                .split(' ')
                .map(name => name[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            setText(initialsElement, initials);
        }
    }
    
    if (userData.username) {
        const usernameInput = getById('profileUsername');
        if (usernameInput) {
            usernameInput.value = userData.username;
        }
    }
    
    if (userData.email) {
        const emailInput = getById('profileEmail');
        if (emailInput) {
            emailInput.value = userData.email;
        }
    }
}

/**
 * Setup edit profile functionality
 * @param {Object} userData - User data object
 */
function setupEditProfile(userData) {
    const editBtn = getById('editProfileBtn');
    const saveBtn = getById('saveProfileBtn');
    const profileForm = getById('profileForm');
    
    if (!editBtn || !saveBtn || !profileForm) {
        return;
    }

    const inputs = profileForm.querySelectorAll('input, textarea');

    addEvent(editBtn, 'click', function() {
        inputs.forEach(input => {
            if (input.id !== 'profileUsername') { // Keep username disabled
                input.disabled = false;
            }
        });
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    addEvent(profileForm, 'submit', function(e) {
        e.preventDefault();
        
        // Update user data
        const updatedData = {
            ...userData,
            fullname: getById('profileFullname').value,
            email: getById('profileEmail').value
        };
        
        setItem(STORAGE_KEYS.USER_DATA, updatedData);
        
        // Disable inputs again
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        
        // Show success message
        showSuccessMessage('Profile updated successfully!');
    });
}

/**
 * Setup logout functionality
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

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    // Create temporary success message
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

