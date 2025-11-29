/**
 * Login Page Module
 * Handles user login form and validation
 */

import { STORAGE_KEYS, ROUTES } from './utils/constants.js';
import { setItem } from './utils/storage.js';
import {
    validateRequired,
    showError,
    clearError,
    clearAllErrors
} from './utils/validation.js';
import { getById, addEvent } from './utils/dom.js';

// Authentication handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = getById('loginForm');

    if (loginForm) {
        initLoginForm(loginForm);
    }
});

/**
 * Initialize login form with validation and submission
 * @param {HTMLFormElement} form - Login form element
 */
function initLoginForm(form) {
    const usernameInput = getById('username');
    const passwordInput = getById('password');

    // Real-time validation
    addEvent(usernameInput, 'blur', () => {
        const result = validateRequired(usernameInput.value);
        if (!result.isValid) {
            showError('username', 'Username ' + result.message);
        } else {
            clearError('username');
        }
    });

    addEvent(passwordInput, 'blur', () => {
        const result = validateRequired(passwordInput.value);
        if (!result.isValid) {
            showError('password', 'Password ' + result.message);
        } else {
            clearError('password');
        }
    });

    addEvent(form, 'submit', function(e) {
        e.preventDefault();
        clearAllErrors(form);
        
        const username = usernameInput.value;
        const password = passwordInput.value;
        const remember = document.querySelector('input[name="remember"]').checked;

        // Validate all fields
        let isValid = true;

        const usernameValidation = validateRequired(username);
        if (!usernameValidation.isValid) {
            showError('username', 'Username ' + usernameValidation.message);
            isValid = false;
        }

        const passwordValidation = validateRequired(password);
        if (!passwordValidation.isValid) {
            showError('password', 'Password ' + passwordValidation.message);
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Simulate login
        if (username && password) {
            // Store user data
            const userData = {
                username: username,
                fullname: 'John Doe',
                email: 'john.doe@example.com',
                loggedIn: true,
                loginTime: new Date().toISOString()
            };
            
            setItem(STORAGE_KEYS.USER_DATA, userData);
            
            // Show success and redirect
            form.classList.add('loading');
            setTimeout(() => {
                window.location.href = ROUTES.HOME;
            }, 500);
        }
    });
}
